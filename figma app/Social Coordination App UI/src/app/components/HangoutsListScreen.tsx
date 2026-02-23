import { Link } from 'react-router';
import { Plus, Clock, MapPin, Calendar } from 'lucide-react';

const mockHangouts = [
  {
    id: '1',
    title: 'Drinks at The Rooftop',
    time: 'Tonight at 7:00 PM',
    timeUntil: '4h 30m',
    location: 'The Rooftop Bar',
    going: 5,
    maybe: 2,
    userStatus: 'going',
  },
  {
    id: '2',
    title: 'Weekend brunch catch-up',
    time: 'Saturday at 11:00 AM',
    timeUntil: '2d',
    location: 'Maple Café',
    going: 3,
    maybe: 4,
    userStatus: 'maybe',
  },
  {
    id: '3',
    title: 'Movie night',
    time: 'Friday at 8:00 PM',
    timeUntil: '1d 6h',
    location: null,
    going: 4,
    maybe: 1,
    userStatus: null,
  },
];

export function HangoutsListScreen() {
  return (
    <div className="flex flex-col h-screen bg-white pb-20">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Hangouts</h1>
          <Link 
            to="/create-hangout"
            className="p-2 bg-[#007AFF] text-white rounded-full active:bg-[#0066CC] transition-colors"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </div>
        <p className="text-gray-500">All your planned hangouts</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {mockHangouts.length > 0 ? (
          <div className="px-6 py-6">
            <div className="space-y-3">
              {mockHangouts.map((hangout) => (
                <Link key={hangout.id} to={`/hangout/${hangout.id}`}>
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
                      <div className="bg-[#007AFF]/10 text-[#007AFF] px-3 py-1.5 rounded-full text-xs font-semibold">
                        {hangout.timeUntil}
                      </div>
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
            <h3 className="text-xl font-bold mb-2">No Hangouts Yet</h3>
            <p className="text-gray-500 mb-8 max-w-[280px]">
              Create your first hangout and invite friends or groups
            </p>
            <Link 
              to="/create-hangout"
              className="bg-[#007AFF] text-white px-8 py-4 rounded-xl font-semibold text-lg active:bg-[#0066CC] transition-colors"
            >
              Create Hangout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}