import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Users as UsersIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';

const emojiOptions = ['💜', '🏀', '⚽', '🎾', '🏊', '🎮', '🎲', '🎸', '🎨', '☕', '🍺', '📚', '🎬', '🧘‍♀️', '⛰️', '🚴', '🏃', '🎵', '🏠', '🎓', '💼', '✈️'];

export function EditGroupScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Mock initial data - in real app, fetch from group ID
  const [name, setName] = useState('Close Friends');
  const [selectedEmoji, setSelectedEmoji] = useState('💜');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveChanges = () => {
    // Save changes and navigate back to group detail
    navigate(`/group/${id}`);
  };

  const handleManageMembers = () => {
    // Navigate to manage members screen
    navigate(`/group/${id}/manage-members`);
  };

  const handleDeleteGroup = () => {
    // Delete group and navigate to groups list
    navigate('/groups');
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 active:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-semibold text-lg">Edit Group</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Choose an Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-14 h-14 text-2xl rounded-xl border-2 transition-all ${
                    selectedEmoji === emoji
                      ? 'border-[#007AFF] bg-[#007AFF]/5 scale-110'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Group Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Group Name *
            </label>
            <input 
              type="text" 
              placeholder="e.g., Close Friends, Basketball Crew"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#007AFF] focus:outline-none transition-colors"
            />
          </div>

          {/* Manage Members Button */}
          <button
            onClick={handleManageMembers}
            className="w-full bg-[#007AFF]/10 border-2 border-[#007AFF]/20 text-[#007AFF] py-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-[#007AFF]/20 transition-colors"
          >
            <UsersIcon className="w-5 h-5" />
            Manage Members
          </button>

          {/* Delete Group */}
          <div className="pt-6 border-t border-gray-100">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-red-100 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Delete Group
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              This will permanently delete this saved friend list
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <button 
          onClick={handleSaveChanges}
          disabled={!name}
          className="w-full bg-[#007AFF] text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed active:bg-[#0066CC] transition-colors shadow-sm"
        >
          Save Changes
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setShowDeleteConfirm(false)}
          ></div>
          
          {/* Modal */}
          <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
            <div className="bg-white rounded-t-3xl shadow-2xl p-6">
              <h2 className="text-xl font-bold mb-2">Delete this group?</h2>
              <p className="text-gray-600 mb-6">
                This will permanently delete the group. This is just a saved friend list, so it won't affect any existing hangouts. This action cannot be undone.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleDeleteGroup}
                  className="w-full bg-red-500 text-white py-4 rounded-xl font-semibold active:bg-red-600 transition-colors"
                >
                  Yes, Delete Group
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold active:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
