import { Link } from 'react-router';
import { Plus, Clock, MapPin, Calendar, SlidersHorizontal, X } from 'lucide-react';
import { useState } from 'react';

const mockHangouts = [
  {
    id: '1',
    title: 'Coffee at Blue Bottle',
    time: 'Started 25 mins ago',
    timeUntil: null,
    location: 'Blue Bottle Coffee, SOMA',
    going: 4,
    maybe: 2,
    userStatus: 'going',
    isLive: true,
    isPast: false,
  },
  {
    id: '2',
    title: 'Drinks at The Rooftop',
    time: 'Tonight at 7:00 PM',
    timeUntil: '4h 30m',
    location: 'The Rooftop Bar',
    going: 5,
    maybe: 2,
    userStatus: 'going',
    isLive: false,
    isPast: false,
  },
  {
    id: '3',
    title: 'Weekend brunch catch-up',
    time: 'Saturday at 11:00 AM',
    timeUntil: '2d',
    location: 'Maple Café',
    going: 3,
    maybe: 4,
    userStatus: 'maybe',
    isLive: false,
    isPast: false,
  },
  {
    id: '4',
    title: 'Movie night',
    time: 'Friday at 8:00 PM',
    timeUntil: '1d 6h',
    location: null,
    going: 4,
    maybe: 1,
    userStatus: null,
    isLive: false,
    isPast: false,
  },
  {
    id: '5',
    title: 'Sunday Pickup Basketball',
    time: 'Sunday at 10:00 AM',
    timeUntil: '3d',
    location: 'Lincoln Park',
    going: 8,
    maybe: 3,
    userStatus: null,
    isLive: false,
    isPast: false,
  },
  {
    id: '6',
    title: 'Game Night at Alex\'s',
    time: 'Last Friday at 8:00 PM',
    timeUntil: null,
    location: 'Alex\'s Apartment',
    attended: 7,
    userStatus: 'went',
    isLive: false,
    isPast: true,
  },
  {
    id: '7',
    title: 'Brunch at Tartine',
    time: 'Feb 15 at 11:00 AM',
    timeUntil: null,
    location: 'Tartine Bakery',
    attended: 5,
    userStatus: 'went',
    isLive: false,
    isPast: true,
  },
  {
    id: '8',
    title: 'Beach Volleyball',
    time: 'Feb 10 at 3:00 PM',
    timeUntil: null,
    location: 'Ocean Beach',
    attended: 9,
    userStatus: null,
    isLive: false,
    isPast: true,
  },
];

