import { Bell, UserPlus, Calendar, MessageCircle, PartyPopper } from 'lucide-react';

const mockNotifications = [
  {
    id: '1',
    type: 'rsvp',
    icon: '👩🏻',
    title: 'Sarah Chen is going',
    message: 'to "Drinks at The Rooftop"',
    time: '5m ago',
    unread: true,
  },
  {
    id: '2',
    type: 'invite',
    icon: '👨🏽',
    title: 'Mike Johnson invited you',
    message: 'to "Weekend brunch catch-up"',
    time: '1h ago',
    unread: true,
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Hangout starting soon',
    message: '"Drinks at The Rooftop" starts in 2 hours',
    time: '2h ago',
    unread: false,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: '4',
    type: 'group',
    icon: '💜',
    title: 'Group invited to hangout',
    message: 'Close Friends was invited to "Movie night"',
    time: '3h ago',
    unread: false,
  },
  {
    id: '5',
    type: 'rsvp',
    icon: '👨🏻',
    title: 'David Kim is maybe',
    message: 'for "Weekend brunch catch-up"',
    time: '5h ago',
    unread: false,
  },
  {
    id: '6',
    type: 'friend',
    icon: '👩🏽',
    title: 'Lisa Martinez accepted your invite',
    message: 'You can now plan hangouts together',
    time: '1d ago',
    unread: false,
  },
  {
    id: '7',
    type: 'group_created',
    title: 'New group created',
    message: 'You created "Basketball Crew" with 8 members',
    time: '2d ago',
    unread: false,
    color: 'from-green-500 to-green-600',
  },
];

export function NotificationsScreen() {
  const getNotificationIcon = (notification: typeof mockNotifications[0]) => {
    if (notification.icon) {
      return (
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl shadow-sm">
          {notification.icon}
        </div>
      );
    }

    if (notification.color) {
      return (
        <div className={`w-12 h-12 bg-gradient-to-br ${notification.color} rounded-full flex items-center justify-center shadow-sm`}>
          {notification.type === 'reminder' && <Calendar className="w-6 h-6 text-white" />}
          {notification.type === 'group_created' && <PartyPopper className="w-6 h-6 text-white" />}
        </div>
      );
    }

    return (
      <div className="w-12 h-12 bg-[#4F46E5] rounded-full flex items-center justify-center shadow-sm">
        <Bell className="w-6 h-6 text-white" />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white pb-20">
      {/* Header */}
      <div className="px-6 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Notifications</h1>
          <button className="text-[#4F46E5] font-semibold text-sm">
            Mark all read
          </button>
        </div>
        <p className="text-gray-500">Stay updated on your hangouts</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {mockNotifications.map((notification) => (
            <button
              key={notification.id}
              className={`w-full flex items-start gap-3 p-4 active:bg-gray-50 transition-colors ${
                notification.unread ? 'bg-[#4F46E5]/5' : ''
              }`}
            >
              {getNotificationIcon(notification)}
              
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold">{notification.title}</h3>
                  {notification.unread && (
                    <div className="w-2 h-2 bg-[#4F46E5] rounded-full mt-1.5 flex-shrink-0"></div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
                <p className="text-xs text-gray-400">{notification.time}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
