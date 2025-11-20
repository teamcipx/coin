
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { getAllTransactions, checkIsAdmin, updateTransactionStatus, fetchLogs } from '../services/db';
import { uploadToImgbb } from '../services/imgbb';
import { TransactionRequest, TransactionStatus, AuditLog } from '../types';
import { ChatWindow } from '../components/ChatWindow';
import * as RouterDOM from 'react-router-dom';
import { ShieldAlert, Check, X, FileText, Image as ImageIcon, Download, MessageSquare, X as CloseIcon } from 'lucide-react';

const { Navigate } = RouterDOM;

const Admin: React.FC = () => {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<TransactionRequest[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending'>('pending');
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminProofFile, setAdminProofFile] = useState<File | null>(null);
  const [selectedChatRequest, setSelectedChatRequest] = useState<TransactionRequest | null>(null);

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
    const buys = await getAllTransactions('buy');
    const sells = await getAllTransactions('sell');
    const auditLogs = await fetchLogs();
    
    setTransactions([...buys, ...sells].sort((a, b) => b.timestamp - a.timestamp));
    setLogs(auditLogs);
  };

  const handleAction = async (tx: TransactionRequest, status: TransactionStatus) => {
    setProcessingId(tx.id);
    try {
      let proofUrl = undefined;
      if (status === TransactionStatus.APPROVED && adminProofFile) {
        proofUrl = await uploadToImgbb(adminProofFile);
      }

      await updateTransactionStatus(
        tx.id, 
        tx.type === 'buy' ? 'buy' : 'sell', 
        status, 
        tx.userId,
        proofUrl,
        auth.currentUser?.email || 'admin'
      );
      
      await loadData();
      setAdminProofFile(null);
    } catch (e) {
      alert("Error updating transaction");
      console.error(e);
    } finally {
      setProcessingId(null);
    }
  };

  const exportCSV = () => {
    if (transactions.length === 0) return;
    
    const headers = ['ID', 'Type', 'Date', 'User Email', 'Coin', 'Amount', 'Total Price ($)', 'Status', 'Payment Method', 'Wallet/Number', 'User Proof', 'Admin Proof'];
    
    const rows = transactions.map(t => [
      t.id,
      t.type.toUpperCase(),
      new Date(t.timestamp).toISOString(),
      t.userEmail,
      t.coinSymbol,
      t.amount,
      t.totalPrice,
      t.status,
      'paymentMethod' in t ? (t as any).paymentMethod : 'N/A',
      'paymentNumber' in t ? (t as any).paymentNumber : ('walletAddress' in t ? (t as any).walletAddress : 'N/A'),
      t.userScreenshotURL,
      t.adminScreenshotURL || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bittred_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-10 text-center text-slate-500">যাচাই করা হচ্ছে...</div>;
  if (!authorized) return <Navigate to="/" />;

  const filteredTx = filter === 'all' ? transactions : transactions.filter(t => t.status === TransactionStatus.PENDING);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 drop-shadow-md">
          <ShieldAlert className="text-violet-500" /> অ্যাডমিন কনসোল
        </h1>
        <div className="flex gap-2 bg-white/5 p-1 rounded-xl backdrop-blur-sm border border-white/5">
          <button onClick={() => setFilter('pending')} className={`px-4 py-2 rounded-lg text-sm transition-all ${filter === 'pending' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>অপেক্ষমান</button>
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm transition-all ${filter === 'all' ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>সকল ইতিহাস</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Transactions List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-slate-400 text-sm uppercase font-semibold mb-4 ml-1">লেনদেন রিকুয়েস্ট</h2>
          {filteredTx.length === 0 && <div className="p-8 text-center text-slate-500 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-sm">কোন রিকুয়েস্ট নেই।</div>}
          
          {filteredTx.map((tx) => (
            <div key={tx.id} className="bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex flex-col gap-4 hover:border-white/10 transition-all shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase border ${tx.type === 'buy' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>{tx.type}</span>
                    <span className="text-slate-200 font-medium">{tx.amount} {tx.coinSymbol}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{tx.userEmail}</div>
                  <div className="text-xs text-slate-500 mt-0.5 font-mono">ID: {tx.id}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-white">${tx.totalPrice.toFixed(2)}</div>
                  <div className={`text-xs capitalize font-medium ${tx.status === 'pending' ? 'text-amber-400' : tx.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    স্ট্যাটাস: {tx.status}
                  </div>
                  <button 
                    onClick={() => setSelectedChatRequest(tx)}
                    className="mt-2 text-xs text-violet-400 hover:text-violet-300 flex items-center justify-end gap-1 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" /> ব্যবহারকারীর সাথে চ্যাট
                  </button>
                </div>
              </div>

              <div className="bg-black/20 p-3 rounded-lg text-xs text-slate-300 space-y-1 font-mono border border-white/5">
                { 'paymentMethod' in tx && <p>মেথড: {(tx as any).paymentMethod}</p> }
                { 'paymentNumber' in tx && <p>নম্বর: {(tx as any).paymentNumber}</p> }
                { 'walletAddress' in tx && <p>ওয়ালেট: {(tx as any).walletAddress}</p> }
              </div>

              {tx.status === TransactionStatus.PENDING && (
                <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row gap-4 items-center">
                  <a href={tx.userScreenshotURL} target="_blank" rel="noreferrer" className="text-blue-400 text-sm hover:underline flex items-center gap-1">
                    <ImageIcon className="w-4 h-4"/> ব্যবহারকারীর প্রমাণ
                  </a>

                  <div className="flex-grow"></div>

                  {/* Admin Action Area */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative overflow-hidden">
                        <input 
                          type="file" 
                          onChange={(e) => e.target.files && setAdminProofFile(e.target.files[0])}
                          className="absolute opacity-0 w-full h-full cursor-pointer"
                        />
                        <button className={`px-3 py-2 rounded-lg text-xs border border-white/10 text-slate-300 hover:bg-white/10 transition-all ${adminProofFile ? 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10' : 'bg-white/5'}`}>
                          {adminProofFile ? 'প্রমাণ সংযুক্ত' : 'প্রমাণ সংযুক্ত করুন'}
                        </button>
                    </div>
                    
                    <button 
                      onClick={() => handleAction(tx, TransactionStatus.REJECTED)}
                      disabled={processingId === tx.id}
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-4 py-2 rounded-lg text-sm border border-rose-500/20 transition-colors backdrop-blur-sm"
                    >
                      বাতিল
                    </button>
                    <button 
                      onClick={() => handleAction(tx, TransactionStatus.APPROVED)}
                      disabled={processingId === tx.id}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg shadow-emerald-900/20 transition-colors border border-emerald-500/20"
                    >
                      {processingId === tx.id ? 'প্রক্রিয়াধীন...' : 'অনুমোদন'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar: Logs & Stats */}
        <div className="space-y-8">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400"/> অডিট লগ</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {logs.map((log) => (
                <div key={log.id} className="text-xs border-l-2 border-slate-600 pl-3 py-1 hover:border-emerald-500 transition-colors">
                   <div className="text-slate-300 font-semibold">{log.actionType}</div>
                   <div className="text-slate-500 truncate">{log.detail}</div>
                   <div className="text-[10px] text-slate-600 mt-1">{new Date(log.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-violet-900/10 backdrop-blur-md border border-violet-500/20 p-6 rounded-2xl">
             <h3 className="text-violet-400 font-bold mb-2">অ্যাডমিন গাইড</h3>
             <ul className="text-xs text-slate-400 list-disc pl-4 space-y-2">
               <li>অনুমোদন করার আগে ব্যবহারকারীর পেমেন্ট নম্বর যাচাই করুন।</li>
               <li>অনুমোদন করার সময় সর্বদা পেআউট/ট্রান্সফারের স্ক্রিনশট সংযুক্ত করুন।</li>
               <li>বাতিল করা লেনদেন পুনরায় খোলা যাবে না।</li>
             </ul>
             <button 
               onClick={exportCSV}
               className="mt-4 w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 py-2 rounded-lg text-sm transition-colors border border-white/5"
             >
                <Download className="w-4 h-4" /> CSV এক্সপোর্ট
             </button>
          </div>
        </div>
      </div>

      {/* Admin Chat Modal */}
      {selectedChatRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900/90 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl backdrop-blur-xl">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
               <h3 className="text-white font-bold">চ্যাট: {selectedChatRequest.userEmail}</h3>
               <button onClick={() => setSelectedChatRequest(null)} className="text-slate-400 hover:text-white">
                  <CloseIcon className="w-5 h-5"/>
               </button>
            </div>
            <div className="p-4">
               <ChatWindow requestId={selectedChatRequest.id} isAdminView={true} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;