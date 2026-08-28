import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  setDoc,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import { auth, db } from "./firebase";

export const realBackend = {
  // ================= TEACHER AUTH =================
  async loginTeacher(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      let role = 'teacher';
      let organizationId = null;
      let organizationName = '';

      if (user.email?.toLowerCase() === 'matthew.harbert@lcps.org') {
        role = 'admin';
      }

      try {
        const docSnap = await getDoc(doc(db, "teachers", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.role) role = data.role;
          if (data.organizationId) organizationId = data.organizationId;
          if (data.organizationName) organizationName = data.organizationName;
        }

        // Always ensure matthew.harbert@lcps.org has admin role persisted in Firestore
        if (user.email?.toLowerCase() === 'matthew.harbert@lcps.org') {
          role = 'admin';
          await setDoc(doc(db, "teachers", user.uid), {
            name: user.displayName || 'Matthew Harbert',
            email: user.email,
            role: 'admin',
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      } catch (e) {
        console.error("Error fetching teacher profile:", e);
      }

      return {
        id: user.uid,
        email: user.email,
        name: user.displayName || email.split('@')[0],
        role,
        organizationId,
        organizationName
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async registerTeacher(name, email, password, organizationId = null, organizationName = '') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      const isDefaultAdmin = email.toLowerCase() === 'matthew.harbert@lcps.org';
      const assignedRole = isDefaultAdmin ? 'admin' : 'teacher';

      const teacherData = {
        name,
        email,
        role: assignedRole,
        organizationId: organizationId || null,
        organizationName: organizationName || '',
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, "teachers", user.uid), teacherData);

      // Increment teacher count on organization if linked
      if (organizationId) {
        try {
          const orgRef = doc(db, "organizations", organizationId);
          const orgSnap = await getDoc(orgRef);
          if (orgSnap.exists()) {
            const count = orgSnap.data().teacherCount || 0;
            await updateDoc(orgRef, { teacherCount: count + 1 });
          }
        } catch (e) {
          console.error("Error updating org teacher count:", e);
        }
      }

      return {
        id: user.uid,
        email: user.email,
        name: name,
        role: 'teacher',
        organizationId,
        organizationName
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  // ================= CLASS MANAGEMENT =================
  async getClasses(teacherId) {
    try {
      // Get classes owned by this teacher
      const ownedQuery = query(collection(db, "classes"), where("teacherId", "==", teacherId));
      const ownedSnapshot = await getDocs(ownedQuery);
      const classes = [];
      ownedSnapshot.forEach((d) => {
        classes.push({ id: d.id, ...d.data() });
      });

      // Get classes where this teacher is a co-teacher
      const coQuery = query(collection(db, "classes"), where("coTeacherIds", "array-contains", teacherId));
      const coSnapshot = await getDocs(coQuery);
      coSnapshot.forEach((d) => {
        // Avoid duplicates
        if (!classes.find(c => c.id === d.id)) {
          classes.push({ id: d.id, ...d.data(), isCoTeacher: true });
        }
      });

      return classes;
    } catch (error) {
      console.error("Error getting classes: ", error);
      return [];
    }
  },

  async createStudent(classId, name, password) {
    try {
      // Check if student exists in this class with this name
      const q = query(
        collection(db, "students"),
        where("classId", "==", classId),
        where("name", "==", name)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) throw new Error("Student already exists");

      const newStudent = {
        classId,
        name,
        password, // In production, hash this!
        xp: 0,
        coins: 100,
        completedActivities: [],
        completedBossChallenges: [],
        currentStreak: 0,
        lastActivityDate: null,
        streakShieldActive: false,
        unlockedAchievements: [],
        guild: null,
        guildXpContributed: 0,
        avatar: { color: 'default', hat: 'none', accessory: 'none', face: 'happy' },
        ownedItems: ['default', 'none', 'happy'],
        dailyQuestCompleted: false,
        lastDailyQuestDate: null,
        mysteryBoxesOpened: 0,
        pendingMysteryBoxes: 0,
        doubleXpActive: false,
        totalActivitiesCompleted: 0,
        collaborationCount: 0,
        pathCompletions: {},
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "students"), newStudent);

      // Update count
      const classRef = doc(db, "classes", classId);
      const classSnap = await getDoc(classRef);
      if (classSnap.exists()) {
        const count = classSnap.data().studentCount || 0;
        await updateDoc(classRef, { studentCount: count + 1 });
      }

      return { id: docRef.id, ...newStudent };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async loginStudent(classId, studentId, password) {
    try {
      const docRef = doc(db, "students", studentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) throw new Error("Student not found");

      const student = docSnap.data();

      if (student.classId !== classId) throw new Error("Invalid class for this student");

      // Check password (simple string check for now)
      if (student.password && student.password !== password) {
        throw new Error("Incorrect password");
      }

      // Note: If no password set (legacy students), we might allow it or require setting one.
      // For this feature, we assume passwords are set via RosterManager.

      return { id: docSnap.id, ...student, role: 'student' };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async createClass(teacherId, className, organizationId = null) {
    try {
      let code;
      let isUnique = false;

      while (!isUnique) {
        code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const q = query(collection(db, "classes"), where("code", "==", code));
        const snapshot = await getDocs(q);
        if (snapshot.empty) isUnique = true;
      }

      let orgId = organizationId;
      if (!orgId) {
        try {
          const tDoc = await getDoc(doc(db, "teachers", teacherId));
          if (tDoc.exists() && tDoc.data().organizationId) {
            orgId = tDoc.data().organizationId;
          }
        } catch (e) {
          console.error("Could not fetch teacher org for class:", e);
        }
      }

      let defaultActivities = null;
      let defaultCatNames = null;
      let defaultCatSubtitles = null;

      // Default to the FIRST template created in that organization if available
      if (orgId) {
        try {
          const templates = await this.getOrgTemplates(orgId);
          if (templates && templates.length > 0) {
            const firstTemplate = templates[0];
            defaultActivities = firstTemplate.activities || null;
            defaultCatNames = firstTemplate.categoryNames || null;
            defaultCatSubtitles = firstTemplate.categorySubtitles || null;
          }
        } catch (e) {
          console.error("Could not fetch org templates for default class setup:", e);
        }
      }

      const newClass = {
        teacherId,
        organizationId: orgId || null,
        name: className,
        code,
        studentCount: 0,
        activities: defaultActivities,
        categoryNames: defaultCatNames,
        categorySubtitles: defaultCatSubtitles,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "classes"), newClass);

      if (orgId) {
        try {
          const orgRef = doc(db, "organizations", orgId);
          const orgSnap = await getDoc(orgRef);
          if (orgSnap.exists()) {
            const count = orgSnap.data().classCount || 0;
            await updateDoc(orgRef, { classCount: count + 1 });
          }
        } catch (e) {
          console.error("Error updating org class count:", e);
        }
      }

      return { id: docRef.id, ...newClass };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getClass(classId) {
    try {
      const docSnap = await getDoc(doc(db, "classes", classId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting class:", error);
      return null;
    }
  },

  async updateClass(classId, updates) {
    try {
      const classRef = doc(db, "classes", classId);
      await updateDoc(classRef, updates);
      return { id: classId, ...updates };
    } catch (error) {
      console.error("Error updating class:", error);
      throw error;
    }
  },

  async deleteClass(classId) {
    try {
      await deleteDoc(doc(db, "classes", classId));
      return true;
    } catch (error) {
      console.error("Error deleting class:", error);
      throw error;
    }
  },

  async getClassByCode(code) {
    const q = query(collection(db, "classes"), where("code", "==", code));
    const snapshot = await getDocs(q);

    if (snapshot.empty) throw new Error('Class not found');

    const classDoc = snapshot.docs[0];
    const classData = classDoc.data();

    let teacherName = "Unknown";
    try {
      const teacherDoc = await getDoc(doc(db, "teachers", classData.teacherId));
      if (teacherDoc.exists()) {
        teacherName = teacherDoc.data().name;
      }
    } catch (e) {
      console.log("Could not fetch teacher details", e);
    }

    return { id: classDoc.id, ...classData, teacherName };
  },

  async getStudents(classId) {
    try {
      const q = query(collection(db, "students"), where("classId", "==", classId));
      const querySnapshot = await getDocs(q);
      const students = [];
      querySnapshot.forEach((doc) => {
        students.push({ id: doc.id, ...doc.data() });
      });
      return students;
    } catch (error) {
      console.error("Error getting students:", error);
      return [];
    }
  },

  // ================= ACTIVITIES =================
  async saveClassActivities(classId, activities) {
    try {
      await updateDoc(doc(db, "classes", classId), { activities });
      return true;
    } catch (error) {
      console.error("Error saving activities:", error);
      throw error;
    }
  },

  async getClassActivities(classId) {
    try {
      const docSnap = await getDoc(doc(db, "classes", classId));
      if (docSnap.exists() && docSnap.data().activities) {
        return docSnap.data().activities;
      }
      return null;
    } catch (error) {
      console.error("Error fetching activities:", error);
      return null;
    }
  },

  // ================= ACTIVITY LIBRARY =================
  async publishActivity(activity) {
    try {
      // Get current user to add as author
      const user = auth.currentUser;
      if (!user) throw new Error("Must be logged in to publish activities to the library");

      // Sanitize fields to ensure Firestore compatibility (no undefined properties)
      const newActivity = {
        title: activity.title || "Untitled Activity",
        desc: activity.desc || "",
        type: activity.type || "Low Tech",
        xp: Number(activity.xp) || 100,
        steps: Array.isArray(activity.steps)
          ? activity.steps.map(s => {
              if (typeof s === 'string') return { text: s };
              const cleanStep = { text: s?.text || '' };
              if (s?.link) cleanStep.link = s.link;
              if (s?.linkText) cleanStep.linkText = s.linkText;
              return cleanStep;
            })
          : [{ text: '' }],
        proTip: activity.proTip || "",
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || "Teacher",
        publishedAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, "activity_library"), newActivity);
      return { id: docRef.id, ...newActivity };
    } catch (error) {
      console.error("Error publishing activity:", error);
      throw error;
    }
  },

  async getPublicActivities() {
    try {
      const q = query(collection(db, "activity_library"));
      const querySnapshot = await getDocs(q);
      const activities = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        activities.push({
          id: docSnap.id,
          title: data.title || "Untitled Activity",
          desc: data.desc || "",
          type: data.type || "Low Tech",
          xp: typeof data.xp === 'number' ? data.xp : 100,
          steps: Array.isArray(data.steps) ? data.steps : [{ text: '' }],
          proTip: data.proTip || "",
          authorName: data.authorName || "Teacher",
          authorId: data.authorId || "",
          publishedAt: data.publishedAt || null
        });
      });
      return activities;
    } catch (error) {
      console.error("Error fetching library activities:", error);
      return [];
    }
  },

  // ================= STUDENT AUTH =================
  async joinClass(classCode, username) {
    // Deprecated legacy join (creates student on fly)
    // We keep this for backward compatibility if needed,
    // OR we change this to just "Get Class Info" for the new flow.
    // The new flow uses `getClassByCode` then `loginStudent`.
    return this.getClassByCode(classCode);
  },

  async getStudent(studentId) {
    try {
      const docRef = doc(db, "students", studentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting student:", error);
      return null;
    }
  },

  async updateStudent(studentId, updates) {
    try {
      const docRef = doc(db, "students", studentId);
      await updateDoc(docRef, updates);
      return { id: studentId, ...updates };
    } catch (error) {
      console.error("Error updating student:", error);
      return null;
    }
  },

  async deleteStudent(studentId, classId) {
    try {
      await deleteDoc(doc(db, "students", studentId));

      // Update count
      if (classId) {
        const classRef = doc(db, "classes", classId);
        const classSnap = await getDoc(classRef);
        if (classSnap.exists()) {
          const count = classSnap.data().studentCount || 0;
          await updateDoc(classRef, { studentCount: Math.max(0, count - 1) });
        }
      }
      return true;
    } catch (error) {
      console.error("Error deleting student:", error);
      throw error;
    }
  },

  // ================= SUBMISSIONS =================
  async getSubmissions(classId) {
    try {
      const q = query(collection(db, "submissions"), where("classId", "==", classId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting submissions:", error);
      return [];
    }
  },

  subscribeToSubmissions(classId, callback) {
    const q = query(collection(db, "submissions"), where("classId", "==", classId));
    return onSnapshot(q, (querySnapshot) => {
      const submissions = [];
      querySnapshot.forEach((doc) => {
        submissions.push({ id: doc.id, ...doc.data() });
      });
      callback(submissions);
    });
  },

  async getStudentSubmissions(studentId) {
    try {
      const q = query(collection(db, "submissions"), where("studentId", "==", studentId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting student submissions:", error);
      return [];
    }
  },

  async createSubmission(studentId, classId, submissionData) {
    try {
      const newSubmission = {
        studentId,
        classId,
        ...submissionData,
        submittedAt: new Date().toISOString(),
        status: 'pending',
        teacherFeedback: ''
      };

      const docRef = await addDoc(collection(db, "submissions"), newSubmission);
      return { id: docRef.id, ...newSubmission };
    } catch (error) {
      console.error("Error creating submission:", error);
      throw error;
    }
  },

  async reviewSubmission(submissionId, status, feedback) {
    try {
      const docRef = doc(db, "submissions", submissionId);
      await updateDoc(docRef, {
        status,
        teacherFeedback: feedback,
        reviewedAt: new Date().toISOString()
      });
      return { id: submissionId, status, teacherFeedback: feedback };
    } catch (error) {
      console.error("Error reviewing submission:", error);
      throw error;
    }
  },

  // ================= ACTIVITY RESET =================
  async resetStudentActivities(studentId) {
    try {
      const docRef = doc(db, "students", studentId);
      await updateDoc(docRef, {
        completedActivities: [],
        lastActivityReset: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error("Error resetting student activities:", error);
      throw error;
    }
  },

  async resetClassActivities(classId) {
    try {
      const q = query(collection(db, "students"), where("classId", "==", classId));
      const querySnapshot = await getDocs(q);
      const updates = [];
      querySnapshot.forEach((studentDoc) => {
        updates.push(updateDoc(doc(db, "students", studentDoc.id), {
          completedActivities: [],
          lastActivityReset: new Date().toISOString()
        }));
      });
      await Promise.all(updates);
      return querySnapshot.size;
    } catch (error) {
      console.error("Error resetting class activities:", error);
      throw error;
    }
  },

  // ================= CO-TEACHER MANAGEMENT =================
  async addCoTeacher(classId, email) {
    try {
      // Look up teacher by email
      const q = query(collection(db, "teachers"), where("email", "==", email));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error("No teacher found with that email. They must create an account first.");
      }

      const coTeacherDoc = snapshot.docs[0];
      const coTeacherId = coTeacherDoc.id;

      // Get the class to check ownership and existing co-teachers
      const classRef = doc(db, "classes", classId);
      const classSnap = await getDoc(classRef);
      if (!classSnap.exists()) throw new Error("Class not found");

      const classData = classSnap.data();

      if (classData.teacherId === coTeacherId) {
        throw new Error("That teacher already owns this class.");
      }

      const existing = classData.coTeacherIds || [];
      if (existing.includes(coTeacherId)) {
        throw new Error("That teacher is already a co-teacher for this class.");
      }

      await updateDoc(classRef, {
        coTeacherIds: [...existing, coTeacherId]
      });

      return { id: coTeacherDoc.id, name: coTeacherDoc.data().name, email: coTeacherDoc.data().email };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async removeCoTeacher(classId, coTeacherId) {
    try {
      const classRef = doc(db, "classes", classId);
      const classSnap = await getDoc(classRef);
      if (!classSnap.exists()) throw new Error("Class not found");

      const classData = classSnap.data();
      const updated = (classData.coTeacherIds || []).filter(id => id !== coTeacherId);

      await updateDoc(classRef, { coTeacherIds: updated });
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async getCoTeachers(classId) {
    try {
      const classRef = doc(db, "classes", classId);
      const classSnap = await getDoc(classRef);
      if (!classSnap.exists()) return [];

      const coTeacherIds = classSnap.data().coTeacherIds || [];
      const coTeachers = [];

      for (const id of coTeacherIds) {
        const teacherSnap = await getDoc(doc(db, "teachers", id));
        if (teacherSnap.exists()) {
          coTeachers.push({ id: teacherSnap.id, ...teacherSnap.data() });
        }
      }

      return coTeachers;
    } catch (error) {
      console.error("Error getting co-teachers:", error);
      return [];
    }
  },

  // ================= STUDENT SELF-SIGNUP =================
  async studentSelfSignup(classId, name, password) {
    // Same as createStudent but intended for the student-facing signup flow
    return this.createStudent(classId, name, password);
  },

  // ================= LEADERBOARD =================
  async getClassLeaderboard(classId) {
    try {
      const students = await this.getStudents(classId);
      return students
        .map(s => ({
          id: s.id,
          name: s.name,
          xp: s.xp || 0,
          avatar: s.avatar || { color: 'default', hat: 'none', accessory: 'none', face: 'happy' },
          unlockedAchievements: s.unlockedAchievements || [],
          guild: s.guild || null,
          guildXpContributed: s.guildXpContributed || 0,
          totalActivitiesCompleted: s.totalActivitiesCompleted || 0,
          currentStreak: s.currentStreak || 0,
        }))
        .sort((a, b) => b.xp - a.xp);
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      return [];
    }
  },

  // ================= STUDENT SPOTLIGHT =================
  async setStudentSpotlight(classId, spotlightData) {
    try {
      const classRef = doc(db, "classes", classId);
      await updateDoc(classRef, { spotlight: spotlightData });
      return true;
    } catch (error) {
      console.error("Error setting spotlight:", error);
      throw error;
    }
  },

  async clearStudentSpotlight(classId) {
    try {
      const classRef = doc(db, "classes", classId);
      await updateDoc(classRef, { spotlight: null });
      return true;
    } catch (error) {
      console.error("Error clearing spotlight:", error);
      throw error;
    }
  },

  // ================= GUILD CHALLENGES =================
  async getGuildLeaderboard(classId) {
    try {
      const students = await this.getStudents(classId);
      const guildStats = {};
      students.forEach(s => {
        if (s.guild) {
          if (!guildStats[s.guild]) {
            guildStats[s.guild] = { totalXp: 0, memberCount: 0, members: [] };
          }
          guildStats[s.guild].totalXp += (s.guildXpContributed || 0);
          guildStats[s.guild].memberCount += 1;
          guildStats[s.guild].members.push({
            id: s.id,
            name: s.name,
            xp: s.guildXpContributed || 0,
            totalXp: s.xp || 0,
            coins: s.coins || 0,
            currentStreak: s.currentStreak || 0,
            unlockedAchievements: s.unlockedAchievements || [],
            avatar: s.avatar || { color: 'default', hat: 'none', accessory: 'none', face: 'happy' },
          });
        }
      });
      // Sort members within each guild
      Object.values(guildStats).forEach(g => {
        g.members.sort((a, b) => b.xp - a.xp);
      });
      return guildStats;
    } catch (error) {
      console.error("Error getting guild leaderboard:", error);
      return {};
    }
  },

  // ================= GUILD REWARDS (TEACHER) =================
  async rewardGuild(classId, guildId, rewardType, rewardValue) {
    try {
      const students = await this.getStudents(classId);
      const guildMembers = students.filter(s => s.guild === guildId);
      if (guildMembers.length === 0) throw new Error('No members in this guild');

      for (const student of guildMembers) {
        const updates = {};
        if (rewardType === 'xp') {
          updates.xp = (student.xp || 0) + rewardValue;
          updates.guildXpContributed = (student.guildXpContributed || 0) + rewardValue;
        } else if (rewardType === 'coins') {
          updates.coins = (student.coins || 0) + rewardValue;
        } else if (rewardType === 'achievement') {
          const current = student.unlockedAchievements || [];
          if (!current.includes(rewardValue)) {
            updates.unlockedAchievements = [...current, rewardValue];
          }
        }
        if (Object.keys(updates).length > 0) {
          await updateDoc(doc(db, "students", student.id), updates);
        }
      }
      return guildMembers.length;
    } catch (error) {
      console.error("Error rewarding guild:", error);
      throw error;
    }
  },

  // ================= GUILD HALL =================
  async getGuildHall(classId, guildId) {
    try {
      const hallDoc = await getDoc(doc(db, "classes", classId, "guildHalls", guildId));
      if (hallDoc.exists()) {
        return { id: hallDoc.id, ...hallDoc.data() };
      }
      return { id: guildId, trophies: [], description: '', banner: '' };
    } catch (error) {
      console.error("Error getting guild hall:", error);
      return { id: guildId, trophies: [], description: '', banner: '' };
    }
  },

  async updateGuildHall(classId, guildId, data) {
    try {
      await setDoc(doc(db, "classes", classId, "guildHalls", guildId), {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error("Error updating guild hall:", error);
      throw error;
    }
  },

  async addGuildHallTrophy(classId, guildId, trophy) {
    try {
      const hall = await this.getGuildHall(classId, guildId);
      const trophies = [...(hall.trophies || []), { ...trophy, awardedAt: new Date().toISOString() }];
      await this.updateGuildHall(classId, guildId, { trophies });
      return true;
    } catch (error) {
      console.error("Error adding guild hall trophy:", error);
      throw error;
    }
  },

  // ================= CUSTOM REWARDS (TEACHER-CREATED SHOP ITEMS) =================
  async getCustomRewards(classId) {
    try {
      const q = query(collection(db, "classes", classId, "customRewards"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error("Error getting custom rewards:", error);
      return [];
    }
  },

  async createCustomReward(classId, rewardData) {
    try {
      const docRef = await addDoc(collection(db, "classes", classId, "customRewards"), {
        ...rewardData,
        active: true,
        createdAt: serverTimestamp(),
      });
      return { id: docRef.id, ...rewardData, active: true };
    } catch (error) {
      console.error("Error creating custom reward:", error);
      throw error;
    }
  },

  async updateCustomReward(classId, rewardId, updates) {
    try {
      const docRef = doc(db, "classes", classId, "customRewards", rewardId);
      await updateDoc(docRef, updates);
      return { id: rewardId, ...updates };
    } catch (error) {
      console.error("Error updating custom reward:", error);
      throw error;
    }
  },

  async deleteCustomReward(classId, rewardId) {
    try {
      await deleteDoc(doc(db, "classes", classId, "customRewards", rewardId));
      return true;
    } catch (error) {
      console.error("Error deleting custom reward:", error);
      throw error;
    }
  },

  // ================= REWARD REDEMPTIONS =================
  async redeemCustomReward(classId, rewardId, redemptionData) {
    try {
      const docRef = await addDoc(collection(db, "classes", classId, "redemptions"), {
        rewardId,
        ...redemptionData,
        status: 'pending', // pending, fulfilled, cancelled
        redeemedAt: serverTimestamp(),
      });
      return { id: docRef.id, rewardId, ...redemptionData, status: 'pending' };
    } catch (error) {
      console.error("Error redeeming reward:", error);
      throw error;
    }
  },

  async getRedemptions(classId) {
    try {
      const q = query(collection(db, "classes", classId, "redemptions"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error("Error getting redemptions:", error);
      return [];
    }
  },

  subscribeToRedemptions(classId, callback) {
    const q = query(collection(db, "classes", classId, "redemptions"));
    return onSnapshot(q, (snapshot) => {
      const redemptions = [];
      snapshot.forEach((d) => {
        redemptions.push({ id: d.id, ...d.data() });
      });
      callback(redemptions);
    });
  },

  async updateRedemption(classId, redemptionId, updates) {
    try {
      const docRef = doc(db, "classes", classId, "redemptions", redemptionId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Error updating redemption:", error);
      throw error;
    }
  },

  // ================= ORGANIZATIONS =================
  async createOrganization(name, description = '') {
    try {
      let code;
      let isUnique = false;

      while (!isUnique) {
        code = 'ORG-' + Math.random().toString(36).substring(2, 7).toUpperCase();
        const q = query(collection(db, "organizations"), where("code", "==", code));
        const snapshot = await getDocs(q);
        if (snapshot.empty) isUnique = true;
      }

      const newOrg = {
        name,
        description,
        code,
        teacherCount: 0,
        classCount: 0,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "organizations"), newOrg);
      return { id: docRef.id, ...newOrg };
    } catch (error) {
      throw new Error("Failed to create organization: " + error.message);
    }
  },

  async getOrganizations() {
    try {
      const q = query(collection(db, "organizations"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error("Error fetching organizations:", error);
      return [];
    }
  },

  async getOrganization(orgId) {
    try {
      const docSnap = await getDoc(doc(db, "organizations", orgId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching organization:", error);
      return null;
    }
  },

  async getOrganizationByCode(code) {
    try {
      const q = query(collection(db, "organizations"), where("code", "==", code.trim().toUpperCase()));
      const snapshot = await getDocs(q);
      if (snapshot.empty) throw new Error("Organization not found with code: " + code);
      const d = snapshot.docs[0];
      return { id: d.id, ...d.data() };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  async updateOrganization(orgId, updates) {
    try {
      const docRef = doc(db, "organizations", orgId);
      await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
      return { id: orgId, ...updates };
    } catch (error) {
      throw new Error("Error updating organization: " + error.message);
    }
  },

  async deleteOrganization(orgId) {
    try {
      await deleteDoc(doc(db, "organizations", orgId));
      return true;
    } catch (error) {
      throw new Error("Error deleting organization: " + error.message);
    }
  },

  // ================= ADMIN & TEACHER USER MANAGEMENT =================
  async getAllTeachers() {
    try {
      const snapshot = await getDocs(collection(db, "teachers"));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error("Error fetching teachers:", error);
      return [];
    }
  },

  async getTeachersByOrganization(orgId) {
    try {
      const q = query(collection(db, "teachers"), where("organizationId", "==", orgId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error("Error fetching teachers by org:", error);
      return [];
    }
  },

  async assignTeacherToOrg(teacherId, organizationId, organizationName = '') {
    try {
      const teacherRef = doc(db, "teachers", teacherId);
      await updateDoc(teacherRef, {
        organizationId: organizationId || null,
        organizationName: organizationName || '',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      throw new Error("Failed to assign teacher to organization: " + error.message);
    }
  },

  async updateTeacherRole(teacherId, newRole) {
    try {
      const teacherRef = doc(db, "teachers", teacherId);
      await updateDoc(teacherRef, {
        role: newRole,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      throw new Error("Failed to update teacher role: " + error.message);
    }
  },

  async createTeacherUserByAdmin(name, email, password, organizationId = null, organizationName = '', role = 'teacher') {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      const teacherDoc = {
        name,
        email,
        role: role || 'teacher',
        organizationId: organizationId || null,
        organizationName: organizationName || '',
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, "teachers", user.uid), teacherDoc);

      if (organizationId) {
        const orgRef = doc(db, "organizations", organizationId);
        const orgSnap = await getDoc(orgRef);
        if (orgSnap.exists()) {
          const count = orgSnap.data().teacherCount || 0;
          await updateDoc(orgRef, { teacherCount: count + 1 });
        }
      }

      return { id: user.uid, ...teacherDoc };
    } catch (error) {
      throw new Error("Failed to create teacher user: " + error.message);
    }
  },

  // ================= ORGANIZATION CHOICE BOARD TEMPLATES =================
  async createOrgTemplate(orgId, templateData) {
    try {
      const newTemplate = {
        orgId,
        title: templateData.title || 'Untitled Choice Board Template',
        description: templateData.description || '',
        activities: templateData.activities || [],
        categoryNames: templateData.categoryNames || {},
        categorySubtitles: templateData.categorySubtitles || {},
        createdBy: templateData.createdBy || 'Admin',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, "orgTemplates"), newTemplate);
      return { id: docRef.id, ...newTemplate };
    } catch (error) {
      throw new Error("Failed to create choice board template: " + error.message);
    }
  },

  async getOrgTemplates(orgId) {
    try {
      const q = query(collection(db, "orgTemplates"), where("orgId", "==", orgId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
      console.error("Error getting organization choice board templates:", error);
      return [];
    }
  },

  async updateOrgTemplate(templateId, updates) {
    try {
      const docRef = doc(db, "orgTemplates", templateId);
      await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
      return { id: templateId, ...updates };
    } catch (error) {
      throw new Error("Failed to update choice board template: " + error.message);
    }
  },

  async deleteOrgTemplate(templateId) {
    try {
      await deleteDoc(doc(db, "orgTemplates", templateId));
      return true;
    } catch (error) {
      throw new Error("Failed to delete choice board template: " + error.message);
    }
  },

  async getAllClassesByOrg(orgId) {
    try {
      // 1. Get classes explicitly tagged with organizationId == orgId
      const orgQuery = query(collection(db, "classes"), where("organizationId", "==", orgId));
      const orgSnapshot = await getDocs(orgQuery);
      const classesMap = new Map();
      orgSnapshot.forEach(d => classesMap.set(d.id, { id: d.id, ...d.data() }));

      // 2. Also query teachers in this org and include their classes
      const teachers = await this.getTeachersByOrganization(orgId);
      const teacherIds = teachers.map(t => t.id);

      for (const tId of teacherIds) {
        const teacherClasses = await this.getClasses(tId);
        for (const cls of teacherClasses) {
          if (!classesMap.has(cls.id)) {
            classesMap.set(cls.id, cls);
          }
        }
      }

      return Array.from(classesMap.values());
    } catch (error) {
      console.error("Error getting classes by organization:", error);
      return [];
    }
  },

  async applyTemplateToClasses(templateId, classIds) {
    try {
      const templateDoc = await getDoc(doc(db, "orgTemplates", templateId));
      if (!templateDoc.exists()) throw new Error("Template not found");
      const templateData = templateDoc.data();

      const updatePromises = classIds.map(classId => {
        const classRef = doc(db, "classes", classId);
        return updateDoc(classRef, {
          activities: templateData.activities || [],
          categoryNames: templateData.categoryNames || {},
          categorySubtitles: templateData.categorySubtitles || {},
          appliedTemplateId: templateId,
          appliedTemplateTitle: templateData.title,
          updatedAt: serverTimestamp()
        });
      });

      await Promise.all(updatePromises);
      return { success: true, count: classIds.length };
    } catch (error) {
      throw new Error("Failed to apply template to classes: " + error.message);
    }
  },

  async applyTemplateToOrganization(orgId, templateId) {
    try {
      const targetClasses = await this.getAllClassesByOrg(orgId);
      const classIds = targetClasses.map(c => c.id);
      if (classIds.length === 0) {
        return { success: true, count: 0 };
      }
      return await this.applyTemplateToClasses(templateId, classIds);
    } catch (error) {
      throw new Error("Failed to apply template to organization: " + error.message);
    }
  },

  async importTemplateActivitiesToClass(classId, activitiesToImport, categoryNames = {}, categorySubtitles = {}) {
    try {
      const classRef = doc(db, "classes", classId);
      const classSnap = await getDoc(classRef);
      if (!classSnap.exists()) throw new Error("Class not found");

      const classData = classSnap.data();
      let currentActivities = classData.activities && classData.activities.length > 0
        ? classData.activities
        : DEFAULT_PATHS;

      const mergedCategoryNames = { ...(classData.categoryNames || {}), ...categoryNames };
      const mergedCategorySubtitles = { ...(classData.categorySubtitles || {}), ...categorySubtitles };

      // Map existing path options to append new activities without deleting existing ones
      const updatedActivities = currentActivities.map(path => {
        const matchingImportPath = activitiesToImport.find(p => p.id === path.id);
        if (!matchingImportPath || !matchingImportPath.options) return path;

        const existingOptIds = new Set((path.options || []).map(o => o.id));
        const newOptions = matchingImportPath.options.filter(o => !existingOptIds.has(o.id));

        return {
          ...path,
          options: [...(path.options || []), ...newOptions]
        };
      });

      // Add any new path IDs present in activitiesToImport that weren't in currentActivities
      const existingPathIds = new Set(updatedActivities.map(p => p.id));
      activitiesToImport.forEach(importPath => {
        if (!existingPathIds.has(importPath.id)) {
          updatedActivities.push(importPath);
        }
      });

      await updateDoc(classRef, {
        activities: updatedActivities,
        categoryNames: mergedCategoryNames,
        categorySubtitles: mergedCategorySubtitles,
        updatedAt: serverTimestamp()
      });

      return { success: true, activities: updatedActivities, categoryNames: mergedCategoryNames, categorySubtitles: mergedCategorySubtitles };
    } catch (error) {
      throw new Error("Failed to import activities to class: " + error.message);
    }
  }
};

