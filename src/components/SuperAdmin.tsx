import React, { useState } from 'react';
import { 
  ShieldCheck, Store, DollarSign, Users, AlertCircle, ArrowLeft,
  Search, CheckCircle2, XCircle, Settings2, Sparkles, RefreshCw,
  Bell, ExternalLink, Calendar, Plus, Building2, Key, HardDrive,
  CreditCard, Globe, BarChart3, TrendingUp, Layers, Check,
  Copy, Printer, Award, Filter, ChevronRight, AlertTriangle
} from 'lucide-react';
import { 
  Tenant, BusinessType, PlanTier, TenantStatus, 
  SubscriptionPackage, SubscriptionTransaction, CustomDomainRequest, 
  BroadcastNotice, LicenseKeyItem 
} from '../types';
import { 
  INITIAL_SUBSCRIPTION_PACKAGES, 
  INITIAL_SUBSCRIPTION_TRANSACTIONS, 
  INITIAL_CUSTOM_DOMAINS, 
  INITIAL_BROADCAST_NOTICES, 
  INITIAL_LICENSE_KEYS,
  SAAS_MONTHLY_EARNINGS 
} from '../data/mockData';
import { CreateTenantModal } from './CreateTenantModal';
import { TenantLicenseModal } from './TenantLicenseModal';
import { EditQuotaModal } from './EditQuotaModal';

