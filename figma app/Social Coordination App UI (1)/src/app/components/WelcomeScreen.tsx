import { Link } from 'react-router';
import { Users, Sparkles } from 'lucide-react';

export function WelcomeScreen() {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#4F46E5] to-[#6366F1] text-white p-6">
      {/* Logo and branding */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-8 relative">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-lg">
            <Users className="w-12 h-12 text-[#4F46E5]" strokeWidth={2.5} />
          </div>
          <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-2 -right-2" fill="currentColor" />
        </div>
        
        <h1 className="text-5xl font-bold mb-3">Hangout</h1>
        <p className="text-xl text-white/90 text-center max-w-[280px]">
          Plan spontaneous meetups and manage recurring social groups
        </p>
      </div>

      {/* CTA buttons */}
      <div className="space-y-3 pb-8">
        <Link 
          to="/auth"
          className="block w-full bg-white text-[#4F46E5] text-center py-4 rounded-2xl font-semibold text-lg shadow-lg active:scale-95 transition-transform"
        >
          Create Account
        </Link>
        <Link 
          to="/auth"
          className="block w-full bg-white/10 backdrop-blur-sm text-white text-center py-4 rounded-2xl font-semibold text-lg border-2 border-white/30 active:scale-95 transition-transform"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
