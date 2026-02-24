import { Link } from 'react-router';
import { Check } from 'lucide-react';

export function GroupCreatedScreen() {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <Check className="w-12 h-12 text-white" strokeWidth={3} />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold mb-3">Group Created!</h1>
        <p className="text-gray-600 mb-8 max-w-[300px]">
          Your group is ready. You can now quickly invite all members to hangouts.
        </p>

        {/* Group Preview */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 mb-8 w-full max-w-[320px]">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">💜</div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-xl mb-1">Close Friends</h3>
              <p className="text-sm text-gray-600 font-medium">5 members</p>
            </div>
          </div>
          <div className="flex -space-x-3 justify-center">
            {['👩🏻', '👨🏽', '👩🏼', '👨🏻', '👩🏽'].map((avatar, index) => (
              <div 
                key={index}
                className="w-12 h-12 bg-white border-2 border-white rounded-full flex items-center justify-center text-xl shadow-md"
              >
                {avatar}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTAs */}
      <div className="p-6 space-y-3">
        <Link to="/create-hangout">
          <button className="w-full bg-[#4F46E5] text-white py-4 rounded-xl font-semibold text-lg active:bg-[#4338CA] transition-colors">
            Create a Hangout
          </button>
        </Link>
        <Link to="/groups">
          <button className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold active:bg-gray-200 transition-colors">
            View All Groups
          </button>
        </Link>
      </div>
    </div>
  );
}
