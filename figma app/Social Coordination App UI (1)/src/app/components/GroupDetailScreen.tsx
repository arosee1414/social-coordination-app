import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Settings, UserPlus, Calendar } from 'lucide-react';

const mockMembers = [
  { name: 'Sarah Chen', avatar: '👩🏻', role: 'Admin' },
  { name: 'Mike Johnson', avatar: '👨🏽', role: 'Member' },
  { name: 'Emma Wilson', avatar: '👩🏼', role: 'Member' },
  { name: 'David Kim', avatar: '👨🏻', role: 'Member' },
  { name: 'Lisa Martinez', avatar: '👩🏽', role: 'Member' },
];

export function GroupDetailScreen() {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleInviteToHangout = () => {
    // In a real app, this would pre-select this group in the create hangout flow
    navigate('/create-hangout');
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
        <button className="p-2 active:bg-gray-100 rounded-full transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Group Header */}
        <div className="px-6 py-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-start gap-4 mb-6">
            <div className="text-5xl">💜</div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">Close Friends</h1>
              <p className="text-gray-600 font-medium">{mockMembers.length} members</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={handleInviteToHangout}
              className="bg-[#007AFF] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-[#0066CC] transition-colors"
            >
              <Calendar className="w-5 h-5" />
              Invite to Hangout
            </button>
            <button className="bg-white text-gray-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:bg-gray-50 transition-colors border-2 border-gray-200">
              <UserPlus className="w-5 h-5" />
              Add Member
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="px-6 py-6">
          <h2 className="text-lg font-bold mb-4">Members</h2>
          
          <div className="space-y-2">
            {mockMembers.map((member, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
                  {member.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-lg">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="px-6 pb-6">
          <div className="bg-[#007AFF]/5 border-2 border-[#007AFF]/10 rounded-xl p-4">
            <h3 className="font-semibold mb-2">About Groups</h3>
            <p className="text-sm text-gray-600">
              This is a saved friend list. When you create a hangout, you can invite this entire group with one tap instead of selecting members individually.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <button className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold active:bg-gray-200 transition-colors">
          Edit Group
        </button>
      </div>
    </div>
  );
}
