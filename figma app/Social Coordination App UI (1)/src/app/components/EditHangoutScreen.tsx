import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Clock, MapPin, Users as UsersIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function EditHangoutScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Mock initial data - in real app, fetch from hangout ID
  const [title, setTitle] = useState('Drinks at The Rooftop');
  const [date, setDate] = useState('2026-02-24');
  const [time, setTime] = useState('19:00');
  const [duration, setDuration] = useState('2');
  const [location, setLocation] = useState('The Rooftop Bar');
  const [note, setNote] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveChanges = () => {
    // Save changes and navigate back to hangout detail
    navigate(`/hangout/${id}`);
  };

  const handleManageInvites = () => {
    // Navigate to manage invites screen
    navigate(`/hangout/${id}/manage-invites`);
  };

  const handleDeleteHangout = () => {
    // Delete hangout and navigate to home
    navigate('/');
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
        <h1 className="font-semibold text-lg">Edit Hangout</h1>
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

          {/* Manage Invites Button */}
          <button
            onClick={handleManageInvites}
            className="w-full bg-[#007AFF]/10 border-2 border-[#007AFF]/20 text-[#007AFF] py-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-[#007AFF]/20 transition-colors"
          >
            <UsersIcon className="w-5 h-5" />
            Manage Invites
          </button>

          {/* Delete Hangout */}
          <div className="pt-6 border-t border-gray-100">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-50 text-red-600 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-red-100 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Delete Hangout
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              This will cancel the hangout for all invited friends
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <button 
          onClick={handleSaveChanges}
          disabled={!title || !date || !time}
          className="w-full bg-[#007AFF] text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed active:bg-[#0066CC] transition-colors shadow-sm"
        >
          Save Changes
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setShowDeleteConfirm(false)}
          ></div>
          
          {/* Modal */}
          <div className="fixed inset-x-0 bottom-0 z-50 animate-slide-up">
            <div className="bg-white rounded-t-3xl shadow-2xl p-6">
              <h2 className="text-xl font-bold mb-2">Delete this hangout?</h2>
              <p className="text-gray-600 mb-6">
                This will permanently delete the hangout and notify all invited friends that it's been cancelled. This action cannot be undone.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleDeleteHangout}
                  className="w-full bg-red-500 text-white py-4 rounded-xl font-semibold active:bg-red-600 transition-colors"
                >
                  Yes, Delete Hangout
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold active:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
