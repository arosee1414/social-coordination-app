import { Link } from 'react-router';
import { Plus, Clock, MapPin, Users as UsersIcon, Calendar, X } from 'lucide-react';
import { useState } from 'react';

const mockLiveHangouts = [
  {
    id: 'live-1',
    title: 'Board Game Night',
    time: 'Now',
    location: 'Alex\'s Place',
    attendeesPreview: ['👩🏻', '👨🏽', '👩🏼', '👨🏻', '👩🏽'],
    attendeeCount: 8,
  },
  {
    id: 'live-2',
    title: 'Late Night Coffee',
    time: 'Now',
    location: 'Blue Bottle',
    attendeesPreview: ['👨🏽', '👩🏼', '👨🏻'],
    attendeeCount: 3,
  },
];

const mockHangouts = [
  {
    id: '1',
    title: 'Drinks at The Rooftop',
    time: 'Tonight at 7:00 PM',
    date: 'Today',
    timeUntil: '4h 30m',
    location: 'The Rooftop Bar',
    group: 'Work Friends',
    creator: 'Sarah Chen',
    going: 5,
    maybe: 2,
    userStatus: 'going',
    attendeesPreview: ['👩🏻', '👨🏽', '👩🏼', '👨🏻', '👩🏽'],
  },
  {
    id: '2',
    title: 'Weekend brunch catch-up',
    time: 'Saturday at 11:00 AM',
    date: 'Sat, Feb 22',
    timeUntil: '2d',
    location: 'Maple Café',
    group: 'Roommates',
    creator: 'Mike Johnson',
    going: 3,
    maybe: 4,
    userStatus: 'maybe',
    attendeesPreview: ['👨🏽', '👩🏼', '👨🏻'],
  },
  {
    id: '3',
    title: 'Movie night',
    time: 'Friday at 8:00 PM',
    date: 'Fri, Feb 21',
    timeUntil: '1d 6h',
    location: null,
    group: 'Basketball Crew',
    creator: 'Emma Wilson',
    going: 4,
    maybe: 1,
    userStatus: null,
    attendeesPreview: ['👩🏼', '👨🏻', '👩🏾', '👨🏼'],
  },
];

const mockRecentActivity = [
  {
    id: 'activity-1',
    text: 'Alex went to Trivia Night',
    avatar: '👨🏽',
  },
  {
    id: 'activity-2',
    text: 'Dinner Crew met last night',
    avatar: '🍽️',
  },
  {
    id: 'activity-3',
    text: 'Sarah joined Basketball Crew',
    avatar: '👩🏻',
  },
  {
    id: 'activity-4',
    text: '5 people went to Brunch',
    avatar: '☕',
  },
];

