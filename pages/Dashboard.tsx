
import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import { getUserTransactions } from '../services/db';
import { TransactionRequest, TransactionStatus } from '../types';
import { ChatWindow } from '../components/ChatWindow';
import * as RouterDOM from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, MessageSquare, X } from 'lucide-react';

const { Navigate } = RouterDOM;

const Dashboard: React.FC = () => {
  const [requests, setRequests] = useState<TransactionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [selectedRequest, setSelectedRequest] = useState<TransactionRequest | null>(null);

  useEffect(() => {
    const fetch = async () => {
      if (!auth.currentUser) return;
      const data = await getUserTransactions(auth.currentUser.uid, tab);
      setRequests(data);
      setLoading(false);
    };
    fetch();
  }, [tab, auth.currentUser]);

  if (!auth.currentUser) return <Navigate to="/login" />;

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.APPROVED: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case TransactionStatus.REJECTED: return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    }
  };

  const getStatusLabel = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.APPROVED: return 'অনুমোদিত';
      case TransactionStatus.REJECTED: return 'বাতিল';
      default: return 'অপেক্ষমান';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">ড্যাশবোর্ড</h1>
          <p className="text-slate-400">স্বাগতম, {auth.currentUser.displayName}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-white/10 pb-1">
        <button
          onClick={() => setTab('buy')}
          className={`pb-3 px-4 font-medium text-sm transition-all relative ${tab === 'buy' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          ক্রয় রিকুয়েস্ট
          {tab === 'buy' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>}
        </button>
        <button
          onClick={() => setTab('sell')}
          className={`pb-3 px-4 font-medium text-sm transition-all relative ${tab === 'sell' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
        >
          বিক্রয় রিকুয়েস্ট
          {tab === 'sell' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400 rounded-t-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>}
        </button>
      </div>

      {loading ? (
        <div className="text-slate-500">তথ্য লোড হচ্ছে...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-slate-400">কোন {tab === 'buy' ? 'ক্রয়' : 'বিক্রয়'} রিকুয়েস্ট পাওয়া যায়নি।</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-6 hover:bg-slate-900/60 hover:border-white/10 transition-all shadow-lg">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl font-bold text-white">{req.amount} {req.coinSymbol}</span>
                  <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(req.status)} flex items-center gap-1 backdrop-blur-sm`}>
                    {req.status === 'approved' ? <CheckCircle2 className="w-3 h-3"/> : req.status === 'rejected' ? <XCircle className="w-3 h-3"/> : <Clock className="w-3 h-3"/>}
                    {getStatusLabel(req.status)}
                  </span>
                </div>
                <div className="text-sm text-slate-400 space-y-1">
                  <p>মোট মূল্য: <span className="text-slate-200 font-mono">${req.totalPrice.toFixed(2)}</span></p>
                  <p>তারিখ: {new Date(req.timestamp).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 items-start md:items-end justify-center">
                 <button 
                   onClick={() => setSelectedRequest(req)}
                   className="bg-white/5 hover:bg-white/10 text-emerald-400 border border-white/10 hover:border-emerald-500/30 px-5 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 backdrop-blur-sm"
                 >
                   <MessageSquare className="w-4 h-4" /> বিস্তারিত ও চ্যাট
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ring-1 ring-white/10">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-white/10 bg-white/5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                রিকুয়েস্ট #{selectedRequest.id.slice(0, 6)}
                <span className={`text-xs px-2 py-0.5 rounded border ${getStatusColor(selectedRequest.status)}`}>{getStatusLabel(selectedRequest.status)}</span>
              </h3>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">লেনদেনের বিবরণ</h4>
                  <div className="bg-black/20 p-5 rounded-2xl border border-white/5 text-sm space-y-3 backdrop-blur-md">
                    <div className="flex justify-between"><span className="text-slate-400">কয়েন:</span> <span className="text-white font-medium">{selectedRequest.coinSymbol}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">পরিমাণ:</span> <span className="text-white font-medium">{selectedRequest.amount}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">মোট:</span> <span className="text-emerald-400 font-bold font-mono">${selectedRequest.totalPrice.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">তারিখ:</span> <span className="text-white">{new Date(selectedRequest.timestamp).toLocaleString()}</span></div>
                    
                    {'paymentMethod' in selectedRequest && (
                       <>
                         <div className="flex justify-between"><span className="text-slate-400">মেথড:</span> <span className="text-white">{(selectedRequest as any).paymentMethod}</span></div>
                         <div className="flex justify-between"><span className="text-slate-400">নম্বর:</span> <span className="text-white">{(selectedRequest as any).paymentNumber}</span></div>
                       </>
                    )}
                    {'walletAddress' in selectedRequest && (
                       <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-white/5">
                          <span className="text-slate-400">ওয়ালেট:</span> 
                          <span className="text-white font-mono text-xs break-all bg-white/5 p-2 rounded border border-white/5">{(selectedRequest as any).walletAddress}</span>
                       </div>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                     {selectedRequest.userScreenshotURL && (
                        <a href={selectedRequest.userScreenshotURL} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl text-center text-xs text-emerald-400 border border-white/10 hover:border-emerald-500/30 transition-all">
                          আপনার পেমেন্ট প্রমাণ
                        </a>
                     )}
                     {selectedRequest.adminScreenshotURL && (
                        <a href={selectedRequest.adminScreenshotURL} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl text-center text-xs text-violet-400 border border-white/10 hover:border-violet-500/30 transition-all">
                          অ্যাডমিন পেমেন্ট প্রমাণ
                        </a>
                     )}
                  </div>
                </div>

                {/* Chat Section */}
                <div>
                   <ChatWindow requestId={selectedRequest.id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;