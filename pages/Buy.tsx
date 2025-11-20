
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { fetchCoins, getSiteSettings, createTransaction, logAction } from '../services/db';
import { uploadToImgbb } from '../services/imgbb';
import { Coin, TransactionStatus, TransactionType, SiteSettings } from '../types';
import * as RouterDOM from 'react-router-dom';
import { Calculator, AlertCircle, ShieldCheck } from 'lucide-react';

const { useNavigate, useLocation } = RouterDOM;

const Buy: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [selectedCoinId, setSelectedCoinId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentNumber, setPaymentNumber] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      const [c, s] = await Promise.all([fetchCoins(), getSiteSettings()]);
      setCoins(c);
      setSettings(s);
      
      const stateCoin = location.state?.coin as Coin;
      if (stateCoin) setSelectedCoinId(stateCoin.id);
      else if (c.length > 0) setSelectedCoinId(c[0].id);
    };
    init();
  }, [location.state]);

  const selectedCoin = coins.find(c => c.id === selectedCoinId);

  useEffect(() => {
    if (selectedCoin && amount > 0) {
      setTotalPrice(amount * selectedCoin.price);
    } else {
      setTotalPrice(0);
    }
  }, [amount, selectedCoin]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return navigate('/login');
    if (!file) return setError("পেমেন্ট স্ক্রিনশট প্রয়োজন।");
    if (!selectedCoin) return;
    
    setError('');
    setLoading(true);

    try {
      const screenshotUrl = await uploadToImgbb(file);

      await createTransaction({
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email!,
        coinId: selectedCoin.id,
        coinSymbol: selectedCoin.symbol,
        coinPriceAtRequest: selectedCoin.price,
        amount,
        totalPrice,
        paymentMethod,
        paymentNumber,
        userScreenshotURL: screenshotUrl,
        status: TransactionStatus.PENDING,
        type: TransactionType.BUY,
        timestamp: Date.now()
      }, 'buyRequests');

      await logAction(auth.currentUser.email!, 'CREATE_BUY', `Requested ${amount} ${selectedCoin.symbol}`);

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || "রিকুয়েস্ট প্রক্রিয়াকরণে ব্যর্থ হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  if (!settings) return <div className="text-center py-20 text-slate-500">এক্সচেঞ্জ লোড হচ্ছে...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 drop-shadow-md">
        ক্রিপ্টো কিনুন <span className="text-emerald-500 text-sm font-normal py-1 px-2 bg-emerald-500/10 rounded border border-emerald-500/20 backdrop-blur-sm">নিরাপদ গেটওয়ে</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Glass Form */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="text-rose-400 text-sm bg-rose-950/30 p-3 rounded-xl border border-rose-900/50">{error}</div>}
            
            <div>
              <label className="block text-slate-400 text-xs uppercase font-semibold mb-2 ml-1">কয়েন নির্বাচন করুন</label>
              <select 
                value={selectedCoinId} 
                onChange={(e) => setSelectedCoinId(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              >
                {coins.map(c => <option key={c.id} value={c.id}>{c.coinName} ({c.symbol})</option>)}
              </select>
            </div>

            <div>
               <label className="block text-slate-400 text-xs uppercase font-semibold mb-2 ml-1">পরিমাণ ({selectedCoin?.symbol})</label>
               <div className="relative">
                 <input 
                   type="number" 
                   step="any"
                   min="0"
                   value={amount}
                   onChange={(e) => setAmount(parseFloat(e.target.value))}
                   className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                   placeholder="0.00"
                 />
                 <div className="absolute right-4 top-3.5 text-slate-500 pointer-events-none"><Calculator className="w-4 h-4"/></div>
               </div>
            </div>

            <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/10 flex justify-between items-center backdrop-blur-sm">
               <span className="text-slate-400 text-sm">মোট পরিশোধ:</span>
               <span className="text-2xl font-bold text-emerald-400 drop-shadow-sm">${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <hr className="border-white/5" />

            <div>
               <label className="block text-slate-400 text-xs uppercase font-semibold mb-2 ml-1">পেমেন্ট মেথড</label>
               <select 
                 value={paymentMethod}
                 onChange={(e) => setPaymentMethod(e.target.value)}
                 required
                 className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-all"
               >
                 <option value="">মেথড নির্বাচন করুন</option>
                 {settings.paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
               </select>
            </div>

            <div>
               <label className="block text-slate-400 text-xs uppercase font-semibold mb-2 ml-1">আপনার অ্যাকাউন্ট নম্বর</label>
               <input 
                 type="text"
                 required
                 value={paymentNumber}
                 onChange={(e) => setPaymentNumber(e.target.value)}
                 placeholder="+8801XXXXXXXXX"
                 className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 transition-all"
               />
               <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 ml-1"><AlertCircle className="w-3 h-3"/> আসল নম্বর দিন। ভুল তথ্য নিষিদ্ধ।</p>
            </div>

            <div>
              <label className="block text-slate-400 text-xs uppercase font-semibold mb-2 ml-1">পেমেন্ট স্ক্রিনশট আপলোড</label>
              <div className="relative group">
                <input 
                   type="file" 
                   accept="image/*"
                   onChange={handleFileChange}
                   className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer file:transition-colors"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1 ml-1">Imgbb তে নিরাপদে হোস্ট করা হয়েছে।</p>
            </div>

            <button 
               type="submit" 
               disabled={loading}
               className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all border border-emerald-400/20"
            >
               {loading ? 'প্রক্রিয়াধীন...' : 'ক্রয় রিকুয়েস্ট জমা দিন'}
            </button>
          </form>
        </div>

        {/* Info Panel */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-emerald-900/20 to-slate-900/20 backdrop-blur-xl border border-emerald-500/20 p-6 rounded-3xl">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-400"/> নির্দেশাবলী</h3>
              <ul className="text-sm text-slate-400 space-y-3 list-disc pl-4">
                 <li>কয়েন নির্বাচন করুন এবং আপনি যে পরিমাণ কিনতে চান তা লিখুন।</li>
                 <li>আমাদের অফিসিয়াল অ্যাকাউন্টে <strong>${totalPrice.toFixed(2)}</strong> পাঠান।</li>
                 <li>লেনদেনের রশিদের একটি পরিষ্কার স্ক্রিনশট নিন।</li>
                 <li><strong>নকল</strong> বা জেনারেটেড রশিদ ব্যবহার করবেন না। সিস্টেম সমস্ত আপলোড অডিট করে।</li>
                 <li>অ্যাডমিন দ্বারা অনুমোদিত হলে, কয়েন আপনার ওয়ালেটে জমা হবে।</li>
              </ul>
           </div>
           
           {selectedCoin && (
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                 <h4 className="text-slate-400 text-sm mb-1">বর্তমান রেট</h4>
                 <div className="text-3xl text-white font-mono tracking-tight">1 {selectedCoin.symbol} = ${selectedCoin.price}</div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Buy;