export function HangoutsListScreen() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Filter states
  const [filterRole, setFilterRole] = useState<'all' | 'hosting' | 'invited' | 'going'>('all');
  const [filterRSVP, setFilterRSVP] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<'all' | 'month' | '3months'>('all');
  
  // Mock groups
  const userGroups = ['Arlington Crew', 'Gym Friends', 'College Friends'];
  
  const upcomingHangouts = mockHangouts.filter(h => !h.isPast);
  const pastHangouts = mockHangouts.filter(h => h.isPast);
  const displayedHangouts = activeTab === 'upcoming' ? upcomingHangouts : pastHangouts;

  const clearAllFilters = () => {
    setFilterRole('all');
    setFilterRSVP('all');
    setFilterGroup('all');
    setFilterDate('all');
  };

  const applyFilters = () => {
    setShowFilterModal(false);
    // Filters would be applied here in real implementation
  };

  const hasActiveFilters = filterRole !== 'all' || filterRSVP !== 'all' || filterGroup !== 'all' || filterDate !== 'all';

  return (
    <div className="flex flex-col h-screen bg-white pb-20">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Hangouts</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilterModal(true)}
              className="p-2 relative text-gray-700 active:bg-gray-100 rounded-full transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {hasActiveFilters && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-[#007AFF] rounded-full"></div>
              )}
            </button>
            <Link 
              to="/create-hangout"
              className="p-2 bg-[#007AFF] text-white rounded-full active:bg-[#0066CC] transition-colors"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <p className="text-gray-500">All your planned hangouts</p>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4">
        <div className="bg-gray-100 p-1 rounded-xl flex gap-1">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'upcoming'
                ? 'bg-white text-[#007AFF] shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'past'
                ? 'bg-white text-[#007AFF] shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {displayedHangouts.length > 0 ? (
          <div className="px-6 pb-6">
            <div className="space-y-3">
              {displayedHangouts.map((hangout) => (
                <Link key={hangout.id} to={`/hangout/${hangout.id}`}>
                  {hangout.isLive ? (
                    // Live Hangout Card
                    <div className="bg-gradient-to-br from-[#007AFF] to-[#0066CC] rounded-2xl p-4 shadow-lg active:shadow-md active:scale-[0.98] transition-all mb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-lg mb-1">{hangout.title}</h3>
                          <div className="flex items-center gap-1.5 text-sm text-white/90 mb-1">
                            <Clock className="w-4 h-4" />
                            <span>{hangout.time}</span>
                          </div>
                          {hangout.location && (
                            <div className="flex items-center gap-1.5 text-sm text-white/90">
                              <MapPin className="w-4 h-4" />
                              <span>{hangout.location}</span>
                            </div>
                          )}
                        </div>
                        {/* LIVE Badge */}
                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full h-fit">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-white text-xs font-bold">LIVE</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 pt-3 border-t border-white/20">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm font-medium text-white">{hangout.going} going</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                          <span className="text-sm font-medium text-white">{hangout.maybe} maybe</span>
                        </div>
                        {hangout.userStatus === 'going' && (
                          <div className="ml-auto text-xs bg-white text-[#007AFF] px-3 py-1.5 rounded-full font-bold">
                            You're going ✓
                          </div>
                        )}
                        {hangout.userStatus === 'maybe' && (
                          <div className="ml-auto text-xs bg-white text-[#007AFF] px-3 py-1.5 rounded-full font-bold">
                            Maybe
                          </div>
                        )}
                      </div>
                    </div>
                  ) : hangout.isPast ? (
                    // Past Hangout Card
                    <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-sm active:shadow-md active:scale-[0.98] transition-all mb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{hangout.title}</h3>
                          <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1">
                            <Clock className="w-4 h-4" />
                            <span>{hangout.time}</span>
                          </div>
                          {hangout.location && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                              <MapPin className="w-4 h-4" />
                              <span>{hangout.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="text-sm font-medium text-gray-600">{hangout.attended} went</span>
                        </div>
                        {hangout.userStatus === 'went' && (
                          <div className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-semibold">
                            You went
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Regular Upcoming Hangout Card
                    <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-sm active:shadow-md active:scale-[0.98] transition-all mb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{hangout.title}</h3>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                            <Clock className="w-4 h-4" />
                            <span>{hangout.time}</span>
                          </div>
                          {hangout.location && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{hangout.location}</span>
                            </div>
                          )}
                        </div>
                        {hangout.timeUntil && (
                          <div className="bg-[#007AFF]/10 text-[#007AFF] px-3 py-1.5 rounded-full text-xs font-semibold">
                            {hangout.timeUntil}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium">{hangout.going} going</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-sm font-medium">{hangout.maybe} maybe</span>
                        </div>
                        {hangout.userStatus === 'going' && (
                          <div className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                            You're going ✓
                          </div>
                        )}
                        {hangout.userStatus === 'maybe' && (
                          <div className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">
                            Maybe
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">
              {activeTab === 'upcoming' ? 'No Upcoming Hangouts' : 'No Past Hangouts'}
            </h3>
            <p className="text-gray-500 mb-8 max-w-[280px]">
              {activeTab === 'upcoming' 
                ? 'Create your first hangout and invite friends or groups'
                : 'Your past hangouts will appear here'
              }
            </p>
            {activeTab === 'upcoming' && (
              <Link 
                to="/create-hangout"
                className="bg-[#007AFF] text-white px-8 py-4 rounded-xl font-semibold text-lg active:bg-[#0066CC] transition-colors"
              >
                Create Hangout
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setShowFilterModal(false)}
          ></div>
          
          {/* Bottom Sheet */}
          <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
            <div className="bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold">Filter Hangouts</h2>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                {/* Role Section */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Role</h3>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'hosting', 'invited', 'going'] as const).map((role) => (
                      <button
                        key={role}
                        onClick={() => setFilterRole(role)}
                        className={`px-4 py-2 rounded-full font-medium transition-all ${
                          filterRole === role
                            ? 'bg-[#007AFF] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                        }`}
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* RSVP Status Section */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">RSVP Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {(['all', 'pending', 'accepted', 'declined'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setFilterRSVP(status)}
                        className={`px-4 py-2 rounded-full font-medium transition-all ${
                          filterRSVP === status
                            ? 'bg-[#007AFF] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Group Section */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Group</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilterGroup('all')}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        filterGroup === 'all'
                          ? 'bg-[#007AFF] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    {userGroups.map((group) => (
                      <button
                        key={group}
                        onClick={() => setFilterGroup(group)}
                        className={`px-4 py-2 rounded-full font-medium transition-all ${
                          filterGroup === group
                            ? 'bg-[#007AFF] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                        }`}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Section (Past tab only) */}
                {activeTab === 'past' && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Date</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setFilterDate('all')}
                        className={`px-4 py-2 rounded-full font-medium transition-all ${
                          filterDate === 'all'
                            ? 'bg-[#007AFF] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                        }`}
                      >
                        All Time
                      </button>
                      <button
                        onClick={() => setFilterDate('month')}
                        className={`px-4 py-2 rounded-full font-medium transition-all ${
                          filterDate === 'month'
                            ? 'bg-[#007AFF] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                        }`}
                      >
                        This Month
                      </button>
                      <button
                        onClick={() => setFilterDate('3months')}
                        className={`px-4 py-2 rounded-full font-medium transition-all ${
                          filterDate === '3months'
                            ? 'bg-[#007AFF] text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                        }`}
                      >
                        Last 3 Months
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold active:bg-gray-200 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={applyFilters}
                  className="flex-1 py-3 px-4 bg-[#007AFF] text-white rounded-xl font-semibold active:bg-[#0066CC] transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}