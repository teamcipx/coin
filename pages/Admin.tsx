import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { getAllTransactions, checkIsAdmin, updateTransactionStatus, fetchLogs, fetchCoins, updateCoin, addNewCoin } from '../services/db';
import { uploadToImgbb } from '../services/imgbb';
import { TransactionRequest, TransactionStatus, AuditLog, Coin } from '../types';
import { ChatWindow } from '../components/ChatWindow';
import * as RouterDOM from 'react-router-dom';
import { ShieldAlert, FileText, Image as ImageIcon, Download, MessageSquare, X as CloseIcon, Settings, RefreshCcw, Plus, Save } from 'lucide-react';

const { Navigate } = RouterDOM;

const Admin: React.FC = () => {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'coins'>('requests');
  
  // Data States
  const [transactions, setTransactions] = useState<TransactionRequest[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');
  
  // Action States
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminProofFile, setAdminProofFile] = useState<File | null>(null);
  const [selectedChatRequest, setSelectedChatRequest] = useState<TransactionRequest | null>(null);

  // New Coin Form State
  const [showAddCoin, setShowAddCoin] = useState(false);
  const [newCoinData, setNewCoinData] = useState({ name: '', symbol: '', price: '', available: true });

  useEffect(() => {
    const verify = async () => {
      if (auth.currentUser && auth.currentUser.email) {
        const isAdmin = await checkIsAdmin(auth.currentUser.email);
        if (isAdmin) {
          setAuthorized(true);
          loadData();
        }
      }
      setLoading(false);
    };
    verify();
  }, []);

  const loadData = async () => {
    const [buys, sells, auditLogs, coinList] = await Promise.all([
      getAllTransactions('buy'),
      getAllTransactions('sell'),
      fetchLogs(),
      fetchCoins()
    ]);
    
    setTransactions([...buys, ...sells].sort((a, b) => b.timestamp - a.timestamp));
    setLogs(auditLogs);
    setCoins(coinList);
  };

  // --- Transaction Logic ---
  const handleAction = async (tx: TransactionRequest, status: TransactionStatus) => {
    setProcessingId(tx.id);
    try {
      let proofUrl = undefined;
      if (status === TransactionStatus.APPROVED && adminProofFile) {
        proofUrl = await uploadToImgbb(adminProofFile);
      }
      await updateTransactionStatus(tx.id, tx.type === 'buy' ? 'buy' : 'sell', status, tx.userId, proofUrl, auth.currentUser?.email || 'admin');
      await loadData();
      setAdminProofFile(null);
    } catch (e) {
      alert("Error updating transaction");
    } finally {
      setProcessingId(null);
    }
  };

  // --- Coin Logic ---
  const handlePriceUpdate = async (id: string, newPrice: string) => {
    const price = parseFloat(newPrice);
    if (isNaN(price)) return;
    await updateCoin(id, { price });
    await loadData(); // Refresh UI
  };

  const handleToggleAvailability = async (coin: Coin) => {
    await updateCoin(coin.id, { available: !coin.available });
    await loadData();
  };

  const handleAddCoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoinData.name || !newCoinData.symbol || !newCoinData.price) return;
    
    try {
      await addNewCoin({
        coinName: newCoinData.name,
        symbol: newCoinData.symbol.toUpperCase(),
        price: parseFloat(newCoinData.price),
        available: newCoinData.available
      });
      setShowAddCoin(false);
      setNewCoinData({ name: '', symbol: '', price: '', available: true });
      await loadData();
    } catch (error) {
      console.error("Failed to add coin", error);
    }
  };

  const exportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Type', 'Date', 'User Email', 'Coin', 'Amount', 'Total Price ($)', 'Status'];
    const rows = transactions.map(t => [t.id, t.type, new Date(t.timestamp).toISOString(), t.userEmail, t.coinSymbol, t.amount, t.totalPrice, t.status]);
    const csvContent = [headers.join(','), ...rows.map(e => e.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bittred_tx_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-10 text-center text-slate-500">যাচাই করা হচ্ছে...</div>;
  if (!authorized) return <Navigate to="/" />;

  const filteredTx = filter === 'all' ? transactions : transactions.filter(t => t.status === TransactionStatus.PENDING);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-md">
          <ShieldAlert className="text-violet-500" /> অ্যাডমিন প্যানেল
        </h1>
        
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
           <button 
             onClick={() => setActiveTab('requests')} 
             className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${activeTab === 'requests' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             <FileText className="w-4 h-4"/> রিকুয়েস্ট
           </button>
           <button 
             onClick={() => setActiveTab('coins')} 
             className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${activeTab === 'coins' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}
           >
             <Settings className="w-4 h-4"/> কয়েন ও রেট
           </button>
        </div>
      </div>

      {activeTab === 'requests' ? (
        // --- REQUESTS VIEW ---
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-2">
               <h2 className="text-slate-400 text-sm uppercase font-semibold ml-1">লেনদেন রিকুয়েস্ট</h2>
               <div className="flex gap-2 text-xs">
                  <button onClick={() => setFilter('pending')} className={`px-3 py-1 rounded ${filter === 'pending' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-slate-500'}`}>অপেক্ষমান</button>
                  <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-slate-500'}`}>সকল</button>
               </div>
            </div>

            {filteredTx.length === 0 && <div className="p-8 text-center text-slate-500 bg-white/5 border border-white/5 rounded-2xl">কোন রিকুয়েস্ট নেই।</div>}
            
            {filteredTx.map((tx) => (
              <div key={tx.id} className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex flex-col gap-4 shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase border ${tx.type === 'buy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>{tx.type}</span>
                      <span className="text-slate-200 font-medium">{tx.amount} {tx.coinSymbol}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{tx.userEmail}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">${tx.totalPrice.toFixed(2)}</div>
                    <div className={`text-xs capitalize font-medium ${tx.status === 'pending' ? 'text-amber-400' : tx.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.status}
                    </div>
                    <button onClick={() => setSelectedChatRequest(tx)} className="mt-2 text-xs text-violet-400 flex items-center justify-end gap-1"><MessageSquare className="w-3 h-3" /> চ্যাট</button>
                  </div>
                </div>

                <div className="bg-black/20 p-3 rounded-lg text-xs text-slate-300 font-mono border border-white/5">
                  {'paymentMethod' in tx ? `Method: ${(tx as any).paymentMethod} | Number: ${(tx as any).paymentNumber}` : `Wallet: ${(tx as any).walletAddress}`}
                </div>

                {tx.status === TransactionStatus.PENDING && (
                  <div className="border-t border-white/5 pt-4 flex flex-wrap gap-4 items-center justify-between">
                    <a href={tx.userScreenshotURL} target="_blank" className="text-blue-400 text-sm hover:underline flex items-center gap-1"><ImageIcon className="w-4 h-4"/> প্রমাণ দেখুন</a>
                    
                    <div className="flex items-center gap-2">
                      <div className="relative overflow-hidden">
                          <input type="file" onChange={(e) => e.target.files && setAdminProofFile(e.target.files[0])} className="absolute opacity-0 w-full h-full cursor-pointer"/>
                          <button className={`px-3 py-2 rounded-lg text-xs border border-white/10 ${adminProofFile ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-white/5'}`}>{adminProofFile ? 'প্রমাণ সংযুক্ত' : 'প্রমাণ দিন'}</button>
                      </div>
                      <button onClick={() => handleAction(tx, TransactionStatus.REJECTED)} disabled={processingId === tx.id} className="bg-rose-500/10 text-rose-400 px-4 py-2 rounded-lg text-sm border border-rose-500/20">বাতিল</button>
                      <button onClick={() => handleAction(tx, TransactionStatus.APPROVED)} disabled={processingId === tx.id} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg shadow-emerald-900/20">অনুমোদন</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2"><FileText className="w-4 h-4"/> অডিট লগ</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                {logs.map((log) => (
                  <div key={log.id} className="text-xs border-l-2 border-slate-600 pl-3 py-1">
                     <div className="text-slate-300 font-semibold">{log.actionType}</div>
                     <div className="text-slate-500 truncate">{log.detail}</div>
                     <div className="text-[10px] text-slate-600 mt-1">{new Date(log.timestamp).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={exportCSV} className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 py-3 rounded-xl text-sm border border-white/5"><Download className="w-4 h-4" /> CSV ডাউনলোড</button>
          </div>
        </div>
      ) : (
        // --- COIN MANAGEMENT VIEW ---
        <div className="max-w-4xl mx-auto">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">কয়েন এবং রেট ম্যানেজমেন্ট</h2>
              <button onClick={() => setShowAddCoin(!showAddCoin)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4" /> নতুন কয়েন
              </button>
           </div>

           {showAddCoin && (
             <div className="bg-slate-800/50 border border-white/10 p-6 rounded-2xl mb-8 animate-fade-in">
                <h3 className="text-white font-semibold mb-4">নতুন কয়েন যোগ করুন</h3>
                <form onSubmit={handleAddCoin} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                   <div>
                      <label className="text-xs text-slate-400 block mb-1">নাম</label>
                      <input type="text" placeholder="Bitcoin" className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={newCoinData.name} onChange={e => setNewCoinData({...newCoinData, name: e.target.value})} required />
                   </div>
                   <div>
                      <label className="text-xs text-slate-400 block mb-1">সিম্বল</label>
                      <input type="text" placeholder="BTC" className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={newCoinData.symbol} onChange={e => setNewCoinData({...newCoinData, symbol: e.target.value})} required />
                   </div>
                   <div>
                      <label className="text-xs text-slate-400 block mb-1">বর্তমান রেট ($)</label>
                      <input type="number" placeholder="50000" className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={newCoinData.price} onChange={e => setNewCoinData({...newCoinData, price: e.target.value})} required />
                   </div>
                   <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm h-[38px]">সেভ করুন</button>
                </form>
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coins.map(coin => (
                 <div key={coin.id} className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 flex justify-between items-center">
                    <div>
                       <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">{coin.coinName}</h3>
                          <span className="text-xs text-slate-500 font-mono">({coin.symbol})</span>
                       </div>
                       <div className="flex items-center gap-2 mt-3">
                          <span className="text-slate-400 text-sm">$</span>
                          <input 
                            type="number" 
                            defaultValue={coin.price}
                            onBlur={(e) => handlePriceUpdate(coin.id, e.target.value)}
                            className="bg-black/20 border border-white/10 rounded px-2 py-1 text-white w-32 text-sm focus:border-emerald-500 outline-none"
                          />
                          <span className="text-[10px] text-slate-500 italic ml-1">ক্লিক করে এডিট করুন</span>
                       </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3">
                       <button 
                         onClick={() => handleToggleAvailability(coin)}
                         className={`px-3 py-1 rounded-full text-xs font-medium border ${coin.available ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}
                       >
                         {coin.available ? 'চালু আছে' : 'বন্ধ আছে'}
                       </button>
                       <span className="text-[10px] text-slate-600">Last updated: {new Date(coin.updatedAt).toLocaleDateString()}</span>
                    </div>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* Chat Modal */}
      {selectedChatRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
               <h3 className="text-white font-bold">চ্যাট: {selectedChatRequest.userEmail}</h3>
               <button onClick={() => setSelectedChatRequest(null)} className="text-slate-400 hover:text-white"><CloseIcon className="w-5 h-5"/></button>
            </div>
            <div className="p-4"><ChatWindow requestId={selectedChatRequest.id} isAdminView={true} /></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
