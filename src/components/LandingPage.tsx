import React, { useState } from 'react';
import { 
  Sparkles, Store, ShieldCheck, ArrowRight, Zap, CheckCircle2, 
  BarChart3, Smartphone, Laptop, Globe, Layers, Users, Database,
  PlusCircle, ShoppingCart, Pill, Package, Wrench, ChevronRight
} from 'lucide-react';
import { BusinessType, Tenant } from '../types';

interface LandingPageProps {
  tenants: Tenant[];
  onOpenStoreDashboard: (tenantId: string) => void;
  onOpenSuperAdmin: () => void;
  onCreateTenant: (newTenant: Omit<Tenant, 'id' | 'createdAt'>) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  tenants,
  onOpenStoreDashboard,
  onOpenSuperAdmin,
  onCreateTenant
}) => {
  const [activeNiche, setActiveNiche] = useState<BusinessType>('pharmacy');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New store form state
  const [newStoreName, setNewStoreName] = useState('');
  const [newBusinessType, setNewBusinessType] = useState<BusinessType>('grocery');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');

  // Interactive Quote Calculator for Custom Software
  const [quotePlatform, setQuotePlatform] = useState<'web' | 'mobile' | 'both'>('web');
  const [quoteModules, setQuoteModules] = useState<{ [key: string]: boolean }>({
    inventory: true,
    pos: true,
    ecommerce: true,
    crm: false,
    ai: false,
  });

  const toggleModule = (key: string) => {
    setQuoteModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const calculatedQuote = () => {
    let base = quotePlatform === 'web' ? 35000 : quotePlatform === 'mobile' ? 45000 : 70000;
    if (quoteModules.inventory) base += 10000;
    if (quoteModules.pos) base += 15000;
    if (quoteModules.ecommerce) base += 20000;
    if (quoteModules.crm) base += 12000;
    if (quoteModules.ai) base += 25000;
    return base;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    const slug = newStoreName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const newTenantData: Omit<Tenant, 'id' | 'createdAt'> = {
      name: newStoreName,
      slug,
      businessType: newBusinessType,
      ownerName: newOwnerName || 'সম্মানিত স্বত্বাধিকারী',
      email: `${slug}@example.com`,
      phone: newPhone || '+880 1700-000000',
      address: newAddress || 'ঢাকা, বাংলাদেশ',
      currency: '৳',
      plan: 'professional',
      status: 'active',
      subscriptionExpiry: '2027-04-30',
      monthlyFee: 1999,
      quotas: {
        maxBranches: 3,
        maxUsers: 10,
        maxProducts: 10000,
        maxMonthlyInvoices: 5000,
        storageGb: 10,
      },
      usage: {
        currentBranches: 1,
        currentUsers: 1,
        currentProducts: 0,
        currentMonthlyInvoices: 0,
        currentStorageMb: 25,
      },
      features: {
        pos: true,
        ecommerce: true,
        crm: true,
        hrm: true,
        ai: true,
        pharmacyBatch: newBusinessType === 'pharmacy',
        imeiWarranty: newBusinessType === 'electronics',
        multiWarehouse: newBusinessType === 'warehouse',
      },
    };

    onCreateTenant(newTenantData);
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-purple-100 selection:text-purple-900">
      {/* Top Banner & Quick Controls */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 font-bold text-[10px] uppercase tracking-wider border border-purple-400/30">
              JH Soft Corporation
            </span>
            <span>JH IMSE: এন্টারপ্রাইজ মাল্টি-টেন্যান্ট ERP, ইনভেন্টরি POS ও ই-কমার্স সাইট বিল্ডার</span>
            <span className="hidden md:inline text-purple-300">• হেল্পলাইন: +8801940999830</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSuperAdmin}
              className="px-2.5 py-1 bg-purple-800/80 hover:bg-purple-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> সুপার অ্যাডমিন কন্ট্রোল
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1 bg-white text-purple-950 hover:bg-purple-100 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" /> ফ্রি ট্রায়াল স্টোর খুলুন
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold mb-6">
              <Store className="w-4 h-4 text-purple-700" />
              মুদি দোকান • ফার্মেসি • ইলেকট্রনিক্স • পাইকারি গোডাউন—সব ব্যবসার স্বয়ংসম্পূর্ণ সিস্টেম
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              JH IMSE: আপনার ব্যবসার ইনভেন্টরি, POS ও <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800">অনলাইন ই-কমার্স সাইট</span>
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
              JH Soft Corporation নির্মিত স্বয়ংসম্পূর্ণ প্ল্যাটফর্ম। আপনার প্রতিষ্ঠানে পান দ্রুততম POS ক্যাশ কাউন্টার, ডিজিটাল বাকি খাতা, ড্রাগ এক্সপায়ারি ও ওয়ারেন্টি ট্র্যাকিং এবং <strong>লাইভ অনলাইন স্টোরফ্রন্ট</strong>।
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-2xl shadow-lg hover:shadow-purple-700/25 transition flex items-center gap-2 text-sm"
              >
                <Store className="w-4 h-4" /> আপনার ফ্রি স্টোর তৈরি করুন <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenStoreDashboard('tenant-1')}
                className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-2xl border border-slate-300 shadow-xs transition flex items-center gap-2 text-sm"
              >
                <Zap className="w-4 h-4 text-purple-600" /> লাইভ ডেমো ড্যাশবোর্ড দেখুন
              </button>
            </div>
          </div>

          {/* Interactive Niche Switcher Live Preview */}
          <div className="mt-14 max-w-5xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80">
            <div className="text-center mb-6">
              <span className="text-xs uppercase font-bold tracking-wider text-purple-700">ব্যবসার ধরন অনুযায়ী কাস্টমাইজড ইন্টারফেস</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">যেকোনো দোকানের ক্যাটাগরি বেছে নিয়ে প্রিভিউ দেখুন:</h3>
            </div>

            {/* Niche Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
              {[
                { id: 'pharmacy', label: 'ফার্মেসি ও ড্রাগ স্টোর', icon: Pill, tenantId: 'tenant-1' },
                { id: 'grocery', label: 'মুদি ও ডিপার্টমেন্টাল', icon: ShoppingCart, tenantId: 'tenant-2' },
                { id: 'electronics', label: 'ইলেকট্রনিক্স ও গ্যাজেট', icon: Laptop, tenantId: 'tenant-3' },
                { id: 'warehouse', label: 'পাইকারি ও ওয়্যারহাউস', icon: Package, tenantId: 'tenant-4' },
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeNiche === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveNiche(item.id as BusinessType)}
                    className={`p-3.5 rounded-2xl text-left border transition flex flex-col gap-2 ${
                      isActive
                        ? 'bg-purple-50 border-purple-600 text-purple-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-purple-700' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Niche Highlights */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 grid md:grid-cols-2 gap-6 items-center">
              <div>
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
                  {activeNiche === 'pharmacy' && 'ফার্মেসি স্পেশালাইজড মোড'}
                  {activeNiche === 'grocery' && 'সুপারশপ ও মুদি স্পেশাল'}
                  {activeNiche === 'electronics' && 'সিরিয়াল ও ওয়ারেন্টি স্পেশাল'}
                  {activeNiche === 'warehouse' && 'মাল্টি-ডিপো হোলসেল মোড'}
                </span>

                <h4 className="text-xl font-bold mt-2 text-white">
                  {activeNiche === 'pharmacy' && 'ওষুধের মেয়াদ শেষ (Expiry), ব্যাচ নম্বর ও প্রেসক্রিপশন'}
                  {activeNiche === 'grocery' && 'বারকোড স্ক্যানার, ডিজিটাল স্কেল ওজন ও দ্রুত ক্যাশ মেমো'}
                  {activeNiche === 'electronics' && 'IMEI সিরিয়াল ট্র্যাকিং, সার্ভিসিং ও ১-ক্লিক ওয়ারেন্টি স্লিপ'}
                  {activeNiche === 'warehouse' && 'কার্টুন/বস্তা স্টক ট্র্যাকিং, ডিপো শিফটিং ও পাইকারি দর'}
                </h4>

                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {activeNiche === 'pharmacy' && 'কোন ওষুধ আগামী ৩০ দিনে এক্সপায়ার হবে ড্যাশবোর্ডে লাল সতর্কতা দেখাবে। জেনেরিক নাম লিখে সার্চ দিয়ে বিকল্প ওষুধ সাজেস্ট করে।'}
                  {activeNiche === 'grocery' && 'কীবোর্ড শর্টকাট দিয়ে মাউস ছাড়া ৩ সেকেন্ডে মেমো প্রিন্ট। চাল, ডাল, আলুর মতো লুজ আইটেমের জন্য টাচস্ক্রিন বাটন।'}
                  {activeNiche === 'electronics' && 'মোবাইল বা টিভির আইএমইআই স্ক্যান করে বিক্রি। ইনভয়েসের নিচে ওয়ারেন্টির কিউআর কোড অটোমেটিক প্রিন্ট হবে।'}
                  {activeNiche === 'warehouse' && 'গোডাউন-১ থেকে গোডাউন-২ এ স্টক ট্রান্সফার এবং ১০ পিসের অধিক অর্ডারে অটোমেটিক পাইকারি মূল্য কার্যকর।'}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      const t = tenants.find(x => x.businessType === activeNiche) || tenants[0];
                      onOpenStoreDashboard(t.id);
                    }}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
                  >
                    এই ক্যাটাগরির লাইভ ERP ড্যাশবোর্ড দেখুন <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mini visual mockup box */}
              <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-purple-400 font-bold">● LIVE DEMO PREVIEW</span>
                  <span className="text-slate-400 text-[10px]">Stocky UI Engine</span>
                </div>
                <div className="space-y-1.5 text-slate-300 text-[11px]">
                  <div className="flex justify-between">
                    <span>আজকের মোট বিক্রয়:</span>
                    <span className="text-emerald-400 font-bold">৳ ১৮,৫৪০.০০</span>
                  </div>
                  <div className="flex justify-between">
                    <span>বাকি খাতায় বকেয়া:</span>
                    <span className="text-rose-400 font-bold">৳ ৪,২০০.০০ (৩ জন গ্রাহক)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>অনলাইন স্টোরে অর্ডার:</span>
                    <span className="text-amber-400 font-bold">২টি নতুন পেন্ডিং</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg border border-purple-500/30 text-purple-200 text-[10px]">
                    স্মার্ট ইনভেন্টরি অ্যালার্ট: &quot;গত সপ্তাহের তুলনায় আজ বিক্রি ২৪% বৃদ্ধি পেয়েছে!&quot;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IT Agency & Custom Development Showcase */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold text-purple-700 tracking-wider">আমাদের আইটি সার্ভিস পোর্টাল</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              কাস্টম ওয়েবসাইট ও সফটওয়্যার ডেভেলপমেন্ট সলিউশন
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              রেডিমেড SaaS ছাড়াও আপনার যেকোনো বিশেষ চাহিদামাফিক ওয়েব প্ল্যাটফর্ম, মোবাইল অ্যাপ এবং কাস্টম ERP আমরা প্রস্তুত করে দিই।
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-purple-400 transition">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">কাস্টম ওয়েব অ্যাপ্লিকেশন ও পোর্টাল</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Next.js, React ও আধুনিক টেক স্ট্যাক দিয়ে রিয়েল-টাইম মাল্টি-ইউজার ড্যাশবোর্ড, স্কুল/কলেজ ম্যানেজমেন্ট ও কোম্পানি ওয়েবসাইট।
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> এসইও ফ্রেন্ডলি ও দ্রুত লোডিং</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600" /> নিরাপদ কাস্টম অথেনটিকেশন</li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-purple-400 transition">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">অ্যান্ড্রয়েড ও আইওএস মোবাইল অ্যাপস</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                দোকানদার এবং সাধারণ কাস্টমারদের জন্য ক্রস-প্ল্যাটফর্ম মোবাইল অ্যাপ। পুশ নোটিফিকেশন, ব্লুটুথ প্রিন্টার কানেকশন ও অফলাইন সিঙ্ক।
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> অফলাইন-ফার্স্ট ক্যাশ কাউন্টার</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> প্লেস্টোর ও অ্যাপস্টোর সাবমিশন</li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-purple-400 transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Globe className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">ই-কমার্স সাইট ও পেমেন্ট ইন্টিগ্রেশন</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                বিকাশ (bKash), নগদ (Nagad), রকেট ও ভিসা/মাস্টারকার্ড পেমেন্ট গেটওয়ে ইন্টিগ্রেশন সহ হাই-কনভার্টিং ই-কমার্স সাইট।
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ইনস্ট্যান্ট এসএমএস ও ওটিপি অ্যালার্ট</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> অটোমেটেড কুরিয়ার ও চালান ট্র্যাকিং</li>
              </ul>
            </div>
          </div>

          {/* Interactive Project Cost Estimator */}
          <div className="mt-12 bg-purple-50 rounded-3xl p-6 sm:p-8 border border-purple-200">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-4 max-w-xl">
                <div>
                  <span className="text-xs font-bold uppercase text-purple-700">ইন্টারেক্টিভ খরচ ক্যালকুলেটর</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">আপনার কাস্টম প্রজেক্টের সম্ভাব্য খরচ হিসাব করুন</h3>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 block">প্ল্যাটফর্ম বেছে নিন:</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'web', label: 'ওয়েব অ্যাপ্লিকেশন' },
                      { id: 'mobile', label: 'মোবাইল অ্যাপ' },
                      { id: 'both', label: 'ওয়েব + মোবাইল কম্বো' },
                    ].map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setQuotePlatform(p.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          quotePlatform === p.id ? 'bg-purple-700 text-white shadow-xs' : 'bg-white text-slate-700 border border-purple-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">প্রয়োজনীয় ফিচারসমূহ সিলেক্ট করুন:</label>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {[
                      { id: 'inventory', label: 'ইনভেন্টরি ও স্টক' },
                      { id: 'pos', label: 'POS ক্যাশ কাউন্টার' },
                      { id: 'ecommerce', label: 'অনলাইন ই-কমার্স' },
                      { id: 'crm', label: 'CRM ও এসএমএস বাকি খাতা' },
                      { id: 'ai', label: 'গুগল এআই প্রেডিকশন' },
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => toggleModule(f.id)}
                        className={`px-2.5 py-1 rounded-lg border text-xs transition ${
                          quoteModules[f.id] ? 'bg-purple-200 text-purple-900 border-purple-400 font-semibold' : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {quoteModules[f.id] ? '✓ ' : '+ '}{f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estimate Display Card */}
              <div className="bg-white rounded-2xl p-6 border border-purple-200 shadow-md text-center min-w-[280px]">
                <span className="text-xs text-slate-500 font-medium">আনুমানিক ডেভেলপমেন্ট বাজেট:</span>
                <div className="text-3xl font-extrabold text-purple-700 mt-1">
                  ৳ {calculatedQuote().toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">ডেলিভারি সময়: ১৫ - ২৫ কার্যদিবস</p>
                <button
                  onClick={() => alert(`ধন্যবাদ! আপনার কাস্টম সফটওয়্যার চাহিদার কোটেশন জমা হয়েছে। আনুমানিক বাজেট: ৳ ${calculatedQuote().toLocaleString()}`)}
                  className="mt-4 w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  প্রজেক্ট ডিসকাশনের জন্য রিকোয়েস্ট পাঠান
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SaaS Pricing Plans */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs uppercase font-bold text-purple-700 tracking-wider">সাশ্রয়ী সাবস্ক্রিপশন প্যাকেজ</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              যেকোনো আকারের দোকানের জন্য উপযুক্ত প্ল্যান
            </h2>
            <div className="mt-4 inline-flex items-center p-1 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                  billingCycle === 'monthly' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                মাসিক বিলিং
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                  billingCycle === 'yearly' ? 'bg-purple-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                বাৎসরিক বিলিং <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full ml-1">২ মাস ফ্রি!</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">স্টার্টার প্ল্যান</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">ছোট মুদি ও খুচরা দোকান</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ৳ {billingCycle === 'monthly' ? '৯৯৯' : '৮৫০'}
                  </span>
                  <span className="text-xs text-slate-500">/ মাস</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">একটি আউটলেটের সম্পূর্ণ দৈনিক হিসাব ও বিক্রয়ের জন্য সেরা।</p>
                
                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> ১টি আউটলেট ও আনলিমিটেড পণ্য</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> POS ক্যাশ কাউন্টার ও রসিদ প্রিন্ট</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> কাস্টমার বাকি খাতা (ডিজিটাল লেজার)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> দৈনিক ও মাসিক লাভ-ক্ষতি রিপোর্ট</li>
                </ul>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-8 w-full py-2.5 bg-slate-100 hover:bg-purple-100 text-purple-900 font-bold rounded-xl text-xs transition"
              >
                ১৪ দিনের ফ্রি ট্রায়াল শুরু করুন
              </button>
            </div>

            {/* Professional (Highlighted) */}
            <div className="bg-white rounded-3xl p-6 border-2 border-purple-600 shadow-xl relative flex flex-col justify-between">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-700 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                সবচেয়ে জনপ্রিয়
              </span>
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase">প্রফেশনাল প্ল্যান</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">ফার্মেসি, সুপারশপ ও গ্যাজেট</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-purple-700">
                    ৳ {billingCycle === 'monthly' ? '১,৯৯৯' : '১,৬৫০'}
                  </span>
                  <span className="text-xs text-slate-500">/ মাস</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">ইনভেন্টরি, অনলাইন ই-কমার্স সাইট ও এসএমএস নোটিফিকেশন সহ কমপ্লিট সলিউশন।</p>
                
                <ul className="mt-6 space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2 font-semibold"><CheckCircle2 className="w-4 h-4 text-purple-600" /> স্টার্টার প্ল্যানের সকল ফিচার</li>
                  <li className="flex items-center gap-2 font-semibold"><CheckCircle2 className="w-4 h-4 text-purple-600" /> নিজস্ব অনলাইন ই-কমার্স ওয়েবসাইট</li>
                  <li className="flex items-center gap-2 font-semibold"><CheckCircle2 className="w-4 h-4 text-purple-600" /> এক্সপায়ারি ডেট, ব্যাচ ও IMEI ট্র্যাকিং</li>
                  <li className="flex items-center gap-2 font-semibold"><CheckCircle2 className="w-4 h-4 text-purple-600" /> বাকি কাস্টমারদের অটোমেটেড SMS অ্যালার্ট</li>
                  <li className="flex items-center gap-2 font-semibold"><CheckCircle2 className="w-4 h-4 text-purple-600" /> মাল্টি-ইউজার রোলস (মালিক, ম্যানেজার, ক্যাশিয়ার)</li>
                </ul>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-8 w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                এখনই প্রফেশনাল স্টোর খুলুন
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">এন্টারপ্রাইজ প্ল্যান</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">গোডাউন ও মাল্টি-ব্রাঞ্চ চেইন</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ৳ {billingCycle === 'monthly' ? '৩,৯৯৯' : '৩,৪০০'}
                  </span>
                  <span className="text-xs text-slate-500">/ মাস</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">আনলিমিটেড ওয়্যারহাউস, এইচআরএম, প্যারোল ও প্রেডিক্টিভ বিজনেস ইন্টেলিজেন্স।</p>
                
                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> আনলিমিটেড ব্রাঞ্চ ও সেন্ট্রাল ওয়্যারহাউস</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> HRM, স্টাফ হাজিরা ও কমিশন প্যারোল</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> অটোমেটেড সেলস ফোরকাস্টিং ও স্মার্ট ইনসাইটস</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> কাস্টম ডোমেইন কানেকশন ও ফ্রি SSL</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> ২৪/৭ ডেডিকেটেড ফোন ও অন-সাইট সাপোর্ট</li>
                </ul>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-8 w-full py-2.5 bg-slate-100 hover:bg-purple-100 text-purple-900 font-bold rounded-xl text-xs transition"
              >
                এন্টারপ্রাইজ একাউন্ট চালু করুন
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Engineering Team Showcase */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase font-bold text-purple-700 tracking-wider">JH Soft Corporation কোর টিম</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              আমাদের লিডারশিপ ও ইঞ্জিনিয়ারিং টিম
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              অভিজ্ঞ ডেভেলপার ও ডিজাইনারদের সরাসরি তত্ত্বাবধানে তৈরি আন্তর্জাতিক মানের এন্টারপ্রাইজ সফটওয়্যার।
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* 1. CEO & Main Developer */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center hover:border-purple-300 transition">
              <div className="w-16 h-16 rounded-full bg-purple-700 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                JA
              </div>
              <h3 className="font-bold text-base text-slate-900">Md Junayed Hossain Anik</h3>
              <p className="text-xs font-semibold text-purple-700 mt-0.5">CEO & Main Developer</p>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                JH Soft Corporation-এর প্রধান নির্বাহী ও কোর সফটওয়্যার আর্কিটেকচার ডেভেলপার।
              </p>
            </div>

            {/* 2. Architecture Designer */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center hover:border-purple-300 transition">
              <div className="w-16 h-16 rounded-full bg-indigo-700 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                MA
              </div>
              <h3 className="font-bold text-base text-slate-900">MD Abdullah</h3>
              <p className="text-xs font-semibold text-indigo-700 mt-0.5">Architecture Designer</p>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                মাল্টি-টেন্যান্ট ডেটাবেস ও হাই-স্কেলিং সিস্টেম আর্কিটেকচার পরিকল্পনাকারী।
              </p>
            </div>

            {/* 3. UI & UX Designer */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 text-center hover:border-purple-300 transition">
              <div className="w-16 h-16 rounded-full bg-emerald-700 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                HA
              </div>
              <h3 className="font-bold text-base text-slate-900">MD Husain Ahmed</h3>
              <p className="text-xs font-semibold text-emerald-700 mt-0.5">UI & UX Designer</p>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                সহজ, আকর্ষণীয় ও আধুনিক ইউজার এক্সপেরিয়েন্স ডিজাইনার।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-white font-bold text-base tracking-wide flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-xs">JH</span>
              JH IMSE — JH Soft Corporation
            </span>
            <p className="text-slate-400 text-xs mt-1">
              অফিসিয়াল যোগাযোগ: <strong className="text-slate-200">+8801940999830</strong> • ঢাকা, বাংলাদেশ
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Developed by Md Junayed Hossain Anik, MD Abdullah & MD Husain Ahmed
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-xs">
            <button onClick={onOpenSuperAdmin} className="text-purple-400 hover:underline font-semibold">সুপার অ্যাডমিন পোর্টাল</button>
            <button onClick={() => setShowCreateModal(true)} className="text-purple-400 hover:underline font-semibold">নতুন স্টোর তৈরি</button>
            <a href="tel:+8801940999830" className="text-emerald-400 hover:underline font-semibold">ফোন: +8801940999830</a>
          </div>
        </div>
      </footer>

      {/* Instant Store Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-purple-800 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">আপনার ফ্রি ট্রায়াল স্টোর খুলুন</h3>
                <p className="text-xs text-purple-200">১৪ দিনের সম্পূর্ণ অ্যাক্সেস, কোনো ক্রেডিট কার্ড লাগবে না</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-purple-200 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">দোকানের নাম (Store Name): *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মা ফার্মেসি / ভাই ভাই জেনারেল স্টোর"
                  value={newStoreName}
                  onChange={e => setNewStoreName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ব্যবসার ধরন (Business Category): *</label>
                <select
                  value={newBusinessType}
                  onChange={e => setNewBusinessType(e.target.value as BusinessType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="pharmacy">ফার্মেসি ও ড্রাগ স্টোর (মেয়াদ ও ব্যাচ ট্র্যাকিং সহ)</option>
                  <option value="grocery">মুদি দোকান ও সুপারশপ (বারকোড ও ডিজিটাল স্কেল সহ)</option>
                  <option value="electronics">ইলেকট্রনিক্স ও গ্যাজেট (IMEI ও ওয়ারেন্টি স্লিপ সহ)</option>
                  <option value="warehouse">পাইকারি ও সেন্ট্রাল গোডাউন (মাল্টি-ডিপো স্টক)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">স্বত্বাধিকারী / মালিকের নাম:</label>
                <input
                  type="text"
                  placeholder="আপনার নাম"
                  value={newOwnerName}
                  onChange={e => setNewOwnerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">মোবাইল নম্বর (এসএমএস ও লগইনের জন্য):</label>
                <input
                  type="tel"
                  placeholder="+880 17xxxxxxxx"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">দোকানের ঠিকানা:</label>
                <input
                  type="text"
                  placeholder="দোকান নং, বাজার বা রাস্তার নাম, জেলা"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <Store className="w-4 h-4" /> ইনস্ট্যান্ট স্টোর তৈরি ও ড্যাশবোর্ডে প্রবেশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
