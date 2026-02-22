import { useNavigate } from 'react-router';
import { ArrowLeft, Search } from 'lucide-react';
import { useState } from 'react';

const mockFriends = [
  { id: '1', name: 'Sarah Chen', avatar: '👩🏻' },
  { id: '2', name: 'Mike Johnson', avatar: '👨🏽' },
  { id: '3', name: 'Emma Wilson', avatar: '👩🏼' },
  { id: '4', name: 'David Kim', avatar: '👨🏻' },
  { id: '5', name: 'Lisa Martinez', avatar: '👩🏽' },
  { id: '6', name: 'Alex Turner', avatar: '👨🏼' },
  { id: '7', name: 'Nina Patel', avatar: '👩🏾' },
  { id: '8', name: 'Tom Anderson', avatar: '👨🏻' },
];

export function AddMembersScreen() {
  const navigate = useNavigate();
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  const toggleMember = (id: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedMembers(newSelected);
  };

  const handleCreate = () => {
    // Navigate to confirmation screen
    navigate('/group-created');
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
        <h1 className="font-semibold text-lg">Add Members</h1>
        <div className="w-10"></div>
      </div>

      {/* Search */}
      <div className="px-6 pt-4 pb-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search friends..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#4F46E5]/20 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6">
        <div className="space-y-2 pb-4">
          {mockFriends.map((friend) => (
            <button
              key={friend.id}
              onClick={() => toggleMember(friend.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                selectedMembers.has(friend.id)
                  ? 'border-[#4F46E5] bg-[#4F46E5]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                {friend.avatar}
              </div>
              <span className="flex-1 text-left font-medium">{friend.name}</span>
              {selectedMembers.has(friend.id) && (
                <div className="w-6 h-6 bg-[#4F46E5] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 border-t border-gray-100 bg-white">
        {selectedMembers.size > 0 && (
          <div className="text-center mb-3 text-sm text-gray-600">
            <span className="font-semibold text-[#4F46E5]">{selectedMembers.size}</span> members selected
          </div>
        )}
        <button 
          onClick={handleCreate}
          disabled={selectedMembers.size === 0}
          className="w-full bg-[#4F46E5] text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed active:bg-[#4338CA] transition-colors"
        >
          Create Group
        </button>
      </div>
    </div>
  );
}