interface SuperAdminProps {
  tenants: Tenant[];
  onUpdateTenant: (updated: Tenant) => void;
  onImpersonateTenant: (tenantId: string) => void;
  onBackToLanding: () => void;
  systemBroadcast: string;
  onSetSystemBroadcast: (msg: string) => void;
  onCreateTenant: (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => void;
}

export const SuperAdmin: React.FC<SuperAdminProps> = ({
  tenants,
  onUpdateTenant,
  onImpersonateTenant,
  onBackToLanding,
  systemBroadcast,
  onSetSystemBroadcast,
  onCreateTenant,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'companies' | 'packages' | 'licenses' | 'domains' | 'transactions' | 'broadcasts'
  >('dashboard');

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | BusinessType>('all');
  const [selectedPlan, setSelectedPlan] = useState<'all' | PlanTier>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | TenantStatus>('all');
  const [chartPeriod, setChartPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [licenseModalTenant, setLicenseModalTenant] = useState<Tenant | null>(null);
  const [quotaModalTenant, setQuotaModalTenant] = useState<Tenant | null>(null);
  const [editingFeaturesTenant, setEditingFeaturesTenant] = useState<Tenant | null>(null);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Collections state
  const [packages, setPackages] = useState<SubscriptionPackage[]>(INITIAL_SUBSCRIPTION_PACKAGES);
  const [transactions, setTransactions] = useState<SubscriptionTransaction[]>(INITIAL_SUBSCRIPTION_TRANSACTIONS);
  const [domains, setDomains] = useState<CustomDomainRequest[]>(INITIAL_CUSTOM_DOMAINS);
  const [broadcasts, setBroadcasts] = useState<BroadcastNotice[]>(INITIAL_BROADCAST_NOTICES);
  const [licenses, setLicenses] = useState<LicenseKeyItem[]>(INITIAL_LICENSE_KEYS);

  // License Generator State in Licenses Tab
  const [newLicTenantId, setNewLicTenantId] = useState<string>(tenants[0]?.id || '');
  const [newLicPlan, setNewLicPlan] = useState<PlanTier>('enterprise');
  const [newLicDuration, setNewLicDuration] = useState<number>(12);
  const [generatedSuccessKey, setGeneratedSuccessKey] = useState<string | null>(null);

  // New Broadcast Form
  const [bcTitle, setBcTitle] = useState('');
  const [bcMessage, setBcMessage] = useState('');
  const [bcType, setBcType] = useState<BroadcastNotice['type']>('info');
  const [bcTarget, setBcTarget] = useState<BroadcastNotice['target']>('all');

  // Overall SaaS Metrics calculations
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const graceOrSuspended = tenants.filter(t => t.status === 'grace_period' || t.status === 'suspended' || t.status === 'expired').length;
  const totalMRR = tenants.reduce((acc, t) => acc + (t.status === 'active' ? t.monthlyFee : 0), 0);
  const totalARR = totalMRR * 12;

  // Plan counts
  const enterpriseCount = tenants.filter(t => t.plan === 'enterprise').length;
  const proCount = tenants.filter(t => t.plan === 'professional').length;
  const starterCount = tenants.filter(t => t.plan === 'starter').length;
  const trialCount = tenants.filter(t => t.plan === 'trial').length;

  // Filtered tenants list
  const filteredTenants = tenants.filter(t => {
    if (selectedCategory !== 'all' && t.businessType !== selectedCategory) return false;
    if (selectedPlan !== 'all' && t.plan !== selectedPlan) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) || 
        t.ownerName.toLowerCase().includes(q) || 
        t.slug.toLowerCase().includes(q) ||
        (t.phone && t.phone.toLowerCase().includes(q)) ||
        (t.tradeLicenseNo && t.tradeLicenseNo.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Recent expired or expiring within 7 days
  const expiringTenants = tenants.filter(t => {
    const diff = (new Date(t.subscriptionExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });

  // Actions
  const handleToggleStatus = (tenant: Tenant) => {
    const newStatus: TenantStatus = tenant.status === 'active' ? 'suspended' : 'active';
    const updated: Tenant = { ...tenant, status: newStatus };
    onUpdateTenant(updated);
  };

  const handleExtendSubscription = (tenant: Tenant, months: number = 1) => {
    const current = new Date(tenant.subscriptionExpiry);
    current.setMonth(current.getMonth() + months);
    const updated: Tenant = {
      ...tenant,
      subscriptionExpiry: current.toISOString().slice(0, 10),
      status: 'active',
    };
    onUpdateTenant(updated);
    alert(`${tenant.name}-এর সাবস্ক্রিপশন মেয়াদ আরও ${months * 30} দিন বাড়ানো হয়েছে!`);
  };

  const handleSaveFeatureFlag = (featureKey: keyof Tenant['features']) => {
    if (!editingFeaturesTenant) return;
    const updated: Tenant = {
      ...editingFeaturesTenant,
      features: {
        ...editingFeaturesTenant.features,
        [featureKey]: !editingFeaturesTenant.features[featureKey],
      },
    };
    setEditingFeaturesTenant(updated);
    onUpdateTenant(updated);
  };

  const handleGenerateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTenant = tenants.find(t => t.id === newLicTenantId);
    if (!targetTenant) return;

    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const generatedKey = `JHIMSE-${newLicPlan.toUpperCase().slice(0, 3)}-2026-${randomSuffix}-${randomCode}`;

    const exp = new Date();
    exp.setMonth(exp.getMonth() + newLicDuration);

    const newLic: LicenseKeyItem = {
      id: 'lic-' + Date.now(),
      key: generatedKey,
      tenantId: targetTenant.id,
      tenantName: targetTenant.name,
      plan: newLicPlan,
      durationMonths: newLicDuration,
      generatedAt: new Date().toISOString().slice(0, 10),
      expiresAt: exp.toISOString().slice(0, 10),
      status: 'active',
      maxBranches: newLicPlan === 'enterprise' ? 25 : newLicPlan === 'professional' ? 3 : 1,
      maxUsers: newLicPlan === 'enterprise' ? 50 : newLicPlan === 'professional' ? 10 : 3,
    };

    setLicenses(prev => [newLic, ...prev]);
    setGeneratedSuccessKey(generatedKey);

    // Also update tenant license
    const updatedTenant: Tenant = {
      ...targetTenant,
      licenseKey: generatedKey,
      plan: newLicPlan,
      subscriptionExpiry: exp.toISOString().slice(0, 10),
      status: 'active',
    };
    onUpdateTenant(updatedTenant);
  };

  const handleDomainStatusChange = (domainId: string, status: CustomDomainRequest['status']) => {
    setDomains(prev => prev.map(d => d.id === domainId ? { 
      ...d, 
      status, 
      sslStatus: status === 'active' ? 'secured' : 'failed' 
    } : d));
  };

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcTitle.trim() || !bcMessage.trim()) return;

    const newBc: BroadcastNotice = {
      id: 'bc-' + Date.now(),
      title: bcTitle,
      message: bcMessage,
      type: bcType,
      target: bcTarget,
      createdAt: 'আজ, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      active: true,
    };

    setBroadcasts(prev => [newBc, ...prev]);
    onSetSystemBroadcast(bcMessage);
    setBcTitle('');
    setBcMessage('');
    setShowBroadcastModal(false);
  };

  const toggleBroadcastActive = (id: string) => {
    setBroadcasts(prev => prev.map(b => {
      if (b.id === id) {
        const nextActive = !b.active;
        if (nextActive) onSetSystemBroadcast(b.message);
        return { ...b, active: nextActive };
      }
      return b;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-20">
      {/* Top Super Admin Navbar */}
      <header className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-950 text-white px-6 py-4 flex flex-col md:flex-row items-center justify-between shadow-lg gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center font-bold shadow-md ring-2 ring-purple-400/30">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <h1 className="font-black text-base tracking-wide flex items-center gap-2">
              JH IMSE Super Admin Command Center
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30 font-semibold">
                JH Soft Corporation
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              এন্টারপ্রাইজ মাল্টি-কোম্পানি সাবস্ক্রিপশন, লাইসেন্স ও SaaS রাজস্ব প্ল্যাটফর্ম • হেল্পলাইন: +8801940999830
            </p>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" /> নতুন কোম্পানি অনবোর্ডিং
          </button>

          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-3.5 py-2 bg-purple-800/80 hover:bg-purple-700 text-purple-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-purple-600/40"
          >
            <Bell className="w-4 h-4 text-amber-300" /> লাইভ সিস্টেম নোটিশ
          </button>

          <button
            onClick={onBackToLanding}
            className="px-3 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> মেইন সাইটে ফিরুন
          </button>
        </div>
      </header>

      {/* Live System Broadcast Indicator Bar */}
      {systemBroadcast && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-6 py-2.5 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping inline-block" />
            <span>সিস্টেম লাইভ ব্রডকাস্ট (সকল ক্লায়েন্ট স্টোর ড্যাশবোর্ডে সচল): <strong>{systemBroadcast}</strong></span>
          </div>
          <button 
            onClick={() => onSetSystemBroadcast('')} 
            className="px-2 py-0.5 rounded bg-black/10 hover:bg-black/20 text-xs font-bold transition"
          >
            নোটিশ বন্ধ করুন ✕
          </button>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="bg-white border-b border-slate-200 px-6 shadow-2xs sticky top-[72px] z-30">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> এক্সিকিউটিভ ড্যাশবোর্ড
          </button>

          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'companies'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" /> কোম্পানি ও টেন্যান্ট হাব ({tenants.length})
          </button>

          <button
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'packages'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" /> সাবস্ক্রিপশন প্যাকেজ ({packages.length})
          </button>

          <button
            onClick={() => setActiveTab('licenses')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'licenses'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Key className="w-4 h-4" /> লাইসেন্স কি জেনারেটর
          </button>

          <button
            onClick={() => setActiveTab('domains')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'domains'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-4 h-4" /> কাস্টম ডোমেইন ({domains.length})
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" /> বিলিং ও পেমেন্ট হিস্ট্রি
          </button>

          <button
            onClick={() => setActiveTab('broadcasts')}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'broadcasts'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bell className="w-4 h-4" /> নোটিশ ও ব্রডকাস্ট ইঞ্জিন
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* ============================================================== */}
        {/* TAB 1: EXECUTIVE DASHBOARD (KANAKKU SUPER ADMIN LOOK & FEEL) */}
        {/* ============================================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Purple Hero Banner (from Screenshot 3) */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-7 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/15">
                  <Sparkles className="w-3.5 h-3.5" /> JH Soft Corporation • Enterprise SaaS
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  শুভ সকাল, সুপার এডমিন John!
                </h2>
                <p className="text-xs sm:text-sm text-purple-200 max-w-xl">
                  আজকে নতুন ১৪টি কোম্পানি সাবস্ক্রাইব করেছে। সকল ক্লাউড সার্ভার স্বাভাবিক ও অফলাইন POS সিঙ্ক চালু আছে।
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('companies')}
                    className="px-4 py-2 bg-white text-purple-950 font-bold rounded-xl text-xs hover:bg-purple-50 transition shadow-sm"
                  >
                    কোম্পানিসমূহ দেখুন
                  </button>
                  <button
                    onClick={() => setActiveTab('packages')}
                    className="px-4 py-2 bg-purple-800/80 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition border border-white/20"
                  >
                    সকল প্যাকেজ
                  </button>
                </div>
              </div>

              {/* Quick High-level SaaS Numbers Right Badge */}
              <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl min-w-[240px] text-center">
                <div className="text-xs text-purple-200 font-medium">মাসিক রিকারিং রেভিনিউ (MRR)</div>
                <div className="text-3xl font-black text-amber-300 my-1">৳ {totalMRR.toLocaleString()}</div>
                <div className="text-[11px] text-emerald-300 font-semibold flex items-center justify-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +১৮.৪% মাসিক প্রবৃদ্ধি
                </div>
                <div className="text-[10px] text-purple-300 mt-2 pt-2 border-t border-white/15">
                  টার্গেট: ৳ ১০,০০,০০০ (৪৬% সম্পন্ন)
                </div>
              </div>

              {/* Decorative background glow */}
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Top 4 KPI Metrics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>মোট কোম্পানি (Total)</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">৯৮৭ টি</div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold mt-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +১৪% গত মাস থেকে
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>সক্রিয় কোম্পানি (Active)</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">৮৫৪ টি</div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold mt-1">
                  <TrendingUp className="w-3.5 h-3.5" /> +৮.৩৬% গত মাস থেকে
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>স্থগিত / গ্রেস পিরিয়ড</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">২৮ টি</div>
                <div className="text-[11px] text-rose-500 font-bold mt-1">
                  মেয়াদ শেষ: ৭ টি কোম্পানি
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-sm transition">
                <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                  <span>বাৎসরিক রান-রেট (ARR)</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2">৳ {(totalARR).toLocaleString()}</div>
                <div className="text-[11px] text-purple-700 font-bold mt-1">
                  ৪টি প্যাকেজ টিয়ার সক্রিয়
                </div>
              </div>
            </div>

            {/* 3 Sub-Metric Cards (from Screenshot: Most Ordered Plan, Top Company, Most Domains/Users) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Most Ordered Plan */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
                  <span className="font-bold text-slate-800">সর্বোচ্চ বিক্রিত প্ল্যান</span>
                  <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">চলতি মাস</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">এন্টারপ্রাইজ কর্পোরেট</h3>
                    <p className="text-xs text-slate-500 mt-0.5">মোট বিক্রি: ২০১ টি অর্ডার</p>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-purple-800">৳ ৫,৯৯৯.০০</div>
                    <span className="text-[10px] text-slate-400">প্রতি মাসে</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Top Company with Plan */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
                  <span className="font-bold text-slate-800">শীর্ষ এন্টারপ্রাইজ ক্লায়েন্ট</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">আজকের ডাটা</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">ঢাকা ফ্যাশন অ্যান্ড লাইফস্টাইল</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">info@dhakafashion.com.bd</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold">
                      ১২টি ব্রাঞ্চ
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Most Domains / Users */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-3">
                  <span className="font-bold text-slate-800">সর্বোচ্চ ইউজার ও স্টোরেজ</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">এই সপ্তাহ</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Apex Electronics & Gadgets</h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-mono">apexgadgets.com.bd</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold">
                      ৫০ জন ইউজার
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Earnings & Income Graph + Subscription Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Revenue Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">মাসিক ও বাৎসরিক আয় প্রবৃদ্ধি (Earnings & Income)</h3>
                    <p className="text-xs text-slate-500">সাবস্ক্রিপশন ও প্ল্যাটফর্ম রাজস্ব ট্রেন্ড (২০২৬)</p>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      onClick={() => setChartPeriod('monthly')}
                      className={`px-3 py-1 rounded-lg transition ${chartPeriod === 'monthly' ? 'bg-white text-purple-800 shadow-2xs' : 'text-slate-600'}`}
                    >
                      মাসিক
                    </button>
                    <button
                      onClick={() => setChartPeriod('yearly')}
                      className={`px-3 py-1 rounded-lg transition ${chartPeriod === 'yearly' ? 'bg-white text-purple-800 shadow-2xs' : 'text-slate-600'}`}
                    >
                      বাৎসরিক (২০২৬)
                    </button>
                  </div>
                </div>

                {/* Interactive CSS Bar Graph */}
                <div className="h-56 flex items-end justify-between gap-2 pt-6 border-b border-slate-200 pb-2">
                  {SAAS_MONTHLY_EARNINGS.map((item, idx) => {
                    const heightPercent = Math.min(100, Math.round((item.revenue / 600000) * 100));
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-12 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow-md z-20">
                          ৳ {item.revenue.toLocaleString()}
                          <div className="text-[9px] text-purple-300">+{item.newStores} কোম্পানি</div>
                        </div>

                        {/* Bar */}
                        <div className="w-full bg-slate-100 rounded-t-lg h-44 flex items-end overflow-hidden">
                          <div
                            className="w-full bg-gradient-to-t from-purple-800 to-indigo-500 rounded-t-lg group-hover:from-purple-900 group-hover:to-indigo-400 transition-all duration-300"
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>

                        <span className="text-[10px] font-semibold text-slate-500">{item.month}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="w-3 h-3 rounded-full bg-purple-700 inline-block" />
                      <span>গ্রস সাবস্ক্রিপশন আয় (৳)</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />
                      <span>সার্ভার ও ক্লাউড খরচ</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800">গড় মাসিক প্রবৃদ্ধি: +১৪.৮%</span>
                </div>
              </div>

              {/* Plan Distribution & Renewal Alerts */}
              <div className="space-y-6">
                {/* Plan Distribution Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <h3 className="font-bold text-sm text-slate-900 mb-1">সাবস্ক্রিপশন প্ল্যান বণ্টন</h3>
                  <p className="text-xs text-slate-500 mb-4">মোট সক্রিয় ক্লায়েন্টের প্ল্যান অনুপাতে বিভাজন</p>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-purple-700">এন্টারপ্রাইজ (Enterprise)</span>
                        <span className="text-slate-800">{enterpriseCount} টি ({Math.round((enterpriseCount / totalTenants) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-purple-700 h-2 rounded-full" style={{ width: `${(enterpriseCount / totalTenants) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-indigo-600">প্রফেশনাল (Professional)</span>
                        <span className="text-slate-800">{proCount} টি ({Math.round((proCount / totalTenants) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(proCount / totalTenants) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-emerald-600">স্টার্টার (Starter)</span>
                        <span className="text-slate-800">{starterCount} টি ({Math.round((starterCount / totalTenants) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${(starterCount / totalTenants) * 100}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-semibold mb-1">
                        <span className="text-amber-600">ফ্রি ট্রায়াল (Free Trial)</span>
                        <span className="text-slate-800">{trialCount} টি ({Math.round((trialCount / totalTenants) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(trialCount / totalTenants) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expiring Soon / Renewal Alerts (from Screenshot) */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      মেয়াদ উত্তীর্ণ ও রিনিউয়াল অ্যালার্ট
                    </h3>
                    <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full">
                      {expiringTenants.length} টি শপ
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {expiringTenants.map(t => (
                      <div key={t.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{t.name}</div>
                          <div className="text-[10px] text-slate-500">
                            মেয়াদ: <span className="font-semibold text-rose-600">{t.subscriptionExpiry}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleExtendSubscription(t, 1)}
                          className="px-2.5 py-1 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-[10px] font-bold transition shadow-2xs"
                        >
                          +৩০ দিন বাড়ান
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Latest Registered Companies Table Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">সম্প্রতি নিবন্ধিত কোম্পানি (Latest Registered Companies)</h3>
                  <p className="text-xs text-slate-500">১-ক্লিক ইম্পারসোনেশন ও লাইভ একাউন্ট স্ট্যাটাস</p>
                </div>
                <button
                  onClick={() => setActiveTab('companies')}
                  className="text-xs text-purple-700 font-bold hover:underline flex items-center gap-1"
                >
                  সবগুলো দেখুন ({tenants.length}) <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">কোম্পানি</th>
                      <th className="py-3 px-4">প্ল্যান</th>
                      <th className="py-3 px-4">মেয়াদ শেষ</th>
                      <th className="py-3 px-4">রিসোর্স ব্যবহার</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">ইম্পারসোনেট / অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tenants.slice(0, 5).map(tenant => (
                      <tr key={tenant.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{tenant.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {tenant.slug}.jh-imse.shop • {tenant.phone}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            tenant.plan === 'enterprise' ? 'bg-purple-100 text-purple-800' :
                            tenant.plan === 'professional' ? 'bg-indigo-100 text-indigo-800' :
                            tenant.plan === 'starter' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {tenant.plan}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-800">{tenant.subscriptionExpiry}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="text-[11px] text-slate-600 font-medium">
                            🏢 {tenant.usage.currentBranches}/{tenant.quotas.maxBranches} ব্রাঞ্চ • 👥 {tenant.usage.currentUsers}/{tenant.quotas.maxUsers} ইউজার
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            tenant.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            tenant.status === 'grace_period' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {tenant.status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                            {tenant.status === 'active' ? 'সক্রিয়' : tenant.status === 'grace_period' ? 'গ্রেস পিরিয়ড' : 'স্থগিত'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => onImpersonateTenant(tenant.id)}
                            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-[11px] font-bold transition shadow-2xs inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> স্টোরে লগইন
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: COMPANIES & TENANT MANAGEMENT HUB */}
        {/* ============================================================== */}
        {activeTab === 'companies' && (
          <div className="space-y-4">
            {/* Header controls & filter */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="কোম্পানি, ট্রেড লাইসেন্স, ফোন বা স্লাগ দিয়ে খুঁজুন..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="all">সকল বিজনেস ক্যাটাগরি</option>
                  <option value="grocery">🛒 মুদি ও সুপারশপ</option>
                  <option value="pharmacy">⚕️ ফার্মেসি ও মেডিসিন</option>
                  <option value="electronics">⚡ ইলেকট্রনিক্স ও গ্যাজেট</option>
                  <option value="warehouse">📦 পাইকারি ও গোডাউন</option>
                </select>

                <select
                  value={selectedPlan}
                  onChange={e => setSelectedPlan(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="all">সকল সাবস্ক্রিপশন প্ল্যান</option>
                  <option value="trial">ফ্রি ট্রায়াল</option>
                  <option value="starter">স্টার্টার</option>
                  <option value="professional">প্রফেশনাল</option>
                  <option value="enterprise">এন্টারপ্রাইজ</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
                >
                  <option value="all">সকল স্ট্যাটাস</option>
                  <option value="active">সক্রিয় (Active)</option>
                  <option value="grace_period">গ্রেস পিরিয়ড</option>
                  <option value="suspended">স্থগিত (Suspended)</option>
                  <option value="expired">মেয়াদোত্তীর্ণ (Expired)</option>
                </select>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> নতুন কোম্পানি যোগ করুন
              </button>
            </div>

            {/* Complete Tenants Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">কোম্পানির নাম ও প্রোফাইল</th>
                      <th className="py-3.5 px-4">ধরন</th>
                      <th className="py-3.5 px-4">স্বত্বাধিকারী ও যোগাযোগ</th>
                      <th className="py-3.5 px-4">প্ল্যান ও বিলিং</th>
                      <th className="py-3.5 px-4">রিসোর্স কোটা বনাম ব্যবহার</th>
                      <th className="py-3.5 px-4">মেয়াদ শেষ</th>
                      <th className="py-3.5 px-4">স্ট্যাটাস</th>
                      <th className="py-3.5 px-4 text-right">কন্ট্রোল ও অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTenants.map(tenant => (
                      <tr key={tenant.id} className="hover:bg-slate-50/80 transition">
                        {/* Company Name & Legal */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 text-xs">{tenant.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {tenant.slug}.jh-imse.shop {tenant.customDomain ? `• 🌐 ${tenant.customDomain}` : ''}
                          </div>
                          <div className="text-[9px] text-purple-700 font-semibold mt-0.5">
                            ট্রেড লাইসেন্স: {tenant.tradeLicenseNo || 'N/A'}
                          </div>
                        </td>

                        {/* Category badge */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            tenant.businessType === 'pharmacy' ? 'bg-cyan-100 text-cyan-800' :
                            tenant.businessType === 'grocery' ? 'bg-amber-100 text-amber-800' :
                            tenant.businessType === 'electronics' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {tenant.businessType === 'pharmacy' && '⚕️ ফার্মেসি'}
                            {tenant.businessType === 'grocery' && '🛒 মুদি / রিটেইল'}
                            {tenant.businessType === 'electronics' && '⚡ গ্যাজেট'}
                            {tenant.businessType === 'warehouse' && '📦 পাইকারি ডিপো'}
                          </span>
                        </td>

                        {/* Owner & Phone */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{tenant.ownerName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{tenant.phone}</div>
                        </td>

                        {/* Plan & Fee */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            tenant.plan === 'enterprise' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            tenant.plan === 'professional' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                            tenant.plan === 'starter' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {tenant.plan}
                          </span>
                          <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                            ৳ {tenant.monthlyFee}/মাস ({tenant.billingCycle === 'yearly' ? 'বাৎসরিক' : 'মাসিক'})
                          </div>
                        </td>

                        {/* Quotas vs Usage */}
                        <td className="py-3.5 px-4 min-w-[160px]">
                          <div className="space-y-1 text-[10px]">
                            <div className="flex justify-between text-slate-600">
                              <span>ব্রাঞ্চ:</span>
                              <strong className="text-slate-900">{tenant.usage.currentBranches}/{tenant.quotas.maxBranches}</strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>ইউজার:</span>
                              <strong className="text-slate-900">{tenant.usage.currentUsers}/{tenant.quotas.maxUsers}</strong>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>স্টোরেজ:</span>
                              <strong className="text-slate-900">{(tenant.usage.currentStorageMb / 1024).toFixed(1)} / {tenant.quotas.storageGb} GB</strong>
                            </div>
                          </div>
                        </td>

                        {/* Expiry */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{tenant.subscriptionExpiry}</div>
                          <button
                            onClick={() => handleExtendSubscription(tenant, 1)}
                            className="text-[10px] text-purple-700 font-bold hover:underline"
                          >
                            +৩০ দিন বাড়ান
                          </button>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleStatus(tenant)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition ${
                              tenant.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : tenant.status === 'grace_period'
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                          >
                            {tenant.status === 'active' ? (
                              <><CheckCircle2 className="w-3 h-3" /> সক্রিয়</>
                            ) : tenant.status === 'grace_period' ? (
                              <><AlertTriangle className="w-3 h-3" /> গ্রেস পিরিয়ড</>
                            ) : (
                              <><XCircle className="w-3 h-3" /> স্থগিত</>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                          {/* Impersonate button */}
                          <button
                            onClick={() => onImpersonateTenant(tenant.id)}
                            className="px-2.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-[11px] font-bold transition shadow-2xs inline-flex items-center gap-1"
                            title="দোকানদারের ড্যাশবোর্ডে প্রবেশ করুন"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> স্টোরে লগইন
                          </button>

                          {/* License Modal trigger */}
                          <button
                            onClick={() => setLicenseModalTenant(tenant)}
                            className="p-1.5 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 rounded-xl transition"
                            title="লাইসেন্স কি ও রিনিউয়াল সার্টিফিকেট"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          {/* Quota Modal trigger */}
                          <button
                            onClick={() => setQuotaModalTenant(tenant)}
                            className="p-1.5 bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 rounded-xl transition"
                            title="রিসোর্স কোটা ও ধারণক্ষমতা এডিট"
                          >
                            <HardDrive className="w-3.5 h-3.5" />
                          </button>

                          {/* Feature flags trigger */}
                          <button
                            onClick={() => setEditingFeaturesTenant(tenant)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                            title="ফিচার ও মডিউল পারমিশন"
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: PACKAGES & SUBSCRIPTION TIERS */}
        {/* ============================================================== */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  ক্লাউড SaaS সাবস্ক্রিপশন প্ল্যানসমূহ (Packages & Tiers)
                </h3>
                <p className="text-xs text-slate-500">
                  বাংলাদেশী রিটেইলার ও এন্টারপ্রাইজ ক্লায়েন্টদের জন্য কাস্টমাইজড কোটা ও প্রাইসিং
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-700">বাৎসরিক বিলিংয়ে ২০% ছাড় ও ফ্রি ইনস্টলেশন সক্রিয়</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {packages.map(pkg => (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-3xl p-6 border shadow-2xs flex flex-col justify-between relative transition hover:shadow-md ${
                    pkg.popular ? 'border-purple-600 ring-2 ring-purple-600/20' : 'border-slate-200'
                  }`}
                >
                  {pkg.badge && (
                    <span className="absolute -top-3 right-6 bg-gradient-to-r from-purple-700 to-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-xs">
                      {pkg.badge}
                    </span>
                  )}

                  <div>
                    <h4 className="font-black text-lg text-slate-900">{pkg.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 min-h-[36px]">{pkg.description}</p>

                    <div className="my-4 pt-4 border-t border-slate-100">
                      <div className="text-3xl font-black text-purple-900">
                        ৳ {pkg.monthlyPrice.toLocaleString()}
                        <span className="text-xs text-slate-400 font-normal"> / মাস</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 font-bold mt-1">
                        বাৎসরিক: ৳ {pkg.yearlyPrice.toLocaleString()} (২ মাস ফ্রি)
                      </div>
                    </div>

                    {/* Quota Highlights */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-1.5 text-xs mb-4">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>🏢 আউটলেট / ব্রাঞ্চ:</span>
                        <strong className="text-slate-900">{pkg.quotas.maxBranches} টি</strong>
                      </div>
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>👥 ক্যাশিয়ার ও ইউজার:</span>
                        <strong className="text-slate-900">{pkg.quotas.maxUsers} জন</strong>
                      </div>
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>📦 ইনভেন্টরি পণ্য:</span>
                        <strong className="text-slate-900">{pkg.quotas.maxProducts.toLocaleString()} টি</strong>
                      </div>
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>💾 ক্লাউড স্টোরেজ:</span>
                        <strong className="text-slate-900">{pkg.quotas.storageGb} GB</strong>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2 text-xs text-slate-600">
                      {pkg.includedFeatures.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => alert(`${pkg.name}-এর কনফিগারেশন আপডেট সফল হয়েছে।`)}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
                        pkg.popular 
                          ? 'bg-purple-700 hover:bg-purple-800 text-white' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                      }`}
                    >
                      প্যাকেজ সেটিংস এডিট করুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: LICENSE KEY GENERATOR */}
        {/* ============================================================== */}
        {activeTab === 'licenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Generator Form */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">ক্রিপ্টো লাইসেন্স জেনারেটর</h3>
                  <p className="text-xs text-slate-500">অফলাইন ও ক্লাউড অথেনটিকেশন কি ইস্যু</p>
                </div>
              </div>

              <form onSubmit={handleGenerateLicense} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">কোম্পানি নির্বাচন করুন:</label>
                  <select
                    value={newLicTenantId}
                    onChange={e => setNewLicTenantId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.slug})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">সাবস্ক্রিপশন টিয়ার:</label>
                  <select
                    value={newLicPlan}
                    onChange={e => setNewLicPlan(e.target.value as PlanTier)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
                  >
                    <option value="starter">স্টার্টার (Starter Tier)</option>
                    <option value="professional">প্রফেশনাল (Professional Tier)</option>
                    <option value="enterprise">এন্টারপ্রাইজ (Enterprise Tier)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">লাইসেন্স মেয়াদ:</label>
                  <select
                    value={newLicDuration}
                    onChange={e => setNewLicDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none font-medium"
                  >
                    <option value={1}>১ মাস (৩০ দিন)</option>
                    <option value={3}>৩ মাস (কোয়ার্টারলি)</option>
                    <option value={6}>৬ মাস (হাফ-ইয়ারলি)</option>
                    <option value={12}>১২ মাস (১ বছর - বাৎসরিক)</option>
                    <option value={36}>৩৬ মাস (৩ বছর - কর্পোরেট)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-xs"
                  >
                    <Key className="w-4 h-4" /> নতুন লাইসেন্স কি তৈরি করুন
                  </button>
                </div>
              </form>

              {/* Success Box */}
              {generatedSuccessKey && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs animate-in zoom-in-95">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    লাইসেন্স কি সফলভাবে তৈরি হয়েছে!
                  </div>
                  <div className="font-mono font-bold text-slate-900 bg-white p-2 rounded-lg border border-emerald-300 break-all my-2 select-all">
                    {generatedSuccessKey}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedSuccessKey);
                      alert('লাইসেন্স কি ক্লিপবোর্ডে কপি হয়েছে!');
                    }}
                    className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition flex items-center justify-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" /> কি কপি করুন
                  </button>
                </div>
              )}
            </div>

            {/* Right: Active Issued Licenses Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h3 className="font-bold text-sm text-slate-900">ইস্যুকৃত লাইসেন্স কি রেজিস্ট্রি</h3>
                <p className="text-xs text-slate-500">JH Soft Corporation অনুমোদিত বৈধ গ্রাহক লাইসেন্স তালিকা</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">কোম্পানি</th>
                      <th className="py-3 px-4">লাইসেন্স কি</th>
                      <th className="py-3 px-4">প্ল্যান</th>
                      <th className="py-3 px-4">ইস্যুর তারিখ</th>
                      <th className="py-3 px-4">মেয়াদ শেষ</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {licenses.map(lic => (
                      <tr key={lic.id} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-4 font-sans font-bold text-slate-900">
                          {lic.tenantName}
                        </td>
                        <td className="py-3 px-4 font-bold text-purple-800">
                          {lic.key}
                        </td>
                        <td className="py-3 px-4 uppercase text-[10px] font-sans font-semibold text-slate-600">
                          {lic.plan}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {lic.generatedAt}
                        </td>
                        <td className="py-3 px-4 text-slate-800 font-bold">
                          {lic.expiresAt}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            ✓ {lic.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: CUSTOM DOMAINS */}
        {/* ============================================================== */}
        {activeTab === 'domains' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">কাস্টম ডোমেইন ম্যাপিং ও SSL সার্টিফিকেট</h3>
                <p className="text-xs text-slate-500">
                  ক্লায়েন্ট স্টোরের নিজস্ব ডোমেইন (e.g. `*.com.bd`) ভেরিফিকেশন ও DNS সংযোগ
                </p>
              </div>

              <div className="text-xs bg-purple-50 text-purple-900 border border-purple-200 px-3 py-1.5 rounded-xl font-mono">
                CNAME রেকর্ড টার্গেট: <strong>cname.jh-imse.shop</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">কোম্পানি</th>
                    <th className="py-3.5 px-4">কাস্টম ডোমেইন</th>
                    <th className="py-3.5 px-4">CNAME টার্গেট</th>
                    <th className="py-3.5 px-4">অনুরোধের তারিখ</th>
                    <th className="py-3.5 px-4">SSL স্ট্যাটাস</th>
                    <th className="py-3.5 px-4">ম্যাপিং স্ট্যাটাস</th>
                    <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {domains.map(dom => (
                    <tr key={dom.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{dom.tenantName}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-700 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400" /> {dom.domain}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{dom.cnameTarget}</td>
                      <td className="py-3.5 px-4 text-slate-600">{dom.requestedDate}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dom.sslStatus === 'secured' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          <ShieldCheck className="w-3 h-3" />
                          {dom.sslStatus === 'secured' ? 'SSL সুরক্ষিত (256-bit)' : 'প্রভিশনিং চলছে'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          dom.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {dom.status === 'active' ? 'অনুমোদিত ও লাইভ' : 'DNS পেন্ডিং'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        {dom.status !== 'active' ? (
                          <button
                            onClick={() => handleDomainStatusChange(dom.id, 'active')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition shadow-2xs"
                          >
                            অনুমোদন করুন
                          </button>
                        ) : (
                          <button
                            onClick={() => alert(`${dom.domain}-এর DNS ও SSL সংযোগ সম্পূর্ণ সুস্থ আছে!`)}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition"
                          >
                            যাচাই করুন
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: BILLING & TRANSACTIONS */}
        {/* ============================================================== */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  SaaS সাবস্ক্রিপশন রাজস্ব ও লেনদেন রেজিস্ট্রি
                </h3>
                <p className="text-xs text-slate-500">
                  bKash, Nagad, ব্যাংক ট্রান্সফার ও কার্ডের মাধ্যমে গৃহীত সাবস্ক্রিপশন ফি
                </p>
              </div>

              <div className="text-sm font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                মোট সংগৃহীত পেমেন্ট: ৳ {transactions.reduce((acc, t) => acc + t.amount, 0).toLocaleString()}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">ইনভয়েস নং</th>
                    <th className="py-3.5 px-4">কোম্পানির নাম</th>
                    <th className="py-3.5 px-4">প্ল্যান</th>
                    <th className="py-3.5 px-4">পেমেন্ট মেথড</th>
                    <th className="py-3.5 px-4">TrxID / রেফারেন্স</th>
                    <th className="py-3.5 px-4">তারিখ</th>
                    <th className="py-3.5 px-4 text-right">টাকার পরিমাণ</th>
                    <th className="py-3.5 px-4 text-center">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.map(trx => (
                    <tr key={trx.id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                        {trx.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {trx.tenantName}
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[10px] font-bold text-slate-600">
                        {trx.plan} ({trx.billingCycle === 'yearly' ? 'বাৎসরিক' : 'মাসিক'})
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {trx.paymentMethod}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {trx.trxId}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {trx.date}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-700">
                        ৳ {trx.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          পরিশোধিত (Paid)
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: BROADCAST ENGINE */}
        {/* ============================================================== */}
        {activeTab === 'broadcasts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Broadcast Form */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
              <h3 className="font-extrabold text-sm text-slate-900 mb-1">নতুন সিস্টেম নোটিশ পাঠান</h3>
              <p className="text-xs text-slate-500 mb-4">সকল বা নির্দিষ্ট ক্লায়েন্ট ড্যাশবোর্ডে লাইভ বার্তা প্রচার করুন।</p>

              <form onSubmit={handleCreateBroadcast} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">নোটিশের শিরোনাম:</label>
                  <input
                    type="text"
                    required
                    value={bcTitle}
                    onChange={e => setBcTitle(e.target.value)}
                    placeholder="যেমন: সার্ভার রক্ষণাবেক্ষণ সংক্রান্ত নোটিশ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">নোটিশের বিষয়বস্তু / মেসেজ:</label>
                  <textarea
                    rows={4}
                    required
                    value={bcMessage}
                    onChange={e => setBcMessage(e.target.value)}
                    placeholder="যেমন: আজ রাত ১২টা থেকে রাত ১টা পর্যন্ত প্ল্যাটফর্ম অপ্টিমাইজেশন সম্পন্ন হবে..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">নোটিশের ধরন:</label>
                    <select
                      value={bcType}
                      onChange={e => setBcType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="info">তথ্যমূলক (Info)</option>
                      <option value="warning">সতর্কতামূলক (Warning)</option>
                      <option value="maintenance">রক্ষণাবেক্ষণ (Maintenance)</option>
                      <option value="critical">জরুরি (Critical)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">টার্গেট প্রাপক:</label>
                    <select
                      value={bcTarget}
                      onChange={e => setBcTarget(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    >
                      <option value="all">সকল কোম্পানি</option>
                      <option value="pharmacy">শুধুমাত্র ফার্মেসি</option>
                      <option value="grocery">মুদি ও রিটেইল</option>
                      <option value="enterprise">এন্টারপ্রাইজ ক্লায়েন্ট</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Bell className="w-4 h-4 text-amber-300" /> সিস্টেমে প্রচার (Broadcast) করুন
                </button>
              </form>
            </div>

            {/* Sent Broadcasts History */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="font-bold text-sm text-slate-900 mb-2">ব্রডকাস্ট নোটিশের ইতিহাস</h3>

              {broadcasts.map(bc => (
                <div key={bc.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        bc.type === 'maintenance' ? 'bg-amber-100 text-amber-800' :
                        bc.type === 'critical' ? 'bg-rose-100 text-rose-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {bc.type.toUpperCase()}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{bc.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">({bc.createdAt})</span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{bc.message}</p>
                    <div className="text-[10px] text-slate-400">প্রাপক: <strong>{bc.target === 'all' ? 'সকল স্টোর' : bc.target}</strong></div>
                  </div>

                  <button
                    onClick={() => toggleBroadcastActive(bc.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      bc.active
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {bc.active ? '✓ লাইভ সক্রিয়' : 'নিষ্ক্রিয়'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ============================================================== */}
      {/* ALL MODALS */}
      {/* ============================================================== */}

      {/* 1. Create Tenant Modal */}
      <CreateTenantModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTenant={onCreateTenant}
      />

      {/* 2. License & Subscription Extension Modal */}
      <TenantLicenseModal
        tenant={licenseModalTenant}
        isOpen={!!licenseModalTenant}
        onClose={() => setLicenseModalTenant(null)}
        onUpdateTenant={onUpdateTenant}
      />

      {/* 3. Resource Quota Adjustment Modal */}
      <EditQuotaModal
        tenant={quotaModalTenant}
        isOpen={!!quotaModalTenant}
        onClose={() => setQuotaModalTenant(null)}
        onUpdateTenant={onUpdateTenant}
      />

      {/* 4. Feature Flags / Module Permissions Modal */}
      {editingFeaturesTenant && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-purple-800 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{editingFeaturesTenant.name} - মডিউল পারমিশন</h3>
                <p className="text-xs text-purple-200">এই নির্দিষ্ট দোকানদারের জন্য যে যে ফিচার অন রাখবেন</p>
              </div>
              <button
                onClick={() => setEditingFeaturesTenant(null)}
                className="text-purple-200 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              {[
                { key: 'pos', label: 'POS ক্যাশ কাউন্টার ও রসিদ প্রিন্ট' },
                { key: 'ecommerce', label: 'অনলাইন ই-কমার্স সাইটফ্রন্ট' },
                { key: 'crm', label: 'CRM ও ডিজিটাল বাকি খাতা' },
                { key: 'hrm', label: 'HRM কর্মচারী ও বেতন প্যারোল' },
                { key: 'ai', label: 'গুগল এআই বিজনেস প্রেডিকশন' },
                { key: 'pharmacyBatch', label: 'মেয়াদ শেষ ও ব্যাচ ট্র্যাকিং (ফার্মেসি)' },
                { key: 'imeiWarranty', label: 'IMEI ও ওয়ারেন্টি ট্র্যাকিং (ইলেকট্রনিক্স)' },
                { key: 'multiWarehouse', label: 'মাল্টি-ওয়্যারহাউস ও ডিপো শিফটিং' },
              ].map(f => {
                const isEnabled = editingFeaturesTenant.features[f.key as keyof Tenant['features']];
                return (
                  <div key={f.key} className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span className="font-medium text-slate-800">{f.label}</span>
                    <button
                      type="button"
                      onClick={() => handleSaveFeatureFlag(f.key as keyof Tenant['features'])}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                        isEnabled ? 'bg-purple-700' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                );
              })}

              <div className="pt-3">
                <button
                  onClick={() => setEditingFeaturesTenant(null)}
                  className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs transition"
                >
                  পরিবর্তন সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Quick Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-purple-100">
            <h3 className="font-bold text-sm text-slate-900 mb-1">সিস্টেম নোটিশ ব্রডকাস্ট</h3>
            <p className="text-xs text-slate-500 mb-3">সকল দোকানদারের ড্যাশবোর্ডে এই নোটিশ হলুদ ব্যানারে প্রদর্শিত হবে।</p>
            <form onSubmit={e => {
              e.preventDefault();
              onSetSystemBroadcast(bcMessage || 'সিস্টেম আপডেট নোটিশ: আজ রাত ১২টায় সার্ভার অপ্টিমাইজেশন সম্পন্ন হবে।');
              setShowBroadcastModal(false);
            }} className="space-y-3">
              <textarea
                rows={3}
                value={bcMessage}
                onChange={e => setBcMessage(e.target.value)}
                placeholder="যেমন: আজ রাত ১২টা থেকে ৩০ মিনিট সার্ভার মেইনটেন্যান্স চলবে..."
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-purple-600 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold"
                >
                  প্রকাশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