export function HomeScreen() {
  const [isFabModalOpen, setIsFabModalOpen] = useState(false);
  const hasLiveHangouts = mockLiveHangouts.length > 0;

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 bg-white">
        <h1 className="text-3xl font-bold mb-1">Home</h1>
        <p className="text-gray-500">Stay connected with your friends</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Happening Now Section */}
        {hasLiveHangouts && (
          <div className="pt-6 pb-4">
            <h2 className="text-xl font-bold px-6 mb-4">Happening Now</h2>
            <div className="flex gap-3 overflow-x-auto px-6 scrollbar-hide">
              {mockLiveHangouts.map((hangout) => (
                <Link 
                  key={hangout.id} 
                  to={`/hangout/${hangout.id}`}
                  className="flex-shrink-0 w-[280px]"
                >
                  <div className="bg-gradient-to-br from-[#007AFF] to-[#0066CC] rounded-2xl p-4 shadow-lg active:scale-[0.98] transition-transform">
                    {/* LIVE Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-white text-xs font-bold">LIVE</span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-white font-bold text-lg mb-1">{hangout.title}</h3>
                    <div className="flex items-center gap-1.5 text-white/90 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      <span>{hangout.time}</span>
                    </div>
                    {hangout.location && (
                      <div className="flex items-center gap-1.5 text-white/90 text-sm mb-4">
                        <MapPin className="w-4 h-4" />
                        <span>{hangout.location}</span>
                      </div>
                    )}

                    {/* Attendees */}
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {hangout.attendeesPreview.slice(0, 4).map((avatar, index) => (
                          <div 
                            key={index}
                            className="w-8 h-8 bg-white border-2 border-[#007AFF] rounded-full flex items-center justify-center text-sm shadow-md"
                            style={{ zIndex: hangout.attendeesPreview.length - index }}
                          >
                            {avatar}
                          </div>
                        ))}
                        {hangout.attendeeCount > 4 && (
                          <div className="w-8 h-8 bg-white border-2 border-[#007AFF] rounded-full flex items-center justify-center text-xs font-bold text-[#007AFF]">
                            +{hangout.attendeeCount - 4}
                          </div>
                        )}
                      </div>

                      {/* Join Button */}
                      <button className="bg-white text-[#007AFF] px-5 py-2 rounded-full font-bold text-sm shadow-md active:scale-95 transition-transform">
                        Join
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reminder Banner */}
        <div className="px-6 pt-4 pb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="text-amber-900 text-sm font-semibold">RSVP closes in 2 hours</p>
              <p className="text-amber-700 text-xs">Drinks at The Rooftop</p>
            </div>
          </div>
        </div>

        {/* Upcoming Hangouts Section */}
        <div className="pt-2 pb-4">
          <div className="flex items-center justify-between px-6 mb-4">
            <h2 className="text-xl font-bold">Upcoming</h2>
            <Link to="/hangouts" className="text-[#007AFF] font-semibold text-sm active:opacity-70 transition-opacity">
              See All
            </Link>
          </div>
          
          <div className="space-y-3 px-6">
            {mockHangouts.slice(0, 3).map((hangout) => (
              <Link key={hangout.id} to={`/hangout/${hangout.id}`}>
                <div className="bg-white rounded-2xl p-4 shadow-sm active:shadow-md active:scale-[0.98] transition-all">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-3">
                      <h3 className="font-bold text-base mb-1.5">{hangout.title}</h3>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{hangout.time}</span>
                      </div>
                      {hangout.location && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{hangout.location}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Group pill */}
                    {hangout.group && (
                      <div className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                        {hangout.group}
                      </div>
                    )}
                  </div>

                  {/* Attendees and RSVP */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {hangout.attendeesPreview.slice(0, 3).map((avatar, index) => (
                        <div 
                          key={index}
                          className="w-7 h-7 bg-white border-2 border-white rounded-full flex items-center justify-center text-xs shadow-sm"
                          style={{ zIndex: hangout.attendeesPreview.length - index }}
                        >
                          {avatar}
                        </div>
                      ))}
                      {hangout.attendeesPreview.length > 3 && (
                        <div className="w-7 h-7 bg-gray-100 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">
                          +{hangout.attendeesPreview.length - 3}
                        </div>
                      )}
                    </div>

                    {/* RSVP Status or Buttons */}
                    {hangout.userStatus === 'going' ? (
                      <div className="bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                        ✓ Going
                      </div>
                    ) : hangout.userStatus === 'maybe' ? (
                      <div className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full text-xs font-bold">
                        Maybe
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button className="bg-[#007AFF] text-white px-4 py-1.5 rounded-full text-xs font-bold active:bg-[#0066CC] transition-colors">
                          Going
                        </button>
                        <button className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-xs font-bold active:bg-gray-200 transition-colors">
                          Maybe
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="pt-4 pb-6">
          <h2 className="text-xl font-bold px-6 mb-4">Recent Activity</h2>
          <div className="flex gap-3 overflow-x-auto px-6 scrollbar-hide">
            {mockRecentActivity.map((activity) => (
              <div 
                key={activity.id}
                className="flex-shrink-0 w-[200px] bg-white rounded-xl p-3.5 shadow-sm"
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 text-lg">
                    {activity.avatar}
                  </div>
                  <p className="text-sm text-gray-700 leading-snug pt-1">
                    {activity.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => setIsFabModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-[#007AFF] text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-30"
      >
        <Plus className="w-7 h-7" strokeWidth={2.5} />
      </button>

      {/* FAB Modal (Bottom Sheet) */}
      {isFabModalOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200"
            onClick={() => setIsFabModalOpen(false)}
          ></div>

          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 animate-in slide-in-from-bottom duration-300">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* Content */}
            <div className="px-6 pt-2 pb-8">
              <h3 className="text-xl font-bold mb-4">Create New</h3>
              
              <div className="space-y-2">
                {/* Create Hangout */}
                <Link 
                  to="/create-hangout"
                  onClick={() => setIsFabModalOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-xl active:bg-gray-50 transition-colors"
                >
                  <div className="w-11 h-11 bg-[#007AFF]/10 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-[#007AFF]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-base">Create Hangout</h4>
                    <p className="text-sm text-gray-500">Plan a new event with friends</p>
                  </div>
                </Link>

                {/* Invite Group */}
                <Link 
                  to="/groups"
                  onClick={() => setIsFabModalOpen(false)}
                  className="flex items-center gap-4 p-4 rounded-xl active:bg-gray-50 transition-colors"
                >
                  <div className="w-11 h-11 bg-[#007AFF]/10 rounded-full flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-[#007AFF]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-base">Invite Group</h4>
                    <p className="text-sm text-gray-500">Quick invite from saved groups</p>
                  </div>
                </Link>

                {/* Cancel */}
                <button 
                  onClick={() => setIsFabModalOpen(false)}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-xl active:bg-gray-50 transition-colors mt-2"
                >
                  <X className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold text-gray-700">Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}