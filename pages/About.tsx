import React from 'react';
import { Shield, Users, Globe, Rocket, Target, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] -z-10"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-xl leading-tight">
            আমরা <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">অর্থনৈতিক স্বাধীনতার</span> নতুন দিগন্ত উন্মোচন করছি
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            BitTred হলো বাংলাদেশের সবচেয়ে বিশ্বস্ত এবং নিরাপদ পিয়ার-টু-পিয়ার ক্রিপ্টোকারেন্সি এক্সচেঞ্জ প্ল্যাটফর্ম। আমাদের লক্ষ্য হলো ডিজিটাল কারেন্সি কেনা-বেচা সবার জন্য সহজ ও নিরাপদ করা।
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 space-y-20">
        
        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-emerald-500/30 transition-all group">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">আমাদের লক্ষ্য</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              বাংলাদেশের প্রতিটি মানুষের কাছে ডিজিটাল কারেন্সির সুফল পৌঁছে দেওয়া এবং একটি স্বচ্ছ অর্থনৈতিক ইকোসিস্টেম তৈরি করা।
            </p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-purple-500/30 transition-all group">
            <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400 mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Shield className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">নিরাপত্তা ও বিশ্বাস</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              আমরা সর্বোচ্চ স্তরের নিরাপত্তা প্রোটোকল ব্যবহার করি। প্রতিটি লেনদেন ম্যানুয়ালি অডিট করা হয় যাতে আপনার কষ্টার্জিত অর্থ সুরক্ষিত থাকে।
            </p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-8 rounded-3xl hover:border-blue-500/30 transition-all group">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Rocket className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">দ্রুত লেনদেন</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              কোনো জটিলতা ছাড়াই মাত্র ৫-১০ মিনিটের মধ্যে বিকাশ, নগদ বা রকেটের মাধ্যমে ক্রিপ্টো কেনা বা বিক্রি করার সুবিধা।
            </p>
          </div>
        </div>

        {/* Why Choose Us - Stats */}
        <div className="bg-gradient-to-r from-slate-900/80 to-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 md:p-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">১০হাজার+</div>
              <div className="text-sm text-slate-400">সন্তুষ্ট ব্যবহারকারী</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-emerald-400 mb-2">$১.৫M+</div>
              <div className="text-sm text-slate-400">মোট লেনদেন</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">২৪/৭</div>
              <div className="text-sm text-slate-400">লাইভ সাপোর্ট</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">১০০%</div>
              <div className="text-sm text-slate-400">নিরাপদ গ্যারান্টি</div>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">আমাদের গল্প</h2>
            <div className="space-y-4 text-slate-400 leading-relaxed">
              <p>
                ২০২৩ সালে আমাদের যাত্রা শুরু হয়। আমরা লক্ষ্য করেছিলাম যে বাংলাদেশে ক্রিপ্টোকারেন্সি কেনাবেচা করার জন্য কোনো বিশ্বস্ত এবং সহজ মাধ্যম নেই। অনেক মানুষ স্ক্যামের শিকার হচ্ছিলেন।
              </p>
              <p>
                সেই সমস্যা সমাধানের জন্যই <strong>BitTred</strong> এর জন্ম। আমরা এমন একটি প্ল্যাটফর্ম তৈরি করেছি যেখানে প্রযুক্তি এবং মানবিক বিশ্বাস একসাথে কাজ করে।
              </p>
              <p>
                আজ আমরা গর্বিত যে হাজার হাজার ফ্রিল্যান্সার এবং ট্রেডার তাদের দৈনন্দিন লেনদেনের জন্য আমাদের ওপর ভরসা রাখেন।
              </p>
            </div>
            <div className="mt-8">
              <Link to="/buy">
                <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-emerald-900/20 transition-all">
                  আজই শুরু করুন
                </button>
              </Link>
            </div>
          </div>
          
          {/* Visual Representation */}
          <div className="relative">
             <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
             <div className="relative bg-slate-950/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Globe className="w-6 h-6" />
                   </div>
                   <div>
                      <h4 className="text-white font-bold">গ্লোবাল কানেক্টিভিটি</h4>
                      <p className="text-xs text-slate-500">সীমানা পেরিয়ে লেনদেন</p>
                   </div>
                </div>
                <div className="flex items-center gap-4 mb-6">
                   <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <Users className="w-6 h-6" />
                   </div>
                   <div>
                      <h4 className="text-white font-bold">কমিউনিটি ফোকাসড</h4>
                      <p className="text-xs text-slate-500">ব্যবহারকারীদের মতামতই আমাদের শক্তি</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                      <Heart className="w-6 h-6" />
                   </div>
                   <div>
                      <h4 className="text-white font-bold">স্বচ্ছতা</h4>
                      <p className="text-xs text-slate-500">কোনো লুকানো চার্জ নেই</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;
