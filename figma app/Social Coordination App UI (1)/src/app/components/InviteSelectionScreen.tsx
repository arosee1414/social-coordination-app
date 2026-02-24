import { useNavigate } from 'react-router';
import { ArrowLeft, Search, Users as UsersIcon, User } from 'lucide-react';
import { useState } from 'react';

const mockFriends = [
  { id: '1', name: 'Sarah Chen', avatar: '👩🏻' },
  { id: '2', name: 'Mike Johnson', avatar: '👨🏽' },
  { id: '3', name: 'Emma Wilson', avatar: '👩🏼' },
  { id: '4', name: 'David Kim', avatar: '👨🏻' },
  { id: '5', name: 'Lisa Martinez', avatar: '👩🏽' },
  { id: '6', name: 'Alex Turner', avatar: '👨🏼' },
  { id: '7', name: 'Nina Patel', avatar: '👩🏾' },
];

const mockGroups = [
  { id: 'g1', name: 'Close Friends', icon: '💜', memberCount: 5 },
  { id: 'g2', name: 'Basketball Crew', icon: '🏀', memberCount: 8 },
  { id: 'g3', name: 'Roommates', icon: '🏠', memberCount: 3 },
];

type SelectionType = 'friends' | 'groups';

export function InviteSelectionScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SelectionType>('friends');
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

  const toggleFriend = (id: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedFriends(newSelected);
  };

  const toggleGroup = (id: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedGroups(newSelected);
  };

  const handleCreate = () => {
    // In a real app, this would create the hangout
    navigate('/home');
  };

  const totalSelected = selectedFriends.size + selectedGroups.size;

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
        <h1 className="font-semibold text-lg">Invite to Hangout</h1>
        <div className="w-10"></div>
      </div>

      {/* Tab Navigation */}
      <div className="px-6 pt-4 pb-3">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'friends'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Friends
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'groups'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Groups
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder={`Search ${activeTab}...`}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#007AFF]/20 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6">
        {activeTab === 'friends' && (
          <div className="space-y-2 pb-4">
            {mockFriends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => toggleFriend(friend.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  selectedFriends.has(friend.id)
                    ? 'border-[#007AFF] bg-[#007AFF]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                  {friend.avatar}
                </div>
                <span className="flex-1 text-left font-medium">{friend.name}</span>
                {selectedFriends.has(friend.id) && (
                  <div className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'groups' && (
          <div className="space-y-2 pb-4">
            {mockGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  selectedGroups.has(group.id)
                    ? 'border-[#007AFF] bg-[#007AFF]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#007AFF]/10 to-[#007AFF]/20 rounded-full flex items-center justify-center text-2xl">
                  {group.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">{group.name}</div>
                  <div className="text-sm text-gray-500">{group.memberCount} members</div>
                </div>
                {selectedGroups.has(group.id) && (
                  <div className="w-6 h-6 bg-[#007AFF] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="p-6 border-t border-gray-100 bg-white">
        {totalSelected > 0 && (
          <div className="text-center mb-3 text-sm text-gray-600">
            <span className="font-semibold text-[#007AFF]">{totalSelected}</span> selected
            {selectedFriends.size > 0 && selectedGroups.size > 0 && (
              <span> ({selectedFriends.size} friends, {selectedGroups.size} groups)</span>
            )}
          </div>
        )}
        <button 
          onClick={handleCreate}
          disabled={totalSelected === 0}
          className="w-full bg-[#007AFF] text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed active:bg-[#0066CC] transition-colors"
        >
          Create Hangout
        </button>
      </div>
    </div>
  );
}
