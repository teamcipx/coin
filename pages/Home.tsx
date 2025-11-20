
import React, { useEffect, useState } from 'react';
import * as RouterDOM from 'react-router-dom';
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';
import { fetchCoins } from '../services/db';
import { Coin } from '../types';

const { Link } = RouterDOM;

const Home: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await fetchCoins();
      // Fallback if empty (first load)
      if (data.length === 0) {
        // This is just for visual demo until Admin adds real coins
        const demoCoins: Coin[] = [
          { id: 'btc', coinName: 'Bitcoin', symbol: 'BTC', price: 64230.50, available: true, createdAt: Date.now(), updatedAt: Date.now() },
          { id: 'eth', coinName: 'Ethereum', symbol: 'ETH', price: 3450.12, available: true, createdAt: Date.now(), updatedAt: Date.now() },
          { id: 'usdt', coinName: 'Tether', symbol: 'USDT', price: 1.00, available: true, createdAt: Date.now(), updatedAt: Date.now() },
        ];
        setCoins(demoCoins);
      } else {
        setCoins(data);
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32">
        {/* Local highlights specifically for Hero on top of global ambient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 drop-shadow-xl">
            ক্রিপ্টো ট্রেড করুন <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]">নিরাপদে</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 font-sans">
            ক্রিপ্টোকারেন্সি কেনা এবং বেচার জন্য সবচেয়ে বিশ্বস্ত প্ল্যাটফর্ম।
            তাৎক্ষণিক যাচাইকরণ, রিয়েল-টাইম রেট এবং নিরাপদ অডিটিং।
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/buy">
              <button className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 border border-emerald-400/30 backdrop-blur-sm">
                ক্রিপ্টো কিনুন <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/sell">
              <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold border border-white/10 backdrop-blur-md transition-all hover:border-white/20">
                ক্রিপ্টো বিক্রি করুন
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Rates */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" /> লাইভ মার্কেট
          </h2>
          <span className="text-xs text-slate-400 animate-pulse bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">● লাইভ আপডেট</span>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-12">রেট লোড হচ্ছে...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coins.map((coin) => (
              <div key={coin.id} className="bg-slate-900/40 backdrop-blur-lg border border-white/5 p-6 rounded-2xl hover:bg-slate-900/60 hover:border-emerald-500/30 transition-all group shadow-2xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{coin.coinName}</h3>
                    <span className="text-sm font-mono text-slate-400">{coin.symbol}</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-md ${coin.available ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    {coin.available ? 'চালু' : 'বন্ধ'}
                  </div>
                </div>
                <div className="text-3xl font-mono font-semibold text-white mb-4 tracking-tight">
                  ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="flex gap-3">
                  <Link to="/buy" state={{ coin }} className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 py-2.5 rounded-lg text-sm font-medium transition-all text-center border border-emerald-500/20 hover:border-emerald-500/40 backdrop-blur-sm">
                    কিনুন
                  </Link>
                  <Link to="/sell" state={{ coin }} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white py-2.5 rounded-lg text-sm font-medium transition-all text-center border border-white/5 hover:border-white/20 backdrop-blur-sm">
                    বিক্রি
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5 pt-12">
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 text-emerald-400 border border-emerald-500/20">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">নিরাপদ স্টোরেজ</h3>
            <p className="text-slate-400 text-sm leading-relaxed">সমস্ত লেনদেনের প্রমাণ নিরাপদে অডিট করা হয়। নিরাপদ ট্রেডিং পরিবেশ নিশ্চিত করতে আমরা প্রতিটি ব্যবহারকারীকে যাচাই করি।</p>
          </div>
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4 text-purple-400 border border-purple-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">দ্রুত লেনদেন</h3>
            <p className="text-slate-400 text-sm leading-relaxed">অ্যাডমিন অনুমোদন দ্রুত প্রক্রিয়া করা হয়। অপ্রয়োজনীয় দেরি ছাড়াই আপনার কয়েন বা টাকা পান।</p>
          </div>
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.05] transition-colors">
             <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 text-blue-400 border border-blue-500/20">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">সেরা রেট</h3>
            <p className="text-slate-400 text-sm leading-relaxed">আপনার পোর্টফোলিও মান সর্বাধিক করতে আমরা রিয়েল-টাইমে আপডেট হওয়া প্রতিযোগিতামূলক মার্কেট রেট অফার করি।</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;