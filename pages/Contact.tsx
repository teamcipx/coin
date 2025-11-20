import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2 } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Save message to Firestore
      await addDoc(collection(db, 'contactMessages'), {
        ...formData,
        timestamp: Date.now(),
        read: false
      });
      
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("মেসেজ পাঠানো যায়নি। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-md">আমাদের সাথে যোগাযোগ করুন</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          আপনার কোন প্রশ্ন বা সমস্যা থাকলে আমাদের মেসেজ পাঠান। আমাদের সাপোর্ট টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-start gap-4 hover:border-emerald-500/30 transition-colors">
            <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-400 border border-emerald-500/20">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">হটলাইন / হোয়াটসঅ্যাপ</h3>
              <p className="text-slate-400 text-sm">+880 1XXXXXXXXX</p>
              <p className="text-slate-500 text-xs mt-1">সকাল ১০টা - রাত ১০টা</p>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-start gap-4 hover:border-emerald-500/30 transition-colors">
            <div className="bg-purple-500/10 p-3 rounded-xl text-purple-400 border border-purple-500/20">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">ইমেইল সাপোর্ট</h3>
              <p className="text-slate-400 text-sm">support@bittred.com</p>
              <p className="text-slate-500 text-xs mt-1">২৪/৭ সাপোর্ট</p>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl flex items-start gap-4 hover:border-emerald-500/30 transition-colors">
            <div className="bg-blue-500/10 p-3 rounded-xl text-blue-400 border border-blue-500/20">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">অফিস ঠিকানা</h3>
              <p className="text-slate-400 text-sm">লেভেল ৪, ক্রিপ্টো টাওয়ার,</p>
              <p className="text-slate-400 text-sm">ঢাকা, বাংলাদেশ ১২১২</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {success ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 mb-6 border border-emerald-500/30 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">মেসেজ পাঠানো হয়েছে!</h3>
              <p className="text-slate-400">ধন্যবাদ। আমরা শীঘ্রই আপনার ইমেইলে যোগাযোগ করব।</p>
              <button onClick={() => setSuccess(false)} className="mt-8 text-emerald-400 hover:text-emerald-300 text-sm underline">
                অন্য মেসেজ পাঠান
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2 ml-1">আপনার নাম</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                    placeholder="নাম লিখুন"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2 ml-1">ইমেইল এড্রেস</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 ml-1">বিষয়</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all"
                  placeholder="কি বিষয়ে জানতে চান?"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2 ml-1">মেসেজ</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all resize-none"
                  placeholder="আপনার প্রশ্ন বা মতামত বিস্তারিত লিখুন..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all border border-emerald-400/20 flex items-center justify-center gap-2"
              >
                {loading ? 'পাঠানো হচ্ছে...' : (
                  <>
                    <Send className="w-4 h-4" /> মেসেজ পাঠান
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
