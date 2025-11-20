
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase';
import { Coin, TransactionRequest, AuditLog, TransactionStatus, UserProfile, SiteSettings, ChatMessage, AppNotification } from '../types';

// --- Collections ---
const COINS_COL = 'coins';
const BUY_REQS_COL = 'buyRequests';
const SELL_REQS_COL = 'sellRequests';
const USERS_COL = 'users';
const ADMINS_COL = 'admins';
const LOGS_COL = 'logs';
const SETTINGS_COL = 'siteSettings';
const CHATS_COL = 'chats';
const NOTIFICATIONS_COL = 'notifications';

// --- Setup / Seed ---
export const getSiteSettings = async (): Promise<SiteSettings> => {
  const defaults: SiteSettings = {
    currency: 'BDT',
    paymentMethods: ['bKash', 'Nagad', 'Rocket', 'Bank Transfer'],
    minimumBuy: 1000,
    minimumSell: 1000,
    fees: 0.5
  };
  
  try {
    const docRef = doc(db, SETTINGS_COL, 'general');
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as SiteSettings;
    }
    return defaults;
  } catch (e) {
    console.warn("Using default settings due to error", e);
    return defaults;
  }
};

// --- Coins ---
export const fetchCoins = async (): Promise<Coin[]> => {
  const q = query(collection(db, COINS_COL), orderBy('symbol'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Coin));
};

// --- Users ---
export const createUserProfile = async (user: UserProfile) => {
  const userRef = doc(db, USERS_COL, user.uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) {
    await setDoc(userRef, user);
  }
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, USERS_COL, uid);
  await updateDoc(userRef, data);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, USERS_COL, uid);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists()) {
    return snapshot.data() as UserProfile;
  }
  return null;
};

export const checkIsAdmin = async (email: string): Promise<boolean> => {
  if (!email) return false;
  const q = query(collection(db, ADMINS_COL), where('email', '==', email));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// --- Transactions ---
export const createTransaction = async (req: Partial<TransactionRequest>, collectionName: string) => {
  const docRef = await addDoc(collection(db, collectionName), req);
  // Create initial chat placeholder
  await setDoc(doc(db, CHATS_COL, docRef.id), { 
    requestId: docRef.id, 
    users: [req.userId, 'admin'],
    lastMessage: 'Request created',
    updatedAt: Date.now()
  });
  return docRef.id;
};

export const getUserTransactions = async (userId: string, type: 'buy' | 'sell'): Promise<TransactionRequest[]> => {
  const col = type === 'buy' ? BUY_REQS_COL : SELL_REQS_COL;
  const q = query(collection(db, col), where('userId', '==', userId), orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  // @ts-ignore - dynamic typing for demo
  return snapshot.docs.map(d => ({ id: d.id, ...d.data(), type } as TransactionRequest));
};

// --- Admin Actions ---
export const getAllTransactions = async (type: 'buy' | 'sell'): Promise<TransactionRequest[]> => {
  const col = type === 'buy' ? BUY_REQS_COL : SELL_REQS_COL;
  const q = query(collection(db, col), orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  // @ts-ignore
  return snapshot.docs.map(d => ({ id: d.id, ...d.data(), type } as TransactionRequest));
};

export const updateTransactionStatus = async (
  id: string, 
  type: 'buy' | 'sell', 
  status: TransactionStatus, 
  userId: string,
  adminScreenshotURL?: string,
  adminEmail?: string
) => {
  const col = type === 'buy' ? BUY_REQS_COL : SELL_REQS_COL;
  const ref = doc(db, col, id);
  
  const updateData: any = { status };
  if (adminScreenshotURL) updateData.adminScreenshotURL = adminScreenshotURL;

  await updateDoc(ref, updateData);

  // Send Notification to User (Translated)
  const banglaStatus = status === TransactionStatus.APPROVED ? 'অনুমোদিত' : 'বাতিল';
  const banglaType = type === 'buy' ? 'ক্রয়' : 'বিক্রয়';

  await createNotification({
    userId,
    title: `রিকুয়েস্ট ${banglaStatus}`,
    message: `আপনার ${banglaType} রিকুয়েস্ট #${id.slice(0,6)} ${banglaStatus} করা হয়েছে।`,
    read: false,
    timestamp: Date.now()
  });

  if (adminEmail) {
    await logAction(adminEmail, type === 'buy' ? 'APPROVE_BUY' : 'APPROVE_SELL', `Updated tx ${id} to ${status}`);
  }
};

// --- Logs ---
export const logAction = async (actorEmail: string, actionType: string, detail: string) => {
  const log: AuditLog = {
    actorId: 'admin', // Simplified
    actorEmail,
    actionType,
    detail,
    timestamp: Date.now()
  };
  await addDoc(collection(db, LOGS_COL), log);
};

export const fetchLogs = async (): Promise<AuditLog[]> => {
  const q = query(collection(db, LOGS_COL), orderBy('timestamp', 'desc'), limit(50));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));
};

// --- Chat System ---
export const sendMessage = async (requestId: string, message: Partial<ChatMessage>) => {
  const chatRef = collection(db, CHATS_COL, requestId, 'messages');
  await addDoc(chatRef, {
    ...message,
    timestamp: Date.now()
  });
  
  // Update metadata for sorting/list views if needed
  await setDoc(doc(db, CHATS_COL, requestId), {
    lastMessage: message.text,
    lastSender: message.senderId,
    updatedAt: Date.now()
  }, { merge: true });
};

export const subscribeToChat = (requestId: string, callback: (messages: ChatMessage[]) => void): Unsubscribe => {
  const q = query(
    collection(db, CHATS_COL, requestId, 'messages'), 
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
    callback(msgs);
  });
};

// --- Notifications ---
export const createNotification = async (notif: Omit<AppNotification, 'id'>) => {
  await addDoc(collection(db, NOTIFICATIONS_COL), notif);
};

export const subscribeToNotifications = (userId: string, callback: (notifs: AppNotification[]) => void): Unsubscribe => {
  const q = query(
    collection(db, NOTIFICATIONS_COL), 
    where('userId', '==', userId),
    orderBy('timestamp', 'desc'),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
    callback(notifs);
  });
};

export const markNotificationRead = async (notifId: string) => {
  await updateDoc(doc(db, NOTIFICATIONS_COL, notifId), { read: true });
};

    // ... (আগের সব কোড ঠিক থাকবে, ফাইলের শেষে এগুলো যুক্ত করুন) ...

// --- Coin Management (Admin) ---

export const updateCoin = async (coinId: string, data: Partial<Coin>) => {
  const ref = doc(db, 'coins', coinId);
  await updateDoc(ref, {
    ...data,
    updatedAt: Date.now()
  });
};

export const addNewCoin = async (coinData: any) => {
  // ID তৈরি করা হচ্ছে symbol থেকে (যেমন: BTC -> btc)
  const id = coinData.symbol.toLowerCase();
  const ref = doc(db, 'coins', id);
  
  await setDoc(ref, {
    id,
    ...coinData,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
};
