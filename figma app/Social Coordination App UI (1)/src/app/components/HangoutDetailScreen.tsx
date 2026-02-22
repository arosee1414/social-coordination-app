import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Clock, MapPin, Share2, MoreVertical, MessageCircle, Users as UsersIcon } from 'lucide-react';
import { useState } from 'react';

type RSVPStatus = 'going' | 'maybe' | 'not-going' | null;

const mockInvitedGroups = [
  { 
    id: 'g1', 
    name: 'Close Friends', 
    icon: '💜', 
    memberCount: 5,
    membersPreview: ['👩🏻', '👨🏽', '👩🏼']
  },
];

const mockInvitedFriends = [
  { name: 'David Kim', avatar: '👨🏻' },
  { name: 'Lisa Martinez', avatar: '👩🏽' },
];

const mockAttendees = {
  going: [
    { name: 'Sarah Chen', avatar: '👩🏻', time: 'RSVP 2h ago', fromGroup: 'Close Friends' },
    { name: 'Mike Johnson', avatar: '👨🏽', time: 'RSVP 1h ago', fromGroup: 'Close Friends' },
    { name: 'Emma Wilson', avatar: '👩🏼', time: 'RSVP 45m ago', fromGroup: 'Close Friends' },
    { name: 'David Kim', avatar: '👨🏻', time: 'RSVP 30m ago', fromGroup: null },
    { name: 'Lisa Martinez', avatar: '👩🏽', time: 'RSVP 15m ago', fromGroup: null },
  ],
  maybe: [
    { name: 'Alex Turner', avatar: '👨🏼', time: 'RSVP 1h ago', fromGroup: 'Close Friends' },
    { name: 'Nina Patel', avatar: '👩🏾', time: 'RSVP 20m ago', fromGroup: 'Close Friends' },
  ],
  notGoing: [
    { name: 'Tom Anderson', avatar: '👨🏻', time: 'RSVP 3h ago', fromGroup: null },
  ],
};

export function HangoutDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [userRSVP, setUserRSVP] = useState<RSVPStatus>('going');

  const handleRSVP = (status: RSVPStatus) => {
    setUserRSVP(status);
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
        <div className="flex items-center gap-2">
          <button className="p-2 active:bg-gray-100 rounded-full transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2 active:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Hangout Header */}
        <div className="px-6 py-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold mb-4">Drinks at The Rooftop</h1>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-semibold">Tonight at 7:00 PM</div>
                <div className="text-sm text-gray-500">In 4h 30m</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-semibold">The Rooftop Bar</div>
                <div className="text-sm text-gray-500">123 Main St, Downtown</div>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="bg-gradient-to-br from-[#007AFF] to-[#3B82F6] rounded-2xl p-5 text-white shadow-lg">
            <div className="text-center">
              <div className="text-sm opacity-90 mb-2">Hangout starting in</div>
              <div className="text-4xl font-bold mb-1">4:30:22</div>
              <div className="text-sm opacity-75">Hours : Minutes : Seconds</div>
            </div>
          </div>
        </div>

        {/* RSVP Buttons */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={() => handleRSVP('going')}
              className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${
                userRSVP === 'going'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-green-50 text-green-700 active:bg-green-100'
              }`}
            >
              Going ✓
            </button>
            <button
              onClick={() => handleRSVP('maybe')}
              className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${
                userRSVP === 'maybe'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-yellow-50 text-yellow-700 active:bg-yellow-100'
              }`}
            >
              Maybe
            </button>
            <button
              onClick={() => handleRSVP('not-going')}
              className={`flex-1 py-3.5 rounded-xl font-semibold transition-all ${
                userRSVP === 'not-going'
                  ? 'bg-gray-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 active:bg-gray-200'
              }`}
            >
              Can't Go
            </button>
          </div>
        </div>

        {/* Invited Groups */}
        {mockInvitedGroups.length > 0 && (
          <div className="px-6 py-6 border-b border-gray-100">
            <h3 className="text-lg font-bold mb-3">Invited Groups</h3>
            <div className="space-y-2">
              {mockInvitedGroups.map((group) => (
                <div key={group.id} className="bg-gradient-to-br from-[#007AFF]/5 to-[#007AFF]/10 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
                      {group.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{group.name}</div>
                      <div className="text-sm text-gray-600">{group.memberCount} members invited</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#007AFF]/10">
                    <div className="flex -space-x-2">
                      {group.membersPreview.map((avatar, index) => (
                        <div 
                          key={index}
                          className="w-8 h-8 bg-white border-2 border-white rounded-full flex items-center justify-center text-sm shadow-sm"
                        >
                          {avatar}
                        </div>
                      ))}
                      {group.memberCount > group.membersPreview.length && (
                        <div className="w-8 h-8 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center text-xs font-semibold text-gray-600">
                          +{group.memberCount - group.membersPreview.length}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Invited Individual Friends */}
        {mockInvitedFriends.length > 0 && (
          <div className="px-6 py-6 border-b border-gray-100">
            <h3 className="text-lg font-bold mb-3">Also Invited</h3>
            <div className="flex flex-wrap gap-2">
              {mockInvitedFriends.map((friend, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-full pl-1 pr-3 py-1">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm shadow-sm">
                    {friend.avatar}
                  </div>
                  <span className="text-sm font-medium">{friend.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RSVPs Section */}
        <div className="px-6 py-6">
          {/* Going */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Going ({mockAttendees.going.length})
            </h3>
            <div className="space-y-2">
              {mockAttendees.going.map((person, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                    {person.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{person.name}</div>
                    <div className="text-sm text-gray-500">
                      {person.time}
                      {person.fromGroup && <span className="text-[#007AFF]"> · from {person.fromGroup}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Maybe */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              Maybe ({mockAttendees.maybe.length})
            </h3>
            <div className="space-y-2">
              {mockAttendees.maybe.map((person, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                    {person.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{person.name}</div>
                    <div className="text-sm text-gray-500">
                      {person.time}
                      {person.fromGroup && <span className="text-[#007AFF]"> · from {person.fromGroup}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Not Going */}
          <div>
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-500">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              Can't Go ({mockAttendees.notGoing.length})
            </h3>
            <div className="space-y-2">
              {mockAttendees.notGoing.map((person, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl opacity-60">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                    {person.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{person.name}</div>
                    <div className="text-sm text-gray-500">{person.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Message Button */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <button className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-gray-200 transition-colors">
          <MessageCircle className="w-5 h-5" />
          Message Group
        </button>
      </div>
    </div>
  );
}
