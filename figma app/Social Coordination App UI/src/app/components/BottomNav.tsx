import { Link, useLocation } from 'react-router';
import { Home, Calendar, Users, Search, User } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/hangouts', icon: Calendar, label: 'Hangouts' },
    { path: '/groups', icon: Users, label: 'Groups' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-gray-100 px-4 py-2 pb-safe">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl transition-all ${
                active ? 'text-[#007AFF]' : 'text-gray-500'
              }`}
            >
              <Icon 
                className="w-6 h-6" 
                strokeWidth={active ? 2.5 : 2}
                fill={active ? 'currentColor' : 'none'}
              />
              <span className={`text-xs ${active ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}