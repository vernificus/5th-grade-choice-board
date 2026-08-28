import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { realBackend as backend } from '../services/realBackend';
import {
  Building2, Users, BookOpen, Plus, Search, LogOut, CheckCircle2,
  XCircle, Edit, Trash2, ShieldCheck, ChevronRight, Share2, Filter,
  CheckSquare, Square, RefreshCw, AlertCircle, Layers, Sparkles, Shield, Copy
} from 'lucide-react';
import ActivityEditor from './ActivityEditor';
import LegalModal from './LegalModal';
import { LEARNING_PATHS as DEFAULT_PATHS, PATH_COLORS } from '../data/gameData';

export default function AdminPortal() {
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('organizations'); // 'organizations', 'teachers', 'templates'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState('privacy');

  // Data states
  const [organizations, setOrganizations] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [allClasses, setAllClasses] = useState([]);

  // Organization state
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [orgName, setOrgName] = useState('');
  const [orgDesc, setOrgDesc] = useState('');

  // Teacher management state
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherOrgFilter, setTeacherOrgFilter] = useState('all');
  const [tName, setTName] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tPassword, setTPassword] = useState('');
  const [tOrgId, setTOrgId] = useState('');
  const [tRole, setTRole] = useState('teacher');
  const [reassigningTeacher, setReassigningTeacher] = useState(null);
  const [newOrgForTeacher, setNewOrgForTeacher] = useState('');

  // Choice Board Templates state
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [templatePaths, setTemplatePaths] = useState(DEFAULT_PATHS);
  const [templateCategoryNames, setTemplateCategoryNames] = useState({});
  const [templateCategorySubtitles, setTemplateCategorySubtitles] = useState({});

  // Assignment Modal State
  const [assigningTemplate, setAssigningTemplate] = useState(null);
  const [assignTargetMode, setAssignTargetMode] = useState('all'); // 'all' or 'specific'
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [orgClassesForAssign, setOrgClassesForAssign] = useState([]);
  const [assigningLoading, setAssigningLoading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [orgsData, teachersData] = await Promise.all([
        backend.getOrganizations(),
        backend.getAllTeachers()
      ]);
      setOrganizations(orgsData);
      setTeachers(teachersData);

      if (orgsData.length > 0 && !selectedOrgId) {
        setSelectedOrgId(orgsData[0].id);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load admin data: ' + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedOrgId) {
      loadTemplatesForOrg(selectedOrgId);
      loadClassesForOrg(selectedOrgId);
    }
  }, [selectedOrgId]);

  const loadTemplatesForOrg = async (orgId) => {
    try {
      const tmps = await backend.getOrgTemplates(orgId);
      setTemplates(tmps);
    } catch (err) {
      console.error('Error fetching org templates:', err);
    }
  };

  const loadClassesForOrg = async (orgId) => {
    try {
      const cls = await backend.getAllClassesByOrg(orgId);
      setAllClasses(cls);
    } catch (err) {
      console.error('Error fetching org classes:', err);
    }
  };

  // Helper for notifications
  const notifySuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // ================= ORGANIZATIONS HANDLERS =================
  const handleSaveOrganization = async (e) => {
    e.preventDefault();
    if (!orgName.trim()) return;
    setError('');
    try {
      if (editingOrg) {
        await backend.updateOrganization(editingOrg.id, {
          name: orgName.trim(),
          description: orgDesc.trim()
        });
        notifySuccess(`Updated organization "${orgName.trim()}"`);
      } else {
        const created = await backend.createOrganization(orgName.trim(), orgDesc.trim());
        notifySuccess(`Created organization "${created.name}" (Code: ${created.code})`);
      }
      setShowOrgModal(false);
      setEditingOrg(null);
      setOrgName('');
      setOrgDesc('');
      loadAllData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteOrganization = async (org) => {
    if (!window.confirm(`Are you sure you want to delete organization "${org.name}"?`)) return;
    try {
      await backend.deleteOrganization(org.id);
      notifySuccess(`Deleted organization "${org.name}"`);
      loadAllData();
    } catch (err) {
      setError(err.message);
    }
  };

  // ================= TEACHERS HANDLERS =================
  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    if (!tName.trim() || !tEmail.trim() || !tPassword.trim()) return;
    setError('');
    try {
      const org = organizations.find(o => o.id === tOrgId);
      await backend.createTeacherUserByAdmin(
        tName.trim(),
        tEmail.trim().toLowerCase(),
        tPassword,
        tOrgId || null,
        org ? org.name : '',
        tRole
      );
      notifySuccess(`Created teacher account for ${tName}`);
      setShowTeacherModal(false);
      setTName('');
      setTEmail('');
      setTPassword('');
      setTOrgId('');
      setTRole('teacher');
      loadAllData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReassignTeacher = async (e) => {
    e.preventDefault();
    if (!reassigningTeacher) return;
    try {
      const org = organizations.find(o => o.id === newOrgForTeacher);
      await backend.assignTeacherToOrg(
        reassigningTeacher.id,
        newOrgForTeacher || null,
        org ? org.name : ''
      );
      notifySuccess(`Reassigned ${reassigningTeacher.name} to ${org ? org.name : 'Unassigned'}`);
      setReassigningTeacher(null);
      setNewOrgForTeacher('');
      loadAllData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleTeacherRole = async (t) => {
    const newRole = t.role === 'admin' ? 'teacher' : 'admin';
    const actionText = newRole === 'admin' ? `Elevate ${t.name} to System Admin role?` : `Change ${t.name}'s role back to Teacher?`;
    if (!window.confirm(actionText)) return;
    try {
      await backend.updateTeacherRole(t.id, newRole);
      notifySuccess(`Updated ${t.name}'s role to ${newRole.toUpperCase()}`);
      loadAllData();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                          t.email?.toLowerCase().includes(teacherSearch.toLowerCase());
    const matchesOrg = teacherOrgFilter === 'all' ? true :
                       teacherOrgFilter === 'unassigned' ? !t.organizationId :
                       t.organizationId === teacherOrgFilter;
    return matchesSearch && matchesOrg;
  });

  // ================= TEMPLATE HANDLERS =================
  const handleOpenNewTemplate = () => {
    setEditingTemplate(null);
    setTemplateTitle('');
    setTemplateDesc('');
    setTemplatePaths(DEFAULT_PATHS);
    setTemplateCategoryNames({});
    setTemplateCategorySubtitles({});
    setShowTemplateEditor(true);
  };

  const handleOpenEditTemplate = (tmp) => {
    setEditingTemplate(tmp);
    setTemplateTitle(tmp.title || '');
    setTemplateDesc(tmp.description || '');
    setTemplatePaths(tmp.activities && tmp.activities.length > 0 ? tmp.activities : DEFAULT_PATHS);
    setTemplateCategoryNames(tmp.categoryNames || {});
    setTemplateCategorySubtitles(tmp.categorySubtitles || {});
    setShowTemplateEditor(true);
  };

  const handleDuplicateTemplate = (tmp) => {
    setEditingTemplate(null); // Creating a new template based on this one
    setTemplateTitle(`${tmp.title || 'Choice Board Template'} (Copy)`);
    setTemplateDesc(tmp.description || '');
    // Deep clone activities to prevent accidental reference mutation
    setTemplatePaths(tmp.activities && tmp.activities.length > 0 ? JSON.parse(JSON.stringify(tmp.activities)) : DEFAULT_PATHS);
    setTemplateCategoryNames(tmp.categoryNames ? { ...tmp.categoryNames } : {});
    setTemplateCategorySubtitles(tmp.categorySubtitles ? { ...tmp.categorySubtitles } : {});
    setShowTemplateEditor(true);
    notifySuccess(`Created a copy draft of "${tmp.title}". Make any changes and click "Save Template" to finalize.`);
  };

  const handleSaveTemplate = async () => {
    if (!templateTitle.trim()) {
      alert('Please enter a template title.');
      return;
    }
    if (!selectedOrgId) {
      alert('Please select an Organization first.');
      return;
    }

    const templateData = {
      title: templateTitle.trim(),
      description: templateDesc.trim(),
      activities: templatePaths,
      categoryNames: templateCategoryNames,
      categorySubtitles: templateCategorySubtitles,
      createdBy: user.name || user.email || 'Admin'
    };

    try {
      if (editingTemplate) {
        await backend.updateOrgTemplate(editingTemplate.id, templateData);
        notifySuccess(`Updated choice board template "${templateTitle}"`);
      } else {
        await backend.createOrgTemplate(selectedOrgId, templateData);
        notifySuccess(`Created choice board template "${templateTitle}"`);
      }
      setShowTemplateEditor(false);
      loadTemplatesForOrg(selectedOrgId);
    } catch (err) {
      alert('Error saving template: ' + err.message);
    }
  };

  const handleDeleteTemplate = async (templateId, title) => {
    if (!window.confirm(`Delete choice board template "${title}"?`)) return;
    try {
      await backend.deleteOrgTemplate(templateId);
      notifySuccess(`Deleted template "${title}"`);
      loadTemplatesForOrg(selectedOrgId);
    } catch (err) {
      alert('Error deleting template: ' + err.message);
    }
  };

  // ================= ASSIGNMENT MODAL HANDLERS =================
  const handleOpenAssignModal = async (tmp) => {
    setAssigningTemplate(tmp);
    setAssignTargetMode('all');
    setSelectedClassIds([]);
    setAssigningLoading(true);
    try {
      const cls = await backend.getAllClassesByOrg(selectedOrgId);
      setOrgClassesForAssign(cls);
      setSelectedClassIds(cls.map(c => c.id));
    } catch (err) {
      console.error(err);
    }
    setAssigningLoading(false);
  };

  const handleExecuteAssignment = async () => {
    if (!assigningTemplate) return;
    setAssigningLoading(true);
    try {
      if (assignTargetMode === 'all') {
        const result = await backend.applyTemplateToOrganization(selectedOrgId, assigningTemplate.id);
        notifySuccess(`Successfully assigned "${assigningTemplate.title}" to ALL ${result.count} classes in organization!`);
      } else {
        if (selectedClassIds.length === 0) {
          alert('Please select at least one class.');
          setAssigningLoading(false);
          return;
        }
        const result = await backend.applyTemplateToClasses(assigningTemplate.id, selectedClassIds);
        notifySuccess(`Successfully assigned "${assigningTemplate.title}" to ${result.count} selected classes!`);
      }
      setAssigningTemplate(null);
    } catch (err) {
      alert('Error assigning template: ' + err.message);
    }
    setAssigningLoading(false);
  };

  const currentOrg = organizations.find(o => o.id === selectedOrgId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Top Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-tr from-yellow-500 to-amber-600 rounded-xl text-slate-950 font-black shadow-lg shadow-yellow-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-yellow-500/30">
                  Super Admin Console
                </span>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white mt-1">Level Up Admin Command Center</h1>
              <p className="text-slate-400 text-sm">Manage organizations, teachers, and distribute choice board templates</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-white text-sm">{user.name || user.email}</p>
              <p className="text-xs text-yellow-400">System Administrator</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors border border-slate-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* System Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{organizations.length}</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Organizations</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{teachers.length}</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Teacher Accounts</p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">{templates.length}</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Active Org Templates</p>
            </div>
          </div>
        </div>

        {/* Error / Success Banners */}
        {error && (
          <div className="mb-6 p-4 bg-red-950/80 border border-red-800 text-red-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-white">✕</button>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Main Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('organizations')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all text-sm ${
              activeTab === 'organizations'
                ? 'bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/10'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Organizations</span>
          </button>

          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all text-sm ${
              activeTab === 'teachers'
                ? 'bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/10'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Teachers & User Assignment</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all text-sm ${
              activeTab === 'templates'
                ? 'bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/10'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Choice Board Templates</span>
          </button>
        </div>

        {/* TAB 1: ORGANIZATIONS MANAGEMENT */}
        {activeTab === 'organizations' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">System Organizations</h2>
                <p className="text-slate-400 text-sm">Schools, Districts, and Organizations in Level Up</p>
              </div>

              <button
                onClick={() => {
                  setEditingOrg(null);
                  setOrgName('');
                  setOrgDesc('');
                  setShowOrgModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl transition-all shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Create Organization</span>
              </button>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-400">Loading organizations...</div>
            ) : organizations.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">No Organizations Yet</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
                  Create your first Organization (School or District) to start assigning teachers and master choice board templates.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map(org => (
                  <div key={org.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all shadow-lg flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="p-3 bg-slate-800 text-yellow-400 rounded-xl">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs font-mono font-bold rounded-lg">
                          {org.code}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold text-white">{org.name}</h3>
                      <p className="text-slate-400 text-sm mt-1 line-clamp-2">{org.description || 'No description provided.'}</p>

                      <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-slate-800 text-xs">
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                          <span className="block text-slate-400">Teachers</span>
                          <span className="text-base font-bold text-white">{org.teacherCount || 0}</span>
                        </div>
                        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                          <span className="block text-slate-400">Classes</span>
                          <span className="text-base font-bold text-white">{org.classCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-slate-800">
                      <button
                        onClick={() => {
                          setEditingOrg(org);
                          setOrgName(org.name);
                          setOrgDesc(org.description || '');
                          setShowOrgModal(true);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteOrganization(org)}
                        className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TEACHER & USER ASSIGNMENTS */}
        {activeTab === 'teachers' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Teacher Roster & Organization Assignment</h2>
                <p className="text-slate-400 text-sm">Create teacher accounts and assign teachers to specific organizations</p>
              </div>

              <button
                onClick={() => setShowTeacherModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl transition-all shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Create Teacher User</span>
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-900 p-4 border border-slate-800 rounded-xl">
              <div className="flex-1 min-w-[240px] relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by teacher name or email..."
                  value={teacherSearch}
                  onChange={e => setTeacherSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400 font-semibold">Filter Org:</span>
                <select
                  value={teacherOrgFilter}
                  onChange={e => setTeacherOrgFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm focus:border-yellow-500 focus:outline-none"
                >
                  <option value="all">All Organizations ({teachers.length})</option>
                  <option value="unassigned">Unassigned Teachers</option>
                  {organizations.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Teachers Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="px-6 py-4">Teacher</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Assigned Organization</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {filteredTeachers.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                          No teachers match your search or filter.
                        </td>
                      </tr>
                    ) : (
                      filteredTeachers.map(t => (
                        <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-white">{t.name || 'Unnamed Teacher'}</div>
                            <div className="text-xs text-slate-400">{t.email}</div>
                          </td>

                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              t.role === 'admin'
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              {t.role || 'teacher'}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            {t.organizationName || (t.organizationId ? (organizations.find(o => o.id === t.organizationId)?.name) : null) ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-950/40 text-blue-300 border border-blue-800/40 rounded-lg text-xs font-medium">
                                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                                {t.organizationName || organizations.find(o => o.id === t.organizationId)?.name}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500 italic">Unassigned</span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleToggleTeacherRole(t)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                                  t.role === 'admin'
                                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                    : 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30'
                                }`}
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                {t.role === 'admin' ? 'Demote' : 'Elevate to Admin'}
                              </button>
                              <button
                                onClick={() => {
                                  setReassigningTeacher(t);
                                  setNewOrgForTeacher(t.organizationId || '');
                                }}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors border border-slate-700"
                              >
                                Assign / Move Org
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CHOICE BOARD TEMPLATES & ASSIGNMENT */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 p-6 border border-slate-800 rounded-2xl">
              <div>
                <h2 className="text-xl font-bold text-white">Organization Choice Board Templates</h2>
                <p className="text-slate-400 text-sm">Design master templates and push them to all or selected classes in an Organization</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-semibold">Active Org:</span>
                  <select
                    value={selectedOrgId}
                    onChange={e => setSelectedOrgId(e.target.value)}
                    className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm font-bold focus:border-yellow-500 focus:outline-none"
                  >
                    {organizations.length === 0 && <option value="">No Organizations Available</option>}
                    {organizations.map(o => (
                      <option key={o.id} value={o.id}>{o.name} ({o.code})</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleOpenNewTemplate}
                  disabled={!selectedOrgId}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Template</span>
                </button>
              </div>
            </div>

            {/* Templates Display */}
            {!selectedOrgId ? (
              <div className="p-12 text-center text-slate-400">Please select an Organization above to view its choice board templates.</div>
            ) : templates.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
                <Layers className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white">No Choice Board Templates for {currentOrg?.name}</h3>
                <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto mb-6">
                  Create master choice board templates for this organization that teachers can adopt or admins can push directly to classes.
                </p>
                <button
                  onClick={handleOpenNewTemplate}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Create First Template
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map(tmp => (
                  <div key={tmp.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all shadow-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="px-2.5 py-1 bg-purple-950/60 text-purple-300 border border-purple-800/40 text-xs font-bold rounded-lg flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          Org Master Template
                        </span>
                        <span className="text-xs text-slate-500">By {tmp.createdBy || 'Admin'}</span>
                      </div>

                      <h3 className="text-xl font-bold text-white">{tmp.title}</h3>
                      <p className="text-slate-400 text-sm mt-1 line-clamp-2">{tmp.description || 'No description provided.'}</p>

                      <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                        <span className="font-bold text-yellow-400">Included Categories / Paths: </span>
                        <span>{tmp.activities?.map(a => a.title).join(', ') || 'Default paths'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-slate-800 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleOpenEditTemplate(tmp)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          onClick={() => handleDuplicateTemplate(tmp)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-blue-950/60 hover:text-blue-300 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700/60 transition-colors"
                          title="Copy this template to create a new one"
                        >
                          <Copy className="w-3.5 h-3.5 text-blue-400" /> Copy Template
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(tmp.id, tmp.title)}
                          className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>

                      <button
                        onClick={() => handleOpenAssignModal(tmp)}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md"
                      >
                        <Share2 className="w-4 h-4" /> Assign to Classes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ================= MODAL: CREATE / EDIT ORGANIZATION ================= */}
      {showOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingOrg ? 'Edit Organization' : 'Create New Organization'}
            </h3>

            <form onSubmit={handleSaveOrganization} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Springfield School District"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Description (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Brief summary or location notes..."
                  value={orgDesc}
                  onChange={e => setOrgDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowOrgModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl text-sm"
                >
                  {editingOrg ? 'Save Changes' : 'Create Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE TEACHER USER ================= */}
      {showTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Create Teacher Account</h3>

            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={tName}
                  onChange={e => setTName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="teacher@school.edu"
                  value={tEmail}
                  onChange={e => setTEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={tPassword}
                  onChange={e => setTPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Assigned Organization</label>
                <select
                  value={tOrgId}
                  onChange={e => setTOrgId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {organizations.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">System Role</label>
                <select
                  value={tRole}
                  onChange={e => setTRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                >
                  <option value="teacher">Teacher</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTeacherModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl text-sm"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REASSIGN TEACHER ORG ================= */}
      {reassigningTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Reassign Organization</h3>
            <p className="text-slate-400 text-sm mb-4">
              Select new Organization for <strong className="text-white">{reassigningTeacher.name}</strong>
            </p>

            <form onSubmit={handleReassignTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Organization</label>
                <select
                  value={newOrgForTeacher}
                  onChange={e => setNewOrgForTeacher(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {organizations.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.code})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setReassigningTeacher(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl text-sm"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT CHOICE BOARD TEMPLATE ================= */}
      {showTemplateEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="template-editor-title">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-6xl w-full p-4 sm:p-6 my-auto shadow-2xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 id="template-editor-title" className="text-xl font-bold text-white">
                {editingTemplate ? 'Edit Choice Board Template' : 'Create Choice Board Template'}
              </h3>
              <button onClick={() => setShowTemplateEditor(false)} aria-label="Close template editor" className="text-slate-400 hover:text-white text-xl font-bold p-1">✕</button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Template Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Q1 Math Master Board"
                    value={templateTitle}
                    onChange={e => setTemplateTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Standard curriculum choice board for middle school"
                    value={templateDesc}
                    onChange={e => setTemplateDesc(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category & Subtitle Customizer */}
              <div className="mt-6 p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Template Categories & Subtitles</h4>
                    <p className="text-xs text-slate-400">Configure custom category titles, subtitles, or add new categories for this choice board template.</p>
                  </div>
                  {templatePaths.length < 6 && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextIndex = templatePaths.length + 1;
                        const newPathId = `path${nextIndex}`;
                        const newTitle = `Category ${nextIndex}`;
                        const newColor = PATH_COLORS[(nextIndex - 1) % PATH_COLORS.length];

                        const newPathObj = {
                          id: newPathId,
                          title: newTitle,
                          subtitle: '',
                          icon: 'BookOpen',
                          color: newColor,
                          options: []
                        };

                        setTemplatePaths(prev => [...prev, newPathObj]);
                        setTemplateCategoryNames(prev => ({ ...prev, [newPathId]: newTitle }));
                        setTemplateCategorySubtitles(prev => ({ ...prev, [newPathId]: '' }));
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-yellow-400 rounded-lg text-xs font-bold transition-colors border border-slate-700"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Category
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templatePaths.map((path, idx) => {
                    const currentName = templateCategoryNames[path.id] || path.title;
                    const currentSub = templateCategorySubtitles[path.id] || path.subtitle || '';
                    return (
                      <div key={path.id} className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-yellow-400">Path #{idx + 1} ({path.id})</span>
                          {idx >= 3 && (
                            <button
                              type="button"
                              onClick={() => {
                                setTemplatePaths(prev => prev.filter(p => p.id !== path.id));
                                setTemplateCategoryNames(prev => { const next = { ...prev }; delete next[path.id]; return next; });
                                setTemplateCategorySubtitles(prev => { const next = { ...prev }; delete next[path.id]; return next; });
                              }}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Category Title</label>
                          <input
                            type="text"
                            value={currentName}
                            onChange={e => {
                              const val = e.target.value;
                              setTemplateCategoryNames(prev => ({ ...prev, [path.id]: val }));
                              setTemplatePaths(prev => prev.map(p => p.id === path.id ? { ...p, title: val } : p));
                            }}
                            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-white text-xs focus:border-yellow-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">Subtitle</label>
                          <input
                            type="text"
                            value={currentSub}
                            onChange={e => {
                              const val = e.target.value;
                              setTemplateCategorySubtitles(prev => ({ ...prev, [path.id]: val }));
                              setTemplatePaths(prev => prev.map(p => p.id === path.id ? { ...p, subtitle: val } : p));
                            }}
                            className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded text-white text-xs focus:border-yellow-500 outline-none"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Activity Paths Visual Editor */}
              <div className="mt-6">
                <h4 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3">Choice Board Activity Paths & Options</h4>
                <ActivityEditor
                  paths={templatePaths}
                  onChange={(updatedPaths) => setTemplatePaths(updatedPaths)}
                  categoryNames={templateCategoryNames}
                  categorySubtitles={templateCategorySubtitles}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setShowTemplateEditor(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl text-sm"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ASSIGN TEMPLATE TO ALL OR SPECIFIC CLASSES ================= */}
      {assigningTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-yellow-400">Template Distribution</span>
                <h3 className="text-xl font-bold text-white">{assigningTemplate.title}</h3>
              </div>
              <button onClick={() => setAssigningTemplate(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                Choose how you want to adjust and deploy this Choice Board Template to classes in <strong className="text-white">{currentOrg?.name}</strong>:
              </p>

              {/* Radio options */}
              <div className="grid grid-cols-1 gap-3">
                <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  assignTargetMode === 'all'
                    ? 'bg-yellow-500/10 border-yellow-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="targetMode"
                      checked={assignTargetMode === 'all'}
                      onChange={() => setAssignTargetMode('all')}
                      className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                    />
                    <div>
                      <div className="font-bold text-sm text-white">All Users & Classes in Organization</div>
                      <div className="text-xs text-slate-400">Pushes this choice board template to every active class ({orgClassesForAssign.length} classes)</div>
                    </div>
                  </div>
                </label>

                <label className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  assignTargetMode === 'specific'
                    ? 'bg-yellow-500/10 border-yellow-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="targetMode"
                      checked={assignTargetMode === 'specific'}
                      onChange={() => setAssignTargetMode('specific')}
                      className="w-4 h-4 text-yellow-500 focus:ring-yellow-500"
                    />
                    <div>
                      <div className="font-bold text-sm text-white">Specific Classes Only</div>
                      <div className="text-xs text-slate-400">Select individual classes in this organization to update</div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Class selection checkboxes if specific */}
              {assignTargetMode === 'specific' && (
                <div className="mt-4 p-4 bg-slate-950 rounded-xl border border-slate-800 max-h-60 overflow-y-auto space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2 pb-2 border-b border-slate-800">
                    <span>Select Classes to Receive Board:</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedClassIds.length === orgClassesForAssign.length) {
                          setSelectedClassIds([]);
                        } else {
                          setSelectedClassIds(orgClassesForAssign.map(c => c.id));
                        }
                      }}
                      className="text-yellow-400 hover:underline"
                    >
                      {selectedClassIds.length === orgClassesForAssign.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  {orgClassesForAssign.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500">No active classes found for this organization.</div>
                  ) : (
                    orgClassesForAssign.map(cls => (
                      <label key={cls.id} className="flex items-center gap-3 p-2 hover:bg-slate-900 rounded-lg cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={selectedClassIds.includes(cls.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedClassIds(prev => [...prev, cls.id]);
                            } else {
                              setSelectedClassIds(prev => prev.filter(id => id !== cls.id));
                            }
                          }}
                          className="w-4 h-4 rounded text-yellow-500 focus:ring-yellow-500 bg-slate-900 border-slate-700"
                        />
                        <div className="flex-1">
                          <span className="font-bold text-white">{cls.name}</span>
                          <span className="text-slate-400 ml-2">(Code: {cls.code})</span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800 mt-6">
              <button
                type="button"
                onClick={() => setAssigningTemplate(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAssignment}
                disabled={assigningLoading}
                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2"
              >
                {assigningLoading ? 'Deploying...' : <><Share2 className="w-4 h-4" /> Deploy Choice Board</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legal & Student Data Privacy Footer */}
      <footer className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 space-y-2 print:hidden">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <button
            onClick={() => { setLegalTab('privacy'); setLegalModalOpen(true); }}
            className="hover:text-blue-400 transition-colors underline underline-offset-2"
          >
            Privacy Policy
          </button>
          <span className="text-slate-700">•</span>
          <button
            onClick={() => { setLegalTab('terms'); setLegalModalOpen(true); }}
            className="hover:text-blue-400 transition-colors underline underline-offset-2"
          >
            Terms of Service
          </button>
          <span className="text-slate-700">•</span>
          <button
            onClick={() => { setLegalTab('compliance'); setLegalModalOpen(true); }}
            className="hover:text-emerald-400 transition-colors flex items-center gap-1 inline-flex"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Student Data Privacy & FERPA / COPPA
          </button>
        </div>
        <p className="text-[11px] text-slate-600">
          Protected under Federal & State Student Privacy Laws. Zero ads & zero data selling.
        </p>
      </footer>

      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalTab}
      />
    </div>
  );
}
