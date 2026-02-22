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
          <button className="w-full bg-[#1877F2] text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-3 active:opacity-90 transition-opacity">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-[#1877F2] font-bold text-xs">f</div>
            Continue with Facebook
          </button>
          <button className="w-full bg-black text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-3 active:opacity-90 transition-opacity">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
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
              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#4F46E5] focus:outline-none transition-colors"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-[#4F46E5] focus:outline-none transition-colors"
            />
          </div>

          {!isSignUp && (
            <div className="text-right">
              <button className="text-[#4F46E5] font-medium text-sm">
                Forgot password?
              </button>
            </div>
          )}

          <Link to="/find-friends">
            <button className="w-full bg-[#4F46E5] text-white py-4 rounded-xl font-semibold text-lg mt-2 active:bg-[#4338CA] transition-colors">
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
          <span className="text-[#4F46E5] font-semibold">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </span>
        </button>
      </div>
    </div>
  );
}
