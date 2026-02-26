import { Settings, ChevronRight, Users as UsersIcon, Calendar, Bell, HelpCircle, LogOut, Moon } from 'lucide-react';
import { useState } from 'react';

const stats = [
  { label: 'Plans Created', value: '24' },
  { label: 'Pods Joined', value: '5' },
  { label: 'Friends', value: '32' },
];

const settingsSections = [
  {
    title: 'Account',
    items: [
      { icon: <UsersIcon className="w-5 h-5" />, label: 'Manage Friends', badge: null },
      { icon: <Bell className="w-5 h-5" />, label: 'Notifications', badge: null },
      { icon: <Calendar className="w-5 h-5" />, label: 'Calendar Sync', badge: null },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: <HelpCircle className="w-5 h-5" />, label: 'Help & Feedback', badge: null },
    ],
  },
];

export function ProfileScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-white pb-20">
      {/* Header */}
      <div className="px-6 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Profile</h1>
          <button className="p-2 active:bg-gray-100 rounded-full transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Profile Card */}
        <div className="px-6 py-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Profile Header */}
            <div className="px-6 pt-8 pb-6 bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-[#007AFF] to-[#3B82F6] rounded-full flex items-center justify-center text-4xl shadow-md">
                  👤
                </div>
                <div className="flex-1 pt-3">
                  <h2 className="text-2xl font-bold mb-1 text-gray-900">You</h2>
                  <p className="text-gray-500 text-sm">you@email.com</p>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 divide-x divide-gray-100 bg-white">
              {stats.map((stat, index) => (
                <div key={index} className="text-center py-5">
                  <div className="text-2xl font-bold text-gray-900 mb-0.5">{stat.value}</div>
                  <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="px-6 pb-6 space-y-6">
          {/* Preferences Section with Dark Mode Toggle */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">
              PREFERENCES
            </h3>
            <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="w-full flex items-center gap-3 px-4 py-4 active:bg-gray-50 transition-colors"
              >
                <div className="text-gray-600">
                  <Moon className="w-5 h-5" />
                </div>
                <span className="flex-1 text-left font-medium">Dark Mode</span>
                {/* Toggle Switch */}
                <div className={`relative w-12 h-7 rounded-full transition-colors ${
                  isDarkMode ? 'bg-[#007AFF]' : 'bg-gray-200'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </div>
              </button>
              <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500">
                  {isDarkMode 
                    ? 'Dark mode is currently enabled. Full dark theme coming soon!' 
                    : 'Enable dark mode for a comfortable viewing experience in low light.'}
                </p>
              </div>
            </div>
          </div>

          {settingsSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 px-1">
                {section.title.toUpperCase()}
              </h3>
              <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                {section.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    className={`w-full flex items-center gap-3 px-4 py-4 active:bg-gray-50 transition-colors ${
                      itemIndex !== section.items.length - 1 ? 'border-b border-gray-100' : ''
                    }`}
                  >
                    <div className="text-gray-600">{item.icon}</div>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Logout Button */}
          <div>
            <button className="w-full bg-white border-2 border-gray-100 rounded-2xl px-4 py-4 shadow-sm active:bg-gray-50 transition-colors">
              <div className="flex items-center justify-center gap-3 text-red-600">
                <LogOut className="w-5 h-5" />
                <span className="font-semibold">Log Out</span>
              </div>
            </button>
          </div>

          {/* Version */}
          <div className="text-center text-sm text-gray-400 pt-4">
            Version 1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}