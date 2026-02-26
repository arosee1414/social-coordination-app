import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Search, Users as UsersIcon, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

const mockInvitedGroups = [
  { 
    id: 'g1', 
    name: 'Close Friends', 
    icon: '💜', 
    memberCount: 5,
  },
];

const mockInvitedFriends = [
  { id: 'f1', name: 'David Kim', avatar: '👨🏻' },
  { id: 'f2', name: 'Lisa Martinez', avatar: '👩🏽' },
];

const mockAvailableGroups = [
  { id: 'g2', name: 'Arlington Crew', icon: '🏡', memberCount: 8 },
  { id: 'g3', name: 'Gym Friends', icon: '💪', memberCount: 6 },
];

const mockAvailableFriends = [
  { id: 'f3', name: 'Alex Johnson', avatar: '👨🏼' },
  { id: 'f4', name: 'Sarah Wilson', avatar: '👩🏻' },
  { id: 'f5', name: 'Chris Lee', avatar: '👨🏽' },
  { id: 'f6', name: 'Emma Davis', avatar: '👩🏾' },
];

export function ManageInvitesScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [invitedGroups, setInvitedGroups] = useState(mockInvitedGroups);
  const [invitedFriends, setInvitedFriends] = useState(mockInvitedFriends);
  const [availableGroups, setAvailableGroups] = useState(mockAvailableGroups);
  const [availableFriends, setAvailableFriends] = useState(mockAvailableFriends);

  const handleRemoveGroup = (groupId: string) => {
    const group = invitedGroups.find(g => g.id === groupId);
    if (group) {
      setInvitedGroups(invitedGroups.filter(g => g.id !== groupId));
      setAvailableGroups([...availableGroups, group]);
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    const friend = invitedFriends.find(f => f.id === friendId);
    if (friend) {
      setInvitedFriends(invitedFriends.filter(f => f.id !== friendId));
      setAvailableFriends([...availableFriends, friend]);
    }
  };

  const handleAddGroup = (groupId: string) => {
    const group = availableGroups.find(g => g.id === groupId);
    if (group) {
      setAvailableGroups(availableGroups.filter(g => g.id !== groupId));
      setInvitedGroups([...invitedGroups, group]);
    }
  };

  const handleAddFriend = (friendId: string) => {
    const friend = availableFriends.find(f => f.id === friendId);
    if (friend) {
      setAvailableFriends(availableFriends.filter(f => f.id !== friendId));
      setInvitedFriends([...invitedFriends, friend]);
    }
  };

  const filteredAvailableGroups = availableGroups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <h1 className="font-semibold text-lg">Manage Invites</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Currently Invited Section */}
        <div className="px-6 py-6 border-b border-gray-100">
          <h2 className="text-lg font-bold mb-4">Currently Invited</h2>
          
          {/* Invited Groups */}
          {invitedGroups.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Groups</h3>
              <div className="space-y-2">
                {invitedGroups.map((group) => (
                  <div 
                    key={group.id}
                    className="bg-gradient-to-br from-[#007AFF]/5 to-[#007AFF]/10 rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                      {group.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">{group.name}</div>
                      <div className="text-sm text-gray-600">{group.memberCount} members</div>
                    </div>
                    <button
                      onClick={() => handleRemoveGroup(group.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invited Friends */}
          {invitedFriends.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Individual Friends</h3>
              <div className="space-y-2">
                {invitedFriends.map((friend) => (
                  <div 
                    key={friend.id}
                    className="bg-gray-50 rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                      {friend.avatar}
                    </div>
                    <div className="flex-1 font-semibold">{friend.name}</div>
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {invitedGroups.length === 0 && invitedFriends.length === 0 && (
            <div className="text-center py-8">
              <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No one invited yet</p>
            </div>
          )}
        </div>

        {/* Add More Section */}
        <div className="px-6 py-6">
          <h2 className="text-lg font-bold mb-4">Add More People</h2>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search groups or friends"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#007AFF] focus:outline-none transition-all"
            />
          </div>

          {/* Available Groups */}
          {filteredAvailableGroups.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Groups</h3>
              <div className="space-y-2">
                {filteredAvailableGroups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleAddGroup(group.id)}
                    className="w-full bg-white border-2 border-gray-100 rounded-xl p-3 flex items-center gap-3 active:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                      {group.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{group.name}</div>
                      <div className="text-sm text-gray-600">{group.memberCount} members</div>
                    </div>
                    <UserPlus className="w-5 h-5 text-[#007AFF]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Available Friends */}
          {filteredAvailableFriends.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">Friends</h3>
              <div className="space-y-2">
                {filteredAvailableFriends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => handleAddFriend(friend.id)}
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
            </div>
          )}

          {filteredAvailableGroups.length === 0 && filteredAvailableFriends.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No results found</p>
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
