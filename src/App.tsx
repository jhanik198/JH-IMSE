import React, { useState } from 'react';
import { 
  INITIAL_TENANTS, INITIAL_PRODUCTS, INITIAL_CUSTOMERS, 
  INITIAL_SALES, INITIAL_EMPLOYEES, INITIAL_ONLINE_ORDERS, 
  INITIAL_WAREHOUSES, INITIAL_QUOTATIONS, INITIAL_DELIVERY_CHALLANS,
  INITIAL_CREDIT_NOTES, INITIAL_PAYMENT_RECEIPTS,
  INITIAL_ATTENDANCE_RECORDS, INITIAL_ROLE_PERMISSIONS, INITIAL_SALARY_SLIPS
} from './data/mockData';
import { 
  Tenant, Product, Sale, Customer, Employee, OnlineOrder, Warehouse,
  Quotation, DeliveryChallan, CreditNote, CustomerPaymentReceipt,
  CustomerTransaction, AttendanceRecord, RolePermission, SalarySlip
} from './types';
import { LandingPage } from './components/LandingPage';
import { SuperAdmin } from './components/SuperAdmin';
import { TenantDashboard } from './components/TenantDashboard';
import { POSScreen } from './components/POSScreen';
import { StorefrontView } from './components/StorefrontView';
import { CalculatorModal } from './components/CalculatorModal';
import { ThermalReceipt } from './components/ThermalReceipt';
import { A4InvoiceModal } from './components/A4InvoiceModal';
import { CheckCircle2, MessageSquare, X, ArrowLeft, Building2 } from 'lucide-react';

