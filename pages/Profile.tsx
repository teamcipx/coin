
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { getUserProfile, updateUserProfile } from '../services/db';
import { UserProfile } from '../types';
import { User, Phone, Mail, Save } from 'lucide-react';
import * as RouterDOM from 'react-router-dom';

const { Navigate } = RouterDOM;

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetch = async () => {
      if (!auth.currentUser) return;
      const data = await getUserProfile(auth.currentUser.uid);
      if (data) {
        setProfile(data);
        setDisplayName(data.displayName || '');
        setPhone(data.phone || '');
      } else {
        // Fallback for user created via simple auth but not in DB yet
        setDisplayName(auth.currentUser.displayName || '');
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setSaving(true);
    setMessage('');

    try {
      await updateUserProfile(auth.currentUser.uid, {
        displayName,
        phone
      });
      setMessage('প্রোফাইল সফলভাবে আপডেট হয়েছে!');
    } catch (error) {
      setMessage('আপডেট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setSaving(false);
    }
  };

  if (!auth.currentUser) return <Navigate to="/login" />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
       <h1 className="text-3xl font-bold text-white mb-8 drop-shadow-lg">আমার প্রোফাইল</h1>

       <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
         {loading ? (
           <div className="text-slate-500">লোড হচ্ছে...</div>
         ) : (
           <form onSubmit={handleSave} className="space-y-6">
              {message && (
                <div className={`p-3 rounded-xl text-sm border ${message.includes('সফল') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                  {message}
                </div>
              )}

              <div className="flex justify-center mb-6">
                 <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <User className="w-10 h-10" />
                 </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 ml-1">ইমেইল (পরিবর্তনযোগ্য নয়)</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-slate-400">
                   <Mail className="w-4 h-4"/>
                   {auth.currentUser.email}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 ml-1">নাম</label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white outline-none focus:border-emerald-500/50 transition-all"
                    placeholder="আপনার নাম"
                  />
                  <div className="absolute left-3 top-3.5 text-slate-500"><User className="w-4 h-4"/></div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 ml-1">ফোন নম্বর</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 pl-10 text-white outline-none focus:border-emerald-500/50 transition-all"
                    placeholder="+8801XXXXXXXXX"
                  />
                  <div className="absolute left-3 top-3.5 text-slate-500"><Phone className="w-4 h-4"/></div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-900/20 transition-all border border-emerald-400/20 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" /> {saving ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সংরক্ষণ করুন'}
              </button>
           </form>
         )}
       </div>
    </div>
  );
};

export default Profile;