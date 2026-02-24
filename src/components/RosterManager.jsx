import React, { useState, useEffect } from 'react';
import { realBackend as backend } from '../services/realBackend';
import { UserPlus, Lock, Trash2, Save, Edit, X, Check, RotateCcw, Gift, Star, Zap, Trophy } from 'lucide-react';
import { ACHIEVEMENTS } from '../data/gameData';

export default function RosterManager({ classId, onStudentAdded }) {
  const [students, setStudents] = useState([]);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', password: '' });

  useEffect(() => {
    loadStudents();
  }, [classId]);

  const loadStudents = async () => {
    setLoading(true);
    const data = await backend.getStudents(classId);
    setStudents(data);
    setLoading(false);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentPassword.trim()) return;

    setAdding(true);
    try {
      await backend.createStudent(classId, newStudentName.trim(), newStudentPassword.trim());
      setNewStudentName('');
      setNewStudentPassword('');
      await loadStudents();
      if (onStudentAdded) onStudentAdded();
    } catch (error) {
      alert('Error adding student: ' + error.message);
    }
    setAdding(false);
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setEditForm({ name: student.name, password: student.password || '' });
  };

  const handleSaveEdit = async () => {
    try {
      await backend.updateStudent(editingId, editForm);
      setEditingId(null);
      loadStudents();
    } catch (error) {
      alert('Error updating student: ' + error.message);
    }
  };

  const handleResetActivities = async (student) => {
    if (!window.confirm(`Reset activity completion for ${student.name}?\n\nThis lets them redo activities and earn XP again. XP, coins, and achievements are kept.`)) return;
    try {
      await backend.resetStudentActivities(student.id);
      alert(`Activities reset for ${student.name}.`);
      loadStudents();
    } catch (error) {
      alert('Error resetting activities: ' + error.message);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure? This deletes all progress for this student.')) return;
    try {
      await backend.deleteStudent(studentId, classId);
      loadStudents();
      if (onStudentAdded) onStudentAdded(); // Updates count
    } catch (error) {
      alert('Error deleting student: ' + error.message);
    }
  };

  // Reward giving
  const [rewardTarget, setRewardTarget] = useState(null); // student object
  const [rewardType, setRewardType] = useState('xp'); // 'xp', 'coins', 'achievement'
  const [rewardAmount, setRewardAmount] = useState('');
  const [rewardAchievement, setRewardAchievement] = useState('');
  const [givingReward, setGivingReward] = useState(false);

  const handleGiveReward = async () => {
    if (!rewardTarget) return;
    setGivingReward(true);
    try {
      if (rewardType === 'xp') {
        const amount = parseInt(rewardAmount) || 0;
        if (amount <= 0) { alert('Enter a positive XP amount'); setGivingReward(false); return; }
        await backend.updateStudent(rewardTarget.id, { xp: (rewardTarget.xp || 0) + amount });
      } else if (rewardType === 'coins') {
        const amount = parseInt(rewardAmount) || 0;
        if (amount <= 0) { alert('Enter a positive coin amount'); setGivingReward(false); return; }
        await backend.updateStudent(rewardTarget.id, { coins: (rewardTarget.coins || 0) + amount });
      } else if (rewardType === 'achievement') {
        if (!rewardAchievement) { alert('Select an achievement'); setGivingReward(false); return; }
        const current = rewardTarget.unlockedAchievements || [];
        if (current.includes(rewardAchievement)) { alert('Student already has this achievement'); setGivingReward(false); return; }
        await backend.updateStudent(rewardTarget.id, { unlockedAchievements: [...current, rewardAchievement] });
      }
      alert(`Reward given to ${rewardTarget.name}!`);
      setRewardTarget(null);
      setRewardAmount('');
      setRewardAchievement('');
      loadStudents();
    } catch (error) {
      alert('Error giving reward: ' + error.message);
    }
    setGivingReward(false);
  };

  // Bulk upload (simple text area parsing)
  const [bulkText, setBulkText] = useState('');
  const [showBulk, setShowBulk] = useState(false);

  const handleBulkUpload = async () => {
    const lines = bulkText.split('\n').filter(line => line.trim());
    setAdding(true);
    let count = 0;
    let errors = [];

    for (const line of lines) {
      // Format: Name, Password
      const parts = line.split(',');
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const pass = parts[1].trim();
        try {
          await backend.createStudent(classId, name, pass);
          count++;
        } catch (e) {
          errors.push(`${name}: ${e.message}`);
        }
      }
    }

    alert(`Added ${count} students.` + (errors.length ? `\nErrors:\n${errors.join('\n')}` : ''));
    setBulkText('');
    setShowBulk(false);
    await loadStudents();
    setAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-green-400" /> Add Student
        </h3>

        <form onSubmit={handleAddStudent} className="flex flex-col md:flex-row gap-4 mb-4" aria-label="Add new student">
          <div className="flex-1">
            <label htmlFor="new-student-name" className="sr-only">Student Name</label>
            <input
              id="new-student-name"
              type="text"
              placeholder="Student Name"
              value={newStudentName}
              onChange={e => setNewStudentName(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 rounded-lg text-white border border-slate-600 focus:border-green-500 outline-none"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" aria-hidden="true" />
            <label htmlFor="new-student-password" className="sr-only">Set Password/PIN</label>
            <input
              id="new-student-password"
              type="text"
              placeholder="Set Password/PIN"
              value={newStudentPassword}
              onChange={e => setNewStudentPassword(e.target.value)}
              className="px-4 py-2 pl-10 bg-slate-700 rounded-lg text-white border border-slate-600 focus:border-green-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold disabled:opacity-50"
          >
            {adding ? 'Adding...' : 'Add'}
          </button>
        </form>

        <button
          onClick={() => setShowBulk(!showBulk)}
          className="text-sm text-blue-400 hover:underline mb-4"
          aria-expanded={showBulk}
        >
          {showBulk ? 'Hide Bulk Upload' : 'Bulk Upload (CSV)'}
        </button>

        {showBulk && (
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 mb-4">
            <label htmlFor="bulk-upload" className="text-xs text-slate-400 mb-2 block">Enter names and passwords, one per line (e.g., "Alice, 1234")</label>
            <textarea
              id="bulk-upload"
              value={bulkText}
              onChange={e => setBulkText(e.target.value)}
              className="w-full h-32 bg-slate-800 text-white p-2 rounded border border-slate-600 text-sm font-mono"
              placeholder="Alice, 1234&#10;Bob, 5678"
            />
            <button
              onClick={handleBulkUpload}
              disabled={adding}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold"
            >
              Process Bulk Upload
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">Class Roster ({students.length})</h3>

        {loading ? (
          <p className="text-slate-500" role="status" aria-live="polite">Loading roster...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map(student => (
              <div key={student.id} className="bg-slate-700 p-4 rounded-lg border border-slate-600 relative group">
                {editingId === student.id ? (
                   <div className="space-y-2">
                     <label htmlFor={`edit-name-${student.id}`} className="sr-only">Student name</label>
                     <input
                       id={`edit-name-${student.id}`}
                       className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white"
                       value={editForm.name}
                       onChange={e => setEditForm({...editForm, name: e.target.value})}
                     />
                     <label htmlFor={`edit-pass-${student.id}`} className="sr-only">Student password</label>
                     <input
                       id={`edit-pass-${student.id}`}
                       className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white"
                       value={editForm.password}
                       onChange={e => setEditForm({...editForm, password: e.target.value})}
                     />
                     <div className="flex gap-2">
                       <button onClick={handleSaveEdit} className="bg-green-600 px-3 py-1 rounded text-white text-xs font-bold">Save</button>
                       <button onClick={() => setEditingId(null)} className="bg-slate-600 px-3 py-1 rounded text-white text-xs font-bold">Cancel</button>
                     </div>
                   </div>
                ) : (
                  <>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setRewardTarget(student); setRewardType('xp'); setRewardAmount(''); setRewardAchievement(''); }} className="p-1 text-slate-400 hover:text-yellow-400" aria-label={`Give reward to ${student.name}`}><Gift className="w-4 h-4" aria-hidden="true" /></button>
                      <button onClick={() => handleResetActivities(student)} className="p-1 text-slate-400 hover:text-orange-400" aria-label={`Reset activities for ${student.name}`}><RotateCcw className="w-4 h-4" aria-hidden="true" /></button>
                      <button onClick={() => handleEdit(student)} className="p-1 text-slate-400 hover:text-white" aria-label={`Edit ${student.name}`}><Edit className="w-4 h-4" aria-hidden="true" /></button>
                      <button onClick={() => handleDelete(student.id)} className="p-1 text-slate-400 hover:text-red-400" aria-label={`Delete ${student.name}`}><Trash2 className="w-4 h-4" aria-hidden="true" /></button>
                    </div>

                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg" aria-hidden="true">
                          👤
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg leading-tight">{student.name}</p>
                          <p className="text-xs text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded inline-block mt-1">
                            Pass: <span className="text-yellow-400">{student.password || 'N/A'}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm border-t border-slate-600 pt-3">
                       <div>
                         <span className="text-slate-400 text-xs uppercase font-bold block">XP</span>
                         <p className="font-mono text-green-400 font-bold">{student.xp || 0}</p>
                       </div>
                       <div>
                         <span className="text-slate-400 text-xs uppercase font-bold block">Coins</span>
                         <p className="font-mono text-yellow-400 font-bold">{student.coins || 0}</p>
                       </div>
                       <div>
                         <span className="text-slate-400 text-xs uppercase font-bold block">Level</span>
                         <p className="font-mono text-blue-400 font-bold">{Math.floor((student.xp || 0)/500)+1}</p>
                       </div>
                       <div>
                         <span className="text-slate-400 text-xs uppercase font-bold block">Done</span>
                         <p className="font-mono text-purple-400 font-bold">{(student.completedActivities || []).length}</p>
                       </div>
                    </div>
                  </>
                )}
              </div>
            ))}
            {students.length === 0 && <p className="text-slate-500 italic">No students yet.</p>}
          </div>
        )}
      </div>

      {/* Reward Modal */}
      {rewardTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setRewardTarget(null)}>
          <div className="bg-slate-800 border-2 border-yellow-500 rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Gift className="w-6 h-6 text-yellow-400" aria-hidden="true" /> Give Reward
              </h3>
              <button onClick={() => setRewardTarget(null)} className="text-slate-400 hover:text-white" aria-label="Close">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <p className="text-slate-400 mb-4">Reward for: <span className="font-bold text-white">{rewardTarget.name}</span></p>

            <div className="flex gap-2 mb-4" role="group" aria-label="Reward type">
              <button
                onClick={() => setRewardType('xp')}
                className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 ${rewardType === 'xp' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300'}`}
              >
                <Zap className="w-4 h-4" aria-hidden="true" /> XP
              </button>
              <button
                onClick={() => setRewardType('coins')}
                className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 ${rewardType === 'coins' ? 'bg-yellow-600 text-white' : 'bg-slate-700 text-slate-300'}`}
              >
                <Star className="w-4 h-4" aria-hidden="true" /> Coins
              </button>
              <button
                onClick={() => setRewardType('achievement')}
                className={`flex-1 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-1 ${rewardType === 'achievement' ? 'bg-purple-600 text-white' : 'bg-slate-700 text-slate-300'}`}
              >
                <Trophy className="w-4 h-4" aria-hidden="true" /> Trophy
              </button>
            </div>

            {(rewardType === 'xp' || rewardType === 'coins') && (
              <div className="mb-4">
                <label htmlFor="reward-amount" className="block text-sm text-slate-400 mb-1">
                  Amount of {rewardType === 'xp' ? 'XP' : 'Coins'} to give
                </label>
                <input
                  id="reward-amount"
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
                <label htmlFor="reward-achievement" className="block text-sm text-slate-400 mb-1">Select Achievement to unlock</label>
                <select
                  id="reward-achievement"
                  value={rewardAchievement}
                  onChange={e => setRewardAchievement(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-yellow-500 outline-none"
                >
                  <option value="">-- Choose --</option>
                  {ACHIEVEMENTS.filter(a => !(rewardTarget.unlockedAchievements || []).includes(a.id)).map(a => (
                    <option key={a.id} value={a.id}>{a.icon} {a.title} - {a.desc}</option>
                  ))}
                </select>
                {ACHIEVEMENTS.filter(a => !(rewardTarget.unlockedAchievements || []).includes(a.id)).length === 0 && (
                  <p className="text-xs text-green-400 mt-2">This student has unlocked all achievements!</p>
                )}
              </div>
            )}

            <button
              onClick={handleGiveReward}
              disabled={givingReward}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {givingReward ? 'Giving...' : 'Give Reward'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
