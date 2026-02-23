import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Users as UsersIcon, Calendar, Clock, MapPin, MoreVertical, UserMinus } from 'lucide-react';
import { useState } from 'react';

const mockFriendProfiles: Record<string, {
  name: string;
  avatar: string;
  friendsSince: string;
  mutualGroups: number;
  mutualFriends: number;
  bio?: string;
  hangoutsTogether: number;
  lastHangout: string;
}> = {
  'sarah': {
    name: 'Sarah Chen',
    avatar: '👩🏻',
    friendsSince: 'Jan 2024',
    mutualGroups: 3,
    mutualFriends: 8,
    bio: 'Coffee enthusiast ☕ Always down for spontaneous adventures',
    hangoutsTogether: 12,
    lastHangout: '2 days ago'
  },
  'mike': {
    name: 'Mike Johnson',
    avatar: '👨🏽',
    friendsSince: 'Mar 2023',
    mutualGroups: 2,
    mutualFriends: 5,
    bio: 'Basketball and good vibes 🏀',
    hangoutsTogether: 18,
    lastHangout: '1 week ago'
  },
  'emma': {
    name: 'Emma Wilson',
    avatar: '👩🏼',
    friendsSince: 'Sep 2023',
    mutualGroups: 4,
    mutualFriends: 12,
    bio: 'Movie buff 🎬 Board game champion',
    hangoutsTogether: 15,
    lastHangout: '3 days ago'
  },
  'alex': {
    name: 'Alex Turner',
    avatar: '👨🏼',
    friendsSince: 'Dec 2023',
    mutualGroups: 2,
    mutualFriends: 6,
    hangoutsTogether: 8,
    lastHangout: '1 week ago'
  }
};

const mockGroupsInCommon = [
  {
    id: 'g1',
    name: 'Work Friends',
    icon: '💼',
    memberCount: 8
  },
  {
    id: 'g2',
    name: 'Basketball Crew',
    icon: '🏀',
    memberCount: 12
  },
  {
    id: 'g3',
    name: 'Close Friends',
    icon: '💜',
    memberCount: 5
  },
  {
    id: 'g4',
    name: 'Dinner Club',
    icon: '🍽️',
    memberCount: 6
  }
];

const mockUpcomingHangouts = [
  {
    id: '1',
    title: 'Coffee at Blue Bottle',
    time: '2:00 PM',
    date: 'Today',
    groupName: 'Work Friends'
  },
  {
    id: '2',
    title: 'Pickup Basketball',
    time: '6:00 PM',
    date: 'Tomorrow',
    groupName: 'Basketball Crew'
  },
  {
    id: '3',
    title: 'Game Night',
    time: '8:00 PM',
    date: 'Saturday',
    groupName: 'Close Friends'
  }
];

const mockRecentActivity = [
  {
    id: '1',
    text: 'Attended Trivia Night',
    time: '2 days ago',
    icon: '🎯'
  },
  {
    id: '2',
    text: 'Joined Basketball Crew',
    time: '1 week ago',
    icon: '🏀'
  },
  {
    id: '3',
    text: 'Went to Brunch Club',
    time: '1 week ago',
    icon: '☕'
  },
  {
    id: '4',
    text: 'Attended Movie Night',
    time: '2 weeks ago',
    icon: '🎬'
  }
];

