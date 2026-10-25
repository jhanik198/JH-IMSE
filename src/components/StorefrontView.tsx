import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Search, MapPin, Phone, CheckCircle, ArrowLeft,
  Truck, ShieldCheck, Heart, Banknote, Filter, X, ArrowRight
} from 'lucide-react';
import { Tenant, Product, OnlineOrder } from '../types';

interface StorefrontViewProps {
  tenant: Tenant;
  products: Product[];
  onPlaceOnlineOrder: (order: OnlineOrder) => void;
  onBackToDashboard: () => void;
}

export const StorefrontView: React.FC<StorefrontViewProps> = ({
  tenant,
  products,
  onPlaceOnlineOrder,
  onBackToDashboard
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Checkout form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash'>('cod');
  const [isOrderSubmitted, setIsOrderSubmitted] = useState<OnlineOrder | null>(null);

  // Products available for online store
  const onlineProducts = useMemo(() => {
    return products.filter(p => p.tenantId === tenant.id && p.showInOnlineStore);
  }, [products, tenant.id]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    onlineProducts.forEach(p => cats.add(p.category));
    return ['All', ...Array.from(cats)];
  }, [onlineProducts]);

  const filteredProducts = useMemo(() => {
    return onlineProducts.filter(p => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.genericName?.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      }
      return true;
    });
  }, [onlineProducts, selectedCategory, searchQuery]);

  const totalCartCount = cart.reduce((acc, i) => acc + i.quantity, 0);
  const totalCartAmount = cart.reduce((acc, i) => acc + (i.product.sellingPrice * i.quantity), 0);
  const deliveryFee = totalCartAmount > 500 ? 0 : 50;
  const grandTotal = totalCartAmount + (cart.length > 0 ? deliveryFee : 0);

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const exist = prev.find(i => i.product.id === product.id);
      if (exist) {
        if (exist.quantity >= product.stock) return prev;
        return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(i => {
        if (i.product.id === productId) {
          const nQty = i.quantity + delta;
          if (nQty <= 0) return null;
          if (nQty > i.product.stock) return i;
          return { ...i, quantity: nQty };
        }
        return i;
      }).filter(Boolean) as { product: Product; quantity: number }[];
    });
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress || cart.length === 0) return;

    const newOrder: OnlineOrder = {
      id: 'ord-' + Date.now(),
      orderNumber: 'WEB-' + Math.floor(1000 + Math.random() * 9000),
      tenantId: tenant.id,
      customerName,
      customerPhone,
      customerAddress,
      items: cart.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        price: i.product.sellingPrice,
        quantity: i.quantity,
      })),
      totalAmount: grandTotal,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toLocaleString('en-GB'),
    };

    onPlaceOnlineOrder(newOrder);
    setIsOrderSubmitted(newOrder);
    setCart([]);
    setIsCartOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* Top Bar for SaaS preview navigation */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>দোকানের লাইভ ই-কমার্স ওয়েবসাইট প্রিভিউ (URL: <strong>{tenant.slug}.jh-imse.shop</strong>)</span>
        </div>
        <button
          onClick={onBackToDashboard}
          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-1 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> স্টোর ERP ড্যাশবোর্ডে ফিরুন
        </button>
      </div>

      {/* Store Header & Branding */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {tenant.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-900 leading-tight">{tenant.name}</h1>
              <p className="text-[11px] text-slate-500 flex items-center gap-2">
                <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-400" /> {tenant.address}</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:flex items-center gap-0.5"><Phone className="w-3 h-3 text-slate-400" /> {tenant.phone}</span>
              </p>
            </div>
          </div>

          {/* Search and Cart Action */}
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="পণ্য বা ওষুধ খুঁজুন..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 border border-transparent focus:border-transparent transition"
              />
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl shadow-xs transition flex items-center gap-2 text-xs font-semibold"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">কার্ট</span>
              {totalCartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-purple-800 font-bold text-[10px] flex items-center justify-center shadow-xs">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="px-4 pb-2.5 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="পণ্য বা ওষুধ খুঁজুন..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>
      </header>

      {/* Store Banner */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-600/60 text-purple-200 text-xs font-semibold mb-2">
              {tenant.businessType === 'pharmacy' ? '⚕️ অনলাইন ফার্মেসি' : tenant.businessType === 'grocery' ? '🛒 অনলাইন মুদি বাজার' : '⚡ গ্যাজেট স্টোর'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold">{tenant.name}-এ স্বাগতম!</h2>
            <p className="text-xs sm:text-sm text-purple-200 mt-1">
              {tenant.storeNotice || 'ঘরে বসেই অর্ডার করুন আপনার প্রয়োজনীয় পণ্য। দ্রুত ডেলিভারি এবং শতভাগ আসল পণ্যের নিশ্চয়তা।'}
            </p>
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-purple-100 font-medium">
              <span className="flex items-center gap-1.5"><Truck className="w-4 h-4 text-emerald-400" /> ৫০ মিনিটে দ্রুত ডেলিভারি</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-cyan-400" /> ১০০% অরিজিনাল পণ্য</span>
              <span className="flex items-center gap-1.5"><Banknote className="w-4 h-4 text-emerald-400" /> ক্যাশ অন ডেলিভারি</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 mt-6">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <ShoppingBag className="w-12 h-12 stroke-[1.2] mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">কোনো পণ্য পাওয়া যায়নি</p>
            <p className="text-xs text-slate-400 mt-1">ক্যাটাগরি বা সার্চ কি-ওয়ার্ড পরিবর্তন করে দেখুন।</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map(product => {
              const inCart = cart.find(i => i.product.id === product.id);
              const isOut = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-1 mb-2">
                      <span className="text-[10px] font-medium text-slate-400">{product.category}</span>
                      {isOut ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">স্টক শেষ</span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">ইন-স্টক</span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                    {product.genericName && (
                      <p className="text-[11px] text-purple-700 font-medium italic mt-0.5 truncate">
                        {product.genericName}
                      </p>
                    )}
                    {product.warrantyMonths && (
                      <p className="text-[10px] text-indigo-600 font-semibold mt-1">
                        🛡️ {product.warrantyMonths} মাসের ওয়ারেন্টি
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-base font-extrabold text-purple-800">
                        {tenant.currency}{product.sellingPrice.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 block -mt-1">
                        প্রতি {product.unit}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={isOut}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                        isOut
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : inCart
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-purple-700 text-white hover:bg-purple-800 shadow-xs'
                      }`}
                    >
                      {inCart ? `কার্টে (${inCart.quantity})` : '+ যোগ করুন'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 bg-purple-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <h3 className="font-bold text-sm">আপনার অনলাইন শপিং ব্যাগ ({totalCartCount})</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 text-purple-200 hover:text-white rounded-lg hover:bg-purple-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                  <ShoppingBag className="w-12 h-12 stroke-[1.2] opacity-40 mb-2" />
                  <p className="font-medium text-slate-600 text-sm">আপনার ব্যাগ খালি</p>
                  <p className="text-xs text-slate-400 mt-1">পছন্দের পণ্য ব্যাগে যোগ করুন</p>
                </div>
              ) : (
                cart.map(({ product, quantity }) => (
                  <div key={product.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-slate-900 truncate">{product.name}</h4>
                      <p className="text-[11px] text-purple-700 font-bold mt-0.5">
                        {tenant.currency}{product.sellingPrice.toFixed(2)} × {quantity} = {tenant.currency}{(product.sellingPrice * quantity).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleUpdateQty(product.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold hover:bg-slate-200"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-900">{quantity}</span>
                      <button
                        onClick={() => handleUpdateQty(product.id, 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center text-xs font-bold hover:bg-slate-200"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Checkout Form */}
            {cart.length > 0 && (
              <form onSubmit={handleCheckoutSubmit} className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-xs text-slate-800">ডেলিভারির তথ্য ও অর্ডার কনফার্ম:</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="আপনার পূর্ণ নাম"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="মোবাইল নম্বর (যেমন: 017xxxxxxxx)"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-purple-600 focus:outline-none"
                  />
                  <textarea
                    required
                    rows={2}
                    placeholder="ডেলিভারির ঠিকানা (বাসা/রোড/এলাকা)"
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-purple-600 focus:outline-none resize-none"
                  />
                </div>

                {/* Payment Option */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold transition ${
                      paymentMethod === 'cod' ? 'bg-purple-700 text-white border-purple-700' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    ক্যাশ অন ডেলিভারি
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`flex-1 py-1.5 rounded-xl border text-xs font-semibold transition ${
                      paymentMethod === 'bkash' ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    বিকাশ (bKash)
                  </button>
                </div>

                {/* Billing Summary */}
                <div className="pt-2 border-t border-slate-200 space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>পণ্যের দাম:</span>
                    <span className="font-semibold">{tenant.currency}{totalCartAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ডেলিভারি চার্জ:</span>
                    <span className="font-semibold">{deliveryFee === 0 ? 'ফ্রি' : `${tenant.currency}${deliveryFee.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 pt-1 border-t border-slate-200">
                    <span>সর্বমোট টাকা:</span>
                    <span className="text-purple-700">{tenant.currency}{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> অর্ডার প্লেস করুন ({tenant.currency}{grandTotal.toFixed(2)})
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Order Confirmed Modal */}
      {isOrderSubmitted && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-purple-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">ধন্যবাদ, আপনার অর্ডার গৃহীত হয়েছে!</h3>
            <p className="text-xs text-slate-500 mt-1">
              অর্ডার নম্বর: <strong className="text-purple-700 font-mono text-sm">{isOrderSubmitted.orderNumber}</strong>
            </p>
            <p className="text-xs text-slate-600 mt-2 bg-purple-50 p-3 rounded-2xl border border-purple-100">
              আমরা দ্রুত আপনার ঠিকানায় <strong>({isOrderSubmitted.customerAddress})</strong> পণ্য পাঠিয়ে দেব।
            </p>

            <div className="mt-5 space-y-2">
              <button
                onClick={() => {
                  setIsOrderSubmitted(null);
                  onBackToDashboard();
                }}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                ERP ড্যাশবোর্ডে গিয়ে নতুন অর্ডারটি দেখুন <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOrderSubmitted(null)}
                className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                আরও কেনাকাটা করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
