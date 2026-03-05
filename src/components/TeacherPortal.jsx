import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { realBackend as backend } from '../services/realBackend';
import {
  Users, Plus, LogOut, BookOpen, ClipboardList, CheckCircle2,
  XCircle, Clock, ChevronRight, GraduationCap, Copy, Trash2, Edit, RefreshCw, RotateCcw, Link, Save, Gift,
  Share2, UserPlus, X, Mail, MessageSquare, Sparkles, Star, Trophy
} from 'lucide-react';
import { LEVELS, ACHIEVEMENTS } from '../data/gameData';
import Avatar3D from './Avatar3D';
import { FileViewer } from './FileViewer';
import ActivityEditor from './ActivityEditor';
import RosterManager from './RosterManager';

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
  const [categoryNames, setCategoryNames] = useState({ path1: '', path2: '', path3: '' });
  const [categorySubtitles, setCategorySubtitles] = useState({ path1: '', path2: '', path3: '' });
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
      setCategoryNames({
        path1: selectedClass.categoryNames?.path1 || 'The Wordsmith',
        path2: selectedClass.categoryNames?.path2 || 'The Data Scientist',
        path3: selectedClass.categoryNames?.path3 || 'The Creator',
      });
      setCategorySubtitles({
        path1: selectedClass.categorySubtitles?.path1 || 'Vocabulary Quest',
        path2: selectedClass.categorySubtitles?.path2 || 'Progress Mission',
        path3: selectedClass.categorySubtitles?.path3 || 'Expression Boss',
      });
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
              <h1 className="text-3xl font-black uppercase italic">Teacher Portal</h1>
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
                    <div className="ml-auto">
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
                    aria-selected={activeTab === 'sharing'}
                    aria-controls="tabpanel-sharing"
                    id="tab-sharing"
                    onClick={() => setActiveTab('sharing')}
                    className={`pb-4 px-2 font-bold ${activeTab === 'sharing' ? 'text-green-400 border-b-2 border-green-400' : 'text-slate-400 hover:text-white'}`}
                  >
                    Sharing
                  </button>
                </div>

                {activeTab === 'activities' && (
                  <div role="tabpanel" id="tabpanel-activities" aria-labelledby="tab-activities"><ActivityEditor
                    classId={selectedClass.id}
                    onSave={() => alert('Activities updated!')}
                  /></div>
                )}

                {activeTab === 'categories' && (
                  <div role="tabpanel" id="tabpanel-categories" aria-labelledby="tab-categories">
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                      <h3 className="text-xl font-bold text-white mb-2">Category Names</h3>
                      <p className="text-slate-400 text-sm mb-6">Customize the three learning path category names and subtitles that students see.</p>
                      <div className="space-y-6">
                        {[
                          { key: 'path1', color: 'border-blue-500', defaultName: 'The Wordsmith', defaultSub: 'Vocabulary Quest' },
                          { key: 'path2', color: 'border-purple-500', defaultName: 'The Data Scientist', defaultSub: 'Progress Mission' },
                          { key: 'path3', color: 'border-orange-500', defaultName: 'The Creator', defaultSub: 'Expression Boss' },
                        ].map(({ key, color, defaultName, defaultSub }) => (
                          <div key={key} className={`p-4 bg-slate-700 rounded-lg border-l-4 ${color}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor={`cat-name-${key}`} className="block text-xs text-slate-400 font-bold uppercase mb-1">Category Name</label>
                                <input
                                  id={`cat-name-${key}`}
                                  type="text"
                                  value={categoryNames[key]}
                                  onChange={e => setCategoryNames(prev => ({ ...prev, [key]: e.target.value }))}
                                  placeholder={defaultName}
                                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-green-500 outline-none"
                                />
                              </div>
                              <div>
                                <label htmlFor={`cat-sub-${key}`} className="block text-xs text-slate-400 font-bold uppercase mb-1">Subtitle</label>
                                <input
                                  id={`cat-sub-${key}`}
                                  type="text"
                                  value={categorySubtitles[key]}
                                  onChange={e => setCategorySubtitles(prev => ({ ...prev, [key]: e.target.value }))}
                                  placeholder={defaultSub}
                                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-green-500 outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
                          <>
                            <h3 className="font-bold text-slate-400 uppercase text-xs tracking-widest mb-4 flex items-center gap-2 border-t border-slate-700 pt-8">
                              <CheckCircle2 className="w-4 h-4" aria-hidden="true" /> Reviewed History
                            </h3>
                            <div className="opacity-60 hover:opacity-100 transition-opacity space-y-4">
                              {reviewed.slice(0, 5).map(sub => (
                                <div key={sub.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                                  <div>
                                    <p className="font-bold text-white">{sub.playerName}</p>
                                    <p className="text-sm text-slate-400">{sub.activityTitle}</p>
                                  </div>
                                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${sub.status === 'approved' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                    {sub.status.toUpperCase()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
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
