
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import * as RouterDOM from 'react-router-dom';
import { createUserProfile } from '../services/db';
import { AlertTriangle } from 'lucide-react';

const { useNavigate } = RouterDOM;

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        if (auth.currentUser) {
            await updateProfile(auth.currentUser, { displayName });
        }
        await createUserProfile({
          uid: res.user.uid,
          email: res.user.email!,
          displayName,
          createdAt: Date.now(),
        });
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white text-center mb-2 drop-shadow-lg">
            {isLogin ? 'স্বাগতম' : 'অ্যাকাউন্ট তৈরি করুন'}
          </h2>
          <p className="text-slate-400 text-center mb-8 text-sm">
            {isLogin ? 'আপনার পোর্টফোলিও পরিচালনা করতে লগইন করুন' : 'নিরাপদ ক্রিপ্টো ট্রেডিং এর জন্য BitTred এ যোগ দিন'}
          </p>

          {error && (
            <div className="bg-rose-500/10 backdrop-blur-md border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm shadow-inner">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 ml-1">পূর্ণ নাম</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none backdrop-blur-sm transition-all placeholder-slate-600"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="আপনার নাম"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 ml-1">ইমেইল এড্রেস</label>
              <input
                type="email"
                required
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none backdrop-blur-sm transition-all placeholder-slate-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 ml-1">পাসওয়ার্ড</label>
              <input
                type="password"
                required
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none backdrop-blur-sm transition-all placeholder-slate-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            
            {!isLogin && (
               <div className="text-xs text-amber-400/90 flex items-start gap-2 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 backdrop-blur-md">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>সতর্কতা: ভুল তথ্য ব্যবহার করবেন না। লেনদেনের জন্য পরিচয় যাচাইকরণ প্রয়োজন হতে পারে।</span>
               </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white font-semibold py-3.5 rounded-xl transition-all mt-4 shadow-lg shadow-emerald-900/40 hover:shadow-emerald-900/60 border border-emerald-400/20"
            >
              {loading ? 'প্রক্রিয়াধীন...' : (isLogin ? 'লগইন' : 'সাইন আপ')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              {isLogin ? "অ্যাকাউন্ট নেই? সাইন আপ করুন" : "ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন করুন"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;