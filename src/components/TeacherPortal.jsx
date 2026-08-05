import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { realBackend as backend } from '../services/realBackend';
import {
  Users, Plus, LogOut, BookOpen, ClipboardList, CheckCircle2,
  XCircle, Clock, ChevronRight, GraduationCap, Copy, Trash2, Edit, RefreshCw, RotateCcw, Link, Save, Gift,
  Share2, UserPlus, X, Mail, MessageSquare, Sparkles, Star, Trophy, ChevronDown, ChevronUp, BarChart3, Eye, Zap, Building2, Layers
} from 'lucide-react';
import { LEVELS, ACHIEVEMENTS, GUILDS, GUILD_TROPHIES, LEARNING_PATHS, MAX_CATEGORIES, PATH_COLORS } from '../data/gameData';
import Avatar3D from './Avatar3D';
import { FileViewer } from './FileViewer';
import ActivityEditor from './ActivityEditor';
import RosterManager from './RosterManager';
import ChoiceBoardExport from './ChoiceBoardExport';

export default function TeacherPortal() {
  const { user, logout } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingClass, setCreatingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions', 'students', 'activities', 'categories'
  const [categoryNames, setCategoryNames] = useState({});
  const [categorySubtitles, setCategorySubtitles] = useState({});
  const [savingCategories, setSavingCategories] = useState(false);

  // Co-teacher state
  const [coTeachers, setCoTeachers] = useState([]);
  const [coTeacherEmail, setCoTeacherEmail] = useState('');
  const [addingCoTeacher, setAddingCoTeacher] = useState(false);

  // Spotlight state
  const [spotlight, setSpotlight] = useState(null);
  const [spotlightMessage, setSpotlightMessage] = useState('');
  const [spotlightCategory, setSpotlightCategory] = useState('star_student');
  const [savingSpotlight, setSavingSpotlight] = useState(false);

  // Org Choice Board Template state
  const [orgTemplates, setOrgTemplates] = useState([]);
  const [showOrgTemplatesModal, setShowOrgTemplatesModal] = useState(false);
  const [selectedTemplateToApply, setSelectedTemplateToApply] = useState(null);
  const [targetClassIdsToApply, setTargetClassIdsToApply] = useState([]);
  const [applyingTemplate, setApplyingTemplate] = useState(false);
  const [inspectingTemplate, setInspectingTemplate] = useState(null);
  const [importingSingleActivityId, setImportingSingleActivityId] = useState(null);

  const loadOrgTemplates = async () => {
    if (!user.organizationId) return;
    try {
      const tmps = await backend.getOrgTemplates(user.organizationId);
      setOrgTemplates(tmps);
    } catch (e) {
      console.error("Failed to load organization templates:", e);
    }
  };

  const handleImportSingleActivity = async (template, pathId, activity) => {
    if (!selectedClass) {
      alert('Please select a class first.');
      return;
    }
    setImportingSingleActivityId(activity.id);
    try {
      const singleActivityPath = [{
        id: pathId,
        title: template.categoryNames?.[pathId] || '',
        subtitle: template.categorySubtitles?.[pathId] || '',
        options: [activity]
      }];
      await backend.importTemplateActivitiesToClass(
        selectedClass.id,
        singleActivityPath,
        template.categoryNames || {},
        template.categorySubtitles || {}
      );
      alert(`Imported "${activity.title}" into "${selectedClass.name}" without removing existing activities!`);
      const updatedClass = await backend.getClass(selectedClass.id);
      if (updatedClass) {
        setSelectedClass(updatedClass);
        setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
      }
    } catch (err) {
      alert('Error importing activity: ' + err.message);
    }
    setImportingSingleActivityId(null);
  };

  const handleImportAllTemplateActivities = async (template) => {
    if (!selectedClass) {
      alert('Please select a class first.');
      return;
    }
    if (!window.confirm(`Import all activities from "${template.title}" into "${selectedClass.name}"? Existing activities will NOT be removed.`)) return;
    setApplyingTemplate(true);
    try {
      await backend.importTemplateActivitiesToClass(
        selectedClass.id,
        template.activities || [],
        template.categoryNames || {},
        template.categorySubtitles || {}
      );
      alert(`Successfully imported all activities from "${template.title}" into "${selectedClass.name}"!`);
      setShowOrgTemplatesModal(false);
      const updatedClass = await backend.getClass(selectedClass.id);
      if (updatedClass) {
        setSelectedClass(updatedClass);
        setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
      }
    } catch (err) {
      alert('Error importing template activities: ' + err.message);
    }
    setApplyingTemplate(false);
  };

  const handleApplyOrgTemplate = async () => {
    if (!selectedTemplateToApply || targetClassIdsToApply.length === 0) {
      alert('Please select a template and at least one class.');
      return;
    }
    setApplyingTemplate(true);
    try {
      await backend.applyTemplateToClasses(selectedTemplateToApply.id, targetClassIdsToApply);
      alert(`Applied "${selectedTemplateToApply.title}" to ${targetClassIdsToApply.length} class(es)!`);
      setShowOrgTemplatesModal(false);
      setSelectedTemplateToApply(null);
      handleRefresh();
    } catch (e) {
      alert('Error applying template: ' + e.message);
    }
    setApplyingTemplate(false);
  };

  useEffect(() => {
    loadClasses();
  }, [user.id]);

  useEffect(() => {
    let unsubscribe;
    if (selectedClass) {
      setLoading(true);

      // Load Students
      backend.getStudents(selectedClass.id).then(data => {
        setStudents(data);
      });

      // Subscribe to Submissions (Real-time)
      unsubscribe = backend.subscribeToSubmissions(selectedClass.id, (data) => {
        setSubmissions(data);
        setLoading(false);
      });
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedClass]);

  const loadClasses = async () => {
    const data = await backend.getClasses(user.id);
    setClasses(data);
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      await backend.createClass(user.id, newClassName);
      setNewClassName('');
      setCreatingClass(false);
      loadClasses();
    } catch (error) {
      console.error(error);
      alert('Failed to create class: ' + error.message + '\n\nMake sure Firestore is enabled and Security Rules allow writes.');
    }
  };

  const handleDeleteClass = async (classId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this class? This cannot be undone.')) {
      try {
        await backend.deleteClass(classId);
        if (selectedClass?.id === classId) setSelectedClass(null);
        loadClasses();
      } catch (error) {
        alert('Error deleting class: ' + error.message);
      }
    }
  };

  const handleReview = async (submissionId, status, feedback) => {
    await backend.reviewSubmission(submissionId, status, feedback);
    // No need to reload, subscription handles it
  };

  const handleRefresh = () => {
    loadClasses();
    if (selectedClass) {
        // Trigger reload by resetting selectedClass briefly or just calling fetch
        // Since we have realtime subscriptions for submissions, we mostly need to refresh students/metadata
        backend.getStudents(selectedClass.id).then(setStudents);
    }
  };

  // Load co-teachers when class changes
  useEffect(() => {
    if (selectedClass) {
      backend.getCoTeachers(selectedClass.id).then(setCoTeachers);
    } else {
      setCoTeachers([]);
    }
  }, [selectedClass]);

  const handleAddCoTeacher = async (e) => {
    e.preventDefault();
    if (!coTeacherEmail.trim()) return;
    setAddingCoTeacher(true);
    try {
      await backend.addCoTeacher(selectedClass.id, coTeacherEmail.trim().toLowerCase());
      setCoTeacherEmail('');
      const updated = await backend.getCoTeachers(selectedClass.id);
      setCoTeachers(updated);
      alert('Co-teacher added!');
    } catch (error) {
      alert(error.message);
    }
    setAddingCoTeacher(false);
  };

  const handleRemoveCoTeacher = async (coTeacherId, coTeacherName) => {
    if (!window.confirm(`Remove ${coTeacherName} as co-teacher?`)) return;
    try {
      await backend.removeCoTeacher(selectedClass.id, coTeacherId);
      setCoTeachers(prev => prev.filter(t => t.id !== coTeacherId));
    } catch (error) {
      alert(error.message);
    }
  };

  // Load spotlight when class changes
  useEffect(() => {
    if (selectedClass) {
      setSpotlight(selectedClass.spotlight || null);
    } else {
      setSpotlight(null);
    }
  }, [selectedClass]);

  const handleSetSpotlight = async (student) => {
    if (!selectedClass) return;
    setSavingSpotlight(true);
    try {
      const spotlightData = {
        studentId: student.id,
        studentName: student.name,
        avatar: student.avatar || { color: 'default', hat: 'none', accessory: 'none', face: 'happy' },
        xp: student.xp || 0,
        message: spotlightMessage || 'Keep up the great work!',
        category: spotlightCategory,
        setAt: new Date().toISOString(),
        setBy: user.name,
      };
      await backend.setStudentSpotlight(selectedClass.id, spotlightData);
      setSpotlight(spotlightData);
      setSelectedClass(prev => ({ ...prev, spotlight: spotlightData }));
      setSpotlightMessage('');
      alert(`${student.name} is now the class spotlight!`);
    } catch (error) {
      alert('Error setting spotlight: ' + error.message);
    }
    setSavingSpotlight(false);
  };

  const handleClearSpotlight = async () => {
    if (!selectedClass) return;
    if (!window.confirm('Remove the current spotlight?')) return;
    try {
      await backend.clearStudentSpotlight(selectedClass.id);
      setSpotlight(null);
      setSelectedClass(prev => ({ ...prev, spotlight: null }));
    } catch (error) {
      alert('Error clearing spotlight: ' + error.message);
    }
  };

  // Load category names when class changes
  useEffect(() => {
    if (selectedClass) {
      // Build names/subtitles from saved data, falling back to defaults from LEARNING_PATHS
      const names = {};
      const subs = {};
      // Start with the default paths
      LEARNING_PATHS.forEach(p => {
        names[p.id] = selectedClass.categoryNames?.[p.id] || p.title;
        subs[p.id] = selectedClass.categorySubtitles?.[p.id] || p.subtitle;
      });
      // Include any extra paths the teacher may have added beyond defaults
      if (selectedClass.categoryNames) {
        Object.keys(selectedClass.categoryNames).forEach(key => {
          if (!(key in names)) {
            names[key] = selectedClass.categoryNames[key];
            subs[key] = selectedClass.categorySubtitles?.[key] || '';
          }
        });
      }
      setCategoryNames(names);
      setCategorySubtitles(subs);
    }
  }, [selectedClass]);

  const handleSaveCategories = async () => {
    if (!selectedClass) return;
    setSavingCategories(true);
    try {
      await backend.updateClass(selectedClass.id, { categoryNames, categorySubtitles });
      // Update local class data
      setSelectedClass(prev => ({ ...prev, categoryNames, categorySubtitles }));
      setClasses(prev => prev.map(c => c.id === selectedClass.id ? { ...c, categoryNames, categorySubtitles } : c));
      alert('Category names saved!');
    } catch (error) {
      alert('Error saving categories: ' + error.message);
    }
    setSavingCategories(false);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert('Class code copied!');
  };

  const copyJoinLink = (code) => {
    const url = `https://level-up-choice-board-game.web.app/?code=${code}`;
    navigator.clipboard.writeText(url);
    alert('Join link copied!');
  };

  const handleResetClassActivities = async () => {
    if (!selectedClass) return;
    if (!window.confirm(
      `Reset all activity completion status for "${selectedClass.name}"?\n\n` +
      'This lets all students redo activities and earn XP again.\n' +
      'XP, coins, achievements, and streaks are NOT affected.'
    )) return;
    try {
      const count = await backend.resetClassActivities(selectedClass.id);
      alert(`Activities reset for ${count} student${count !== 1 ? 's' : ''}. They can now redo all activities.`);
      backend.getStudents(selectedClass.id).then(setStudents);
    } catch (error) {
      alert('Error resetting activities: ' + error.message);
    }
  };

  // Filter submissions
  const pending = submissions.filter(s => s.status === 'pending');
  const reviewed = submissions.filter(s => s.status !== 'pending');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <header className="flex items-center justify-between mb-8 pb-8 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600 rounded-lg" aria-hidden="true">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black uppercase italic">Teacher Portal</h1>
                {user.organizationName && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-950/60 text-blue-300 border border-blue-800/40 rounded-lg text-xs font-semibold">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    {user.organizationName}
                  </span>
                )}
              </div>
              <p className="text-slate-400">Welcome, {user.name}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
          >
            <LogOut className="w-5 h-5" aria-hidden="true" /> Logout
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar: Class List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold text-slate-400 uppercase text-xs tracking-widest">Your Classes</h2>
              <button
                onClick={() => setCreatingClass(true)}
                className="text-green-400 hover:text-green-300"
                aria-label="Create new class"
              >
                <Plus className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {creatingClass && (
              <form onSubmit={handleCreateClass} className="mb-4 bg-slate-800 p-3 rounded-lg border border-slate-600" aria-label="Create new class">
                <label htmlFor="new-class-name" className="sr-only">Class Name</label>
                <input
                  id="new-class-name"
                  autoFocus
                  type="text"
                  placeholder="Class Name"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 rounded text-sm text-white mb-2"
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-green-600 text-xs font-bold py-1 rounded">Create</button>
                  <button type="button" onClick={() => setCreatingClass(false)} className="flex-1 bg-slate-600 text-xs font-bold py-1 rounded">Cancel</button>
                </div>
              </form>
            )}

            <div className="space-y-2" role="listbox" aria-label="Your classes">
              {classes.map(cls => (
                <div
                  key={cls.id}
                  role="option"
                  aria-selected={selectedClass?.id === cls.id}
                  tabIndex={0}
                  onClick={() => setSelectedClass(cls)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedClass(cls)}
                  className={`w-full p-4 rounded-xl text-left transition-all cursor-pointer relative group ${selectedClass?.id === cls.id ? 'bg-green-600 text-white shadow-lg shadow-green-900/50' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
                >
                  <div className="font-bold text-lg pr-6">{cls.name}</div>
                  <div className="flex justify-between items-center mt-2 text-sm opacity-80">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" aria-hidden="true" /> {cls.studentCount || 0} Students</span>
                    <span className="font-mono bg-black/20 px-2 rounded text-xs">Code: {cls.code}</span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteClass(cls.id, e)}
                    className="absolute top-2 right-2 p-2 text-red-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Delete class ${cls.name}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
              {classes.length === 0 && !creatingClass && (
                <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                  No classes yet.<br/>Click + to create one.
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedClass ? (
              <div>
                <div className="bg-slate-800 p-6 rounded-2xl mb-6 border border-slate-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-black text-white">{selectedClass.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-400 text-sm">Class Code:</span>
                        <code className="text-xl font-mono font-bold text-green-400 tracking-widest">{selectedClass.code}</code>
                        <button onClick={() => copyCode(selectedClass.code)} className="text-slate-500 hover:text-white" aria-label="Copy class code">
                          <Copy className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button onClick={() => copyJoinLink(selectedClass.code)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-white ml-2" aria-label="Copy join link">
                          <Link className="w-4 h-4" aria-hidden="true" /> Copy Join Link
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="p-2 text-slate-400 hover:text-white transition-colors"
                        aria-label={loading ? 'Refreshing data...' : 'Refresh data'}
                      >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                      </button>
                      <div className="text-right">
                        <p className="text-3xl font-black text-white">{pending.length}</p>
                        <p className="text-slate-400 text-xs uppercase font-bold">Pending Reviews</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="text-right">
                      <p className="text-3xl font-black text-white">{students.length}</p>
                      <p className="text-slate-400 text-xs uppercase font-bold">Students</p>
                    </div>
                    <div className="text-right border-l border-slate-600 pl-4">
                      <p className="text-3xl font-black text-white">{pending.length}</p>
                      <p className="text-slate-400 text-xs uppercase font-bold">Pending</p>
                    </div>
                    <div className="text-right border-l border-slate-600 pl-4">
                      <p className="text-3xl font-black text-white">{reviewed.filter(s => s.status === 'approved').length}</p>
                      <p className="text-slate-400 text-xs uppercase font-bold">Approved</p>
                    </div>
                    <div className="text-right border-l border-slate-600 pl-4">
                      <p className="text-3xl font-black text-white">{reviewed.filter(s => s.status === 'rejected').length}</p>
                      <p className="text-slate-400 text-xs uppercase font-bold">Rejected</p>
                    </div>
                    <div className="text-right border-l border-slate-600 pl-4">
                      <p className="text-3xl font-black text-green-400">{students.length > 0 ? Math.round(students.reduce((sum, s) => sum + (s.xp || 0), 0) / students.length) : 0}</p>
                      <p className="text-slate-400 text-xs uppercase font-bold">Avg XP</p>
                    </div>
                    <div className="ml-auto flex items-start gap-3">
                      <ChoiceBoardExport classId={selectedClass.id} className={selectedClass.name} />
                      <div>
                        <button
                          onClick={handleResetClassActivities}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/50 text-orange-300 rounded-lg text-sm font-bold transition-colors"
                          aria-label="Reset activity completion for all students"
                        >
                          <RotateCcw className="w-4 h-4" aria-hidden="true" /> Reset Activities
                        </button>
                        <p className="text-xs text-slate-500 mt-1">Auto-resets Mondays at 7am</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-slate-700" role="tablist" aria-label="Class management">
                  <button
                    role="tab"
                    aria-selected={activeTab === 'submissions'}
                    aria-controls="tabpanel-submissions"
                    id="tab-submissions"
                    onClick={() => setActiveTab('submissions')}
                    className={`pb-4 px-2 font-bold ${activeTab === 'submissions' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-400 hover:text-white'}`}
                  >
                    Submissions
                  </button>
                  <button
                    role="tab"
                    aria-selected={activeTab === 'students'}
                    aria-controls="tabpanel-students"
                    id="tab-students"
                    onClick={() => setActiveTab('students')}
                    className={`pb-4 px-2 font-bold ${activeTab === 'students' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-400 hover:text-white'}`}
                  >
                    Students
                  </button>
                  <button
                    role="tab"
                    aria-selected={activeTab === 'activities'}
                    aria-controls="tabpanel-activities"
                    id="tab-activities"
                    onClick={() => setActiveTab('activities')}
                    className={`pb-4 px-2 font-bold ${activeTab === 'activities' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-400 hover:text-white'}`}
                  >
                    Activities
                  </button>
                  <button
                    role="tab"
                    aria-selected={activeTab === 'categories'}
                    aria-controls="tabpanel-categories"
                    id="tab-categories"
                    onClick={() => setActiveTab('categories')}
                    className={`pb-4 px-2 font-bold ${activeTab === 'categories' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-400 hover:text-white'}`}
                  >
                    Categories
                  </button>
                  <button
                    role="tab"
                    aria-selected={activeTab === 'spotlight'}
                    aria-controls="tabpanel-spotlight"
                    id="tab-spotlight"
                    onClick={() => setActiveTab('spotlight')}
                    className={`pb-4 px-2 font-bold ${activeTab === 'spotlight' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-slate-400 hover:text-white'}`}
                  >
                    <span className="flex items-center gap-1"><Sparkles className="w-4 h-4" aria-hidden="true" /> Spotlight</span>
                  </button>
                  <button
                    role="tab"
                    aria-selected={activeTab === 'guilds'}
                    aria-controls="tabpanel-guilds"
                    id="tab-guilds"
                    onClick={() => setActiveTab('guilds')}
                    className={`pb-4 px-2 font-bold ${activeTab === 'guilds' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-400 hover:text-white'}`}
                  >
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" aria-hidden="true" /> Guilds</span>
                  </button>
                  <button
                    role="tab"
                    aria-selected={activeTab === 'sharing'}
                    aria-controls="tabpanel-sharing"
                    id="tab-sharing"
                    onClick={() => setActiveTab('sharing')}
                    className={`pb-4 px-2 font-bold ${activeTab === 'sharing' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-400 hover:text-white'}`}
                  >
                    Sharing
                  </button>
                  <button
                    role="tab"
                    aria-selected={activeTab === 'rewards'}
                    aria-controls="tabpanel-rewards"
                    id="tab-rewards"
                    onClick={() => setActiveTab('rewards')}
                    className={`pb-4 px-2 font-bold ${activeTab === 'rewards' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-400 hover:text-white'}`}
                  >
                    <span className="flex items-center gap-1"><Gift className="w-4 h-4" aria-hidden="true" /> Rewards</span>
                  </button>
                </div>

                {activeTab === 'activities' && (
                  <div role="tabpanel" id="tabpanel-activities" aria-labelledby="tab-activities">
                    {user.organizationId && (
                      <div className="mb-6 p-4 bg-slate-800 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-4 shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-purple-950/80 text-purple-400 border border-purple-800/40 rounded-xl">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm">Organization Choice Board Templates</h4>
                            <p className="text-xs text-slate-400">Import master choice boards configured for {user.organizationName || 'your organization'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            loadOrgTemplates();
                            if (selectedClass) setTargetClassIdsToApply([selectedClass.id]);
                            setShowOrgTemplatesModal(true);
                          }}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
                        >
                          <Layers className="w-4 h-4" /> Browse Org Templates
                        </button>
                      </div>
                    )}
                    <ActivityEditor
                      classId={selectedClass.id}
                      onSave={() => alert('Activities updated!')}
                    />
                  </div>
                )}

                {activeTab === 'categories' && (
                  <div role="tabpanel" id="tabpanel-categories" aria-labelledby="tab-categories">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                      <h3 className="text-xl font-bold text-white mb-2">Category Names</h3>
                      <p className="text-slate-400 text-sm mb-6">Customize your learning path category names and subtitles that students see. You can have up to {MAX_CATEGORIES} categories.</p>
                      <div className="space-y-6">
                        {Object.keys(categoryNames).map((key, idx) => {
                          const borderColors = ['border-blue-500', 'border-purple-500', 'border-orange-500', 'border-green-500', 'border-pink-500', 'border-teal-500'];
                          const color = borderColors[idx % borderColors.length];
                          const isDefault = LEARNING_PATHS.some(p => p.id === key);
                          return (
                          <div key={key} className={`p-4 bg-slate-700 rounded-lg border-l-4 ${color}`}>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs text-slate-500 font-mono">{key}</span>
                              {!isDefault && (
                                <button
                                  onClick={() => {
                                    if (!window.confirm('Remove this category? Activities in it will need to be reassigned.')) return;
                                    setCategoryNames(prev => { const next = { ...prev }; delete next[key]; return next; });
                                    setCategorySubtitles(prev => { const next = { ...prev }; delete next[key]; return next; });
                                  }}
                                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" /> Remove
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor={`cat-name-${key}`} className="block text-xs text-slate-400 font-bold uppercase mb-1">Category Name</label>
                                <input
                                  id={`cat-name-${key}`}
                                  type="text"
                                  value={categoryNames[key] || ''}
                                  onChange={e => setCategoryNames(prev => ({ ...prev, [key]: e.target.value }))}
                                  placeholder="Category name"
                                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-green-500 outline-none"
                                />
                              </div>
                              <div>
                                <label htmlFor={`cat-sub-${key}`} className="block text-xs text-slate-400 font-bold uppercase mb-1">Subtitle</label>
                                <input
                                  id={`cat-sub-${key}`}
                                  type="text"
                                  value={categorySubtitles[key] || ''}
                                  onChange={e => setCategorySubtitles(prev => ({ ...prev, [key]: e.target.value }))}
                                  placeholder="Subtitle"
                                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-green-500 outline-none"
                                />
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>

                      {Object.keys(categoryNames).length < MAX_CATEGORIES && (
                        <button
                          onClick={() => {
                            const nextNum = Object.keys(categoryNames).length + 1;
                            const newKey = `path${nextNum}`;
                            // Find a unique key
                            let key = newKey;
                            let counter = nextNum;
                            while (key in categoryNames) {
                              counter++;
                              key = `path${counter}`;
                            }
                            setCategoryNames(prev => ({ ...prev, [key]: `Category ${counter}` }));
                            setCategorySubtitles(prev => ({ ...prev, [key]: '' }));
                          }}
                          className="mt-4 flex items-center gap-2 px-4 py-2 border-2 border-dashed border-slate-600 hover:border-green-500 text-slate-400 hover:text-green-400 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Add Category
                        </button>
                      )}

                      <button
                        onClick={handleSaveCategories}
                        disabled={savingCategories}
                        className="mt-6 flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" aria-hidden="true" /> {savingCategories ? 'Saving...' : 'Save Category Names'}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'sharing' && (
                  <div role="tabpanel" id="tabpanel-sharing" aria-labelledby="tab-sharing">
                    <div className="space-y-6">
                      {/* Student Join Link */}
                      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                          <Link className="w-5 h-5 text-blue-400" aria-hidden="true" /> Student Join Link
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">
                          Share this link with students. They can create their own account and join the class directly.
                        </p>
                        <div className="flex items-center gap-3 bg-slate-900 p-3 rounded-lg border border-slate-700">
                          <code className="flex-1 text-blue-400 text-sm break-all">
                            {`${window.location.origin}/?code=${selectedClass.code}`}
                          </code>
                          <button
                            onClick={() => copyJoinLink(selectedClass.code)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-sm whitespace-nowrap"
                          >
                            <Copy className="w-4 h-4" aria-hidden="true" /> Copy Link
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Students who use this link can sign up with their own name and password. You can edit their info from the Students tab.
                        </p>
                      </div>

                      {/* Co-Teacher Management */}
                      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                          <Share2 className="w-5 h-5 text-purple-400" aria-hidden="true" /> Co-Teachers
                        </h3>
                        <p className="text-slate-400 text-sm mb-4">
                          Add other teachers to help manage this class. They'll see it in their dashboard and can review submissions, manage students, and edit activities.
                        </p>

                        {!selectedClass.isCoTeacher && (
                          <form onSubmit={handleAddCoTeacher} className="flex gap-3 mb-6" aria-label="Add co-teacher">
                            <div className="flex-1 relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" aria-hidden="true" />
                              <label htmlFor="co-teacher-email" className="sr-only">Co-teacher email</label>
                              <input
                                id="co-teacher-email"
                                type="email"
                                placeholder="Enter teacher's email address"
                                value={coTeacherEmail}
                                onChange={e => setCoTeacherEmail(e.target.value)}
                                className="w-full px-4 py-2 pl-10 bg-slate-700 rounded-lg text-white border border-slate-600 focus:border-purple-500 outline-none"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={addingCoTeacher}
                              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-sm disabled:opacity-50"
                            >
                              <UserPlus className="w-4 h-4" aria-hidden="true" /> {addingCoTeacher ? 'Adding...' : 'Add'}
                            </button>
                          </form>
                        )}

                        {selectedClass.isCoTeacher && (
                          <div className="mb-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-purple-300 text-sm">
                            You are a co-teacher on this class. Only the class owner can add or remove co-teachers.
                          </div>
                        )}

                        {coTeachers.length > 0 ? (
                          <div className="space-y-2">
                            {coTeachers.map(ct => (
                              <div key={ct.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg border border-slate-600">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white" aria-hidden="true">
                                    {ct.name?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                  <div>
                                    <p className="font-bold text-white text-sm">{ct.name}</p>
                                    <p className="text-xs text-slate-400">{ct.email}</p>
                                  </div>
                                </div>
                                {!selectedClass.isCoTeacher && (
                                  <button
                                    onClick={() => handleRemoveCoTeacher(ct.id, ct.name)}
                                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                                    aria-label={`Remove ${ct.name} as co-teacher`}
                                  >
                                    <X className="w-4 h-4" aria-hidden="true" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-500 text-sm italic">No co-teachers added yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'spotlight' && (
                  <div role="tabpanel" id="tabpanel-spotlight" aria-labelledby="tab-spotlight">
                    <div className="space-y-6">
                      {/* Current Spotlight */}
                      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-yellow-400" aria-hidden="true" /> Current Spotlight
                        </h3>
                        {spotlight ? (
                          <div className="bg-gradient-to-r from-yellow-900/30 to-amber-900/30 border-2 border-yellow-500/50 rounded-xl p-6">
                            <div className="flex items-center gap-4">
                              <Avatar3D avatar={spotlight.avatar} level={(() => {
                                let lvl = 1;
                                for (const l of LEVELS) { if (spotlight.xp >= l.xpRequired) lvl = l.level; else break; }
                                return lvl;
                              })()} size="md" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">
                                    {spotlight.category === 'star_student' && '⭐'}
                                    {spotlight.category === 'most_improved' && '📈'}
                                    {spotlight.category === 'team_player' && '🤝'}
                                    {spotlight.category === 'creative_genius' && '🎨'}
                                  </span>
                                  <span className="text-xs font-bold uppercase tracking-widest text-yellow-400">
                                    {spotlight.category === 'star_student' && 'Star Student'}
                                    {spotlight.category === 'most_improved' && 'Most Improved'}
                                    {spotlight.category === 'team_player' && 'Team Player'}
                                    {spotlight.category === 'creative_genius' && 'Creative Genius'}
                                  </span>
                                </div>
                                <p className="text-2xl font-black text-white">{spotlight.studentName}</p>
                                <p className="text-slate-300 italic mt-1">"{spotlight.message}"</p>
                                <p className="text-xs text-slate-500 mt-2">Set by {spotlight.setBy} on {new Date(spotlight.setAt).toLocaleDateString()}</p>
                              </div>
                              <button
                                onClick={handleClearSpotlight}
                                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                                aria-label="Remove spotlight"
                              >
                                <X className="w-5 h-5" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                            <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-20" aria-hidden="true" />
                            No student spotlight set. Select a student below to highlight them for the class!
                          </div>
                        )}
                      </div>

                      {/* Set Spotlight */}
                      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          <Star className="w-5 h-5 text-yellow-400" aria-hidden="true" /> Highlight a Student
                        </h3>

                        {/* Category Selection */}
                        <div className="mb-4">
                          <label className="block text-xs text-slate-400 font-bold uppercase mb-2">Spotlight Category</label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                              { id: 'star_student', label: 'Star Student', emoji: '⭐' },
                              { id: 'most_improved', label: 'Most Improved', emoji: '📈' },
                              { id: 'team_player', label: 'Team Player', emoji: '🤝' },
                              { id: 'creative_genius', label: 'Creative Genius', emoji: '🎨' },
                            ].map(cat => (
                              <button
                                key={cat.id}
                                onClick={() => setSpotlightCategory(cat.id)}
                                className={`p-2 rounded-lg text-sm font-bold transition-colors ${
                                  spotlightCategory === cat.id
                                    ? 'bg-yellow-500 text-slate-900'
                                    : 'bg-slate-700 text-slate-400 hover:text-white'
                                }`}
                              >
                                {cat.emoji} {cat.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Custom Message */}
                        <div className="mb-4">
                          <label htmlFor="spotlight-message" className="block text-xs text-slate-400 font-bold uppercase mb-1">Custom Message</label>
                          <input
                            id="spotlight-message"
                            type="text"
                            value={spotlightMessage}
                            onChange={e => setSpotlightMessage(e.target.value)}
                            placeholder="Keep up the great work!"
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-yellow-500 outline-none"
                            maxLength={100}
                          />
                        </div>

                        {/* Student List */}
                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                          {students.length === 0 ? (
                            <p className="text-slate-500 text-center py-4">No students in this class.</p>
                          ) : (
                            students
                              .sort((a, b) => (b.xp || 0) - (a.xp || 0))
                              .map(student => {
                                const level = LEVELS.reduce((acc, l) => (student.xp || 0) >= l.xpRequired ? l : acc, LEVELS[0]);
                                return (
                                  <div
                                    key={student.id}
                                    className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                                  >
                                    <Avatar3D avatar={student.avatar || { color: 'default', hat: 'none', accessory: 'none', face: 'happy' }} level={level.level} size="sm" />
                                    <div className="flex-1">
                                      <p className="font-bold text-white text-sm">{student.name}</p>
                                      <p className={`text-xs ${level.color}`}>Lv.{level.level} {level.title} - {student.xp || 0} XP</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-400">
                                        {(student.unlockedAchievements || []).length} <Trophy className="w-3 h-3 inline" aria-hidden="true" />
                                      </span>
                                      <button
                                        onClick={() => handleSetSpotlight(student)}
                                        disabled={savingSpotlight}
                                        className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                                      >
                                        <Sparkles className="w-3 h-3 inline mr-1" aria-hidden="true" />
                                        Spotlight
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'guilds' && (
                  <div role="tabpanel" id="tabpanel-guilds" aria-labelledby="tab-guilds">
                    <GuildManagement classId={selectedClass.id} students={students} onStudentsUpdated={() => backend.getStudents(selectedClass.id).then(setStudents)} />
                  </div>
                )}

                {activeTab === 'rewards' && (
                  <div role="tabpanel" id="tabpanel-rewards" aria-labelledby="tab-rewards">
                    <RewardsManager classId={selectedClass.id} />
                  </div>
                )}

                {activeTab === 'students' && (
                  <div role="tabpanel" id="tabpanel-students" aria-labelledby="tab-students"><RosterManager
                    classId={selectedClass.id}
                    onStudentAdded={() => backend.getStudents(selectedClass.id).then(setStudents)}
                  /></div>
                )}

                {activeTab === 'submissions' && (
                  <div role="tabpanel" id="tabpanel-submissions" aria-labelledby="tab-submissions">
                    {loading ? (
                      <div className="text-center py-12 text-slate-500" role="status" aria-live="polite">Loading submissions...</div>
                    ) : (
                      <>
                        <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                          <Clock className="w-4 h-4" aria-hidden="true" /> Pending Reviews ({pending.length})
                        </h3>

                        {pending.length === 0 ? (
                          <div className="bg-slate-800/50 rounded-xl p-8 text-center text-slate-500 mb-8">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-20" aria-hidden="true" />
                            No pending submissions. You're all caught up!
                          </div>
                        ) : (
                          <div className="space-y-4 mb-8">
                            {pending.map(sub => (
                              <SubmissionCard key={sub.id} submission={sub} onReview={handleReview} />
                            ))}
                          </div>
                        )}

                        {reviewed.length > 0 && (
                          <ReviewedSubmissions reviewed={reviewed} onReview={handleReview} />
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl min-h-[400px]">
                <BookOpen className="w-16 h-16 mb-4 opacity-20" aria-hidden="true" />
                <p>Select a class to view dashboard</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ================= MODAL: BROWSE & APPLY ORG TEMPLATES ================= */}
      {showOrgTemplatesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="browse-templates-title">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Organization Choice Boards</span>
                <h3 id="browse-templates-title" className="text-xl font-bold text-white">{user.organizationName || 'Organization'} Master Templates</h3>
              </div>
              <button onClick={() => setShowOrgTemplatesModal(false)} aria-label="Close templates modal" className="text-slate-400 hover:text-white text-xl font-bold p-1">✕</button>
            </div>

            <div className="space-y-6 overflow-y-auto flex-1 pr-1">
              <p className="text-xs text-slate-400">
                Browse master choice board templates configured for your organization. You can choose specific individual activities to import into <strong>{selectedClass?.name || 'your class'}</strong> without removing any of your current activities!
              </p>

              {orgTemplates.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border border-slate-800 rounded-xl">
                  No organization templates found for {user.organizationName || 'your organization'}.
                </div>
              ) : (
                <div className="space-y-4">
                  {orgTemplates.map(tmp => {
                    const isInspecting = inspectingTemplate?.id === tmp.id;
                    const isSelectedFull = selectedTemplateToApply?.id === tmp.id;

                    return (
                      <div key={tmp.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg space-y-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h4 className="text-lg font-bold text-white flex items-center gap-2">
                              <Layers className="w-5 h-5 text-purple-400" />
                              {tmp.title}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">{tmp.description || 'No description provided.'}</p>
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                              <span>Created by: {tmp.createdBy || 'Admin'}</span>
                              <span>&middot;</span>
                              <span>{tmp.activities?.length || 0} Categories</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            <button
                              onClick={() => setInspectingTemplate(isInspecting ? null : tmp)}
                              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-lg transition-colors border border-slate-600 flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {isInspecting ? 'Hide Activities' : 'Choose Specific Activities'}
                            </button>
                            <button
                              onClick={() => handleImportAllTemplateActivities(tmp)}
                              disabled={applyingTemplate}
                              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg transition-colors shadow flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Import All Activities to Class
                            </button>
                          </div>
                        </div>

                        {/* Selective Activity Inspector */}
                        {isInspecting && (
                          <div className="mt-4 pt-4 border-t border-slate-700/80 space-y-4 bg-slate-900/60 p-4 rounded-xl">
                            <h5 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                              Activities in "{tmp.title}" &mdash; Click "+ Import" to add to {selectedClass?.name}
                            </h5>

                            <div className="space-y-4">
                              {(tmp.activities || []).map(path => {
                                const categoryName = tmp.categoryNames?.[path.id] || path.title;
                                const categorySub = tmp.categorySubtitles?.[path.id] || path.subtitle;

                                return (
                                  <div key={path.id} className="bg-slate-800 rounded-lg border border-slate-700 p-3 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <span className="font-bold text-sm text-white">{categoryName}</span>
                                        {categorySub && <span className="text-xs text-slate-400 ml-2 italic">({categorySub})</span>}
                                      </div>
                                      <span className="text-[11px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                                        {path.options?.length || 0} activities
                                      </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                                      {(path.options || []).map(opt => (
                                        <div key={opt.id} className="p-2.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-start justify-between gap-2">
                                          <div className="min-w-0">
                                            <div className="font-bold text-xs text-white truncate">{opt.title}</div>
                                            <div className="text-[11px] text-slate-400 line-clamp-1">{opt.desc}</div>
                                            <div className="text-[10px] text-yellow-400 font-semibold mt-0.5">{opt.type} &middot; {opt.xp} XP</div>
                                          </div>
                                          <button
                                            onClick={() => handleImportSingleActivity(tmp, path.id, opt)}
                                            disabled={importingSingleActivityId === opt.id}
                                            className="px-2.5 py-1 bg-green-600 hover:bg-green-500 text-white font-bold text-[11px] rounded transition-colors whitespace-nowrap flex items-center gap-1 disabled:opacity-50 flex-shrink-0"
                                          >
                                            <Plus className="w-3 h-3" />
                                            {importingSingleActivityId === opt.id ? 'Importing...' : 'Import'}
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setShowOrgTemplatesModal(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== GUILD MANAGEMENT (TEACHER) ==============
function GuildManagement({ classId, students, onStudentsUpdated }) {
  const [guildData, setGuildData] = useState({});
  const [loading, setLoading] = useState(true);
  const [rewardGuild, setRewardGuild] = useState(null);
  const [rewardType, setRewardType] = useState('xp');
  const [rewardAmount, setRewardAmount] = useState('');
  const [rewardAchievement, setRewardAchievement] = useState('');
  const [givingReward, setGivingReward] = useState(false);
  const [trophyGuild, setTrophyGuild] = useState(null);
  const [selectedTrophy, setSelectedTrophy] = useState('');
  const [trophyMessage, setTrophyMessage] = useState('');
  const [awardingTrophy, setAwardingTrophy] = useState(false);
  const [guildHalls, setGuildHalls] = useState({});

  useEffect(() => {
    loadGuildData();
  }, [classId]);

  const loadGuildData = async () => {
    setLoading(true);
    try {
      const data = await backend.getGuildLeaderboard(classId);
      setGuildData(data);
      // Load guild halls
      const halls = {};
      for (const guild of GUILDS) {
        halls[guild.id] = await backend.getGuildHall(classId, guild.id);
      }
      setGuildHalls(halls);
    } catch (e) {
      console.error("Failed to load guild data", e);
    }
    setLoading(false);
  };

  const handleGuildReward = async () => {
    if (!rewardGuild) return;
    setGivingReward(true);
    try {
      let value;
      if (rewardType === 'xp' || rewardType === 'coins') {
        value = parseInt(rewardAmount) || 0;
        if (value <= 0) { alert('Enter a positive amount'); setGivingReward(false); return; }
      } else {
        if (!rewardAchievement) { alert('Select an achievement'); setGivingReward(false); return; }
        value = rewardAchievement;
      }
      const count = await backend.rewardGuild(classId, rewardGuild, rewardType, value);
      const guildName = GUILDS.find(g => g.id === rewardGuild)?.name || rewardGuild;
      alert(`Reward given to ${count} members of ${guildName}!`);
      setRewardGuild(null);
      setRewardAmount('');
      setRewardAchievement('');
      loadGuildData();
      if (onStudentsUpdated) onStudentsUpdated();
    } catch (error) {
      alert('Error giving guild reward: ' + error.message);
    }
    setGivingReward(false);
  };

  const handleAwardTrophy = async () => {
    if (!trophyGuild || !selectedTrophy) return;
    setAwardingTrophy(true);
    try {
      const trophy = GUILD_TROPHIES.find(t => t.id === selectedTrophy);
      await backend.addGuildHallTrophy(classId, trophyGuild, {
        ...trophy,
        message: trophyMessage || '',
      });
      const guildName = GUILDS.find(g => g.id === trophyGuild)?.name || trophyGuild;
      alert(`${trophy.title} awarded to ${guildName}!`);
      setTrophyGuild(null);
      setSelectedTrophy('');
      setTrophyMessage('');
      loadGuildData();
    } catch (error) {
      alert('Error awarding trophy: ' + error.message);
    }
    setAwardingTrophy(false);
  };

  // Sort guilds by total XP for leaderboard
  const sortedGuilds = [...GUILDS].sort((a, b) => {
    const aXp = guildData[a.id]?.totalXp || 0;
    const bXp = guildData[b.id]?.totalXp || 0;
    return bXp - aXp;
  });

  const unassigned = students.filter(s => !s.guild);

  return (
    <div className="space-y-6">
      {/* Guild Leaderboard */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" aria-hidden="true" /> Guild Leaderboard
        </h3>

        {loading ? (
          <p className="text-slate-500 text-center py-4" role="status">Loading guild data...</p>
        ) : (
          <div className="space-y-3">
            {sortedGuilds.map((guild, idx) => {
              const stats = guildData[guild.id];
              const hallTrophies = guildHalls[guild.id]?.trophies || [];
              return (
                <div key={guild.id} className={`p-4 rounded-xl border-2 ${idx === 0 ? 'border-yellow-500/50 bg-yellow-500/5' : 'border-slate-600 bg-slate-700/30'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-center flex-shrink-0">
                      {idx === 0 && <span className="text-2xl" aria-hidden="true">🥇</span>}
                      {idx === 1 && <span className="text-2xl" aria-hidden="true">🥈</span>}
                      {idx === 2 && <span className="text-2xl" aria-hidden="true">🥉</span>}
                      {idx === 3 && <span className="text-lg font-bold text-slate-500">#4</span>}
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${guild.color} flex items-center justify-center`}>
                      <span className="text-2xl" aria-hidden="true">{guild.emoji}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-white text-lg">{guild.name}</p>
                      <p className="text-xs text-slate-400">{guild.motto}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-yellow-400">{stats?.totalXp || 0}</p>
                      <p className="text-xs text-slate-400">Total XP</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-400">{stats?.memberCount || 0}</p>
                      <p className="text-xs text-slate-400">Members</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setRewardGuild(guild.id); setRewardType('xp'); setRewardAmount(''); }}
                        className="p-2 text-slate-400 hover:text-yellow-400 transition-colors"
                        aria-label={`Give reward to ${guild.name}`}
                      >
                        <Gift className="w-5 h-5" aria-hidden="true" />
                      </button>
                      <button
                        onClick={() => { setTrophyGuild(guild.id); setSelectedTrophy(''); setTrophyMessage(''); }}
                        className="p-2 text-slate-400 hover:text-purple-400 transition-colors"
                        aria-label={`Award trophy to ${guild.name}`}
                      >
                        <Trophy className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Guild Hall Trophies Preview */}
                  {hallTrophies.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-600/50 flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-slate-500 uppercase font-bold">Hall Trophies:</span>
                      {hallTrophies.map((t, i) => (
                        <span key={i} className="text-lg" title={`${t.title}${t.message ? ': ' + t.message : ''}`} aria-label={t.title}>{t.icon}</span>
                      ))}
                    </div>
                  )}

                  {/* Member List */}
                  {stats && stats.members.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-600/50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {stats.members.map(member => {
                          const level = LEVELS.reduce((acc, l) => member.totalXp >= l.xpRequired ? l : acc, LEVELS[0]);
                          return (
                            <div key={member.id} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-lg text-sm">
                              <Avatar3D avatar={member.avatar} level={level.level} size="sm" />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate">{member.name}</p>
                                <p className={`text-xs ${level.color}`}>Lv.{level.level}</p>
                              </div>
                              <span className="text-yellow-400 font-bold text-xs">{member.xp} XP</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Unassigned students */}
        {unassigned.length > 0 && (
          <div className="mt-6 p-4 bg-slate-700/30 rounded-xl border border-dashed border-slate-600">
            <h4 className="text-sm font-bold text-slate-400 mb-3">Students Without a Guild ({unassigned.length})</h4>
            <div className="flex flex-wrap gap-2">
              {unassigned.map(s => (
                <span key={s.id} className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-300">{s.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Guild Reward Modal */}
      {rewardGuild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setRewardGuild(null)}>
          <div className="bg-slate-800 border-2 border-yellow-500 rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Gift className="w-6 h-6 text-yellow-400" aria-hidden="true" /> Guild Reward
              </h3>
              <button onClick={() => setRewardGuild(null)} className="text-slate-400 hover:text-white" aria-label="Close">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {(() => {
              const guild = GUILDS.find(g => g.id === rewardGuild);
              const stats = guildData[rewardGuild];
              return (
                <div className={`p-3 rounded-xl ${guild.color} bg-opacity-30 mb-4 flex items-center gap-3`}>
                  <span className="text-3xl" aria-hidden="true">{guild.emoji}</span>
                  <div>
                    <p className="font-bold text-white">{guild.name}</p>
                    <p className="text-xs text-slate-300">{stats?.memberCount || 0} members will receive this reward</p>
                  </div>
                </div>
              );
            })()}

            <div className="flex gap-2 mb-4" role="group" aria-label="Reward type">
              <button onClick={() => setRewardType('xp')} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 ${rewardType === 'xp' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                <Zap className="w-4 h-4" aria-hidden="true" /> XP
              </button>
              <button onClick={() => setRewardType('coins')} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 ${rewardType === 'coins' ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                <Star className="w-4 h-4" aria-hidden="true" /> Coins
              </button>
              <button onClick={() => setRewardType('achievement')} className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 ${rewardType === 'achievement' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                <Trophy className="w-4 h-4" aria-hidden="true" /> Trophy
              </button>
            </div>

            {(rewardType === 'xp' || rewardType === 'coins') && (
              <div className="mb-4">
                <label htmlFor="guild-reward-amount" className="block text-sm text-slate-400 mb-1">
                  Amount of {rewardType === 'xp' ? 'XP' : 'Coins'} per member
                </label>
                <input
                  id="guild-reward-amount"
                  type="number"
                  min="1"
                  value={rewardAmount}
                  onChange={e => setRewardAmount(e.target.value)}
                  placeholder={rewardType === 'xp' ? 'e.g. 100' : 'e.g. 50'}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-yellow-500 outline-none"
                />
              </div>
            )}

            {rewardType === 'achievement' && (
              <div className="mb-4">
                <label htmlFor="guild-reward-achievement" className="block text-sm text-slate-400 mb-1">Select Achievement to unlock for all members</label>
                <select
                  id="guild-reward-achievement"
                  value={rewardAchievement}
                  onChange={e => setRewardAchievement(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-yellow-500 outline-none"
                >
                  <option value="">-- Choose --</option>
                  {ACHIEVEMENTS.map(a => (
                    <option key={a.id} value={a.id}>{a.icon} {a.title} - {a.desc}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleGuildReward}
              disabled={givingReward}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {givingReward ? 'Giving...' : 'Give Reward to Entire Guild'}
            </button>
          </div>
        </div>
      )}

      {/* Award Trophy to Guild Hall Modal */}
      {trophyGuild && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setTrophyGuild(null)}>
          <div className="bg-slate-800 border-2 border-purple-500 rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-purple-400" aria-hidden="true" /> Award Guild Hall Trophy
              </h3>
              <button onClick={() => setTrophyGuild(null)} className="text-slate-400 hover:text-white" aria-label="Close">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {(() => {
              const guild = GUILDS.find(g => g.id === trophyGuild);
              return (
                <div className={`p-3 rounded-xl ${guild.color} bg-opacity-30 mb-4 flex items-center gap-3`}>
                  <span className="text-3xl" aria-hidden="true">{guild.emoji}</span>
                  <div>
                    <p className="font-bold text-white">{guild.name} Guild Hall</p>
                    <p className="text-xs text-slate-300">This trophy will be displayed in their Guild Hall</p>
                  </div>
                </div>
              );
            })()}

            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">Select Trophy</label>
              <div className="grid grid-cols-2 gap-2">
                {GUILD_TROPHIES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTrophy(t.id)}
                    className={`p-3 rounded-lg text-left transition-colors ${selectedTrophy === t.id ? 'bg-purple-600/30 border-2 border-purple-500' : 'bg-slate-700 border-2 border-transparent hover:border-slate-500'}`}
                  >
                    <span className="text-2xl" aria-hidden="true">{t.icon}</span>
                    <p className="font-bold text-white text-xs mt-1">{t.title}</p>
                    <p className="text-xs text-slate-400">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="trophy-message" className="block text-sm text-slate-400 mb-1">Trophy Message (optional)</label>
              <input
                id="trophy-message"
                type="text"
                value={trophyMessage}
                onChange={e => setTrophyMessage(e.target.value)}
                placeholder="e.g. Great teamwork this week!"
                maxLength={100}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-purple-500 outline-none"
              />
            </div>

            <button
              onClick={handleAwardTrophy}
              disabled={awardingTrophy || !selectedTrophy}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {awardingTrophy ? 'Awarding...' : 'Award Trophy to Guild Hall'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============== REWARDS MANAGER (TEACHER) ==============
function RewardsManager({ classId }) {
  const [rewards, setRewards] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', cost: '', directions: '' });

  useEffect(() => {
    loadData();
    const unsub = backend.subscribeToRedemptions(classId, (data) => {
      setRedemptions(data);
    });
    return () => unsub();
  }, [classId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const items = await backend.getCustomRewards(classId);
      setRewards(items);
    } catch (e) {
      console.error("Failed to load rewards", e);
    }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.cost) return;
    try {
      if (editingReward) {
        await backend.updateCustomReward(classId, editingReward.id, {
          name: form.name.trim(),
          description: form.description.trim(),
          cost: parseInt(form.cost),
          directions: form.directions.trim(),
        });
      } else {
        await backend.createCustomReward(classId, {
          name: form.name.trim(),
          description: form.description.trim(),
          cost: parseInt(form.cost),
          directions: form.directions.trim(),
        });
      }
      setForm({ name: '', description: '', cost: '', directions: '' });
      setShowCreateForm(false);
      setEditingReward(null);
      loadData();
    } catch (error) {
      alert('Error saving reward: ' + error.message);
    }
  };

  const handleDelete = async (rewardId) => {
    if (!window.confirm('Delete this reward item?')) return;
    try {
      await backend.deleteCustomReward(classId, rewardId);
      loadData();
    } catch (error) {
      alert('Error deleting reward: ' + error.message);
    }
  };

  const handleToggleActive = async (reward) => {
    try {
      await backend.updateCustomReward(classId, reward.id, { active: !reward.active });
      loadData();
    } catch (error) {
      alert('Error updating reward: ' + error.message);
    }
  };

  const handleFulfill = async (redemptionId) => {
    try {
      await backend.updateRedemption(classId, redemptionId, { status: 'fulfilled' });
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const pendingRedemptions = redemptions.filter(r => r.status === 'pending');
  const fulfilledRedemptions = redemptions.filter(r => r.status === 'fulfilled');

  if (loading) return <p className="text-slate-500 text-center py-8">Loading rewards...</p>;

  return (
    <div className="space-y-6">
      {/* Pending Redemptions Alert */}
      {pendingRedemptions.length > 0 && (
        <div className="bg-green-900/30 border-2 border-green-500/50 rounded-xl p-4">
          <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
            <Gift className="w-5 h-5" aria-hidden="true" /> Pending Redemptions ({pendingRedemptions.length})
          </h3>
          <p className="text-sm text-slate-400 mb-4">Students have redeemed these rewards and are waiting for fulfillment.</p>
          <div className="space-y-3">
            {pendingRedemptions.map(r => (
              <div key={r.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500/20 border-2 border-green-500 rounded-lg flex items-center justify-center text-xl">
                  🎁
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white">{r.studentName} redeemed <span className="text-green-400">{r.itemName}</span></p>
                  <p className="text-xs text-slate-400">Cost: {r.cost} coins</p>
                  {r.directions && <p className="text-xs text-yellow-400 mt-1">Directions: {r.directions}</p>}
                  <p className="text-xs text-slate-500 mt-1">
                    {r.redeemedAt?.toDate ? new Date(r.redeemedAt.toDate()).toLocaleString() : r.redeemedAt ? new Date(r.redeemedAt).toLocaleString() : 'Just now'}
                  </p>
                </div>
                <button
                  onClick={() => handleFulfill(r.id)}
                  className="px-4 py-2 bg-green-500 text-slate-900 rounded-lg font-bold text-sm hover:bg-green-400"
                >
                  Mark Fulfilled
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manage Reward Items */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-green-400" aria-hidden="true" /> Custom Reward Items
          </h3>
          <button
            onClick={() => { setShowCreateForm(true); setEditingReward(null); setForm({ name: '', description: '', cost: '', directions: '' }); }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm"
          >
            <Plus className="w-4 h-4" aria-hidden="true" /> Add Reward
          </button>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          Create real-world reward items that students can purchase with their coins. You'll be notified when a student redeems one.
        </p>

        {showCreateForm && (
          <form onSubmit={handleCreate} className="bg-slate-700/50 rounded-xl p-4 border border-slate-600 mb-4 space-y-3">
            <h4 className="font-bold text-white text-sm">{editingReward ? 'Edit Reward' : 'New Reward Item'}</h4>
            <div>
              <label htmlFor="reward-name" className="block text-xs text-slate-400 mb-1">Reward Name *</label>
              <input
                id="reward-name"
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Homework Pass, Extra Credit, Lunch with Teacher"
                maxLength={60}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-green-500 outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="reward-desc" className="block text-xs text-slate-400 mb-1">Description</label>
              <input
                id="reward-desc"
                type="text"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description students will see"
                maxLength={120}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-green-500 outline-none"
              />
            </div>
            <div>
              <label htmlFor="reward-cost" className="block text-xs text-slate-400 mb-1">Coin Cost *</label>
              <input
                id="reward-cost"
                type="number"
                min="1"
                value={form.cost}
                onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                placeholder="e.g. 200"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-green-500 outline-none"
                required
              />
            </div>
            <div>
              <label htmlFor="reward-directions" className="block text-xs text-slate-400 mb-1">Redemption Directions</label>
              <textarea
                id="reward-directions"
                value={form.directions}
                onChange={e => setForm(f => ({ ...f, directions: e.target.value }))}
                placeholder="Instructions for the student on how to redeem this reward (e.g. 'Show this to your teacher during class')"
                maxLength={300}
                rows={3}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-green-500 outline-none resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowCreateForm(false); setEditingReward(null); }} className="flex-1 py-2 bg-slate-600 text-white rounded-lg font-bold text-sm">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2 bg-green-500 text-slate-900 rounded-lg font-bold text-sm">
                {editingReward ? 'Save Changes' : 'Create Reward'}
              </button>
            </div>
          </form>
        )}

        {rewards.length === 0 && !showCreateForm ? (
          <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
            <Gift className="w-12 h-12 mx-auto mb-2 opacity-20" aria-hidden="true" />
            No custom rewards yet. Add one to let students spend coins on real-world items!
          </div>
        ) : (
          <div className="space-y-3">
            {rewards.map(reward => (
              <div key={reward.id} className={`rounded-xl p-4 border flex items-center gap-4 ${reward.active !== false ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-800/50 border-slate-700 opacity-60'}`}>
                <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 border-2 border-green-500/50 rounded-lg flex items-center justify-center text-2xl">
                  🎁
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white">{reward.name} {reward.active === false && <span className="text-xs text-red-400">(Inactive)</span>}</p>
                  {reward.description && <p className="text-xs text-slate-400">{reward.description}</p>}
                  {reward.directions && <p className="text-xs text-yellow-400/70 mt-0.5">Directions: {reward.directions}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-yellow-400 font-bold">{reward.cost} coins</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditingReward(reward);
                      setForm({ name: reward.name, description: reward.description || '', cost: String(reward.cost), directions: reward.directions || '' });
                      setShowCreateForm(true);
                    }}
                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                    aria-label={`Edit ${reward.name}`}
                  >
                    <Edit className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(reward)}
                    className={`p-2 transition-colors ${reward.active !== false ? 'text-green-400 hover:text-red-400' : 'text-slate-500 hover:text-green-400'}`}
                    aria-label={reward.active !== false ? `Deactivate ${reward.name}` : `Activate ${reward.name}`}
                  >
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={() => handleDelete(reward.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    aria-label={`Delete ${reward.name}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fulfilled History */}
      {fulfilledRedemptions.length > 0 && (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" aria-hidden="true" /> Fulfilled Redemptions ({fulfilledRedemptions.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {fulfilledRedemptions.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg text-sm">
                <span className="text-green-400">✓</span>
                <span className="text-white font-bold">{r.studentName}</span>
                <span className="text-slate-400">redeemed</span>
                <span className="text-green-400">{r.itemName}</span>
                <span className="text-slate-500 ml-auto text-xs">
                  {r.updatedAt?.toDate ? new Date(r.updatedAt.toDate()).toLocaleDateString() : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SubmissionCard({ submission, onReview }) {
  const [feedback, setFeedback] = useState('');
  const feedbackId = `feedback-${submission.id}`;

  return (
    <article className="bg-slate-800 border-2 border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-colors" aria-label={`Submission from ${submission.playerName}: ${submission.activityTitle}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-lg text-white">{submission.activityTitle}</h4>
          <p className="text-blue-400 font-bold">{submission.playerName}</p>
        </div>
        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
          {new Date(submission.submittedAt).toLocaleDateString()}
        </span>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-lg mb-4 border border-slate-800">
        <p className="text-xs text-slate-500 uppercase font-bold mb-2 flex items-center gap-1.5">
          {submission.submissionType === 'text' && <><MessageSquare className="w-3.5 h-3.5" aria-hidden="true" /> Written Response:</>}
          {submission.submissionType === 'link' && <>Submission Link:</>}
          {submission.submissionType === 'file' && <>Uploaded File:</>}
          {!['text', 'link', 'file'].includes(submission.submissionType) && <>Submission Content:</>}
        </p>
        {submission.submissionType === 'link' ? (
          <a href={submission.submissionContent} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all block p-2 bg-slate-800 rounded">
            {submission.submissionContent}
          </a>
        ) : submission.submissionType === 'text' ? (
          <div className="p-3 bg-slate-800 rounded-lg text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
            {submission.submissionContent}
          </div>
        ) : (
          <div className="p-2 bg-slate-800 rounded">
            {submission.submissionContent ? (
               <div className="text-blue-400">
                 <FileViewer content={submission.submissionContent} fileName={submission.fileName} fileType={submission.fileType} />
               </div>
            ) : (
              <span className="text-slate-500 italic">No content?</span>
            )}
          </div>
        )}

        {submission.submissionNote && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <p className="text-xs text-slate-500 uppercase font-bold mb-1">Student Note:</p>
            <p className="text-slate-300 text-sm italic">"{submission.submissionNote}"</p>
          </div>
        )}
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label htmlFor={feedbackId} className="text-xs text-slate-400 font-bold uppercase mb-1 block">Feedback</label>
          <input
            id={feedbackId}
            type="text"
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Nice work!"
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => onReview(submission.id, 'rejected', feedback)}
          className="bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
        >
          Reject
        </button>
        <button
          onClick={() => onReview(submission.id, 'approved', feedback)}
          className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors"
        >
          Approve (+{submission.xp} XP)
        </button>
      </div>
    </article>
  );
}

function ReviewedSubmissions({ reviewed, onReview }) {
  const [expandedId, setExpandedId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'approved', 'rejected'
  const [changingStatus, setChangingStatus] = useState(null);
  const [newFeedback, setNewFeedback] = useState('');

  const filtered = filter === 'all' ? reviewed : reviewed.filter(s => s.status === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.reviewedAt || b.submittedAt) - new Date(a.reviewedAt || a.submittedAt));
  const displayed = showAll ? sorted : sorted.slice(0, 10);

  const handleChangeStatus = async (sub, newStatus) => {
    setChangingStatus(sub.id);
    await onReview(sub.id, newStatus, newFeedback || sub.teacherFeedback || '');
    setChangingStatus(null);
    setExpandedId(null);
    setNewFeedback('');
  };

  return (
    <>
      <div className="flex items-center justify-between border-t border-slate-700 pt-8 mb-4">
        <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Reviewed History ({filtered.length})
        </h3>
        <div className="flex gap-2" role="group" aria-label="Filter reviewed submissions">
          {[
            { key: 'all', label: 'All' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                filter === f.key
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {displayed.map(sub => (
          <div key={sub.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <button
              onClick={() => { setExpandedId(expandedId === sub.id ? null : sub.id); setNewFeedback(''); }}
              className="w-full p-4 flex justify-between items-center text-left hover:bg-slate-750 transition-colors"
              aria-expanded={expandedId === sub.id}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sub.status === 'approved' ? 'bg-green-400' : 'bg-red-400'}`} />
                <div className="min-w-0">
                  <p className="font-bold text-white truncate">{sub.playerName}</p>
                  <p className="text-sm text-slate-400 truncate">{sub.activityTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {sub.teacherFeedback && (
                  <span className="text-xs text-slate-500 hidden sm:inline max-w-[200px] truncate italic">"{sub.teacherFeedback}"</span>
                )}
                <span className="text-xs text-slate-500">{new Date(sub.reviewedAt || sub.submittedAt).toLocaleDateString()}</span>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${sub.status === 'approved' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                  {sub.status.toUpperCase()}
                </div>
                {expandedId === sub.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {expandedId === sub.id && (
              <div className="px-4 pb-4 border-t border-slate-700">
                <div className="bg-slate-900/50 p-4 rounded-lg mt-3 border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2 flex items-center gap-1.5">
                    {sub.submissionType === 'text' && <><MessageSquare className="w-3.5 h-3.5" aria-hidden="true" /> Written Response:</>}
                    {sub.submissionType === 'link' && <>Submission Link:</>}
                    {sub.submissionType === 'file' && <>Uploaded File:</>}
                    {!['text', 'link', 'file'].includes(sub.submissionType) && <>Submission Content:</>}
                  </p>
                  {sub.submissionType === 'link' ? (
                    <a href={sub.submissionContent} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all block p-2 bg-slate-800 rounded">
                      {sub.submissionContent}
                    </a>
                  ) : sub.submissionType === 'text' ? (
                    <div className="p-3 bg-slate-800 rounded-lg text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                      {sub.submissionContent}
                    </div>
                  ) : (
                    <div className="p-2 bg-slate-800 rounded">
                      {sub.submissionContent ? (
                        <div className="text-blue-400">
                          <FileViewer content={sub.submissionContent} fileName={sub.fileName} fileType={sub.fileType} />
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No content</span>
                      )}
                    </div>
                  )}

                  {sub.submissionNote && (
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Student Note:</p>
                      <p className="text-slate-300 text-sm italic">"{sub.submissionNote}"</p>
                    </div>
                  )}
                </div>

                {sub.teacherFeedback && (
                  <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Your Feedback:</p>
                    <p className="text-slate-300 text-sm">"{sub.teacherFeedback}"</p>
                  </div>
                )}

                <div className="mt-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600">
                  <p className="text-xs text-slate-400 font-bold uppercase mb-2">Change Decision</p>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label htmlFor={`revised-feedback-${sub.id}`} className="sr-only">Updated feedback</label>
                      <input
                        id={`revised-feedback-${sub.id}`}
                        type="text"
                        value={newFeedback}
                        onChange={e => setNewFeedback(e.target.value)}
                        placeholder={sub.teacherFeedback || 'Update feedback (optional)'}
                        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {sub.status === 'approved' ? (
                      <button
                        onClick={() => handleChangeStatus(sub, 'rejected')}
                        disabled={changingStatus === sub.id}
                        className="bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 px-4 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                      >
                        {changingStatus === sub.id ? 'Updating...' : 'Change to Rejected'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleChangeStatus(sub, 'approved')}
                        disabled={changingStatus === sub.id}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                      >
                        {changingStatus === sub.id ? 'Updating...' : `Change to Approved (+${sub.xp} XP)`}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-2 flex gap-4 text-xs text-slate-500">
                  <span>Submitted: {new Date(sub.submittedAt).toLocaleString()}</span>
                  {sub.reviewedAt && <span>Reviewed: {new Date(sub.reviewedAt).toLocaleString()}</span>}
                  <span>XP: {sub.xp}</span>
                  {sub.isBoss && <span className="text-orange-400 font-bold">Boss Challenge</span>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {sorted.length > 10 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-sm font-bold transition-colors"
        >
          Show All ({sorted.length - 10} more)
        </button>
      )}
      {showAll && sorted.length > 10 && (
        <button
          onClick={() => setShowAll(false)}
          className="mt-4 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-sm font-bold transition-colors"
        >
          Show Less
        </button>
      )}
    </>
  );
}
