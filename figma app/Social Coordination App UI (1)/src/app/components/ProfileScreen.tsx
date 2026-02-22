import { Settings, ChevronRight, Users as UsersIcon, Calendar, Bell, HelpCircle, LogOut } from 'lucide-react';

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
          <div className="bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg">
                👤
              </div>
              <div className="flex-1 pt-2">
                <h2 className="text-2xl font-bold mb-1">You</h2>
                <p className="text-white/80">you@email.com</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="px-6 pb-6 space-y-6">
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
