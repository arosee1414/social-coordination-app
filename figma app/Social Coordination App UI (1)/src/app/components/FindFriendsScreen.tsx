import { Link } from 'react-router';
import { ArrowLeft, Search, UserPlus, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const mockContacts = [
  { id: '1', name: 'Sarah Chen', phone: '+1 (555) 123-4567', avatar: '👩🏻' },
  { id: '2', name: 'Mike Johnson', phone: '+1 (555) 234-5678', avatar: '👨🏽' },
  { id: '3', name: 'Emma Wilson', phone: '+1 (555) 345-6789', avatar: '👩🏼' },
  { id: '4', name: 'David Kim', phone: '+1 (555) 456-7890', avatar: '👨🏻' },
  { id: '5', name: 'Lisa Martinez', phone: '+1 (555) 567-8901', avatar: '👩🏽' },
];

export function FindFriendsScreen() {
  const [copied, setCopied] = useState(false);
  const inviteLink = 'hangout.app/join/abc123';

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-4 flex items-center border-b border-gray-100">
        <Link to="/auth" className="p-2 -ml-2 active:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="flex-1 text-center font-semibold text-lg pr-10">Find Friends</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Connect with your friends to start planning hangouts together
          </p>

          {/* Invite link card */}
          <div className="bg-gradient-to-br from-[#007AFF] to-[#3B82F6] rounded-2xl p-5 mb-6 shadow-sm">
            <h3 className="text-white font-semibold mb-2">Share Your Invite Link</h3>
            <p className="text-white/80 text-sm mb-4">Send this link to friends to connect instantly</p>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="flex-1 text-white text-sm font-mono truncate">{inviteLink}</span>
              <button 
                onClick={handleCopy}
                className="bg-white/20 p-2 rounded-lg active:bg-white/30 transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Copy className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search contacts"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#007AFF]/20 focus:outline-none transition-all"
            />
          </div>

          {/* Contacts list */}
          <div className="space-y-2">
            {mockContacts.map((contact) => (
              <div key={contact.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                  {contact.avatar}
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{contact.name}</div>
                  <div className="text-sm text-gray-500">{contact.phone}</div>
                </div>
                <button className="px-4 py-2 bg-[#007AFF] text-white rounded-lg font-medium text-sm active:bg-[#0066CC] transition-colors">
                  Invite
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="p-6 border-t border-gray-100 bg-white">
        <Link to="/home">
          <button className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold active:bg-gray-200 transition-colors">
            Skip for Now
          </button>
        </Link>
      </div>
    </div>
  );
}