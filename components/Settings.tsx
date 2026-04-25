
import {
    Camera,
    CheckCircle2,
    Loader2,
    Mail,
    Moon,
    ShieldCheck,
    Sun,
    Trash2,
    User as UserIcon
} from 'lucide-react';
import React, { useState } from 'react';
import { updateUserProfile } from '../services/authService';
import { uploadToCloudinary } from '../services/uploadService';
import { Theme, User } from '../types';

interface SettingsProps {
  user: User;
  token: string;
  onUpdateUser: (userData: User, token: string) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, token, onUpdateUser, theme, onThemeChange }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.photoUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setPhotoPreview(url);
    } catch (err) {
      alert("Photo update failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await updateUserProfile(
        {
          name: formData.name,
          email: formData.email,
          photoUrl: photoPreview,
          theme: theme
        },
        token
      );
      
      onUpdateUser(response.user, response.token);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Profile update failed.';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const labelClass = `text-[10px] font-black mb-1.5 block uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`;
  const inputClass = `w-full px-5 py-3.5 rounded-2xl border outline-none transition-all text-sm font-bold ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500'}`;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-black ${textColor}`}>Control Center</h2>
          <p className="text-slate-500 font-bold mt-1 text-[11px] uppercase tracking-widest">Administrator Account Preferences</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 text-emerald-500 font-black text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-right-4">
            <CheckCircle2 size={16} /> Changes Persistent
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="space-y-10">
          {/* Avatar Section */}
          <div className={`${cardBg} p-10 rounded-[3rem] border flex flex-col items-center text-center`}>
            <h3 className={labelClass}>Profile Visuals</h3>
            <div className="relative w-36 h-36 mt-8 mb-8 group">
              <div className={`w-full h-full rounded-[2.5rem] border-4 border-indigo-500/20 overflow-hidden shadow-2xl relative ${isUploading ? 'opacity-50' : ''}`}>
                <img 
                  src={photoPreview || "https://picsum.photos/seed/manager/200/200"} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer">
                  <Camera className="text-white" size={24} />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-indigo-500" size={32} />
                </div>
              )}
            </div>
            <p className={`text-xs font-bold ${textColor}`}>{user.name}</p>
            <p className="text-[10px] text-slate-500 font-black uppercase mt-1">System Administrator</p>
            <button 
              onClick={() => setPhotoPreview(null)}
              className="mt-6 flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-500/10 px-4 py-2 rounded-xl transition-all"
            >
              <Trash2 size={12} /> Reset Avatar
            </button>
          </div>

          {/* Security Summary */}
          <div className={`${cardBg} p-10 rounded-[3rem] border`}>
             <h3 className={labelClass}>Digital Security</h3>
             <div className="mt-6 space-y-6">
                <div className="flex items-start gap-4">
                   <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <ShieldCheck size={18} />
                   </div>
                   <div>
                      <p className={`text-[11px] font-black ${textColor} uppercase`}>Session encrypted</p>
                      <p className="text-[10px] text-slate-500 mt-1">AES-256 standard active</p>
                   </div>
                </div>
                <div className="flex items-start gap-4">
                   <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
                      <CheckCircle2 size={18} />
                   </div>
                   <div>
                      <p className={`text-[11px] font-black ${textColor} uppercase`}>Role Verified</p>
                      <p className="text-[10px] text-slate-500 mt-1">Full privilege granted</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-10">
          <form onSubmit={handleSave} className={`${cardBg} p-10 rounded-[3rem] border space-y-10`}>
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                <h3 className={`text-lg font-black ${textColor}`}>Identity Configuration</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className={labelClass}>Legal Profile Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      className={inputClass + " pl-12"}
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>System Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      type="email"
                      className={inputClass + " pl-12"}
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                <h3 className={`text-lg font-black ${textColor}`}>Interface & Experience</h3>
              </div>
              <div className="p-8 bg-slate-100 dark:bg-slate-800/40 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`text-[11px] font-black uppercase tracking-widest ${textColor}`}>System Color Mode</h4>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">Switch between high-contrast light and deep dark themes</p>
                  </div>
                  <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <button 
                      type="button"
                      onClick={() => onThemeChange('light')}
                      className={`px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 ${theme === 'light' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}
                    >
                      <Sun size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Light</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => onThemeChange('dark')}
                      className={`px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 ${theme === 'dark' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200'}`}
                    >
                      <Moon size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">Dark</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200/50 flex justify-end">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-12 py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-indigo-600/20 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                {isSubmitting ? 'Applying...' : 'Save Preferences'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
