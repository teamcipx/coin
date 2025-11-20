
import React, { useEffect, useState } from 'react';
import * as RouterDOM from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../firebase';
import { checkIsAdmin, subscribeToNotifications, markNotificationRead } from '../services/db';
import { Menu, X, LayoutDashboard, LogOut, User as UserIcon, ShieldCheck, Coins, LogIn, Bell, HelpCircle } from 'lucide-react';
import { AppNotification } from '../types';

const { Link, useLocation, useNavigate } = RouterDOM;

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        const adminStatus = await checkIsAdmin(currentUser.email);
        setIsAdmin(adminStatus);
        
        const unsubNotif = subscribeToNotifications(currentUser.uid, (data) => {
          setNotifications(data);
        });
        return () => unsubNotif();
      } else {
        setIsAdmin(false);
        setNotifications([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotifClick = async (n: AppNotification) => {
    if (!n.read) await markNotificationRead(n.id);
    setShowNotifs(false);
  };

  const navLinks = [
    { name: 'হোম', path: '/' },
    { name: 'কিনুন', path: '/buy' },
    { name: 'বিক্রি করুন', path: '/sell' },
    { name: 'প্রশ্ন ও উত্তর', path: '/faq' },
  ];

  return (
    <div className="min-h-screen text-slate-200 font-sans flex flex-col relative overflow-x-hidden">
      {/* Ambient Background - Glass Effect Base */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-blue-600/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Glass Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.7)] transition-all border border-white/10">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white drop-shadow-sm">Bit<span className="text-emerald-400">Tred</span></span>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-6 items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              {isAdmin && (
                <Link to="/admin" className="text-sm font-medium text-violet-400 hover:text-violet-300 flex items-center gap-1 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]">
                  <ShieldCheck className="w-4 h-4" /> অ্যাডমিন
                </Link>
              )}

              <div className="h-6 w-px bg-white/10 mx-2"></div>

              {user ? (
                <div className="flex items-center gap-3">
                  {/* Notification Bell */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifs(!showNotifs)}
                      className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors relative"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotifs && (
                      <div className="absolute right-0 mt-4 w-80 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 ring-1 ring-black/50">
                        <div className="p-4 border-b border-white/5 bg-white/5">
                          <h4 className="text-sm font-bold text-white">নোটিফিকেশন</h4>
                        </div>
                        <div className="max-h-80 overflow-y-auto custom-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-slate-500 text-sm">কোন নতুন নোটিফিকেশন নেই।</div>
                          ) : (
                            notifications.map(n => (
                              <div 
                                key={n.id} 
                                onClick={() => handleNotifClick(n)}
                                className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${!n.read ? 'bg-emerald-500/10' : ''}`}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <h5 className={`text-sm font-semibold ${!n.read ? 'text-emerald-400' : 'text-slate-300'}`}>{n.title}</h5>
                                  <span className="text-[10px] text-slate-500">{new Date(n.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-xs text-slate-400">{n.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <Link to="/dashboard" title="ড্যাশবোর্ড">
                     <button className="p-2 text-slate-300 hover:text-white transition-colors hover:bg-white/5 rounded-full">
                        <LayoutDashboard className="w-5 h-5" />
                     </button>
                  </Link>
                  
                  <Link to="/profile" title="প্রোফাইল">
                     <button className="p-2 text-slate-300 hover:text-white transition-colors hover:bg-white/5 rounded-full">
                        <UserIcon className="w-5 h-5" />
                     </button>
                  </Link>

                  <button 
                    onClick={handleLogout}
                    title="লগআউট"
                    className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-full text-sm transition-all border border-white/10 hover:border-white/20"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link to="/login">
                  <button className="bg-emerald-600/90 hover:bg-emerald-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] flex items-center gap-2 backdrop-blur-sm border border-emerald-400/30">
                    <LogIn className="w-4 h-4" /> লগইন
                  </button>
                </Link>
              )}
            </nav>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-slate-300 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Glass */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-950/90 backdrop-blur-2xl border-b border-white/10">
            <div className="px-4 pt-2 pb-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-white/5"
                >
                  {link.name}
                </Link>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-violet-400 hover:bg-white/5"
                >
                  অ্যাডমিন প্যানেল
                </Link>
              )}
              <div className="pt-4 border-t border-white/10 mt-4">
                {user ? (
                  <div className="space-y-2">
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-md">
                      <LayoutDashboard className="w-4 h-4" /> ড্যাশবোর্ড
                    </Link>
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-md">
                      <UserIcon className="w-4 h-4" /> প্রোফাইল
                    </Link>
                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md">
                      <LogOut className="w-4 h-4" /> লগআউট
                    </button>
                  </div>
                ) : (
                   <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-emerald-400">লগইন / সাইন আপ</Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow relative z-10" onClick={() => { if(showNotifs) setShowNotifs(false); }}>
        {children}
      </main>

      <footer className="bg-slate-950/40 backdrop-blur-md border-t border-white/5 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} BitTred. নিরাপদ ক্রিপ্টো এক্সচেঞ্জ। 
            <span className="block mt-2 text-xs text-slate-600">ভুল তথ্য প্রদান নিষিদ্ধ। লেনদেনের জন্য পরিচয় যাচাইকরণ আবশ্যক।</span>
          </p>
        </div>
      </footer>
    </div>
  );
};