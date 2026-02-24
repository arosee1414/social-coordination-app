import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Search, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

const mockCurrentMembers = [
  { id: 'm1', name: 'Sarah Chen', avatar: '👩🏻', role: 'Admin' },
  { id: 'm2', name: 'Mike Johnson', avatar: '👨🏽', role: 'Member' },
  { id: 'm3', name: 'Emma Wilson', avatar: '👩🏼', role: 'Member' },
  { id: 'm4', name: 'David Kim', avatar: '👨🏻', role: 'Member' },
  { id: 'm5', name: 'Lisa Martinez', avatar: '👩🏽', role: 'Member' },
];

const mockAvailableFriends = [
  { id: 'f1', name: 'Alex Johnson', avatar: '👨🏼' },
  { id: 'f2', name: 'Nina Patel', avatar: '👩🏾' },
  { id: 'f3', name: 'Chris Lee', avatar: '👨🏽' },
  { id: 'f4', name: 'Tom Anderson', avatar: '👨🏻' },
  { id: 'f5', name: 'Rachel Kim', avatar: '👩🏻' },
];

export function ManageGroupMembersScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMembers, setCurrentMembers] = useState(mockCurrentMembers);
  const [availableFriends, setAvailableFriends] = useState(mockAvailableFriends);

  const handleRemoveMember = (memberId: string) => {
    const member = currentMembers.find(m => m.id === memberId);
    if (member && member.role !== 'Admin') {
      setCurrentMembers(currentMembers.filter(m => m.id !== memberId));
      setAvailableFriends([...availableFriends, { id: member.id, name: member.name, avatar: member.avatar }]);
    }
  };

  const handleAddMember = (friendId: string) => {
    const friend = availableFriends.find(f => f.id === friendId);
    if (friend) {
      setAvailableFriends(availableFriends.filter(f => f.id !== friendId));
      setCurrentMembers([...currentMembers, { ...friend, role: 'Member' }]);
    }
  };

  const filteredAvailableFriends = availableFriends.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="font-semibold text-lg">Manage Members</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Current Members Section */}
        <div className="px-6 py-6 border-b border-gray-100">
          <h2 className="text-lg font-bold mb-4">Current Members ({currentMembers.length})</h2>
          
          <div className="space-y-2">
            {currentMembers.map((member) => (
              <div 
                key={member.id}
                className="bg-gray-50 rounded-xl p-3 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                  {member.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.role}</div>
                </div>
                {member.role !== 'Admin' && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add Members Section */}
        <div className="px-6 py-6">
          <h2 className="text-lg font-bold mb-4">Add More Members</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search friends"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#007AFF] focus:outline-none transition-all"
            />
          </div>

          {/* Available Friends */}
          {filteredAvailableFriends.length > 0 ? (
            <div className="space-y-2">
              {filteredAvailableFriends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => handleAddMember(friend.id)}
                  className="w-full bg-white border-2 border-gray-100 rounded-xl p-3 flex items-center gap-3 active:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                    {friend.avatar}
                  </div>
                  <div className="flex-1 text-left font-semibold">{friend.name}</div>
                  <UserPlus className="w-5 h-5 text-[#007AFF]" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchQuery ? 'No results found' : 'All friends are already in this group'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <button 
          onClick={() => navigate(-1)}
          className="w-full bg-[#007AFF] text-white py-4 rounded-xl font-semibold text-lg active:bg-[#0066CC] transition-colors shadow-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
}
