import React, { useState } from 'react';
import { 
  ShieldCheck, Store, DollarSign, Users, AlertCircle, ArrowLeft,
  Search, CheckCircle2, XCircle, Settings2, Sparkles, RefreshCw,
  Bell, ExternalLink, Calendar, Plus
} from 'lucide-react';
import { Tenant, BusinessType } from '../types';

interface SuperAdminProps {
  tenants: Tenant[];
  onUpdateTenant: (updated: Tenant) => void;
  onImpersonateTenant: (tenantId: string) => void;
  onBackToLanding: () => void;
  systemBroadcast: string;
  onSetSystemBroadcast: (msg: string) => void;
}

export const SuperAdmin: React.FC<SuperAdminProps> = ({
  tenants,
  onUpdateTenant,
  onImpersonateTenant,
  onBackToLanding,
  systemBroadcast,
  onSetSystemBroadcast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | BusinessType>('all');
  const [editingFeaturesTenant, setEditingFeaturesTenant] = useState<Tenant | null>(null);
  const [broadcastInput, setBroadcastInput] = useState(systemBroadcast);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  // Metrics
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter(t => t.status === 'active').length;
  const totalMRR = tenants.reduce((acc, t) => acc + (t.status === 'active' ? t.monthlyFee : 0), 0);
  const pharmacyCount = tenants.filter(t => t.businessType === 'pharmacy').length;
  const groceryCount = tenants.filter(t => t.businessType === 'grocery').length;

  const filteredTenants = tenants.filter(t => {
    if (selectedFilter !== 'all' && t.businessType !== selectedFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return t.name.toLowerCase().includes(q) || t.ownerName.toLowerCase().includes(q) || t.slug.toLowerCase().includes(q);
    }
    return true;
  });

  const handleToggleStatus = (tenant: Tenant) => {
    const updated: Tenant = {
      ...tenant,
      status: tenant.status === 'active' ? 'suspended' : 'active',
    };
    onUpdateTenant(updated);
  };

  const handleExtendSubscription = (tenant: Tenant) => {
    const current = new Date(tenant.subscriptionExpiry);
    current.setMonth(current.getMonth() + 1);
    const updated: Tenant = {
      ...tenant,
      subscriptionExpiry: current.toISOString().slice(0, 10),
      status: 'active',
    };
    onUpdateTenant(updated);
    alert(`${tenant.name}-এর সাবস্ক্রিপশন মেয়াদ আরও ৩০ দিন বাড়ানো হয়েছে!`);
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

  const handleSaveBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    onSetSystemBroadcast(broadcastInput);
    setShowBroadcastModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 pb-16">
      {/* Top Navbar */}
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-700 flex items-center justify-center font-bold shadow-xs">
            <ShieldCheck className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wide flex items-center gap-2">
              JH IMSE Super Admin Command Center
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                JH Soft Corporation
              </span>
            </h1>
            <p className="text-xs text-slate-400">সকল ক্লায়েন্ট স্টোর, সাবস্ক্রিপশন ও প্ল্যাটফর্ম ম্যানেজমেন্ট • সাপোর্ট: +8801940999830</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-3 py-1.5 bg-purple-800 hover:bg-purple-700 text-purple-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Bell className="w-3.5 h-3.5 text-amber-300" /> গ্লোবাল সিস্টেম নোটিশ
          </button>

          <button
            onClick={onBackToLanding}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> মেইন ওয়েবসাইটে ফিরুন
          </button>
        </div>
      </header>

      {/* Broadcast Alert indicator if active */}
      {systemBroadcast && (
        <div className="bg-amber-500 text-slate-950 px-6 py-2 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>লাইভ সিস্টেম নোটিশ (সকল স্টোর ড্যাশবোর্ডে প্রদর্শিত হচ্ছে): <strong>{systemBroadcast}</strong></span>
          </div>
          <button onClick={() => onSetSystemBroadcast('')} className="text-xs underline hover:opacity-80">
            রিমুভ করুন
          </button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>মোট নিবন্ধিত স্টোর</span>
              <Store className="w-4 h-4 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{totalTenants} টি</div>
            <span className="text-[11px] text-emerald-600 font-medium">সক্রিয়: {activeTenants} টি দোকান</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>মাসিক রাজস্ব (MRR)</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 mt-2">৳ {totalMRR.toLocaleString()}</div>
            <span className="text-[11px] text-slate-400">বাৎসরিক রান-রেট: ৳ {(totalMRR * 12).toLocaleString()}</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>ফার্মেসি ক্লায়েন্ট</span>
              <span className="text-xs font-bold text-cyan-600">⚕️</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{pharmacyCount} টি</div>
            <span className="text-[11px] text-slate-400">ড্রাগ ও ব্যাচ ট্র্যাকিং সক্রিয়</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>মুদি ও ডিপার্টমেন্টাল</span>
              <span className="text-xs font-bold text-amber-600">🛒</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{groceryCount} টি</div>
            <span className="text-[11px] text-slate-400">বারকোড POS ও স্কেল সক্রিয়</span>
          </div>
        </div>

        {/* Tenants Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          {/* Table Header controls */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-base text-slate-900">দোকানদার ও টেন্যান্ট তালিকা</h2>
              <p className="text-xs text-slate-500">প্রতিটি দোকানের স্ট্যাটাস, সাবস্ক্রিপশন মেয়াদ ও ড্যাশবোর্ডে প্রবেশের কন্ট্রোল</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="দোকান বা মালিকের নাম..."
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-purple-600"
                />
              </div>

              <select
                value={selectedFilter}
                onChange={e => setSelectedFilter(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
              >
                <option value="all">সকল ক্যাটাগরি</option>
                <option value="pharmacy">ফার্মেসি</option>
                <option value="grocery">মুদি দোকান</option>
                <option value="electronics">ইলেকট্রনিক্স</option>
                <option value="warehouse">ওয়্যারহাউস</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">দোকানের নাম ও আইডি</th>
                  <th className="py-3 px-4">ক্যাটাগরি</th>
                  <th className="py-3 px-4">মালিক ও যোগাযোগ</th>
                  <th className="py-3 px-4">সাবস্ক্রিপশন প্ল্যান</th>
                  <th className="py-3 px-4">মেয়াদ শেষ</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTenants.map(tenant => (
                  <tr key={tenant.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-xs">{tenant.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        slug: {tenant.slug} • {tenant.customDomain || 'no domain'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                        tenant.businessType === 'pharmacy' ? 'bg-cyan-100 text-cyan-800' :
                        tenant.businessType === 'grocery' ? 'bg-amber-100 text-amber-800' :
                        tenant.businessType === 'electronics' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {tenant.businessType === 'pharmacy' && '⚕️ ফার্মেসি'}
                        {tenant.businessType === 'grocery' && '🛒 মুদি ও ফুড'}
                        {tenant.businessType === 'electronics' && '⚡ গ্যাজেট'}
                        {tenant.businessType === 'warehouse' && '📦 পাইকারি গোডাউন'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{tenant.ownerName}</div>
                      <div className="text-[10px] text-slate-500">{tenant.phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-purple-700 uppercase text-[10px]">
                        {tenant.plan}
                      </span>
                      <div className="text-[10px] text-slate-500 font-medium">৳ {tenant.monthlyFee}/মাস</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700">{tenant.subscriptionExpiry}</div>
                      <button
                        onClick={() => handleExtendSubscription(tenant)}
                        className="text-[10px] text-purple-600 font-bold hover:underline"
                      >
                        +৩০ দিন বাড়ান
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(tenant)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
                          tenant.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {tenant.status === 'active' ? (
                          <><CheckCircle2 className="w-3 h-3" /> সক্রিয় (Active)</>
                        ) : (
                          <><XCircle className="w-3 h-3" /> বন্ধ (Suspended)</>
                        )}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => setEditingFeaturesTenant(tenant)}
                        className="p-1.5 text-slate-500 hover:text-purple-700 rounded-lg hover:bg-purple-50 transition"
                        title="ফিচার ও মডিউল পারমিশন"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onImpersonateTenant(tenant.id)}
                        className="px-2.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-[11px] font-bold transition shadow-xs inline-flex items-center gap-1"
                        title="দোকানদারের ড্যাশবোর্ডে প্রবেশ করুন"
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
      </main>

      {/* Feature Flags Modal */}
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

      {/* Global Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-purple-100">
            <h3 className="font-bold text-sm text-slate-900 mb-1">সিস্টেম নোটিশ ব্রডকাস্ট</h3>
            <p className="text-xs text-slate-500 mb-3">সকল দোকানদারের ড্যাশবোর্ডে এই নোটিশ হলুদ ব্যানারে প্রদর্শিত হবে।</p>
            <form onSubmit={handleSaveBroadcast} className="space-y-3">
              <textarea
                rows={3}
                value={broadcastInput}
                onChange={e => setBroadcastInput(e.target.value)}
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
