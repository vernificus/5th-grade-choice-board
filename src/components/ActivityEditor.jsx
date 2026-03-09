import React, { useState, useEffect, useRef } from 'react';
import { realBackend as backend } from '../services/realBackend';
import { LEARNING_PATHS as DEFAULT_PATHS, PATH_COLORS } from '../data/gameData';
import {
  Save, Plus, Trash2, BookOpen, Search, X, ChevronDown, ChevronUp,
  GripVertical, Link2, ExternalLink, Eye, EyeOff, Bold, Italic, Type,
  ArrowUp, ArrowDown, Copy, ChevronRight
} from 'lucide-react';

// Normalize a step to object form for backward compatibility.
// Old steps are plain strings; new steps are { text, link?, linkText? }.
function normalizeStep(step) {
  if (typeof step === 'string') return { text: step };
  return step;
}

function normalizeSteps(steps) {
  if (!steps) return [{ text: '' }];
  return steps.map(normalizeStep);
}

// Render text with basic markdown-style formatting: **bold** and *italic*
function renderFormattedText(text) {
  if (!text) return null;
  const parts = [];
  let remaining = text;
  let key = 0;

  // Process **bold** and *italic* markers
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    if (match[2]) {
      // **bold**
      parts.push(<strong key={key++} className="font-bold text-white">{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={key++} className="italic text-slate-200">{match[3]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : text;
}

// Step editor component for a single step with link support
function StepEditor({ step, index, totalSteps, onChange, onRemove, onMoveUp, onMoveDown }) {
  const [showLink, setShowLink] = useState(!!(step.link || step.linkText));
  const textareaRef = useRef(null);

  const handleTextChange = (e) => {
    onChange({ ...step, text: e.target.value });
  };

  const handleLinkChange = (field, value) => {
    onChange({ ...step, [field]: value });
  };

  const insertFormatting = (wrapper) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = step.text || '';
    const selected = text.slice(start, end);

    if (selected) {
      const newText = text.slice(0, start) + wrapper + selected + wrapper + text.slice(end);
      onChange({ ...step, text: newText });
    } else {
      const placeholder = wrapper === '**' ? 'bold text' : 'italic text';
      const newText = text.slice(0, start) + wrapper + placeholder + wrapper + text.slice(end);
      onChange({ ...step, text: newText });
      // Set cursor inside the markers after render
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + wrapper.length, start + wrapper.length + placeholder.length);
      }, 0);
    }
  };

  return (
    <div className="bg-slate-800/80 rounded-lg border border-slate-600 p-3 group/step">
      <div className="flex items-start gap-2">
        {/* Step number badge */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <span className="w-6 h-6 rounded-full bg-slate-600 text-yellow-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {index + 1}
          </span>
          <div className="flex flex-col gap-0.5 opacity-0 group-hover/step:opacity-100 transition-opacity">
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-0.5 text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={`Move step ${index + 1} up`}
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === totalSteps - 1}
              className="p-0.5 text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={`Move step ${index + 1} down`}
            >
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Formatting toolbar */}
          <div className="flex items-center gap-1 mb-1">
            <button
              type="button"
              onClick={() => insertFormatting('**')}
              className="p-1 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Bold (**text**)"
              aria-label="Insert bold formatting"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*')}
              className="p-1 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Italic (*text*)"
              aria-label="Insert italic formatting"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <div className="w-px h-4 bg-slate-600 mx-1" />
            <button
              type="button"
              onClick={() => setShowLink(!showLink)}
              className={`p-1 rounded transition-colors flex items-center gap-1 text-xs ${showLink ? 'text-blue-400 bg-blue-500/20' : 'text-slate-500 hover:text-white hover:bg-slate-700'}`}
              title="Add a link to this step"
              aria-label={showLink ? 'Hide link fields' : 'Add link to this step'}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Link</span>
            </button>
          </div>

          {/* Step text */}
          <textarea
            ref={textareaRef}
            value={step.text || ''}
            onChange={handleTextChange}
            placeholder="Describe this step..."
            rows={2}
            className="w-full bg-slate-700 text-sm text-white px-3 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none resize-y min-h-[52px] placeholder-slate-500"
            aria-label={`Step ${index + 1} instructions`}
          />

          {/* Link fields */}
          {showLink && (
            <div className="mt-2 p-2.5 bg-slate-700/50 rounded-lg border border-slate-600/50 space-y-2">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Link URL
                </label>
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-slate-500 flex-shrink-0" aria-hidden="true" />
                  <input
                    type="url"
                    value={step.link || ''}
                    onChange={(e) => handleLinkChange('link', e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 bg-slate-700 text-sm text-blue-300 px-2 py-1.5 rounded border border-slate-600 focus:border-blue-500 outline-none placeholder-slate-500"
                    aria-label={`Step ${index + 1} link URL`}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">
                  Link display text (optional)
                </label>
                <input
                  type="text"
                  value={step.linkText || ''}
                  onChange={(e) => handleLinkChange('linkText', e.target.value)}
                  placeholder="Click here to open..."
                  className="w-full bg-slate-700 text-sm text-white px-2 py-1.5 rounded border border-slate-600 focus:border-blue-500 outline-none placeholder-slate-500"
                  aria-label={`Step ${index + 1} link display text`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={onRemove}
          className="p-1 text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 mt-1"
          aria-label={`Remove step ${index + 1}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Preview of how the activity will look to students
function ActivityPreview({ activity }) {
  const steps = normalizeSteps(activity.steps);

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="w-4 h-4 text-slate-500" aria-hidden="true" />
        <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Student Preview</span>
      </div>

      <h4 className="text-lg font-black uppercase italic text-white mb-1">{activity.title || 'Untitled Activity'}</h4>
      <p className="text-sm text-slate-400 mb-3">{activity.desc || 'No description'}</p>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs bg-slate-700 text-yellow-400 px-2 py-1 rounded-full font-bold">+{activity.xp} XP</span>
        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">{activity.type}</span>
      </div>

      <div className="space-y-3 mb-4">
        <h5 className="font-bold text-slate-300 uppercase text-xs tracking-widest">How to Play:</h5>
        <ol className="space-y-2.5">
          {steps.map((step, idx) => (
            <li key={idx} className="flex gap-3 text-slate-300">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 text-yellow-500 flex items-center justify-center text-xs font-bold border border-slate-600">
                {idx + 1}
              </span>
              <div className="text-sm leading-relaxed">
                <span>{renderFormattedText(step.text)}</span>
                {step.link && (
                  <span className="inline-flex items-center gap-1 ml-1 text-blue-400 underline">
                    <Link2 className="w-3 h-3" />
                    {step.linkText || step.link}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {activity.proTip && (
        <div className="bg-blue-600/20 border border-blue-500/30 p-3 rounded-xl">
          <span className="text-xs font-black uppercase tracking-widest text-blue-400 block mb-1">Pro Tip</span>
          <p className="text-sm text-blue-100">{renderFormattedText(activity.proTip)}</p>
        </div>
      )}
    </div>
  );
}

export default function ActivityEditor({ classId, onSave, onCancel }) {
  const [learningPaths, setLearningPaths] = useState(DEFAULT_PATHS);
  const [libraryActivities, setLibraryActivities] = useState([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Which activity is currently being edited (pathId + activityId)
  const [editingPathId, setEditingPathId] = useState(null);
  const [editingActivityId, setEditingActivityId] = useState(null);

  // Which path sections are expanded in the sidebar
  // Initialize all paths as expanded (dynamically based on loaded data)
  const [expandedPaths, setExpandedPaths] = useState({});

  // Show/hide preview
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const classDoc = await backend.getClass(classId);
      if (classDoc) {
        let paths = classDoc.activities && classDoc.activities.length > 0
          ? classDoc.activities
          : DEFAULT_PATHS;

        if (classDoc.categoryNames || classDoc.categorySubtitles) {
          paths = paths.map(path => ({
            ...path,
            title: classDoc.categoryNames?.[path.id] || path.title,
            subtitle: classDoc.categorySubtitles?.[path.id] || path.subtitle,
          }));

          // Add any extra categories that don't have activity paths yet
          if (classDoc.categoryNames) {
            const existingIds = new Set(paths.map(p => p.id));
            Object.keys(classDoc.categoryNames).forEach((key, idx) => {
              if (!existingIds.has(key)) {
                paths.push({
                  id: key,
                  title: classDoc.categoryNames[key],
                  subtitle: classDoc.categorySubtitles?.[key] || '',
                  icon: 'BookOpen',
                  color: PATH_COLORS[(paths.length) % PATH_COLORS.length],
                  options: [],
                });
              }
            });
          }
        }

        // Normalize all steps to object form
        paths = paths.map(path => ({
          ...path,
          options: path.options.map(opt => ({
            ...opt,
            steps: normalizeSteps(opt.steps),
          })),
        }));

        setLearningPaths(paths);
        // Expand all path sections by default
        const expanded = {};
        paths.forEach(p => { expanded[p.id] = true; });
        setExpandedPaths(expanded);
      }
      setLoading(false);
    };
    loadData();
  }, [classId]);

  const loadLibrary = async () => {
    setLoading(true);
    const activities = await backend.getPublicActivities();
    setLibraryActivities(activities);
    setShowLibrary(true);
    setLoading(false);
  };

  const handleUpdateActivity = (pathId, activityId, field, value) => {
    setLearningPaths(prev => prev.map(path => {
      if (path.id !== pathId) return path;
      return {
        ...path,
        options: path.options.map(opt => {
          if (opt.id !== activityId) return opt;
          return { ...opt, [field]: value };
        })
      };
    }));
  };

  const handleAddActivity = (pathId) => {
    const newId = `${pathId}-${Date.now()}`;
    setLearningPaths(prev => prev.map(path => {
      if (path.id !== pathId) return path;
      return {
        ...path,
        options: [...path.options, {
          id: newId,
          title: 'New Activity',
          desc: 'Description here',
          type: 'Low Tech',
          xp: 100,
          steps: [{ text: '' }],
          proTip: ''
        }]
      };
    }));
    // Auto-select the new activity for editing
    setEditingPathId(pathId);
    setEditingActivityId(newId);
    setExpandedPaths(prev => ({ ...prev, [pathId]: true }));
  };

  const handleDeleteActivity = (pathId, activityId) => {
    if (!window.confirm('Delete this activity?')) return;
    setLearningPaths(prev => prev.map(path => {
      if (path.id !== pathId) return path;
      return {
        ...path,
        options: path.options.filter(opt => opt.id !== activityId)
      };
    }));
    // Clear selection if we deleted the active one
    if (editingActivityId === activityId) {
      setEditingActivityId(null);
      setEditingPathId(null);
    }
  };

  const handleDuplicateActivity = (pathId, activity) => {
    const newId = `${pathId}-${Date.now()}`;
    const duplicate = {
      ...activity,
      id: newId,
      title: `${activity.title} (Copy)`,
      steps: activity.steps.map(s => ({ ...normalizeStep(s) })),
    };
    setLearningPaths(prev => prev.map(path => {
      if (path.id !== pathId) return path;
      return { ...path, options: [...path.options, duplicate] };
    }));
    setEditingPathId(pathId);
    setEditingActivityId(newId);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await backend.saveClassActivities(classId, learningPaths);
      alert('Activities saved successfully!');
      if (onSave) onSave();
    } catch (error) {
      alert('Error saving activities: ' + error.message);
    }
    setLoading(false);
  };

  const handleImport = (activity, targetPathId) => {
    setLearningPaths(prev => prev.map(path => {
      if (path.id !== targetPathId) return path;
      const newActivity = {
        ...activity,
        id: `${targetPathId}-${Date.now()}`,
        steps: normalizeSteps(activity.steps),
      };
      delete newActivity.publishedAt;
      return { ...path, options: [...path.options, newActivity] };
    }));
    setShowLibrary(false);
  };

  const handlePublish = async (activity) => {
    if (!window.confirm(`Publish "${activity.title}" to the public library?`)) return;
    try {
      await backend.publishActivity(activity);
      alert('Activity published!');
    } catch (error) {
      alert('Error publishing: ' + error.message);
    }
  };

  // Get the currently editing activity
  const editingActivity = editingPathId && editingActivityId
    ? learningPaths.find(p => p.id === editingPathId)?.options.find(a => a.id === editingActivityId)
    : null;

  // Step management helpers for the editing activity
  const updateStep = (idx, newStep) => {
    if (!editingActivity) return;
    const newSteps = [...editingActivity.steps];
    newSteps[idx] = newStep;
    handleUpdateActivity(editingPathId, editingActivityId, 'steps', newSteps);
  };

  const removeStep = (idx) => {
    if (!editingActivity || editingActivity.steps.length <= 1) return;
    const newSteps = editingActivity.steps.filter((_, i) => i !== idx);
    handleUpdateActivity(editingPathId, editingActivityId, 'steps', newSteps);
  };

  const addStep = () => {
    if (!editingActivity) return;
    handleUpdateActivity(editingPathId, editingActivityId, 'steps', [
      ...editingActivity.steps,
      { text: '' }
    ]);
  };

  const moveStep = (idx, direction) => {
    if (!editingActivity) return;
    const newSteps = [...editingActivity.steps];
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= newSteps.length) return;
    [newSteps[idx], newSteps[targetIdx]] = [newSteps[targetIdx], newSteps[idx]];
    handleUpdateActivity(editingPathId, editingActivityId, 'steps', newSteps);
  };

  // ---- Library modal ----
  if (showLibrary) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="library-dialog-title" onKeyDown={(e) => e.key === 'Escape' && setShowLibrary(false)}>
        <div className="bg-slate-800 border-2 border-blue-500 rounded-2xl w-full max-w-4xl p-6 h-[80vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 id="library-dialog-title" className="text-2xl font-bold text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-400" aria-hidden="true" /> Activity Library
            </h3>
            <button onClick={() => setShowLibrary(false)} aria-label="Close activity library"><X className="w-6 h-6 text-slate-400 hover:text-white" aria-hidden="true" /></button>
          </div>

          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" aria-hidden="true" />
            <label htmlFor="library-search" className="sr-only">Search activities</label>
            <input
              id="library-search"
              type="search"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-700 rounded-lg text-white border border-slate-600 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {libraryActivities
              .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(activity => (
              <div key={activity.id} className="bg-slate-700 p-4 rounded-xl border border-slate-600">
                <h4 className="font-bold text-white">{activity.title}</h4>
                <p className="text-sm text-slate-400 mb-2">{activity.desc}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {learningPaths.map(path => (
                    <button
                      key={path.id}
                      onClick={() => handleImport(activity, path.id)}
                      className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded text-white"
                    >
                      Import to {path.title}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ---- Main editor layout ----
  return (
    <div className="space-y-4">
      {/* Top toolbar */}
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700 sticky top-0 z-10 shadow-xl">
        <h2 className="text-xl font-bold text-white">Edit Choice Board</h2>
        <div className="flex gap-2">
          <button
            onClick={loadLibrary}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" /> Browse Library
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" aria-hidden="true" /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Two-panel layout: sidebar + editor */}
      <div className="flex gap-6 min-h-[70vh]">

        {/* Left sidebar: Activity list organized by path */}
        <div className="w-72 flex-shrink-0 space-y-3">
          {learningPaths.map(path => (
            <div key={path.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              {/* Path header - collapsible */}
              <button
                onClick={() => setExpandedPaths(prev => ({ ...prev, [path.id]: !prev[path.id] }))}
                className={`w-full flex items-center justify-between p-3 ${path.color} hover:brightness-110 transition-all`}
                aria-expanded={expandedPaths[path.id]}
                aria-controls={`path-list-${path.id}`}
              >
                <span className="font-black uppercase italic text-white text-sm truncate">{path.title}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full">{path.options.length}</span>
                  {expandedPaths[path.id]
                    ? <ChevronDown className="w-4 h-4 text-white/80" aria-hidden="true" />
                    : <ChevronRight className="w-4 h-4 text-white/80" aria-hidden="true" />
                  }
                </div>
              </button>

              {/* Activity list for this path */}
              {expandedPaths[path.id] && (
                <div id={`path-list-${path.id}`} className="p-2 space-y-1">
                  {path.options.map(activity => {
                    const isActive = editingPathId === path.id && editingActivityId === activity.id;
                    return (
                      <button
                        key={activity.id}
                        onClick={() => {
                          setEditingPathId(path.id);
                          setEditingActivityId(activity.id);
                          setShowPreview(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-600/30 border border-blue-500 text-white'
                            : 'hover:bg-slate-700 text-slate-300 border border-transparent'
                        }`}
                        aria-current={isActive ? 'true' : undefined}
                      >
                        <div className="font-bold truncate">{activity.title}</div>
                        <div className="text-xs text-slate-500 truncate">{activity.type} &middot; {activity.xp} XP</div>
                      </button>
                    );
                  })}

                  {/* Add activity button */}
                  <button
                    onClick={() => handleAddActivity(path.id)}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-slate-600 rounded-lg text-slate-500 hover:border-slate-400 hover:text-slate-300 text-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Add Activity
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right panel: Activity editor or empty state */}
        <div className="flex-1 min-w-0">
          {editingActivity ? (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              {/* Editor header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/80">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">Edit Activity</h3>
                  <span className="text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded-full">
                    {learningPaths.find(p => p.id === editingPathId)?.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      showPreview ? 'bg-blue-600/30 text-blue-400 border border-blue-500' : 'bg-slate-700 text-slate-400 hover:text-white'
                    }`}
                    aria-pressed={showPreview}
                  >
                    {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showPreview ? 'Hide Preview' : 'Preview'}
                  </button>
                  <button
                    onClick={() => handleDuplicateActivity(editingPathId, editingActivity)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-slate-400 hover:text-white rounded-lg text-sm font-medium transition-colors"
                    aria-label="Duplicate this activity"
                  >
                    <Copy className="w-4 h-4" /> Duplicate
                  </button>
                  <button
                    onClick={() => handlePublish(editingActivity)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-slate-400 hover:text-blue-400 rounded-lg text-sm font-medium transition-colors"
                    aria-label="Publish to library"
                  >
                    <BookOpen className="w-4 h-4" /> Publish
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(editingPathId, editingActivityId)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-slate-400 hover:text-red-400 rounded-lg text-sm font-medium transition-colors"
                    aria-label="Delete this activity"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-6 max-h-[calc(100vh-240px)] overflow-y-auto">
                {/* Basic info section */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor={`edit-title-${editingActivityId}`} className="block text-sm font-bold text-slate-300 mb-1.5">
                      Activity Title
                    </label>
                    <input
                      id={`edit-title-${editingActivityId}`}
                      className="w-full bg-slate-700 text-white text-lg font-bold px-4 py-2.5 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                      value={editingActivity.title}
                      onChange={(e) => handleUpdateActivity(editingPathId, editingActivityId, 'title', e.target.value)}
                      placeholder="Activity title..."
                    />
                  </div>

                  <div>
                    <label htmlFor={`edit-desc-${editingActivityId}`} className="block text-sm font-bold text-slate-300 mb-1.5">
                      Description
                    </label>
                    <textarea
                      id={`edit-desc-${editingActivityId}`}
                      className="w-full bg-slate-700 text-sm text-slate-200 px-4 py-2.5 rounded-lg border border-slate-600 focus:border-blue-500 outline-none resize-y min-h-[60px]"
                      value={editingActivity.desc}
                      onChange={(e) => handleUpdateActivity(editingPathId, editingActivityId, 'desc', e.target.value)}
                      placeholder="Brief description of the activity..."
                      rows={2}
                    />
                    <p className="text-xs text-slate-500 mt-1">Use **bold** and *italic* for formatting.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`edit-xp-${editingActivityId}`} className="block text-sm font-bold text-slate-300 mb-1.5">
                        XP Reward
                      </label>
                      <input
                        id={`edit-xp-${editingActivityId}`}
                        className="w-full bg-slate-700 text-yellow-400 font-bold px-4 py-2.5 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                        type="number"
                        min="0"
                        step="10"
                        value={editingActivity.xp}
                        onChange={(e) => handleUpdateActivity(editingPathId, editingActivityId, 'xp', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label htmlFor={`edit-type-${editingActivityId}`} className="block text-sm font-bold text-slate-300 mb-1.5">
                        Activity Type
                      </label>
                      <select
                        id={`edit-type-${editingActivityId}`}
                        className="w-full bg-slate-700 text-slate-200 px-4 py-2.5 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                        value={editingActivity.type}
                        onChange={(e) => handleUpdateActivity(editingPathId, editingActivityId, 'type', e.target.value)}
                      >
                        <option value="Low Tech">Low Tech</option>
                        <option value="High Tech">High Tech</option>
                        <option value="Collaboration">Collaboration</option>
                        <option value="Reflection">Reflection</option>
                        <option value="Creation">Creation</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-700" />

                {/* Steps section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Steps</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Instructions students will follow. Use formatting toolbar for **bold** and *italic*.</p>
                    </div>
                    <span className="text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded-full">
                      {editingActivity.steps.length} {editingActivity.steps.length === 1 ? 'step' : 'steps'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {editingActivity.steps.map((step, idx) => {
                      const normalizedStep = normalizeStep(step);
                      return (
                        <StepEditor
                          key={idx}
                          step={normalizedStep}
                          index={idx}
                          totalSteps={editingActivity.steps.length}
                          onChange={(newStep) => updateStep(idx, newStep)}
                          onRemove={() => removeStep(idx)}
                          onMoveUp={() => moveStep(idx, -1)}
                          onMoveDown={() => moveStep(idx, 1)}
                        />
                      );
                    })}
                  </div>

                  <button
                    onClick={addStep}
                    className="w-full mt-3 py-2.5 border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:border-blue-500 hover:text-blue-400 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" /> Add Step
                  </button>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-700" />

                {/* Pro Tip */}
                <div>
                  <label htmlFor={`edit-protip-${editingActivityId}`} className="block text-sm font-bold text-slate-300 mb-1.5">
                    Pro Tip
                  </label>
                  <textarea
                    id={`edit-protip-${editingActivityId}`}
                    className="w-full bg-slate-700 text-blue-300 px-4 py-2.5 rounded-lg border border-slate-600 focus:border-blue-500 outline-none resize-y min-h-[60px]"
                    value={editingActivity.proTip || ''}
                    onChange={(e) => handleUpdateActivity(editingPathId, editingActivityId, 'proTip', e.target.value)}
                    placeholder="Optional tip for students to earn extra XP..."
                    rows={2}
                  />
                  <p className="text-xs text-slate-500 mt-1">Supports **bold** and *italic* formatting.</p>
                </div>

                {/* Preview section */}
                {showPreview && (
                  <>
                    <div className="border-t border-slate-700" />
                    <ActivityPreview activity={editingActivity} />
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Empty state when no activity is selected */
            <div className="bg-slate-800 rounded-xl border border-slate-700 flex flex-col items-center justify-center min-h-[400px] text-center p-8">
              <div className="w-16 h-16 bg-slate-700 rounded-2xl flex items-center justify-center mb-4">
                <Type className="w-8 h-8 text-slate-500" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-slate-300 mb-2">Select an Activity to Edit</h3>
              <p className="text-sm text-slate-500 max-w-md">
                Click on any activity in the sidebar to start editing. You can also add new activities using the
                "+ Add Activity" button under each learning path.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