export function FriendProfileScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const friend = mockFriendProfiles[id || 'sarah'] || mockFriendProfiles['sarah'];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between bg-white border-b border-gray-100">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 active:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setShowRemoveModal(true)}
          className="p-2 -mr-2 active:bg-gray-100 rounded-full transition-colors"
        >
          <MoreVertical className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-8">
        {/* Profile Header */}
        <div className="bg-white px-6 pt-8 pb-6 text-center">
          <div className="w-28 h-28 bg-gradient-to-br from-[#007AFF]/10 to-[#007AFF]/5 rounded-full flex items-center justify-center text-6xl mx-auto mb-4 shadow-md">
            {friend.avatar}
          </div>
          <h1 className="text-2xl font-bold mb-1">{friend.name}</h1>
          <p className="text-gray-500 text-sm mb-2">Friends since {friend.friendsSince}</p>
          <div className="inline-flex items-center gap-1.5 bg-[#007AFF]/10 text-[#007AFF] px-3 py-1.5 rounded-full text-xs font-semibold">
            <UsersIcon className="w-3.5 h-3.5" />
            {friend.mutualFriends} mutual friends
          </div>
          {friend.bio && (
            <p className="text-gray-600 text-sm mt-4 leading-relaxed">{friend.bio}</p>
          )}
        </div>

        {/* Social Stats */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-[#007AFF] mb-1">{friend.hangoutsTogether}</div>
              <div className="text-xs text-gray-500 leading-tight">Hangouts<br/>Together</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-[#007AFF] mb-1">{friend.mutualFriends}</div>
              <div className="text-xs text-gray-500 leading-tight">Mutual<br/>Friends</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <div className="text-2xl font-bold text-[#007AFF] mb-1">{friend.lastHangout}</div>
              <div className="text-xs text-gray-500 leading-tight">Last<br/>Hangout</div>
            </div>
          </div>
        </div>

        {/* Groups in Common */}
        <div className="py-4">
          <h2 className="text-lg font-bold px-6 mb-3">Groups in Common</h2>
          <div className="flex gap-3 overflow-x-auto px-6 scrollbar-hide">
            {mockGroupsInCommon.slice(0, friend.mutualGroups).map((group) => (
              <div 
                key={group.id}
                className="flex-shrink-0 w-[140px] bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#007AFF]/10 to-[#007AFF]/5 rounded-full flex items-center justify-center text-2xl mx-auto mb-3 shadow-sm">
                  {group.icon}
                </div>
                <h3 className="font-semibold text-sm text-center mb-1 line-clamp-2">{group.name}</h3>
                <p className="text-xs text-gray-500 text-center">{group.memberCount} members</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Hangouts */}
        <div className="py-4">
          <h2 className="text-lg font-bold px-6 mb-3">Upcoming Hangouts</h2>
          <div className="px-6 space-y-3">
            {mockUpcomingHangouts.map((hangout) => (
              <div 
                key={hangout.id}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-base flex-1">{hangout.title}</h3>
                  <span className="bg-[#007AFF]/10 text-[#007AFF] px-2.5 py-1 rounded-full text-xs font-semibold">
                    {hangout.date}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{hangout.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UsersIcon className="w-3.5 h-3.5" />
                    <span>{hangout.groupName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="py-4">
          <h2 className="text-lg font-bold px-6 mb-3">Recent Activity</h2>
          <div className="px-6 space-y-2">
            {mockRecentActivity.map((activity) => (
              <div 
                key={activity.id}
                className="bg-white rounded-xl p-3.5 shadow-sm flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Menu Modal */}
      {showRemoveModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
            onClick={() => setShowRemoveModal(false)}
          />
          
          {/* Modal */}
          <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white rounded-t-3xl z-50 animate-in slide-in-from-bottom duration-300">
            <div className="p-6">
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
              
              <button
                onClick={() => {
                  // Handle invite to hangout action
                  setShowRemoveModal(false);
                }}
                className="w-full flex items-center justify-center gap-3 py-4 text-gray-800 font-semibold active:bg-gray-50 rounded-xl transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Invite to Hangout
              </button>

              <button
                onClick={() => {
                  // Handle invite to group action
                  setShowRemoveModal(false);
                }}
                className="w-full flex items-center justify-center gap-3 py-4 text-gray-800 font-semibold active:bg-gray-50 rounded-xl transition-colors"
              >
                <UsersIcon className="w-5 h-5" />
                Invite to Group
              </button>

              <div className="w-full h-px bg-gray-200 my-2" />

              <button
                onClick={() => {
                  // Handle remove friend action
                  setShowRemoveModal(false);
                }}
                className="w-full flex items-center justify-center gap-3 py-4 text-red-600 font-semibold active:bg-gray-50 rounded-xl transition-colors"
              >
                <UserMinus className="w-5 h-5" />
                Remove Friend
              </button>

              <button
                onClick={() => setShowRemoveModal(false)}
                className="w-full mt-2 py-4 text-gray-600 font-semibold active:bg-gray-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}