
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { FAQItem } from '../types';

const FAQ: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'কিভাবে অ্যাকাউন্ট খুলব?',
      answer: 'উপরের ডানদিকে "সাইন আপ" বা "লগইন" বাটনে ক্লিক করুন। আপনার নাম, ইমেইল এবং পাসওয়ার্ড দিয়ে খুব সহজেই অ্যাকাউন্ট খুলতে পারবেন।'
    },
    {
      id: '2',
      question: 'টাকা জমা দিতে কতক্ষণ সময় লাগে?',
      answer: 'সাধারণত ৫-১০ মিনিটের মধ্যে আমরা পেমেন্ট ভেরিফাই করি। তবে নেটওয়ার্ক বা ব্যাংকিং সমস্যার কারণে মাঝে মাঝে ৩০ মিনিট পর্যন্ত সময় লাগতে পারে।'
    },
    {
      id: '3',
      question: 'আমি কি বিকাশ/নগদ ব্যবহার করতে পারি?',
      answer: 'হ্যাঁ, আমরা বিকাশ, নগদ, রকেট এবং ব্যাংক ট্রান্সফার সমর্থন করি। ক্রয়ের সময় আপনি মেথড নির্বাচন করতে পারবেন।'
    },
    {
      id: '4',
      question: 'সর্বনিম্ন কত ডলার কেনা/বেচা করা যায়?',
      answer: 'বর্তমানে আমাদের প্ল্যাটফর্মে সর্বনিম্ন ১০ ডলার সমমূল্যের ক্রিপ্টো কেনা বা বেচা করা যায়।'
    },
    {
      id: '5',
      question: 'ভুল ওয়ালেট অ্যাড্রেস দিলে কি হবে?',
      answer: 'ক্রিপ্টোকারেন্সি লেনদেন অপরিবর্তনযোগ্য। ভুল অ্যাড্রেসে পাঠালে তা ফেরত আনা সম্ভব নয়। তাই সাবমিট করার আগে অ্যাড্রেস বারবার চেক করুন।'
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-4 drop-shadow-md">সচরাচর জিজ্ঞাসিত প্রশ্ন</h1>
        <p className="text-slate-400">BitTred সম্পর্কে সাধারণ প্রশ্নের উত্তর খুঁজুন</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div 
            key={faq.id} 
            className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-emerald-500/30"
          >
            <button
              onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
              className="w-full flex items-center justify-between p-5 text-left"
            >
              <span className="font-semibold text-white flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
                {faq.question}
              </span>
              {openId === faq.id ? <ChevronUp className="text-slate-400"/> : <ChevronDown className="text-slate-400"/>}
            </button>
            
            {openId === faq.id && (
              <div className="px-5 pb-5 pt-0 text-slate-400 text-sm leading-relaxed border-t border-white/5 mt-2 pt-4">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;