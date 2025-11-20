
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { fetchCoins, createTransaction, logAction } from '../services/db';
import { uploadToImgbb } from '../services/imgbb';
import { Coin, TransactionStatus, TransactionType } from '../types';
import * as RouterDOM from 'react-router-dom';
import { Wallet, AlertCircle } from 'lucide-react';

const { useNavigate, useLocation } = RouterDOM;

const Sell: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [selectedCoinId, setSelectedCoinId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      const data = await fetchCoins();
      setCoins(data);
      const stateCoin = location.state?.coin as Coin;
      if (stateCoin) setSelectedCoinId(stateCoin.id);
      else if (data.length > 0) setSelectedCoinId(data[0].id);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return navigate('/login');
    if (!selectedCoin) return;
    
    setError('');
    setLoading(true);

    try {
      let screenshotUrl = '';
      if (file) {
        screenshotUrl = await uploadToImgbb(file);
      }

      await createTransaction({
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email!,
        coinId: selectedCoin.id,
        coinSymbol: selectedCoin.symbol,
        coinPriceAtRequest: selectedCoin.price,
        amount,
        totalPrice, // Amount user receives
        walletAddress,
        userScreenshotURL: screenshotUrl || 'N/A',
        status: TransactionStatus.PENDING,
        type: TransactionType.SELL,
        timestamp: Date.now()
      }, 'sellRequests');

      await logAction(auth.currentUser.email!, 'CREATE_SELL', `Selling ${amount} ${selectedCoin.symbol}`);

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 drop-shadow-md">
        ক্রিপ্টো বিক্রি করুন <span className="text-rose-500 text-sm font-normal py-1 px-2 bg-rose-500/10 rounded border border-rose-500/20 backdrop-blur-sm">ক্যাশ আউট</span>
      </h1>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="text-rose-400 text-sm bg-rose-950/30 p-3 rounded-xl border border-rose-900/50">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-slate-400 text-xs uppercase font-semibold mb-2 ml-1">বিক্রির জন্য কয়েন</label>
                    <select 
                        value={selectedCoinId} 
                        onChange={(e) => setSelectedCoinId(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500/50 transition-all"
                    >
                        {coins.map(c => <option key={c.id} value={c.id}>{c.coinName} ({c.symbol})</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-slate-400 text-xs uppercase font-semibold mb-2 ml-1">পরিমাণ</label>
                    <input 
                        type="number" 
                        step="any"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value))}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500/50 transition-all"
                        placeholder="0.00"
                    />
                </div>
            </div>

            <div className="bg-rose-500/5 p-4 rounded-xl border border-rose-500/10 flex items-center justify-between backdrop-blur-sm">
                <span className="text-slate-400">আপনি পাবেন:</span>
                <span className="text-2xl font-bold text-rose-400 drop-shadow-sm">${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>

            <div>
                <label className="block text-slate-400 text-xs uppercase font-semibold mb-2 ml-1">আপনার ওয়ালেট / পেমেন্ট বিবরণ</label>
                <div className="relative">
                    <input 
                        type="text"
                        required
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder="বিকাশ/নগদ নম্বর অথবা ব্যাংক তথ্য"
                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-rose-500/50 pl-10 transition-all"
                    />
                    <div className="absolute left-3 top-3.5 text-slate-500"><Wallet className="w-4 h-4"/></div>
                </div>
                <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 ml-1"><AlertCircle className="w-3 h-3"/> নিশ্চিত করুন তথ্য সঠিক। ভুল বিবরণের জন্য রিফান্ড সম্ভব নয়।</p>
            </div>
            
            <div>
              <label className="block text-slate-400 text-xs uppercase font-semibold mb-2 ml-1">ট্রান্সফার প্রমাণ (ঐচ্ছিক)</label>
              <input 
                 type="file" 
                 accept="image/*"
                 onChange={(e) => e.target.files && setFile(e.target.files[0])}
                 className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-800/50 file:text-slate-300 hover:file:bg-slate-700/50 cursor-pointer file:backdrop-blur-sm"
              />
            </div>

            <button 
               type="submit" 
               disabled={loading}
               className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-rose-900/20 transition-all border border-rose-400/20"
            >
               {loading ? 'প্রক্রিয়াধীন...' : 'বিক্রয় শুরু করুন'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default Sell;