export default function App() {
  // Navigation View State
  const [currentView, setCurrentView] = useState<
    'landing' | 'super_admin' | 'tenant_dashboard' | 'pos' | 'storefront'
  >('landing');
  const [isImpersonating, setIsImpersonating] = useState(false);

  // Core Data Collections
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [activeTenantId, setActiveTenantId] = useState<string>('tenant-1');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>(INITIAL_ONLINE_ORDERS);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(INITIAL_WAREHOUSES);
  const [activeWarehouseId, setActiveWarehouseId] = useState<string>('all');
  const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);
  const [deliveryChallans, setDeliveryChallans] = useState<DeliveryChallan[]>(INITIAL_DELIVERY_CHALLANS);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>(INITIAL_CREDIT_NOTES);
  const [paymentReceipts, setPaymentReceipts] = useState<CustomerPaymentReceipt[]>(INITIAL_PAYMENT_RECEIPTS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_RECORDS);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>(INITIAL_ROLE_PERMISSIONS);
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>(INITIAL_SALARY_SLIPS);

  // Modals & Tools
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<Sale | null>(null);
  const [activeA4InvoiceSale, setActiveA4InvoiceSale] = useState<Sale | null>(null);
  const [systemBroadcast, setSystemBroadcast] = useState(
    'সিস্টেম আপডেট নোটিশ: আজ রাত ১২টায় সার্ভার অপ্টিমাইজেশন সম্পন্ন হবে।'
  );

  // SMS Alert Simulation Toast
  const [smsToast, setSmsToast] = useState<{ name: string; phone: string; amount: number; message?: string } | null>(null);

  // Active Tenant Helper
  const activeTenant = tenants.find(t => t.id === activeTenantId) || tenants[0];

  // Actions
  const handleCreateTenant = (newTenantData: Omit<Tenant, 'id' | 'createdAt'>) => {
    const newId = 'tenant-' + (tenants.length + 1);
    const created: Tenant = {
      ...newTenantData,
      id: newId,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setTenants(prev => [created, ...prev]);

    // Create a default warehouse for this tenant
    const newWh: Warehouse = {
      id: 'wh-' + Date.now(),
      tenantId: newId,
      name: 'Main Store Outlet',
      location: created.address,
      isMain: true,
    };
    setWarehouses(prev => [...prev, newWh]);

    // Switch directly into their new dashboard
    setActiveTenantId(newId);
    setCurrentView('tenant_dashboard');
  };

  const handleUpdateTenant = (updated: Tenant) => {
    setTenants(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const handleCompleteSale = (newSale: Sale) => {
    // 1. Add to sales log
    setSales(prev => [newSale, ...prev]);

    // 2. Deduct inventory stock for each item sold
    setProducts(prev => {
      return prev.map(p => {
        const itemSold = newSale.items.find(i => i.productId === p.id);
        if (itemSold) {
          const newStock = Math.max(0, p.stock - itemSold.quantity);
          return { ...p, stock: newStock };
        }
        return p;
      });
    });

    // 3. Update customer due if customer exists & there's due or payment
    if (newSale.customerId) {
      setCustomers(prev => {
        return prev.map(c => {
          if (c.id === newSale.customerId) {
            const newDue = c.dueAmount + newSale.dueAmount;
            const newTrx: CustomerTransaction = {
              id: 'trx-' + Date.now(),
              customerId: c.id,
              date: newSale.createdAt.slice(0, 10),
              type: 'invoice',
              referenceNo: newSale.invoiceNumber,
              description: `বিক্রয় মেমো (${newSale.paymentMethod.toUpperCase()})`,
              debit: newSale.totalAmount,
              credit: newSale.paidAmount,
              balance: newDue,
              paymentMethod: newSale.paymentMethod as any,
              note: `মোট বিল: ৳${newSale.totalAmount}, জমা: ৳${newSale.paidAmount}`,
            };

            return {
              ...c,
              totalSpent: c.totalSpent + newSale.totalAmount,
              dueAmount: newDue,
              purchaseCount: c.purchaseCount + 1,
              lastPurchased: new Date().toISOString().slice(0, 10),
              transactions: [newTrx, ...(c.transactions || [])],
            };
          }
          return c;
        });
      });
    }
  };

  const handlePlaceOnlineOrder = (newOrder: OnlineOrder) => {
    // 1. Add order to tenant list
    setOnlineOrders(prev => [newOrder, ...prev]);

    // 2. Deduct inventory stock immediately
    setProducts(prev => {
      return prev.map(p => {
        const itemOrdered = newOrder.items.find(i => i.productId === p.id);
        if (itemOrdered) {
          return { ...p, stock: Math.max(0, p.stock - itemOrdered.quantity) };
        }
        return p;
      });
    });
  };

  const handleAddProduct = (newProdData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: 'prod-' + Date.now(),
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleBulkImportProducts = (newProductsList: Omit<Product, 'id'>[]) => {
    const created = newProductsList.map((p, idx) => ({
      ...p,
      id: 'prod-bulk-' + Date.now() + '-' + idx,
    }));
    setProducts(prev => [...created, ...prev]);
  };

  const handleAdjustStock = (productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleSaveCustomer = (customerData: Omit<Customer, 'id'>, existingId?: string) => {
    if (existingId) {
      setCustomers(prev => prev.map(c => c.id === existingId ? { ...c, ...customerData, id: existingId } : c));
    } else {
      const newId = 'cust-' + Date.now();
      const created: Customer = {
        ...customerData,
        id: newId,
      };
      setCustomers(prev => [created, ...prev]);
    }
  };

  const handleReceivePayment = (receipt: CustomerPaymentReceipt) => {
    setPaymentReceipts(prev => [receipt, ...prev]);

    setCustomers(prev => prev.map(c => {
      if (c.id === receipt.customerId) {
        const remainingDue = receipt.remainingDue;
        const newTrx: CustomerTransaction = {
          id: 'trx-' + Date.now(),
          customerId: c.id,
          date: receipt.date.slice(0, 10),
          type: 'payment',
          referenceNo: receipt.receiptNumber,
          description: `বকেয়া জমা (${receipt.paymentMethod.toUpperCase()})${receipt.discount > 0 ? ` [ছাড়: ৳${receipt.discount}]` : ''}`,
          debit: 0,
          credit: receipt.amount + receipt.discount,
          balance: remainingDue,
          paymentMethod: receipt.paymentMethod,
          note: receipt.note || (receipt.transactionId ? `TrxID: ${receipt.transactionId}` : undefined),
        };

        return {
          ...c,
          dueAmount: remainingDue,
          transactions: [newTrx, ...(c.transactions || [])],
        };
      }
      return c;
    }));
  };

  const handleSmsDue = (customer: Customer, message?: string) => {
    setSmsToast({
      name: customer.name,
      phone: customer.phone,
      amount: customer.dueAmount,
      message,
    });
    setTimeout(() => {
      setSmsToast(null);
    }, 6000);
  };

  const handleUpdateOrderStatus = (orderId: string, status: OnlineOrder['status']) => {
    setOnlineOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const handleCreateQuotation = (newQuoteData: Omit<Quotation, 'id'>) => {
    const newQuote: Quotation = {
      ...newQuoteData,
      id: 'quote-' + Date.now(),
    };
    setQuotations(prev => [newQuote, ...prev]);
  };

  const handleCreateDeliveryChallan = (newChallanData: Omit<DeliveryChallan, 'id'>) => {
    const newChallan: DeliveryChallan = {
      ...newChallanData,
      id: 'challan-' + Date.now(),
    };
    setDeliveryChallans(prev => [newChallan, ...prev]);
  };

  const handleCreateCreditNote = (cnData: Omit<CreditNote, 'id'>, restockItems: { productId: string; quantity: number }[]) => {
    const newCn: CreditNote = {
      ...cnData,
      id: 'cn-' + Date.now(),
    };
    setCreditNotes(prev => [newCn, ...prev]);

    // If items in good condition, restock inventory!
    if (restockItems.length > 0) {
      setProducts(prev => prev.map(p => {
        const itemReturned = restockItems.find(it => it.productId === p.id);
        if (itemReturned) {
          return { ...p, stock: p.stock + itemReturned.quantity };
        }
        return p;
      }));
    }

    // If refundMethod is adjust_due, deduct customer's due amount in ledger
    if (cnData.refundMethod === 'adjust_due' && cnData.customerId) {
      setCustomers(prev => prev.map(c => {
        if (c.id === cnData.customerId) {
          return { ...c, dueAmount: Math.max(0, c.dueAmount - cnData.totalRefundAmount) };
        }
        return c;
      }));
    }
  };

  const handleConvertQuotationToSale = (quote: Quotation) => {
    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      invoiceNumber: 'INV-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900),
      tenantId: quote.tenantId,
      warehouseId: activeWarehouseId === 'all' ? (warehouses[0]?.id || 'wh-1') : activeWarehouseId,
      customerId: quote.customerId,
      customerName: quote.customerName,
      customerPhone: quote.customerPhone,
      items: quote.items.map(it => {
        const prod = products.find(p => p.id === it.productId);
        return {
          productId: it.productId,
          productName: it.productName,
          sku: it.sku,
          price: it.rate,
          costPrice: prod?.costPrice || it.rate * 0.8,
          quantity: it.quantity,
          unit: it.unit,
          subtotal: it.subtotal,
        };
      }),
      subtotal: quote.subtotal,
      tax: quote.tax,
      discount: quote.discount,
      totalAmount: quote.totalAmount,
      paidAmount: quote.totalAmount,
      dueAmount: 0,
      changeAmount: 0,
      paymentMethod: 'cash',
      cashierId: 'cashier-1',
      cashierName: employees[0]?.name || 'Suman Roy',
      createdAt: new Date().toLocaleString('en-GB'),
      status: 'completed',
      invoiceStatus: 'paid',
    };

    setSales(prev => [newSale, ...prev]);

    // Deduct stock for converted items
    setProducts(prev => prev.map(p => {
      const itemSold = newSale.items.find(i => i.productId === p.id);
      if (itemSold) {
        return { ...p, stock: Math.max(0, p.stock - itemSold.quantity) };
      }
      return p;
    }));

    // Update quotation status to accepted
    setQuotations(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'accepted' } : q));

    // Show A4 Invoice
    setActiveA4InvoiceSale(newSale);
  };

  // Phase 5 HRM Handlers
  const handleSaveEmployee = (empData: Omit<Employee, 'id'>, existingId?: string) => {
    if (existingId) {
      setEmployees(prev => prev.map(e => e.id === existingId ? { ...empData, id: existingId } : e));
    } else {
      const newEmp: Employee = {
        ...empData,
        id: 'emp-' + Date.now(),
      };
      setEmployees(prev => [newEmp, ...prev]);
    }
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  const handleUpdateAttendanceRecord = (record: AttendanceRecord) => {
    setAttendanceRecords(prev => {
      const idx = prev.findIndex(r => r.tenantId === record.tenantId && r.employeeId === record.employeeId && r.date === record.date);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [record, ...prev];
    });

    setEmployees(prev => prev.map(e => {
      if (e.id === record.employeeId) {
        return {
          ...e,
          attendanceToday: record.status,
          clockInTime: record.clockIn || e.clockInTime,
          clockOutTime: record.clockOut || e.clockOutTime,
        };
      }
      return e;
    }));
  };

  const handleBulkMarkAttendance = (records: AttendanceRecord[]) => {
    setAttendanceRecords(prev => {
      let nextList = [...prev];
      records.forEach(rec => {
        const idx = nextList.findIndex(r => r.tenantId === rec.tenantId && r.employeeId === rec.employeeId && r.date === rec.date);
        if (idx >= 0) {
          nextList[idx] = rec;
        } else {
          nextList = [rec, ...nextList];
        }
      });
      return nextList;
    });

    setEmployees(prev => prev.map(e => {
      const rec = records.find(r => r.employeeId === e.id);
      if (rec) {
        return {
          ...e,
          attendanceToday: rec.status,
          clockInTime: rec.clockIn || e.clockInTime,
        };
      }
      return e;
    }));
  };

  const handleUpdateRolePermissions = (roles: RolePermission[]) => {
    setRolePermissions(roles);
  };

  const handleAddSalarySlip = (slip: SalarySlip) => {
    setSalarySlips(prev => [slip, ...prev]);
  };

  const handleUpdateSlipStatus = (slipId: string, status: 'paid' | 'pending', method?: 'cash' | 'bkash' | 'bank') => {
    setSalarySlips(prev => prev.map(s => {
      if (s.id === slipId) {
        return {
          ...s,
          status,
          paymentMethod: method || s.paymentMethod,
          paymentDate: new Date().toISOString().slice(0, 10),
        };
      }
      return s;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      {/* View Switcher Bar (Persistent Global Switcher for convenient testing) */}
      <div className="bg-slate-950 text-slate-300 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-slate-800 z-40 relative">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white tracking-wide">JH IMSE</span>
          <span className="text-slate-500">•</span>
          <span className="text-[11px] text-purple-200">JH Soft Corporation</span>
          <span className="text-slate-500">|</span>
          <span className="text-[11px] text-purple-300">
            পোর্টাল: <strong className="text-white uppercase">{currentView}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <button
            onClick={() => setCurrentView('landing')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              currentView === 'landing' ? 'bg-purple-700 text-white' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            মেইন ওয়েবসাইট (Landing)
          </button>
          <button
            onClick={() => setCurrentView('tenant_dashboard')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              currentView === 'tenant_dashboard' ? 'bg-purple-700 text-white' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            স্টোর ERP ড্যাশবোর্ড (Purple UI)
          </button>
          <button
            onClick={() => setCurrentView('pos')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              currentView === 'pos' ? 'bg-purple-700 text-white' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            POS ক্যাশ কাউন্টার
          </button>
          <button
            onClick={() => setCurrentView('storefront')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              currentView === 'storefront' ? 'bg-purple-700 text-white' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            অনলাইন ই-কমার্স সাইট
          </button>
          <button
            onClick={() => setCurrentView('super_admin')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              currentView === 'super_admin' ? 'bg-purple-700 text-white' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            সুপার অ্যাডমিন
          </button>
        </div>
      </div>

      {/* Impersonation Banner if logged in via Super Admin */}
      {isImpersonating && currentView !== 'super_admin' && (
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white px-6 py-2.5 text-xs font-bold flex flex-wrap items-center justify-between shadow-md border-b border-purple-500/30 gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              ⚡ সুপার এডমিন ইম্পারসোনেশন ভিউ: আপনি বর্তমানে <strong className="text-amber-300">&quot;{activeTenant.name}&quot;</strong> ({activeTenant.slug}) স্টোরে প্রবেশ করেছেন।
            </span>
          </div>
          <button
            onClick={() => {
              setIsImpersonating(false);
              setCurrentView('super_admin');
            }}
            className="px-3 py-1 bg-white hover:bg-purple-50 text-purple-950 rounded-xl text-xs font-black transition shadow-xs flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> সুপার এডমিন কমান্ড সেন্টারে ফিরুন
          </button>
        </div>
      )}

      {/* Render Current View */}
      {currentView === 'landing' && (
        <LandingPage
          tenants={tenants}
          onOpenStoreDashboard={(id) => {
            setActiveTenantId(id);
            setCurrentView('tenant_dashboard');
          }}
          onOpenSuperAdmin={() => setCurrentView('super_admin')}
          onCreateTenant={handleCreateTenant}
        />
      )}

      {currentView === 'super_admin' && (
        <SuperAdmin
          tenants={tenants}
          onUpdateTenant={handleUpdateTenant}
          onImpersonateTenant={(id) => {
            setIsImpersonating(true);
            setActiveTenantId(id);
            setCurrentView('tenant_dashboard');
          }}
          onBackToLanding={() => setCurrentView('landing')}
          systemBroadcast={systemBroadcast}
          onSetSystemBroadcast={setSystemBroadcast}
          onCreateTenant={handleCreateTenant}
        />
      )}

      {currentView === 'tenant_dashboard' && (
        <TenantDashboard
          tenant={activeTenant}
          tenants={tenants}
          onSelectTenant={(id) => setActiveTenantId(id)}
          products={products}
          sales={sales}
          customers={customers}
          employees={employees}
          onlineOrders={onlineOrders}
          warehouses={warehouses}
          activeWarehouseId={activeWarehouseId}
          onSelectWarehouse={setActiveWarehouseId}
          onOpenPOS={() => setCurrentView('pos')}
          onOpenStorefront={() => setCurrentView('storefront')}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenSuperAdmin={() => setCurrentView('super_admin')}
          onBackToLanding={() => setCurrentView('landing')}
          onAddProduct={handleAddProduct}
          onBulkImportProducts={handleBulkImportProducts}
          onAdjustStock={handleAdjustStock}
          onDeleteProduct={handleDeleteProduct}
          onSmsCustomerDue={handleSmsDue}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          quotations={quotations}
          deliveryChallans={deliveryChallans}
          creditNotes={creditNotes}
          paymentReceipts={paymentReceipts}
          onAddCustomer={handleSaveCustomer}
          onReceivePayment={handleReceivePayment}
          onCreateQuotation={handleCreateQuotation}
          onCreateDeliveryChallan={handleCreateDeliveryChallan}
          onCreateCreditNote={handleCreateCreditNote}
          onConvertToInvoice={handleConvertQuotationToSale}
          onOpenReceipt={(sale) => setActiveReceiptSale(sale)}
          onOpenA4Invoice={(sale) => setActiveA4InvoiceSale(sale)}
          systemBroadcast={systemBroadcast}
          attendanceRecords={attendanceRecords}
          rolePermissions={rolePermissions}
          salarySlips={salarySlips}
          onSaveEmployee={handleSaveEmployee}
          onDeleteEmployee={handleDeleteEmployee}
          onUpdateAttendanceRecord={handleUpdateAttendanceRecord}
          onBulkMarkAttendance={handleBulkMarkAttendance}
          onUpdateRolePermissions={handleUpdateRolePermissions}
          onAddSalarySlip={handleAddSalarySlip}
          onUpdateSlipStatus={handleUpdateSlipStatus}
        />
      )}

      {currentView === 'pos' && (
        <POSScreen
          tenant={activeTenant}
          products={products}
          customers={customers}
          warehouses={warehouses}
          activeWarehouseId={activeWarehouseId}
          cashierName={employees[0]?.name || 'Suman Roy'}
          onCompleteSale={handleCompleteSale}
          onBackToDashboard={() => setCurrentView('tenant_dashboard')}
          onOpenReceipt={(sale) => setActiveReceiptSale(sale)}
          onOpenA4Invoice={(sale) => setActiveA4InvoiceSale(sale)}
        />
      )}

      {currentView === 'storefront' && (
        <StorefrontView
          tenant={activeTenant}
          products={products}
          onPlaceOnlineOrder={handlePlaceOnlineOrder}
          onBackToDashboard={() => setCurrentView('tenant_dashboard')}
        />
      )}

      {/* Modals & Tools */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Thermal POS Slip Modal (80mm) */}
      {activeReceiptSale && (
        <ThermalReceipt
          sale={activeReceiptSale}
          tenant={activeTenant}
          onClose={() => setActiveReceiptSale(null)}
        />
      )}

      {/* Corporate A4 Tax Invoice Modal */}
      <A4InvoiceModal
        isOpen={Boolean(activeA4InvoiceSale)}
        onClose={() => setActiveA4InvoiceSale(null)}
        sale={activeA4InvoiceSale}
        tenant={activeTenant}
      />

      {/* SMS Simulation Toast */}
      {smsToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-purple-500/40 max-w-sm flex items-start gap-3 animate-in slide-in-from-bottom duration-200">
          <div className="w-8 h-8 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0 mt-0.5">
            <MessageSquare className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300">অটো SMS প্রেরিত হয়েছে!</span>
              <button onClick={() => setSmsToast(null)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-slate-300 mt-1">
              প্রাপক: <strong>{smsToast.name}</strong> ({smsToast.phone})
            </p>
            <p className="text-[11px] text-slate-300 mt-1 italic bg-slate-800 p-2.5 rounded-lg border border-slate-700 leading-relaxed font-sans">
              &quot;{smsToast.message || `সম্মানিত গ্রাহক, ${activeTenant.name}-এ আপনার বকেয়া ${activeTenant.currency}${smsToast.amount.toFixed(2)} টাকা। দ্রুত পরিশোধের বিনীত অনুরোধ জানাচ্ছি।`}&quot;
            </p>
            <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>JH Soft SMS Gateway: Delivered</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
