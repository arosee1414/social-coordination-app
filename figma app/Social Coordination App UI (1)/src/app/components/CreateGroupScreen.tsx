import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const emojiOptions = ['💜', '🏀', '⚽', '🎾', '🏊', '🎮', '🎲', '🎸', '🎨', '☕', '🍺', '📚', '🎬', '🧘‍♀️', '⛰️', '🚴', '🏃', '🎵', '🏠', '🎓', '💼', '✈️'];

export function CreateGroupScreen() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💜');

  const handleContinue = () => {
    // Navigate to add members screen
    navigate('/create-group/add-members');
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
        <h1 className="font-semibold text-lg">Create Group</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {/* Info */}
          <div className="bg-[#4F46E5]/5 border-2 border-[#4F46E5]/10 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              Groups are saved friend lists that make inviting people to hangouts faster. They're not recurring events.
            </p>
          </div>

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
                      ? 'border-[#4F46E5] bg-[#4F46E5]/5 scale-110'
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
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#4F46E5] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <button 
          onClick={handleContinue}
          disabled={!name}
          className="w-full bg-[#4F46E5] text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed active:bg-[#4338CA] transition-colors"
        >
          Continue to Add Members
        </button>
      </div>
    </div>
  );
}
