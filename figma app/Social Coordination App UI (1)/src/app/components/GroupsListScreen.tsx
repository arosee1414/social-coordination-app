import { Link } from 'react-router';
import { Plus, Users as UsersIcon } from 'lucide-react';

const mockGroups = [
  {
    id: '1',
    name: 'Close Friends',
    icon: '💜',
    memberCount: 5,
    bgColor: 'from-purple-50 to-purple-100',
  },
  {
    id: '2',
    name: 'Basketball Crew',
    icon: '🏀',
    memberCount: 8,
    bgColor: 'from-orange-50 to-orange-100',
  },
  {
    id: '3',
    name: 'Roommates',
    icon: '🏠',
    memberCount: 3,
    bgColor: 'from-blue-50 to-blue-100',
  },
  {
    id: '4',
    name: 'College Squad',
    icon: '🎓',
    memberCount: 12,
    bgColor: 'from-green-50 to-green-100',
  },
];

export function GroupsListScreen() {
  return (
    <div className="flex flex-col h-screen bg-white pb-20">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Groups</h1>
          <Link 
            to="/create-group"
            className="p-2 bg-[#4F46E5] text-white rounded-full active:bg-[#4338CA] transition-colors"
          >
            <Plus className="w-5 h-5" />
          </Link>
        </div>
        <p className="text-gray-500">Your saved friend lists</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {mockGroups.length > 0 ? (
          <div className="px-6 py-6">
            <div className="space-y-3">
              {mockGroups.map((group) => (
                <Link key={group.id} to={`/group/${group.id}`}>
                  <div className={`bg-gradient-to-br ${group.bgColor} rounded-2xl p-5 shadow-sm active:shadow-md active:scale-[0.98] transition-all`}>
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{group.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-1">{group.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <UsersIcon className="w-4 h-4" />
                          <span className="font-medium">{group.memberCount} members</span>
                        </div>
                      </div>
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
              <UsersIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Groups Yet</h3>
            <p className="text-gray-500 mb-8 max-w-[280px]">
              Create a group to save friend lists and invite them faster to hangouts
            </p>
            <Link 
              to="/create-group"
              className="bg-[#4F46E5] text-white px-8 py-4 rounded-xl font-semibold text-lg active:bg-[#4338CA] transition-colors"
            >
              Create Group
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
