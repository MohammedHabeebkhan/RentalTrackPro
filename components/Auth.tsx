
import { ArrowRight, Cloud, Globe, Info, Loader2, Lock, Mail, ShieldCheck, User as UserIcon } from 'lucide-react';
import React, { useState } from 'react';
import { authenticateUser, registerUser } from '../services/authService';
import { AuthState, User } from '../types';

interface AuthProps {
  onLogin: (userData: User, token: string) => void;
  initialState?: AuthState;
}

const Auth: React.FC<AuthProps> = ({ onLogin, initialState = 'login' }) => {
  const [mode, setMode] = useState<AuthState>(initialState);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = mode === 'register'
        ? await registerUser(name, email, password)
        : await authenticateUser(email, password);

      onLogin(result.user, result.token);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Authentication failed. Please check your credentials and try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row overflow-hidden font-sans">
      <div className="hidden md:flex md:w-1/2 bg-indigo-600 p-12 flex-col justify-between relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2.5 shadow-xl shadow-black/20">
            <img src="/images/logo.png" alt="PropTrack Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-black text-white tracking-tight italic">PropTrack Next</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            Cloud Native <br />
            <span className="text-indigo-200">Management.</span>
          </h1>
          <p className="text-indigo-100 text-lg opacity-80 max-w-md">
            Built on <strong>Next.js</strong> architecture with enterprise MongoDB clustering.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-4 text-indigo-100 font-bold text-sm bg-white/10 w-fit px-4 py-2 rounded-xl">
            <Globe size={18} />
            <span>Region: AP-South-1 (KFMDATA)</span>
          </div>
          <div className="flex items-center gap-4 text-indigo-200 text-xs opacity-70">
            <Cloud size={16} />
            <span>CDN Engine: testecommerce</span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white p-8 md:p-24 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-2">
               <ShieldCheck className="text-indigo-600" size={20} />
               <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Secure Handshake Required</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              {mode === 'login' ? 'Access Portal' : 'Agent Enrollment'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Legal Identity</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="text" 
                    placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 font-bold"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="email" 
                  placeholder="admin@kfmdata.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 font-bold"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Access Secret</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-900 font-bold"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              type="submit"
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>
                  <span>{mode === 'login' ? 'Initialize Session' : 'Create Record'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500 font-bold">
              {mode === 'login' ? "New operative?" : "Existing admin?"}{' '}
              <button 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-indigo-600 font-black hover:underline ml-1"
              >
                {mode === 'login' ? 'Register here' : 'Login here'}
              </button>
            </p>
          </div>

          <div className="mt-12 bg-indigo-50 p-5 rounded-2xl flex gap-4 border border-indigo-100 items-center">
             <div className="p-2.5 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-200">
                <Info size={16} />
             </div>
             <p className="text-[10px] text-indigo-700 leading-tight font-black uppercase tracking-tight">
                Authenticating via <span className="underline">KFMDATACLUSTER</span>. Token Rotation Policy: 24H.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
