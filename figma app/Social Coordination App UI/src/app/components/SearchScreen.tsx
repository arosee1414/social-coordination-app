import { Search as SearchIcon, UserPlus, Users as UsersIcon, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

const mockFriends = [
  { id: 'sarah', name: 'Sarah Chen', avatar: '👩🏻', mutualFriends: 12, groups: ['Close Friends', 'Work Friends'] },
  { id: 'mike', name: 'Mike Johnson', avatar: '👨🏽', mutualFriends: 8, groups: ['Basketball Crew'] },
  { id: 'emma', name: 'Emma Wilson', avatar: '👩🏼', mutualFriends: 15, groups: ['Close Friends', 'Basketball Crew'] },
  { id: 'david', name: 'David Kim', avatar: '👨🏻', mutualFriends: 5, groups: ['Work Friends'] },
  { id: 'lisa', name: 'Lisa Martinez', avatar: '👩🏽', mutualFriends: 10, groups: ['Close Friends'] },
  { id: 'alex', name: 'Alex Thompson', avatar: '👨🏼', mutualFriends: 6, groups: [] },
  { id: 'rachel', name: 'Rachel Lee', avatar: '👩🏻', mutualFriends: 9, groups: ['Work Friends'] },
  { id: 'james', name: 'James Brown', avatar: '👨🏾', mutualFriends: 7, groups: ['Basketball Crew'] },
];

const mockSuggestedFriends = [
  { id: 'suggest-1', name: 'Tyler Adams', avatar: '👨🏽', mutualFriends: 3 },
  { id: 'suggest-2', name: 'Nina Patel', avatar: '👩🏾', mutualFriends: 5 },
  { id: 'suggest-3', name: 'Chris Evans', avatar: '👨🏻', mutualFriends: 2 },
];

export function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'friends' | 'discover'>('friends');

  const filteredFriends = mockFriends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSuggestions = mockSuggestedFriends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 bg-white">
        <h1 className="text-3xl font-bold mb-1">Search</h1>
        <p className="text-gray-500">Find and manage friends</p>
      </div>

      {/* Search Bar */}
      <div className="px-6 pt-4 pb-3 bg-white border-b border-gray-100">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007AFF] text-base"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 active:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 pb-3 bg-white">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'friends'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            My Friends ({mockFriends.length})
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-all ${
              activeTab === 'discover'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Discover
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'friends' ? (
          <div className="px-6 py-4">
            {/* Friends List */}
            {filteredFriends.length > 0 ? (
              <div className="space-y-3">
                {filteredFriends.map((friend) => (
                  <Link key={friend.id} to={`/friend/${friend.id}`}>
                    <div className="bg-white rounded-xl p-4 shadow-sm active:shadow-md active:scale-[0.98] transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                          {friend.avatar}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">{friend.name}</h3>
                          <p className="text-sm text-gray-500">
                            {friend.mutualFriends} mutual friends
                          </p>
                          {friend.groups.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <UsersIcon className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                {friend.groups.slice(0, 2).join(', ')}
                                {friend.groups.length > 2 && ` +${friend.groups.length - 2}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <SearchIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-lg mb-1">No friends found</h3>
                <p className="text-gray-500 text-sm">Try a different search</p>
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-4">
            {/* Suggested Friends */}
            <h2 className="text-lg font-bold mb-4">People You May Know</h2>
            {filteredSuggestions.length > 0 ? (
              <div className="space-y-3">
                {filteredSuggestions.map((friend) => (
                  <div key={friend.id} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
                        {friend.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">{friend.name}</h3>
                        <p className="text-sm text-gray-500">
                          {friend.mutualFriends} mutual friends
                        </p>
                      </div>
                      <button className="bg-[#007AFF] text-white px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-1.5 active:bg-[#0066CC] transition-colors">
                        <UserPlus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <SearchIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-lg mb-1">No suggestions found</h3>
                <p className="text-gray-500 text-sm">Try a different search</p>
              </div>
            )}

            {/* Empty State for Discover */}
            {!searchQuery && (
              <div className="mt-8 bg-[#007AFF]/5 border-2 border-[#007AFF]/10 rounded-xl p-6">
                <h3 className="font-semibold mb-2">Find More Friends</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connect with people you know to make planning hangouts even easier.
                </p>
                <button className="bg-[#007AFF] text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 active:bg-[#0066CC] transition-colors">
                  <UserPlus className="w-4 h-4" />
                  Find Friends
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
