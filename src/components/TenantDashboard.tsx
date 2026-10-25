import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Store, Users, UserCheck, Package, ShoppingBag, 
  ShoppingCart, DollarSign, BrainCircuit, Settings, ChevronDown, 
  Menu, X, Bell, Calculator, Moon, Sun, Globe, Search, Plus, 
  TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, ArrowDownRight,
  Printer, Send, CheckCircle2, ShieldCheck, Sparkles, Filter, Calendar,
  Clock, Award, HelpCircle, Layers, Eye, Smartphone, AlertCircle,
  Barcode, Download, UploadCloud, SlidersHorizontal, Trash2, FileSpreadsheet,
  FileText, Truck, RotateCcw, Receipt, CreditCard, RefreshCw
} from 'lucide-react';
import { 
  Tenant, Product, Sale, Customer, Employee, OnlineOrder, Warehouse, AIInsight, 
  StockAdjustment, Quotation, DeliveryChallan, CreditNote 
} from '../types';
import { BarcodeGeneratorModal } from './BarcodeGeneratorModal';
import { BulkImportModal } from './BulkImportModal';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { QuotationModal } from './QuotationModal';
import { DeliveryChallanModal } from './DeliveryChallanModal';
import { CreditNoteModal } from './CreditNoteModal';

interface TenantDashboardProps {
  tenant: Tenant;
  tenants: Tenant[];
  onSelectTenant: (tenantId: string) => void;
  products: Product[];
  sales: Sale[];
  customers: Customer[];
  employees: Employee[];
  onlineOrders: OnlineOrder[];
  warehouses: Warehouse[];
  activeWarehouseId: string;
  onSelectWarehouse: (whId: string) => void;
  onOpenPOS: () => void;
  onOpenStorefront: () => void;
  onOpenCalculator: () => void;
  onOpenSuperAdmin: () => void;
  onBackToLanding: () => void;
  onAddProduct: (prod: Omit<Product, 'id'>) => void;
  onBulkImportProducts?: (prods: Omit<Product, 'id'>[]) => void;
  onAdjustStock?: (productId: string, newStock: number, record: StockAdjustment) => void;
  onDeleteProduct?: (productId: string) => void;
  onSmsCustomerDue: (customer: Customer) => void;
  onUpdateOrderStatus: (orderId: string, status: OnlineOrder['status']) => void;
  quotations?: Quotation[];
  deliveryChallans?: DeliveryChallan[];
  creditNotes?: CreditNote[];
  onCreateQuotation?: (quote: Omit<Quotation, 'id'>) => void;
  onCreateDeliveryChallan?: (challan: Omit<DeliveryChallan, 'id'>) => void;
  onCreateCreditNote?: (cn: Omit<CreditNote, 'id'>, restockItems: { productId: string; quantity: number }[]) => void;
  onConvertToInvoice?: (quote: Quotation) => void;
  onOpenReceipt?: (sale: Sale) => void;
  onOpenA4Invoice?: (sale: Sale) => void;
  systemBroadcast?: string;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({
  tenant,
  tenants,
  onSelectTenant,
  products,
  sales,
  customers,
  employees,
  onlineOrders,
  warehouses,
  activeWarehouseId,
  onSelectWarehouse,
  onOpenPOS,
  onOpenStorefront,
  onOpenCalculator,
  onOpenSuperAdmin,
  onBackToLanding,
  onAddProduct,
  onBulkImportProducts,
  onAdjustStock,
  onDeleteProduct,
  onSmsCustomerDue,
  onUpdateOrderStatus,
  quotations = [],
  deliveryChallans = [],
  creditNotes = [],
  onCreateQuotation,
  onCreateDeliveryChallan,
  onCreateCreditNote,
  onConvertToInvoice,
  onOpenReceipt,
  onOpenA4Invoice,
  systemBroadcast,
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'invoices' | 'pos' | 'crm' | 'hrm' | 'ecommerce' | 'ai' | 'warehouses' | 'accounting' | 'settings'
  >('dashboard');

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | '7days' | 'month' | 'year'>('month');
  
  // Phase 1 Modals & Filters State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [barcodeProductToPrint, setBarcodeProductToPrint] = useState<string | undefined>(undefined);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'low_stock' | 'near_expiry' | 'out_of_stock'>('all');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Phase 2 Invoicing & Modals State
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [isCreditNoteModalOpen, setIsCreditNoteModalOpen] = useState(false);
  const [invoiceFilterStatus, setInvoiceFilterStatus] = useState<'all' | 'paid' | 'due' | 'returned'>('all');
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [invoiceSubTab, setInvoiceSubTab] = useState<'invoices' | 'quotations' | 'challans' | 'credit_notes'>('invoices');

  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // New product form state with deep niche fields
  const [pName, setPName] = useState('');
  const [pSku, setPSku] = useState('');
  const [pCategory, setPCategory] = useState('');
  const [pCostPrice, setPCostPrice] = useState('');
  const [pSellingPrice, setPSellingPrice] = useState('');
  const [pWholesalePrice, setPWholesalePrice] = useState('');
  const [pStock, setPStock] = useState('');
  const [pAlertStock, setPAlertStock] = useState('5');
  const [pUnit, setPUnit] = useState('pcs');
  const [pExpiry, setPExpiry] = useState('');
  const [pBatch, setPBatch] = useState('');
  const [pGeneric, setPGeneric] = useState('');
  const [pManufacturer, setPManufacturer] = useState('');
  const [pRackNumber, setPRackNumber] = useState('');
  const [pDarNumber, setPDarNumber] = useState('');
  const [pDosageForm, setPDosageForm] = useState('Tablet');
  const [pWarranty, setPWarranty] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pModelNumber, setPModelNumber] = useState('');
  const [pMoq, setPMoq] = useState('');
  const [pOnline, setPOnline] = useState(true);

  // CSV Export Generator
  const handleExportCSV = () => {
    if (tenantProducts.length === 0) return;
    const headers = [
      'ID', 'Name', 'SKU', 'Category', 'CostPrice', 'SellingPrice', 'WholesalePrice',
      'Stock', 'Unit', 'AlertStock', 'ExpiryDate', 'BatchNumber', 'GenericName', 'Manufacturer', 'RackNumber'
    ];
    const rows = tenantProducts.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      `"${p.category}"`,
      p.costPrice,
      p.sellingPrice,
      p.wholesalePrice || (p.sellingPrice * 0.9).toFixed(2),
      p.stock,
      p.unit,
      p.alertStock,
      p.expiryDate || '',
      p.batchNumber || '',
      `"${(p.genericName || '').replace(/"/g, '""')}"`,
      `"${(p.manufacturer || '').replace(/"/g, '""')}"`,
      `"${(p.rackNumber || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${tenant.slug}_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter products and sales for this tenant
  const tenantProducts = useMemo(() => {
    return products.filter(p => {
      if (p.tenantId !== tenant.id) return false;
      if (activeWarehouseId !== 'all' && p.warehouseId !== activeWarehouseId) return false;
      return true;
    });
  }, [products, tenant.id, activeWarehouseId]);

  const tenantSales = useMemo(() => {
    return sales.filter(s => s.tenantId === tenant.id);
  }, [sales, tenant.id]);

  const tenantCustomers = useMemo(() => {
    return customers.filter(c => c.tenantId === tenant.id);
  }, [customers, tenant.id]);

  const tenantEmployees = useMemo(() => {
    return employees.filter(e => e.tenantId === tenant.id);
  }, [employees, tenant.id]);

  const tenantOrders = useMemo(() => {
    return onlineOrders.filter(o => o.tenantId === tenant.id);
  }, [onlineOrders, tenant.id]);

  // Financial KPI calculations
  const totalSalesAmount = useMemo(() => {
    return tenantSales.reduce((acc, s) => acc + s.totalAmount, 0);
  }, [tenantSales]);

  const totalCostAmount = useMemo(() => {
    return tenantSales.reduce((acc, s) => {
      const saleCost = s.items.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
      return acc + saleCost;
    }, 0);
  }, [tenantSales]);

  const totalProfit = Math.max(0, totalSalesAmount - totalCostAmount);

  const totalSalesDue = useMemo(() => {
    return tenantCustomers.reduce((acc, c) => acc + c.dueAmount, 0);
  }, [tenantCustomers]);

  const totalStockCost = useMemo(() => {
    return tenantProducts.reduce((acc, p) => acc + (p.costPrice * p.stock), 0);
  }, [tenantProducts]);

  const totalStockRetail = useMemo(() => {
    return tenantProducts.reduce((acc, p) => acc + (p.sellingPrice * p.stock), 0);
  }, [tenantProducts]);

  const totalStockWholesale = useMemo(() => {
    return tenantProducts.reduce((acc, p) => acc + ((p.wholesalePrice || p.costPrice * 1.1) * p.stock), 0);
  }, [tenantProducts]);

  // Near expiry & low stock alerts
  const nearExpiryProducts = useMemo(() => {
    return tenantProducts.filter(p => p.expiryDate && p.expiryDate < '2026-12-31');
  }, [tenantProducts]);

  const lowStockProducts = useMemo(() => {
    return tenantProducts.filter(p => p.stock <= p.alertStock);
  }, [tenantProducts]);

  const outOfStockProducts = useMemo(() => {
    return tenantProducts.filter(p => p.stock <= 0);
  }, [tenantProducts]);

  const displayedProducts = useMemo(() => {
    return tenantProducts.filter(p => {
      // Search query
      if (productSearchQuery.trim()) {
        const q = productSearchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesGeneric = p.genericName?.toLowerCase().includes(q);
        const matchesManufacturer = p.manufacturer?.toLowerCase().includes(q);
        const matchesRack = p.rackNumber?.toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesGeneric && !matchesManufacturer && !matchesRack) {
          return false;
        }
      }

      // Status filter
      if (productStatusFilter === 'low_stock') {
        return p.stock > 0 && p.stock <= p.alertStock;
      }
      if (productStatusFilter === 'out_of_stock') {
        return p.stock <= 0;
      }
      if (productStatusFilter === 'near_expiry') {
        return Boolean(p.expiryDate && p.expiryDate < '2026-12-31');
      }

      return true;
    });
  }, [tenantProducts, productSearchQuery, productStatusFilter]);

  // Invoicing & Billing Memos
  const tenantQuotations = useMemo(() => {
    return quotations.filter(q => q.tenantId === tenant.id);
  }, [quotations, tenant.id]);

  const tenantDeliveryChallans = useMemo(() => {
    return deliveryChallans.filter(dc => dc.tenantId === tenant.id);
  }, [deliveryChallans, tenant.id]);

  const tenantCreditNotes = useMemo(() => {
    return creditNotes.filter(cn => cn.tenantId === tenant.id);
  }, [creditNotes, tenant.id]);

  const invoiceStats = useMemo(() => {
    const totalInvoiced = tenantSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const paidSales = tenantSales.filter(s => (s.dueAmount || 0) <= 0);
    const paidTotal = paidSales.reduce((acc, s) => acc + s.paidAmount, 0);
    const dueSales = tenantSales.filter(s => (s.dueAmount || 0) > 0);
    const dueTotal = dueSales.reduce((acc, s) => acc + (s.dueAmount || 0), 0);
    const returnedTotal = tenantCreditNotes.reduce((acc, cn) => acc + cn.totalRefundAmount, 0);

    return {
      totalInvoiced,
      invoicesCount: tenantSales.length,
      paidTotal,
      paidCount: paidSales.length,
      dueTotal,
      dueCount: dueSales.length,
      returnedTotal,
      returnedCount: tenantCreditNotes.length,
    };
  }, [tenantSales, tenantCreditNotes]);

  const displayedInvoices = useMemo(() => {
    return tenantSales.filter(sale => {
      if (invoiceSearchQuery.trim()) {
        const q = invoiceSearchQuery.toLowerCase();
        const matchesId = (sale.invoiceNumber || '').toLowerCase().includes(q) || sale.id.toLowerCase().includes(q);
        const matchesCustomer = (sale.customerName || '').toLowerCase().includes(q);
        const matchesPhone = (sale.customerPhone || '').toLowerCase().includes(q);
        const matchesTrx = (sale.transactionId || '').toLowerCase().includes(q);
        if (!matchesId && !matchesCustomer && !matchesPhone && !matchesTrx) {
          return false;
        }
      }

      if (invoiceFilterStatus === 'paid') {
        return (sale.dueAmount || 0) <= 0;
      }
      if (invoiceFilterStatus === 'due') {
        return (sale.dueAmount || 0) > 0;
      }
      if (invoiceFilterStatus === 'returned') {
        return tenantCreditNotes.some(cn => cn.originalInvoiceNumber === sale.invoiceNumber || cn.originalInvoiceNumber === sale.id);
      }
      return true;
    });
  }, [tenantSales, invoiceSearchQuery, invoiceFilterStatus, tenantCreditNotes]);

  // AI / System query handler
  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setIsAiThinking(true);
    setTimeout(() => {
      setIsAiThinking(false);
      const q = aiQuestion.toLowerCase();
      if (q.includes('লাভ') || q.includes('profit')) {
        setAiAnswer(`আপনার বর্তমান নিট লাভ হচ্ছে ${tenant.currency}${totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}। গড় প্রফিট মার্জিন ২২.৪%।`);
      } else if (q.includes('স্টক') || q.includes('মজুদ') || q.includes('বাকি')) {
        setAiAnswer(`আপনার মোট পণ্যের পাইকারি মূল্য ${tenant.currency}${totalStockCost.toLocaleString()} এবং খুচরা মূল্য ${tenant.currency}${totalStockRetail.toLocaleString()}। বাকি খাতায় মোট বকেয়া আছে ${tenant.currency}${totalSalesDue.toLocaleString()}।`);
      } else {
        setAiAnswer(`সিস্টেম অ্যানালাইটিক্স রিপোর্ট: ${tenant.name}-এ চলতি সপ্তাহে সবচেয়ে বেশি বিক্রি হয়েছে ${tenantProducts[0]?.name || 'পণ্য'}। পরবর্তী সপ্তাহের জন্য আরও ৩০% স্টক বাড়ানো লাভজনক হবে।`);
      }
    }, 600);
  };

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pSellingPrice) return;

    onAddProduct({
      tenantId: tenant.id,
      name: pName,
      sku: pSku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      category: pCategory || 'General',
      costPrice: parseFloat(pCostPrice) || 0,
      sellingPrice: parseFloat(pSellingPrice) || 0,
      wholesalePrice: pWholesalePrice ? parseFloat(pWholesalePrice) : (parseFloat(pSellingPrice) || 0) * 0.9,
      stock: parseInt(pStock) || 10,
      alertStock: parseInt(pAlertStock) || 5,
      unit: pUnit || 'pcs',
      showInOnlineStore: pOnline,
      warehouseId: activeWarehouseId === 'all' ? (warehouses[0]?.id || 'wh-1') : activeWarehouseId,
      expiryDate: pExpiry || undefined,
      batchNumber: pBatch || undefined,
      genericName: pGeneric || undefined,
      manufacturer: pManufacturer || undefined,
      rackNumber: pRackNumber || undefined,
      darNumber: pDarNumber || undefined,
      dosageForm: pDosageForm || undefined,
      warrantyMonths: pWarranty ? parseInt(pWarranty) : undefined,
      brand: pBrand || undefined,
      modelNumber: pModelNumber || undefined,
      moq: pMoq ? parseInt(pMoq) : undefined,
    });

    setShowAddProductModal(false);
    setPName('');
    setPSku('');
    setPCategory('');
    setPCostPrice('');
    setPSellingPrice('');
    setPWholesalePrice('');
    setPStock('');
    setPAlertStock('5');
    setPExpiry('');
    setPBatch('');
    setPGeneric('');
    setPManufacturer('');
    setPRackNumber('');
    setPDarNumber('');
    setPWarranty('');
    setPBrand('');
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-800 font-sans overflow-hidden">
      {/* Sidebar Navigation (Matching Stocky / IMS screenshot) */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-slate-200 transition-all duration-200 flex flex-col z-30 shrink-0 shadow-sm`}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
              {tenant.name.charAt(0)}
            </div>
            {isSidebarOpen && (
              <div className="truncate">
                <span className="font-bold text-sm text-slate-900 block truncate leading-tight">
                  {tenant.name}
                </span>
                <span className="text-[10px] text-purple-700 font-semibold block capitalize truncate">
                  {tenant.businessType === 'pharmacy' ? '⚕️ ফার্মেসি' : tenant.businessType === 'grocery' ? '🛒 মুদি ও সুপারশপ' : '⚡ গ্যাজেট স্টোর'}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
          {[
            { id: 'dashboard', label: 'ড্যাশবোর্ড (Dashboard)', icon: LayoutDashboard },
            { id: 'pos', label: 'POS ক্যাশ কাউন্টার', icon: ShoppingCart, badge: 'Live' },
            { id: 'products', label: 'পণ্য ও ইনভেন্টরি (Products)', icon: Package },
            { id: 'invoices', label: 'ইনভয়েস, কোটেশন ও চালান', icon: FileText, badge: tenantSales.length },
            { id: 'crm', label: 'CRM ও ডিজিটাল বাকি খাতা', icon: Users, badge: tenantCustomers.filter(c => c.dueAmount > 0).length },
            { id: 'ecommerce', label: 'অনলাইন ই-কমার্স ও অর্ডার', icon: ShoppingBag, badge: tenantOrders.filter(o => o.status === 'pending').length },
            { id: 'hrm', label: 'HRM কর্মচারী ও প্যারোল', icon: UserCheck },
            { id: 'ai', label: 'বিজনেস ইন্টেলিজেন্স ও ফোরকাস্ট', icon: TrendingUp, badge: 'BI' },
            { id: 'warehouses', label: 'ব্রাঞ্চ ও ওয়্যারহাউস', icon: Store },
            { id: 'accounting', label: 'অ্যাকাউন্টিং ও খরচ', icon: DollarSign },
            { id: 'settings', label: 'স্টোর সেটিংস', icon: Settings },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'pos') {
                    onOpenPOS();
                  } else {
                    setActiveTab(item.id as any);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition text-left font-medium ${
                  isActive
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                </div>

                {isSidebarOpen && item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      isActive
                        ? 'bg-purple-800 text-purple-100'
                        : item.badge === 'Live'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer - Switch Tenant & Public Link */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-2">
          {isSidebarOpen && (
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                অন্য দোকানে স্যুইচ করুন:
              </label>
              <select
                value={tenant.id}
                onChange={e => onSelectTenant(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none"
              >
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.businessType})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={onOpenStorefront}
            className="w-full py-2 bg-white border border-purple-200 text-purple-800 hover:bg-purple-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            {isSidebarOpen && <span>অনলাইন স্টোরফ্রন্ট প্রিভিউ</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar (Matching Screenshot UI with Calculator, Dark Mode, Avatar) */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Breadcrumb */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-purple-700">{tenant.name}</span>
              <span>/</span>
              <span className="capitalize">{activeTab}</span>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2.5">
            {/* Quick POS Launch Button (Purple) */}
            <button
              onClick={onOpenPOS}
              className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>POS কাউন্টার</span>
            </button>

            {/* Quick Calculator Tool */}
            <button
              onClick={onOpenCalculator}
              className="p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition"
              title="ক্যালকুলেটর"
            >
              <Calculator className="w-4 h-4" />
            </button>

            {/* Online Store Shortcut */}
            <button
              onClick={onOpenStorefront}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
              title="অনলাইন ওয়েবসাইট"
            >
              <Globe className="w-3.5 h-3.5 text-purple-600" />
              <span>ই-কমার্স সাইট</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setActiveTab('ecommerce')}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition relative"
                title="নোটিফিকেশন"
              >
                <Bell className="w-4 h-4" />
                {tenantOrders.filter(o => o.status === 'pending').length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            </div>

            {/* Super Admin Control Access */}
            <button
              onClick={onOpenSuperAdmin}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
              title="সুপার অ্যাডমিন"
            >
              <ShieldCheck className="w-4 h-4 text-purple-700" />
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center">
                {tenant.ownerName.charAt(0)}
              </div>
              <div className="hidden lg:block text-left text-xs">
                <span className="font-bold text-slate-900 block leading-tight">{tenant.ownerName}</span>
                <span className="text-[10px] text-slate-400 capitalize">{tenant.plan} Plan</span>
              </div>
            </div>
          </div>
        </header>

        {/* Global Broadcast Announcement */}
        {systemBroadcast && (
          <div className="bg-amber-500 text-slate-950 px-6 py-2 text-xs font-medium flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{systemBroadcast}</span>
            </div>
          </div>
        )}

        {/* Dynamic Body Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'dashboard' && (
            <>
              {/* Purple Hero Banner (Matching the screenshot exactly) */}
              <div className="bg-gradient-to-r from-purple-800 via-purple-700 to-indigo-800 rounded-3xl p-6 text-white shadow-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      Dashboard - স্বাগতম, {tenant.name}!
                    </h1>
                    <p className="text-xs sm:text-sm text-purple-200 mt-1">
                      আজকের সার্বিক ব্যবসায়িক হিসাব, লাইভ ইনভেন্টরি ও বিক্রয় চিত্র
                    </p>
                  </div>

                  {/* Filter by warehouse & Date range picker */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Warehouse Selector */}
                    <div className="bg-purple-900/60 border border-purple-400/30 rounded-xl px-3 py-1.5 flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 text-purple-300" />
                      <select
                        value={activeWarehouseId}
                        onChange={e => onSelectWarehouse(e.target.value)}
                        className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="all" className="text-slate-900">সকল ওয়্যারহাউস / ব্রাঞ্চ</option>
                        {warehouses.filter(w => w.tenantId === tenant.id).map(w => (
                          <option key={w.id} value={w.id} className="text-slate-900">
                            {w.name} ({w.location})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Filter */}
                    <div className="bg-purple-900/60 border border-purple-400/30 rounded-xl px-3 py-1.5 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-purple-300" />
                      <select
                        value={dateRange}
                        onChange={e => setDateRange(e.target.value as any)}
                        className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="today" className="text-slate-900">আজকের হিসাব (Today)</option>
                        <option value="7days" className="text-slate-900">গত ৭ দিন (Last 7 Days)</option>
                        <option value="month" className="text-slate-900">চলতি মাস (This Month)</option>
                        <option value="year" className="text-slate-900">এই বছর (This Year)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 8 Metric Summary KPI Cards (Exact replica from the screenshot) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 1. Sales */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Sales</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                    {tenant.currency}{totalSalesAmount.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5 mt-0.5">
                    <TrendingUp className="w-3 h-3" /> +12.5% গত সপ্তাহের তুলনায়
                  </span>
                </div>

                {/* 2. Purchases */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Purchases</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                    {tenant.currency}{(totalCostAmount * 1.3).toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">সাপ্লায়ার ইনভয়েস</span>
                </div>

                {/* 3. Sales Return */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Sales Return</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <ArrowDownRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                    {tenant.currency}0.00
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">কোনো রিটার্ন নেই</span>
                </div>

                {/* 4. Purchases Return */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Purchases Return</span>
                    <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                    {tenant.currency}0.00
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">সাপ্লায়ার রিটার্ন ০</span>
                </div>

                {/* 5. Sales Due (বাকি খাতা) */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Sales Due (বাকি)</span>
                    <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-cyan-700 mt-2">
                    {tenant.currency}{totalSalesDue.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-cyan-600 font-medium block mt-0.5">
                    {tenantCustomers.filter(c => c.dueAmount > 0).length} জন গ্রাহকের বাকি
                  </span>
                </div>

                {/* 6. Total Purchase Due */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Total Purchase Due</span>
                    <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                    {tenant.currency}0.00
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">কোম্পানি বকেয়া পরিশোধিত</span>
                </div>

                {/* 7. Invoice Count */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Invoices</span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Printer className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                    {tenantSales.length}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">মোট মুদ্রিত মেমো</span>
                </div>

                {/* 8. Profit */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">Profit (লাভ)</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-emerald-700 mt-2">
                    {tenant.currency}{totalProfit.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">নিট লাভ মার্জিন</span>
                </div>
              </div>

              {/* Special Alerts for Pharmacy & Grocery */}
              {tenant.businessType === 'pharmacy' && nearExpiryProducts.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-rose-900">
                        জরুরি ফার্মেসি ড্রাগ এক্সপায়ারি সতর্কতা!
                      </h4>
                      <p className="text-xs text-rose-700">
                        {nearExpiryProducts.length}টি ওষুধের মেয়াদ আগামী ৬০-৯০ দিনের মধ্যে শেষ হচ্ছে (যেমন: {nearExpiryProducts.map(p => p.name).join(', ')})।
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition shrink-0"
                  >
                    তালিকা দেখুন
                  </button>
                </div>
              )}

              {lowStockProducts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-amber-900">
                        লো-স্টক (Low Stock) রিমাইন্ডার!
                      </h4>
                      <p className="text-xs text-amber-700">
                        {lowStockProducts.length}টি পণ্যের মজুদ বিপজ্জনকভাবে কমে গেছে (যেমন: {lowStockProducts.map(p => `${p.name} [স্টক: ${p.stock}]`).join(', ')})।
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition shrink-0"
                  >
                    রি-অর্ডার করুন
                  </button>
                </div>
              )}

              {/* Charts & Stock Value Widgets (Exact layout as user screenshot) */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Sales & Purchases Interactive Chart Widget */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Sales & Purchases</h3>
                      <p className="text-[11px] text-slate-400">রিয়েল-টাইম বিক্রয় ও ক্রয়ের তুলনামূলক চার্ট</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5 text-purple-700 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-700" /> Sales
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Purchases
                      </span>
                    </div>
                  </div>

                  {/* Simulated interactive SVG / bar chart */}
                  <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-slate-100">
                    {[
                      { day: 'শনি', sales: 65, pur: 40 },
                      { day: 'রবি', sales: 85, pur: 55 },
                      { day: 'সোম', sales: 45, pur: 30 },
                      { day: 'মঙ্গল', sales: 90, pur: 70 },
                      { day: 'বুধ', sales: 75, pur: 45 },
                      { day: 'বৃহস্পতি', sales: 110, pur: 60 },
                      { day: 'শুক্র', sales: 135, pur: 80 },
                    ].map((bar, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="w-full flex items-end justify-center gap-1.5 h-full">
                          {/* Sales Bar */}
                          <div
                            style={{ height: `${(bar.sales / 150) * 100}%` }}
                            className="w-4 bg-purple-600 group-hover:bg-purple-700 rounded-t-md transition-all relative"
                          >
                            <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 py-0.5 rounded whitespace-nowrap z-10 transition">
                              ৳{bar.sales * 100}
                            </span>
                          </div>
                          {/* Purchases Bar */}
                          <div
                            style={{ height: `${(bar.pur / 150) * 100}%` }}
                            className="w-4 bg-emerald-400 group-hover:bg-emerald-500 rounded-t-md transition-all relative"
                          >
                            <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1 py-0.5 rounded whitespace-nowrap z-10 transition">
                              ৳{bar.pur * 100}
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">{bar.day}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-3 text-xs text-slate-500">
                    <span>সর্বোচ্চ বিক্রি: শুক্রবার (৳ ১৩,৫০০.০০)</span>
                    <span className="text-emerald-600 font-semibold">সাপ্তাহিক প্রবৃদ্ধি: +১৮%</span>
                  </div>
                </div>

                {/* Right Col: Stock Value Widget (From Screenshot) */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Stock Value</h3>
                    <p className="text-[11px] text-slate-400 mb-4">মোট পণ্য ইনভেন্টরি মূল্যায়ন</p>

                    <div className="space-y-3">
                      {/* Stock Value by Cost (Blue badge) */}
                      <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
                        <div className="flex items-center justify-between text-xs font-semibold text-sky-800">
                          <span>Stock Value by Cost</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-200 text-sky-900">কেনা দর</span>
                        </div>
                        <div className="text-lg font-bold text-sky-950 mt-1">
                          {tenant.currency}{totalStockCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Stock Value by Retail (Yellow badge) */}
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                        <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
                          <span>Stock Value by Retail</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">খুচরা বেচা দর</span>
                        </div>
                        <div className="text-lg font-bold text-amber-950 mt-1">
                          {tenant.currency}{totalStockRetail.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Stock Value by Wholesale (Purple badge) */}
                      <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                        <div className="flex items-center justify-between text-xs font-semibold text-purple-800">
                          <span>Stock Value by Wholesale</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">পাইকারি দর</span>
                        </div>
                        <div className="text-lg font-bold text-purple-950 mt-1">
                          {tenant.currency}{totalStockWholesale.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>মোট স্টক আইটেম:</span>
                    <strong className="text-slate-800">{tenantProducts.length} প্রকার</strong>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Top Selling Products & Payment Distribution */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Selling Products */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-slate-900">Top Selling Products</h3>
                    <button onClick={() => setActiveTab('products')} className="text-xs text-purple-700 hover:underline">
                      সব দেখুন
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {tenantProducts.slice(0, 4).map((p, idx) => (
                      <div key={p.id} className="py-2.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">{p.name}</div>
                            <div className="text-[10px] text-slate-400">{p.category} • স্টক: {p.stock} {p.unit}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-700">{tenant.currency}{p.sellingPrice.toFixed(2)}</div>
                          <div className="text-[10px] text-emerald-600 font-medium">ইন-স্টক</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sales by Payment Method */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
                  <h3 className="font-bold text-sm text-slate-900 mb-3">Sales by Payment Method</h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-700 mb-1">
                        <span className="font-semibold">নগদ ক্যাশ (Cash)</span>
                        <span className="font-bold">৬৫% (৳ ১২,০৫০.০০)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-700 rounded-full" style={{ width: '65%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-700 mb-1">
                        <span className="font-semibold">বিকাশ / নগদ (Mobile MFS)</span>
                        <span className="font-bold">২২% (৳ ৪,১০০.০০)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 rounded-full" style={{ width: '22%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-700 mb-1">
                        <span className="font-semibold">বাকি খাতায় বকেয়া (Credit / Due)</span>
                        <span className="font-bold">১৩% (৳ ২,৪০০.০০)</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: '13%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* PRODUCTS TAB - Phase 1 Full Implementation */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Top Header & Action Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-purple-700" />
                    পণ্য ও ইনভেন্টরি হাব (JH IMSE Products Engine)
                  </h2>
                  <p className="text-xs text-slate-500">
                    {tenant.businessType === 'pharmacy' && 'ওষুধের স্টক, মেয়াদোত্তীর্ণ তারিখ, ড্রাগ লাইসেন্স ও প্রস্তুতকারক ট্র্যাকিং'}
                    {tenant.businessType === 'grocery' && 'খুচরা ও পাইকারি দর, বারকোড এবং ডিজিটাল স্কেল ওজন'}
                    {tenant.businessType === 'electronics' && 'আইএমইআই সিরিয়াল নম্বর ও সার্ভিসিং ওয়ারেন্টি'}
                    {tenant.businessType === 'warehouse' && 'মাল্টি-ডিপো কার্টুন স্টক ও হোলসেল লট'}
                  </p>
                </div>

                {/* 5 Core Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowAddProductModal(true)}
                    className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> নতুন পণ্য
                  </button>

                  <button
                    onClick={() => {
                      setBarcodeProductToPrint(tenantProducts[0]?.id);
                      setIsBarcodeModalOpen(true);
                    }}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Barcode className="w-4 h-4 text-purple-700" /> বারকোড স্টিকার
                  </button>

                  <button
                    onClick={() => setIsBulkImportOpen(true)}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <UploadCloud className="w-4 h-4 text-indigo-600" /> CSV ইমপোর্ট
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-4 h-4 text-emerald-600" /> CSV এক্সপোর্ট
                  </button>

                  <button
                    onClick={() => setIsStockAdjustmentOpen(true)}
                    className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-amber-600" /> +/- স্টক সমন্বয়
                  </button>
                </div>
              </div>

              {/* Status Filter Tabs & Search Bar */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Status Badges */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  <button
                    onClick={() => setProductStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                      productStatusFilter === 'all'
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    সকল পণ্য ({tenantProducts.length})
                  </button>

                  <button
                    onClick={() => setProductStatusFilter('low_stock')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1 ${
                      productStatusFilter === 'low_stock'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    লো-স্টক ({lowStockProducts.length})
                  </button>

                  <button
                    onClick={() => setProductStatusFilter('near_expiry')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap flex items-center gap-1 ${
                      productStatusFilter === 'near_expiry'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                    }`}
                  >
                    মেয়াদোত্তীর্ণ সংকেত ({nearExpiryProducts.length})
                  </button>

                  <button
                    onClick={() => setProductStatusFilter('out_of_stock')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                      productStatusFilter === 'out_of_stock'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    স্টক নেই ({outOfStockProducts.length})
                  </button>
                </div>

                {/* Instant Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={e => setProductSearchQuery(e.target.value)}
                    placeholder="পণ্য, SKU, জেনেরিক বা তাক নম্বর..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-purple-600"
                  />
                  {productSearchQuery && (
                    <button
                      onClick={() => setProductSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Products Table Card */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                {displayedProducts.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">
                    <Package className="w-12 h-12 stroke-[1.2] mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">কোনো পণ্য পাওয়া যায়নি</p>
                    <p className="text-xs text-slate-400 mt-1">ফিল্টার বা সার্চ কি-ওয়ার্ড পরিবর্তন করে দেখুন।</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <tr>
                          <th className="py-3 px-4">পণ্য ও স্পেসিফিকেশন</th>
                          <th className="py-3 px-4">ক্যাটাগরি ও লোকেশন</th>
                          <th className="py-3 px-4">মূল্য বিবরণ (কেনা / পাইকারি / বেচা)</th>
                          <th className="py-3 px-4">বর্তমান মজুদ</th>
                          {tenant.businessType === 'pharmacy' && <th className="py-3 px-4">মেয়াদ ও ব্যাচ নং</th>}
                          {tenant.businessType === 'electronics' && <th className="py-3 px-4">ব্র্যান্ড ও ওয়ারেন্টি</th>}
                          <th className="py-3 px-4 text-center">অনলাইন স্টোর</th>
                          <th className="py-3 px-4 text-right">অ্যাকশন</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {displayedProducts.map(p => {
                          const isLow = p.stock > 0 && p.stock <= p.alertStock;
                          const isOut = p.stock <= 0;

                          return (
                            <tr key={p.id} className="hover:bg-slate-50/80 transition">
                              {/* Product Info */}
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900 text-xs">{p.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                                  <span>SKU: {p.sku}</span>
                                  {p.genericName && (
                                    <span className="text-purple-700 italic font-sans font-medium">• {p.genericName}</span>
                                  )}
                                </div>
                                {p.manufacturer && (
                                  <div className="text-[9px] text-slate-400 font-medium">কোম্পানি: {p.manufacturer}</div>
                                )}
                              </td>

                              {/* Category & Rack */}
                              <td className="py-3 px-4">
                                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                                  {p.category}
                                </span>
                                {p.rackNumber && (
                                  <div className="text-[10px] text-purple-700 font-semibold mt-1">
                                    তাক নং: {p.rackNumber}
                                  </div>
                                )}
                              </td>

                              {/* Pricing (3 Tier) */}
                              <td className="py-3 px-4">
                                <div className="font-bold text-purple-700 text-xs">
                                  বিক্রয়: {tenant.currency}{p.sellingPrice.toFixed(2)}
                                </div>
                                <div className="text-[10px] text-slate-400 flex gap-2 mt-0.5">
                                  <span>কেনা: {tenant.currency}{p.costPrice.toFixed(2)}</span>
                                  {p.wholesalePrice && (
                                    <span>পাইকারি: {tenant.currency}{p.wholesalePrice.toFixed(2)}</span>
                                  )}
                                </div>
                              </td>

                              {/* Stock */}
                              <td className="py-3 px-4">
                                <span className={`inline-block px-2 py-0.5 rounded-lg font-bold text-[11px] ${
                                  isOut
                                    ? 'bg-rose-100 text-rose-700'
                                    : isLow
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {p.stock} {p.unit}
                                </span>
                                {isLow && (
                                  <span className="block text-[9px] text-amber-700 font-semibold mt-0.5">
                                    ⚠️ অ্যালার্ট সীমা: {p.alertStock}
                                  </span>
                                )}
                              </td>

                              {/* Pharmacy Specific */}
                              {tenant.businessType === 'pharmacy' && (
                                <td className="py-3 px-4">
                                  <div className="font-medium text-slate-800 text-[11px]">{p.expiryDate || 'N/A'}</div>
                                  <div className="text-[10px] text-slate-400">ব্যাচ: {p.batchNumber || 'N/A'}</div>
                                  {p.darNumber && (
                                    <div className="text-[9px] text-slate-400">DAR: {p.darNumber}</div>
                                  )}
                                </td>
                              )}

                              {/* Electronics Specific */}
                              {tenant.businessType === 'electronics' && (
                                <td className="py-3 px-4">
                                  <div className="font-medium text-slate-800 text-[11px]">{p.brand || 'N/A'}</div>
                                  <span className="text-indigo-600 font-semibold text-[10px]">
                                    {p.warrantyMonths ? `🛡️ ${p.warrantyMonths} মাস ওয়ারেন্টি` : 'ওয়ারেন্টি নেই'}
                                  </span>
                                </td>
                              )}

                              {/* Online Storefront toggle */}
                              <td className="py-3 px-4 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  p.showInOnlineStore
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-slate-100 text-slate-400'
                                }`}>
                                  {p.showInOnlineStore ? 'ওয়েবসাইটে চালু' : 'অফলাইন'}
                                </span>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => {
                                      setBarcodeProductToPrint(p.id);
                                      setIsBarcodeModalOpen(true);
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-purple-700 rounded-lg hover:bg-purple-50 transition"
                                    title="বারকোড লেবেল প্রিন্ট"
                                  >
                                    <Barcode className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      setIsStockAdjustmentOpen(true);
                                    }}
                                    className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition"
                                    title="+/- স্টক সমন্বয়"
                                  >
                                    <SlidersHorizontal className="w-4 h-4" />
                                  </button>

                                  {onDeleteProduct && (
                                    <button
                                      onClick={() => {
                                        if (confirm(`আপনি কি নিশ্চিত যে "${p.name}" পণ্যটি ইনভেন্টরি থেকে মুছে ফেলতে চান?`)) {
                                          onDeleteProduct(p.id);
                                        }
                                      }}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                                      title="পণ্য মুছে ফেলুন"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* INVOICES & BILLING ECOSYSTEM (Kanakku SaaS Style) */}
          {activeTab === 'invoices' && (
            <div className="space-y-6">
              {/* Header with Actions */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">ইনভয়েস, বিলিং ও কোটেশন হাব</h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    কোটেশন জেনারেশন, A4 কর্পোরেট ট্যাক্স ইনভয়েস, থার্মাল POS রশিদ, ট্রান্সপোর্ট চালান ও বিক্রয় ফেরত ক্রেডিট নোট
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setIsQuotationModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    নতুন কোটেশন
                  </button>
                  <button
                    onClick={() => setIsChallanModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-xl border border-amber-200 transition-colors cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    ডেলিভারি চালান
                  </button>
                  <button
                    onClick={() => setIsCreditNoteModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    বিক্রয় ফেরত
                  </button>
                  <button
                    onClick={onOpenPOS}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    + POS ক্যাশ কাউন্টার
                  </button>
                </div>
              </div>

              {/* 4 Kanakku Top KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Invoiced */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">মোট ইনভয়েস বিলিং</p>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                        {tenant.currency}{invoiceStats.totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>মোট ইস্যুকৃত ইনভয়েস</span>
                    <span className="font-bold text-slate-700">{invoiceStats.invoicesCount} টি</span>
                  </div>
                </div>

                {/* Paid Invoices */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">পরিশোধিত ইনভয়েস (Paid)</p>
                      <h3 className="text-xl font-extrabold text-emerald-700 mt-1">
                        {tenant.currency}{invoiceStats.paidTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>পূর্ণ পরিশোধ ইনভয়েস</span>
                    <span className="font-bold text-emerald-600">{invoiceStats.paidCount} টি</span>
                  </div>
                </div>

                {/* Due Invoices */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">বকেয়া ইনভয়েস (Due)</p>
                      <h3 className="text-xl font-extrabold text-rose-600 mt-1">
                        {tenant.currency}{invoiceStats.dueTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>বকেয়া রয়েছে</span>
                    <span className="font-bold text-rose-600">{invoiceStats.dueCount} টি ইনভয়েস</span>
                  </div>
                </div>

                {/* Returns / Credit Notes */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">বিক্রয় ফেরত (Credit Notes)</p>
                      <h3 className="text-xl font-extrabold text-purple-700 mt-1">
                        {tenant.currency}{invoiceStats.returnedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </h3>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>মোট ক্রেডিট নোট</span>
                    <span className="font-bold text-purple-600">{invoiceStats.returnedCount} টি</span>
                  </div>
                </div>
              </div>

              {/* Invoicing Navigation Tabs (Kanakku Sub-tabs) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="flex border-b border-slate-200 bg-slate-50/70 p-2 gap-2 overflow-x-auto">
                  <button
                    onClick={() => setInvoiceSubTab('invoices')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      invoiceSubTab === 'invoices'
                        ? 'bg-white text-blue-700 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    বিক্রয় ইনভয়েস তালিকা
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 font-extrabold">
                      {tenantSales.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setInvoiceSubTab('quotations')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      invoiceSubTab === 'quotations'
                        ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    কোটেশন হাব (Quotations)
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-700 font-extrabold">
                      {tenantQuotations.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setInvoiceSubTab('challans')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      invoiceSubTab === 'challans'
                        ? 'bg-white text-amber-800 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    ডেলিভারি চালান (Challans)
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-extrabold">
                      {tenantDeliveryChallans.length}
                    </span>
                  </button>

                  <button
                    onClick={() => setInvoiceSubTab('credit_notes')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      invoiceSubTab === 'credit_notes'
                        ? 'bg-white text-rose-700 shadow-xs border border-slate-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    বিক্রয় ফেরত (Credit Notes)
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700 font-extrabold">
                      {tenantCreditNotes.length}
                    </span>
                  </button>
                </div>

                {/* TAB 1: INVOICES LIST */}
                {invoiceSubTab === 'invoices' && (
                  <div>
                    {/* Filters & Search Toolbar */}
                    <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
                      {/* Status Tabs */}
                      <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
                        <button
                          onClick={() => setInvoiceFilterStatus('all')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            invoiceFilterStatus === 'all'
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          সকল ({tenantSales.length})
                        </button>
                        <button
                          onClick={() => setInvoiceFilterStatus('paid')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            invoiceFilterStatus === 'paid'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          পরিশোধিত ({invoiceStats.paidCount})
                        </button>
                        <button
                          onClick={() => setInvoiceFilterStatus('due')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            invoiceFilterStatus === 'due'
                              ? 'bg-rose-600 text-white'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          বকেয়া ({invoiceStats.dueCount})
                        </button>
                        <button
                          onClick={() => setInvoiceFilterStatus('returned')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            invoiceFilterStatus === 'returned'
                              ? 'bg-purple-600 text-white'
                              : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                          }`}
                        >
                          ফেরত ({invoiceStats.returnedCount})
                        </button>
                      </div>

                      {/* Search Field */}
                      <div className="relative w-full md:w-72">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={invoiceSearchQuery}
                          onChange={(e) => setInvoiceSearchQuery(e.target.value)}
                          placeholder="ইনভয়েস #, নাম, মোবাইল বা TrxID..."
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                        {invoiceSearchQuery && (
                          <button
                            onClick={() => setInvoiceSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Invoices Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4">ইনভয়েস নং</th>
                            <th className="py-3 px-4">গ্রাহকের তথ্য</th>
                            <th className="py-3 px-4">তারিখ ও সময়</th>
                            <th className="py-3 px-4">পেমেন্ট মাধ্যম</th>
                            <th className="py-3 px-4 text-right">মোট বিল</th>
                            <th className="py-3 px-4 text-right">পরিশোধ</th>
                            <th className="py-3 px-4 text-right">বকেয়া</th>
                            <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                            <th className="py-3 px-4 text-center">ইনভয়েস প্রিন্ট ও অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {displayedInvoices.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="py-12 text-center text-slate-400">
                                <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                                <p className="font-medium">কোনো ইনভয়েস রেকর্ড পাওয়া যায়নি</p>
                                <p className="text-[11px] text-slate-400 mt-1">POS ক্যাশ কাউন্টার থেকে নতুন বিক্রয় সম্পন্ন করুন</p>
                              </td>
                            </tr>
                          ) : (
                            displayedInvoices.map((sale) => {
                              const isDue = (sale.dueAmount || 0) > 0;
                              const isWholesale = sale.pricingType === 'wholesale';
                              const total = sale.totalAmount;
                              const paid = sale.paidAmount;

                              return (
                                <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                                    <div className="flex items-center gap-1.5">
                                      <span>#{sale.invoiceNumber || sale.id}</span>
                                      {isWholesale ? (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 font-bold">
                                          পাইকারি
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                                          খুচরা
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                                      {sale.items.length} টি আইটেম
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <div className="font-semibold text-slate-900">
                                      {sale.customerName || 'সাধারণ ক্রেতা (Walk-in)'}
                                    </div>
                                    {sale.customerPhone && (
                                      <div className="text-[11px] text-slate-500 font-mono">
                                        {sale.customerPhone}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                                    <div>{new Date(sale.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">
                                      {new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 uppercase">
                                      {sale.paymentMethod}
                                    </span>
                                    {sale.transactionId && (
                                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                                        Trx: {sale.transactionId}
                                      </div>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                                    {tenant.currency}{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                                    {tenant.currency}{paid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </td>
                                  <td className="py-3.5 px-4 text-right font-bold">
                                    {isDue ? (
                                      <span className="text-rose-600">
                                        {tenant.currency}{(sale.dueAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 font-mono">৳0.00</span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    {isDue ? (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                                        বকেয়া
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                        <CheckCircle2 className="w-3 h-3" />
                                        পেইড
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                      {/* Thermal Receipt */}
                                      <button
                                        onClick={() => onOpenReceipt?.(sale)}
                                        title="থার্মাল রসিদ (POS Slip) প্রিন্ট"
                                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                                      >
                                        <Receipt className="w-3.5 h-3.5" />
                                      </button>
                                      {/* A4 Tax Invoice */}
                                      <button
                                        onClick={() => onOpenA4Invoice?.(sale)}
                                        title="A4 কর্পোরেট ট্যাক্স ইনভয়েস প্রিন্ট"
                                        className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer border border-blue-200"
                                      >
                                        <FileText className="w-3 h-3" />
                                        A4 ইনভয়েস
                                      </button>
                                      {/* Delivery Challan */}
                                      <button
                                        onClick={() => setIsChallanModalOpen(true)}
                                        title="চালান ইস্যু করুন"
                                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
                                      >
                                        <Truck className="w-3.5 h-3.5" />
                                      </button>
                                      {/* Sales Return / Credit Note */}
                                      <button
                                        onClick={() => setIsCreditNoteModalOpen(true)}
                                        title="বিক্রয় ফেরত / ক্রেডিট নোট তৈরি করুন"
                                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 2: QUOTATIONS LIST */}
                {invoiceSubTab === 'quotations' && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">গ্রাহক কোটেশন ও প্রাইজ অফার লেটার</h4>
                        <p className="text-xs text-slate-500">কোটেশন অনুমোদন হলে ১-ক্লিকেই সরাসরি ইনভয়েসে রূপান্তর করা যাবে</p>
                      </div>
                      <button
                        onClick={() => setIsQuotationModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        নতুন কোটেশন তৈরি
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">কোটেশন নং</th>
                            <th className="py-2.5 px-3">গ্রাহক ও প্রতিষ্ঠান</th>
                            <th className="py-2.5 px-3">মেয়াদ (Valid Until)</th>
                            <th className="py-2.5 px-3">আইটেম সংখ্যা</th>
                            <th className="py-2.5 px-3 text-right">মোট অফার মূল্য</th>
                            <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                            <th className="py-2.5 px-3 text-center">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {tenantQuotations.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-400">
                                <Award className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                <p className="font-semibold text-slate-600">কোনো কোটেশন তৈরি করা হয়নি</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">নতুন কোটেশন তৈরি করতে উপরের বাটনে ক্লিক করুন</p>
                              </td>
                            </tr>
                          ) : (
                            tenantQuotations.map((q) => (
                              <tr key={q.id} className="hover:bg-slate-50/70">
                                <td className="py-3 px-3 font-mono font-bold text-slate-900">
                                  {q.quotationNumber}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-slate-900">{q.customerName}</div>
                                  {q.customerPhone && <div className="text-[11px] text-slate-500 font-mono">{q.customerPhone}</div>}
                                </td>
                                <td className="py-3 px-3 text-slate-600 font-mono">
                                  {q.validUntil}
                                </td>
                                <td className="py-3 px-3 text-slate-700">
                                  {q.items.length} টি পণ্য
                                </td>
                                <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                                  {tenant.currency}{q.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  {q.status === 'converted' ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                      ইনভয়েসে রূপান্তরিত
                                    </span>
                                  ) : q.status === 'accepted' ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                                      গৃহীত (Accepted)
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                      প্রস্তাবিত (Sent)
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    {q.status !== 'converted' && onConvertToInvoice && (
                                      <button
                                        onClick={() => onConvertToInvoice(q)}
                                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-[11px] font-bold cursor-pointer"
                                      >
                                        বিক্রয়ে রূপান্তর
                                      </button>
                                    )}
                                    <button
                                      onClick={() => setIsQuotationModalOpen(true)}
                                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                                      title="কোটেশন দেখুন ও প্রিন্ট করুন"
                                    >
                                      <Printer className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 3: CHALLANS LIST */}
                {invoiceSubTab === 'challans' && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">ডেলিভারি চালান ও ট্রান্সপোর্ট গেটপাস</h4>
                        <p className="text-xs text-slate-500">পণ্য ডেলিভারি ও কুরিয়ার ট্র্যাকিং এর জন্য অফিসিয়াল ডেলিভারি চালান</p>
                      </div>
                      <button
                        onClick={() => setIsChallanModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        নতুন চালান তৈরি
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">চালান নং</th>
                            <th className="py-2.5 px-3">ইনভয়েস রেফারেন্স</th>
                            <th className="py-2.5 px-3">গ্রাহক ও গন্তব্য</th>
                            <th className="py-2.5 px-3">ট্রান্সপোর্ট / কুরিয়ার</th>
                            <th className="py-2.5 px-3">যানবাহন ও চালক</th>
                            <th className="py-2.5 px-3 text-center">স্ট্যাটাস</th>
                            <th className="py-2.5 px-3 text-center">প্রিন্ট</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {tenantDeliveryChallans.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-400">
                                <Truck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                <p className="font-semibold text-slate-600">কোনো ডেলিভারি চালান পাওয়া যায়নি</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">নতুন চালান তৈরি করতে উপরের বাটনে ক্লিক করুন</p>
                              </td>
                            </tr>
                          ) : (
                            tenantDeliveryChallans.map((dc) => (
                              <tr key={dc.id} className="hover:bg-slate-50/70">
                                <td className="py-3 px-3 font-mono font-bold text-amber-800">
                                  {dc.challanNumber}
                                </td>
                                <td className="py-3 px-3 font-mono text-slate-700">
                                  #{dc.invoiceNumber}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="font-semibold text-slate-900">{dc.customerName}</div>
                                  <div className="text-[11px] text-slate-500 truncate max-w-xs">{dc.deliveryAddress}</div>
                                </td>
                                <td className="py-3 px-3 text-slate-700">
                                  <span className="font-medium">{dc.transportName}</span>
                                </td>
                                <td className="py-3 px-3 text-slate-600">
                                  <div>{dc.vehicleNumber || '—'}</div>
                                  {dc.driverPhone && <div className="text-[10px] text-slate-400">{dc.driverPhone}</div>}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  {dc.status === 'delivered' ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                                      ডেলিভার্ড
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                                      ইন-ট্রানজিট
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <button
                                    onClick={() => setIsChallanModalOpen(true)}
                                    className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 cursor-pointer"
                                    title="চালান প্রিন্ট করুন"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 4: CREDIT NOTES LIST */}
                {invoiceSubTab === 'credit_notes' && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">বিক্রয় ফেরত ও ক্রেডিট নোট (Sales Returns)</h4>
                        <p className="text-xs text-slate-500">ত্রুটিযুক্ত বা অতিরিক্ত পণ্য ফেরত নেওয়া এবং ইনভেন্টরি অটো-এডজাস্টমেন্ট</p>
                      </div>
                      <button
                        onClick={() => setIsCreditNoteModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        নতুন ক্রেডিট নোট তৈরি
                      </button>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">ক্রেডিট নোট নং</th>
                            <th className="py-2.5 px-3">মূল ইনভয়েস #</th>
                            <th className="py-2.5 px-3">গ্রাহক</th>
                            <th className="py-2.5 px-3">ফেরতের কারণ</th>
                            <th className="py-2.5 px-3">রিফান্ড মাধ্যম</th>
                            <th className="py-2.5 px-3 text-right">মোট রিফান্ড টাকা</th>
                            <th className="py-2.5 px-3 text-center">প্রিন্ট</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {tenantCreditNotes.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-400">
                                <RotateCcw className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                                <p className="font-semibold text-slate-600">কোনো বিক্রয় ফেরত বা ক্রেডিট নোট নেই</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">গ্রাহক পণ্য ফেরত দিলে নতুন ক্রেডিট নোট তৈরি করুন</p>
                              </td>
                            </tr>
                          ) : (
                            tenantCreditNotes.map((cn) => (
                              <tr key={cn.id} className="hover:bg-slate-50/70">
                                <td className="py-3 px-3 font-mono font-bold text-rose-700">
                                  {cn.creditNoteNumber}
                                </td>
                                <td className="py-3 px-3 font-mono text-slate-700">
                                  #{cn.originalInvoiceNumber}
                                </td>
                                <td className="py-3 px-3 font-semibold text-slate-900">
                                  {cn.customerName}
                                </td>
                                <td className="py-3 px-3 text-slate-600">
                                  {cn.reason}
                                </td>
                                <td className="py-3 px-3">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                    {cn.refundMethod === 'cash' ? 'নগদ ফেরত' : cn.refundMethod === 'adjust_due' ? 'বাকি সমন্বয়' : 'স্টোর ক্রেডিট'}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-extrabold text-rose-600">
                                  {tenant.currency}{cn.totalRefundAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <button
                                    onClick={() => setIsCreditNoteModalOpen(true)}
                                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                                    title="ক্রেডিট নোট প্রিন্ট করুন"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CRM & DIGITAL DUE LEDGER (বাকি খাতা) */}
          {activeTab === 'crm' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">CRM ও ডিজিটাল বাকি খাতা (Customer Due Ledger)</h2>
                  <p className="text-xs text-slate-500">গ্রাহকের বাকির হিসাব, পেমেন্ট আদায় এবং সরাসরি মোবাইলে অটো এসএমএস পাঠানো</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs font-semibold text-purple-900">
                  মোট কাস্টমার বকেয়া: <strong className="text-sm font-extrabold text-rose-600">{tenant.currency}{totalSalesDue.toFixed(2)}</strong>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tenantCustomers.map(cust => (
                  <div key={cust.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{cust.name}</h4>
                          <p className="text-xs text-slate-500">{cust.phone}</p>
                        </div>
                        {cust.dueAmount > 0 ? (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 font-bold rounded-lg text-xs">
                            বাকি: {tenant.currency}{cust.dueAmount}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-medium rounded-lg text-xs">
                            পরিশোধিত
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2">{cust.address}</p>
                      <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-600">
                        <span>মোট ক্রয়: {tenant.currency}{cust.totalSpent}</span>
                        <span>অর্ডার সংখ্যা: {cust.purchaseCount} বার</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
                      <button
                        onClick={() => onSmsCustomerDue(cust)}
                        disabled={cust.dueAmount <= 0}
                        className="flex-1 py-1.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <Send className="w-3.5 h-3.5" /> বকেয়া তাগাদা SMS
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ONLINE E-COMMERCE ORDERS TAB */}
          {activeTab === 'ecommerce' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">অনলাইন ই-কমার্স ও লাইভ কাস্টমার অর্ডার</h2>
                  <p className="text-xs text-slate-500">আপনার ওয়েবসাইট ({tenant.slug}.bizpulse.store) থেকে আসা সরাসরি অর্ডার</p>
                </div>
                <button
                  onClick={onOpenStorefront}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Eye className="w-4 h-4" /> লাইভ স্টোরফ্রন্ট ভিজিট করুন
                </button>
              </div>

              {tenantOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">কোনো নতুন অনলাইন অর্ডার নেই</p>
                  <p className="text-xs text-slate-400 mt-1">কাস্টমাররা আপনার ওয়েবসাইটে অর্ডার দিলে সাথে সাথে এখানে চলে আসবে।</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tenantOrders.map(order => (
                    <div key={order.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-purple-700 text-xs">{order.orderNumber}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.status === 'pending' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                            order.status === 'processing' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {order.status}
                          </span>
                          <span className="text-[10px] text-slate-400">{order.createdAt}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-1">
                          {order.customerName} ({order.customerPhone})
                        </h4>
                        <p className="text-xs text-slate-500">{order.customerAddress}</p>
                        <div className="text-xs text-purple-900 font-medium mt-1">
                          পণ্য: {order.items.map(i => `${i.productName} (${i.quantity}x)`).join(', ')}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase font-medium">{order.paymentMethod}</span>
                          <span className="text-base font-extrabold text-purple-700">{tenant.currency}{order.totalAmount.toFixed(2)}</span>
                        </div>

                        {order.status === 'pending' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'processing')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                          >
                            অর্ডার কনফার্ম করুন
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button
                            onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                            className="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition"
                          >
                            ডেলিভারি সম্পন্ন
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HRM TAB */}
          {activeTab === 'hrm' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">HRM, কর্মচারী হাজিরা ও সেলস কমিশন</h2>
                  <p className="text-xs text-slate-500">স্টাফদের মাসিক বেতন, দৈনিক উপস্থিতি এবং বিক্রয়ের ওপর কমিশন নির্ধারণ</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tenantEmployees.map(emp => (
                  <div key={emp.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{emp.name}</h4>
                        <span className="inline-block px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold uppercase mt-1">
                          {emp.role}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        উপস্থিত
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>মূল মাসিক বেতন:</span>
                        <span className="font-semibold">{tenant.currency}{emp.salary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>চলতি মাসের সেলস:</span>
                        <span className="font-semibold text-purple-700">{tenant.currency}{emp.salesThisMonth.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>কমিশন ({emp.salesCommissionRate}%):</span>
                        <span className="font-bold text-emerald-600">
                          {tenant.currency}{(emp.salesThisMonth * (emp.salesCommissionRate / 100)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-100 font-bold text-slate-900">
                        <span>মোট পরিশোধযোগ্য:</span>
                        <span>{tenant.currency}{(emp.salary + (emp.salesThisMonth * (emp.salesCommissionRate / 100))).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI TAB */}
          {activeTab === 'ai' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-700" />
                  স্মার্ট বিজনেস অ্যানালিটিক্স ও সেলস ফোরকাস্টিং (JH IMSE BI)
                </h2>
                <p className="text-xs text-slate-500">ইনভেন্টরি টার্নওভার, বিক্রয় ট্রেন্ড ও লাভজনকতা বৃদ্ধির স্বয়ংক্রিয় অ্যানালিটিক্স</p>
              </div>

              {/* Natural language query bar */}
              <div className="bg-white rounded-2xl p-4 border border-purple-200 shadow-sm">
                <form onSubmit={handleAskAI} className="flex gap-2">
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={e => setAiQuestion(e.target.value)}
                    placeholder="যেমন: 'গত সপ্তাহের তুলনায় লাভ কেমন?' অথবা 'কোন মালের স্টক কমে গেছে?'"
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <button
                    type="submit"
                    disabled={isAiThinking}
                    className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <TrendingUp className="w-3.5 h-3.5 text-purple-200" /> {isAiThinking ? 'হিসাব সম্পন্ন হচ্ছে...' : 'রিপোর্ট তৈরি করুন'}
                  </button>
                </form>

                {aiAnswer && (
                  <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 font-medium">
                    📊 <strong>সিস্টেম অ্যানালাইসিস রিপোর্ট:</strong> {aiAnswer}
                  </div>
                )}
              </div>

              {/* AI Auto Insights cards */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase text-slate-400 tracking-wider">অটোমেটেড ইনসাইটস</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                      জরুরি রিস্টক সংকেত
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">অ্যান্টিবায়োটিক ও প্রয়োজনীয় স্টকে ঘাটতি</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      গত ৩ দিনের বিক্রয়ের হার অনুযায়ী আজথ্রোসিন ও প্যারাসিটামলের স্টক আগামী ৭২ ঘণ্টার মধ্যে শেষ হয়ে যাবে।
                    </p>
                    <button className="text-xs font-bold text-purple-700 hover:underline">
                      সাপ্লায়ারকে অটো পারচেজ অর্ডার ড্রাফট করুন →
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                      ডেড-স্টক অ্যালার্ট
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">৩টি পণ্যের বিক্রি গত ৯০ দিনে শূন্য</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      এই পণ্যগুলোতে মোট ৳ ৪,৫০০ মূলধন আটকে রয়েছে। এখনই ১০% ছাড় দিয়ে বিক্রি শুরু করার সুপারিশ করা হচ্ছে।
                    </p>
                    <button className="text-xs font-bold text-purple-700 hover:underline">
                      ১০% ডিসকাউন্ট প্রমোশন সক্রিয় করুন →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WAREHOUSES & SETTINGS TABS */}
          {(activeTab === 'warehouses' || activeTab === 'accounting' || activeTab === 'settings') && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs max-w-2xl space-y-4">
              <h3 className="font-bold text-base text-slate-900 capitalize">{activeTab} কনফিগারেশন</h3>
              <p className="text-xs text-slate-500">
                মুদ্রা: {tenant.currency} • ভ্যাট রেজিস্ট্রেশন: ২০২৫-৮৮৯৯১ • থার্মাল প্রিন্টার সাইজ: ৮০মিমি (80mm standard paper)
              </p>
              <div className="pt-2">
                <button
                  onClick={() => alert('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!')}
                  className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold"
                >
                  সেভ করুন
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-purple-100 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-purple-800 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">নতুন পণ্য যুক্ত করুন ({tenant.name})</h3>
                <p className="text-xs text-purple-200">ইনভেন্টরি ও অনলাইন স্টোরে পণ্যটি যুক্ত হবে</p>
              </div>
              <button onClick={() => setShowAddProductModal(false)} className="text-purple-200 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="p-5 space-y-3 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">পণ্যের নাম: *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: নাপা ৫০০মিগ্রা / বাসমতি চাল"
                    value={pName}
                    onChange={e => setPName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SKU / বারকোড:</label>
                  <input
                    type="text"
                    placeholder="অটো জেনারেট"
                    value={pSku}
                    onChange={e => setPSku(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ক্যাটাগরি:</label>
                  <input
                    type="text"
                    placeholder="যেমন: মেডিসিন / চাল"
                    value={pCategory}
                    onChange={e => setPCategory(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">কেনা দর (Cost Price):</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={pCostPrice}
                    onChange={e => setPCostPrice(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">খুচরা বিক্রয় মূল্য (MRP): *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0.00"
                    value={pSellingPrice}
                    onChange={e => setPSellingPrice(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl font-bold text-purple-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">পাইকারি দর (Wholesale):</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="যেমন: ৳৫০.০০"
                    value={pWholesalePrice}
                    onChange={e => setPWholesalePrice(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-slate-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">প্রারম্ভিক স্টক:</label>
                  <input
                    type="number"
                    placeholder="10"
                    value={pStock}
                    onChange={e => setPStock(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">সতর্কবার্তা স্টক (Low Alert):</label>
                  <input
                    type="number"
                    placeholder="5"
                    value={pAlertStock}
                    onChange={e => setPAlertStock(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-amber-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">একক (Unit):</label>
                  <select
                    value={pUnit}
                    onChange={e => setPUnit(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                  >
                    <option value="pcs">পিস (pcs)</option>
                    <option value="kg">কেজি (kg)</option>
                    <option value="strip">পাতা (strip)</option>
                    <option value="bottle">বোতল (bottle)</option>
                    <option value="box">কার্টুন (box)</option>
                    <option value="packet">প্যাকেট (packet)</option>
                    <option value="meter">মিটার (meter)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">কোম্পানি / প্রস্তুতকারক:</label>
                  <input
                    type="text"
                    placeholder="যেমন: স্কয়ার / বেক্সিমকো / প্রাণ"
                    value={pManufacturer}
                    onChange={e => setPManufacturer(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">র‍্যাক বা তাকের অবস্থান:</label>
                  <input
                    type="text"
                    placeholder="যেমন: Rack-A1, Shelf-3"
                    value={pRackNumber}
                    onChange={e => setPRackNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Special Fields for Pharmacy */}
              {tenant.businessType === 'pharmacy' && (
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-2">
                  <span className="font-bold text-purple-900 block text-xs">⚕️ ফার্মেসি স্পেশাল ফিল্ডস (DGDA স্ট্যান্ডার্ড):</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 block">জেনেরিক নাম:</label>
                      <input
                        type="text"
                        placeholder="যেমন: Paracetamol 500mg"
                        value={pGeneric}
                        onChange={e => setPGeneric(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block">ঔষধের ধরন (Dosage Form):</label>
                      <select
                        value={pDosageForm}
                        onChange={e => setPDosageForm(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="Tablet">Tablet (ট্যাবলেট)</option>
                        <option value="Capsule">Capsule (ক্যাপসুল)</option>
                        <option value="Syrup">Syrup (সিরাপ)</option>
                        <option value="Suspension">Suspension</option>
                        <option value="Injection">Injection (ইনজেকশন)</option>
                        <option value="Ointment">Ointment / Gel (মলম)</option>
                        <option value="Eye Drops">Eye / Ear Drops (ড্রপ)</option>
                        <option value="Suppository">Suppository</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block">মেয়াদোত্তীর্ণ তারিখ (Expiry):</label>
                      <input
                        type="date"
                        value={pExpiry}
                        onChange={e => setPExpiry(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block">ব্যাচ নম্বর:</label>
                      <input
                        type="text"
                        placeholder="BEX-2026-01"
                        value={pBatch}
                        onChange={e => setPBatch(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] text-slate-600 block">DAR / ড্রাগ রেজিস্ট্রেশন নম্বর:</label>
                      <input
                        type="text"
                        placeholder="যেমন: DAR-025-010"
                        value={pDarNumber}
                        onChange={e => setPDarNumber(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Special Fields for Electronics & Hardware */}
              {tenant.businessType === 'electronics' && (
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 space-y-2">
                  <span className="font-bold text-indigo-900 block text-xs">⚡ গ্যাজেট ও ইলেকট্রনিক্স ফিল্ডস:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-600 block">ব্র্যান্ড (Brand):</label>
                      <input
                        type="text"
                        placeholder="যেমন: Samsung, Walton, Apple"
                        value={pBrand}
                        onChange={e => setPBrand(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 block">মডেল নম্বর:</label>
                      <input
                        type="text"
                        placeholder="যেমন: SM-G998B"
                        value={pModelNumber}
                        onChange={e => setPModelNumber(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[11px] text-slate-600 block">ওয়ারেন্টির মেয়াদ (মাসে):</label>
                      <input
                        type="number"
                        placeholder="১২"
                        value={pWarranty}
                        onChange={e => setPWarranty(e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pOnlineCheck"
                  checked={pOnline}
                  onChange={e => setPOnline(e.target.checked)}
                  className="rounded text-purple-700"
                />
                <label htmlFor="pOnlineCheck" className="text-slate-700 font-semibold cursor-pointer">
                  অনলাইন ই-কমার্স ওয়েবসাইটে দেখান
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-xs"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode & Price Tag Generator Modal */}
      <BarcodeGeneratorModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        tenant={tenant}
        products={tenantProducts}
        initialSelectedProductId={barcodeProductToPrint}
      />

      {/* CSV Bulk Product Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        tenant={tenant}
        warehouseId={activeWarehouseId}
        onImportProducts={(prods) => {
          if (onBulkImportProducts) {
            onBulkImportProducts(prods);
          }
        }}
      />

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isStockAdjustmentOpen}
        onClose={() => setIsStockAdjustmentOpen(false)}
        tenant={tenant}
        products={tenantProducts}
        onApplyAdjustment={(productId, newStock, record) => {
          if (onAdjustStock) {
            onAdjustStock(productId, newStock, record);
          }
        }}
      />

      {/* Quotations Modal */}
      <QuotationModal
        isOpen={isQuotationModalOpen}
        onClose={() => setIsQuotationModalOpen(false)}
        tenant={tenant}
        products={tenantProducts}
        customers={tenantCustomers}
        quotations={quotations}
        onCreateQuotation={(q) => onCreateQuotation?.(q)}
        onConvertToInvoice={(q) => onConvertToInvoice?.(q)}
      />

      {/* Delivery Challans Modal */}
      <DeliveryChallanModal
        isOpen={isChallanModalOpen}
        onClose={() => setIsChallanModalOpen(false)}
        tenant={tenant}
        sales={tenantSales}
        challans={deliveryChallans}
        onCreateChallan={(ch) => onCreateDeliveryChallan?.(ch)}
      />

      {/* Credit Note / Sales Return Modal */}
      <CreditNoteModal
        isOpen={isCreditNoteModalOpen}
        onClose={() => setIsCreditNoteModalOpen(false)}
        tenant={tenant}
        sales={tenantSales}
        creditNotes={creditNotes}
        onCreateCreditNote={(cn, items) => onCreateCreditNote?.(cn, items)}
      />
    </div>
  );
};
