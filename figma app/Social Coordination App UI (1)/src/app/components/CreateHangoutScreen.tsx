import { useNavigate } from 'react-router';
import { ArrowLeft, Clock, MapPin, Users as UsersIcon } from 'lucide-react';
import { useState } from 'react';

export function CreateHangoutScreen() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');

  const handleContinue = () => {
    // Navigate to invite selection screen
    navigate('/create-hangout/invite');
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
        <h1 className="font-semibold text-lg">Create Hangout</h1>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Hangout Title *
            </label>
            <input 
              type="text" 
              placeholder="e.g., Drinks at The Rooftop"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#007AFF] focus:outline-none transition-colors"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date *
              </label>
              <div className="relative">
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#007AFF] focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Time *
              </label>
              <div className="relative">
                <input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#007AFF] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Duration (Optional)
            </label>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <select 
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="flex-1 px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#007AFF] focus:outline-none transition-colors bg-white"
              >
                <option value="">No set duration</option>
                <option value="1">1 hour</option>
                <option value="1.5">1.5 hours</option>
                <option value="2">2 hours</option>
                <option value="2.5">2.5 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
                <option value="5">5+ hours</option>
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-2 ml-8">
              If not set, the hangout will use a default expiration
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location (Optional)
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Add a location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#007AFF] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Note (Optional)
            </label>
            <textarea 
              placeholder="Add any details for your friends..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#007AFF] focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Info Card */}
          <div className="bg-[#007AFF]/5 border-2 border-[#007AFF]/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <UsersIcon className="w-5 h-5 text-[#007AFF] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Next: Invite friends</h4>
                <p className="text-sm text-gray-600">
                  You'll be able to invite individual friends or entire groups on the next screen
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <button 
          onClick={handleContinue}
          disabled={!title || !date || !time}
          className="w-full bg-[#007AFF] text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed active:bg-[#0066CC] transition-colors"
        >
          Continue to Invite
        </button>
      </div>
    </div>
  );
}