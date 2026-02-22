import { Link } from 'react-router';
import { ArrowLeft, Mail, Lock } from 'lucide-react';
import { useState } from 'react';

export function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="px-4 py-4 flex items-center">
        <Link to="/" className="p-2 -ml-2 active:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pt-8">
        <h1 className="text-3xl font-bold mb-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-gray-500 mb-8">
          {isSignUp 
            ? 'Sign up to start planning hangouts with friends' 
            : 'Sign in to continue'
          }
        </p>

        {/* Social login buttons */}
        <div className="space-y-3 mb-8">
          <button className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-3 active:bg-gray-50 transition-colors">
            <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-gray-400 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Email form */}
        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="email" 
              placeholder="Email address"
              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#007AFF] focus:outline-none transition-colors"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#007AFF] focus:outline-none transition-colors"
            />
          </div>

          {!isSignUp && (
            <div className="text-right">
              <button className="text-[#007AFF] font-medium text-sm">
                Forgot password?
              </button>
            </div>
          )}

          <Link to="/find-friends">
            <button className="w-full bg-[#007AFF] text-white py-4 rounded-xl font-semibold text-lg mt-2 active:bg-[#0066CC] transition-colors">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </Link>
        </div>
      </div>

      {/* Toggle sign up/in */}
      <div className="px-6 pb-8 text-center">
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-gray-600"
        >
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <span className="text-[#007AFF] font-semibold">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </span>
        </button>
      </div>
    </div>
  );
}