import React from 'react';

export enum TransactionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum TransactionType {
  BUY = 'buy',
  SELL = 'sell'
}

export interface Coin {
  id: string;
  coinName: string;
  symbol: string;
  price: number;
  available: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  phone?: string;
  createdAt: number;
}

export interface AdminProfile {
  email: string;
  role: 'super' | 'editor';
  createdAt: number;
}

export interface BaseRequest {
  id: string;
  userId: string;
  userEmail: string; // Helper for UI
  coinId: string;
  coinSymbol: string; // Snapshot
  coinPriceAtRequest: number; // Snapshot
  amount: number; // Coin amount
  totalPrice: number; // Fiat amount
  userScreenshotURL: string;
  adminScreenshotURL?: string;
  status: TransactionStatus;
  note?: string;
  timestamp: number;
}

export interface BuyRequest extends BaseRequest {
  type: TransactionType.BUY;
  paymentMethod: string;
  paymentNumber: string;
}

export interface SellRequest extends BaseRequest {
  type: TransactionType.SELL;
  walletAddress: string;
}

export type TransactionRequest = BuyRequest | SellRequest;

export interface SiteSettings {
  currency: string;
  paymentMethods: string[];
  minimumBuy: number;
  minimumSell: number;
  fees: number; // Percentage
}

export interface AuditLog {
  id?: string;
  actorId: string;
  actorEmail: string;
  actionType: string;
  detail: string;
  timestamp: number;
}

export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  adminOnly?: boolean;
}

// --- NEW FEATURES ---

export interface ChatMessage {
  id?: string;
  requestId: string;
  senderId: string; // 'admin' or user UID
  senderEmail: string;
  text: string;
  isAdmin: boolean;
  timestamp: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  link?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}