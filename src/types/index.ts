export type BusinessType = 'grocery' | 'pharmacy' | 'electronics' | 'warehouse';

export type UserRole = 'super_admin' | 'owner' | 'manager' | 'cashier';

export interface TenantFeatures {
  pos: boolean;
  ecommerce: boolean;
  crm: boolean;
  hrm: boolean;
  ai: boolean;
  pharmacyBatch: boolean;
  imeiWarranty: boolean;
  multiWarehouse: boolean;
}

export type PlanTier = 'trial' | 'starter' | 'professional' | 'enterprise';
export type TenantStatus = 'active' | 'suspended' | 'grace_period' | 'expired';

export interface TenantQuota {
  maxBranches: number;
  maxUsers: number;
  maxProducts: number;
  maxMonthlyInvoices: number;
  storageGb: number;
}

export interface TenantUsage {
  currentBranches: number;
  currentUsers: number;
  currentProducts: number;
  currentMonthlyInvoices: number;
  currentStorageMb: number;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  businessType: BusinessType;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  currency: string;
  plan: PlanTier;
  status: TenantStatus;
  subscriptionExpiry: string;
  monthlyFee: number;
  billingCycle?: 'monthly' | 'yearly';
  licenseKey?: string;
  tradeLicenseNo?: string;
  taxVatNo?: string;
  customDomain?: string;
  storeNotice?: string;
  quotas: TenantQuota;
  usage: TenantUsage;
  features: TenantFeatures;
  createdAt: string;
}

export interface SubscriptionPackage {
  id: string;
  name: string;
  tier: PlanTier;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  badge?: string;
  popular?: boolean;
  quotas: TenantQuota;
  includedFeatures: string[];
}

export interface SubscriptionTransaction {
  id: string;
  tenantId: string;
  tenantName: string;
  plan: PlanTier;
  amount: number;
  paymentMethod: 'bKash' | 'Nagad' | 'Rocket' | 'Bank Transfer' | 'Card';
  trxId: string;
  date: string;
  billingCycle: 'monthly' | 'yearly';
  status: 'paid' | 'pending' | 'failed';
  invoiceNumber: string;
}

export interface CustomDomainRequest {
  id: string;
  tenantId: string;
  tenantName: string;
  domain: string;
  cnameTarget: string;
  requestedDate: string;
  status: 'active' | 'pending' | 'rejected';
  sslStatus: 'secured' | 'provisioning' | 'failed';
}

export interface BroadcastNotice {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'maintenance' | 'critical';
  target: 'all' | 'pharmacy' | 'grocery' | 'electronics' | 'enterprise';
  createdAt: string;
  active: boolean;
}

export interface LicenseKeyItem {
  id: string;
  key: string;
  tenantId: string;
  tenantName: string;
  plan: PlanTier;
  durationMonths: number;
  generatedAt: string;
  expiresAt: string;
  status: 'active' | 'redeemed' | 'revoked';
  maxBranches: number;
  maxUsers: number;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "500gm", "1kg", "Red-XL"
  sku: string;
  priceDelta: number;
  stock: number;
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: 'addition' | 'subtraction' | 'damage' | 'expired' | 'audit';
  quantity: number;
  reason: string;
  adjustedBy: string;
  createdAt: string;
}

export interface Product {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  stock: number;
  alertStock: number;
  unit: string;
  image?: string;
  showInOnlineStore: boolean;
  warehouseId: string;
  variants?: ProductVariant[];
  // Pharmacy specific
  expiryDate?: string;
  batchNumber?: string;
  genericName?: string;
  dosageForm?: string; // Tablet, Capsule, Syrup, Drop, Injection
  manufacturer?: string; // e.g., Square Pharmaceuticals, Beximco, Incepta
  rackNumber?: string; // e.g., Rack A-3
  darNumber?: string; // Drug Administration Registration No
  // Electronics specific
  imeiNumbers?: string[];
  warrantyMonths?: number;
  brand?: string;
  modelNumber?: string;
  // Warehouse & Wholesale specific
  moq?: number; // Minimum Order Quantity
  masterCartonSize?: number;
}

export interface Category {
  id: string;
  tenantId: string;
  name: string;
  icon?: string;
}

export interface Warehouse {
  id: string;
  tenantId: string;
  name: string;
  location: string;
  isMain: boolean;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  price: number;
  costPrice: number;
  quantity: number;
  subtotal: number;
  imei?: string;
  batchNumber?: string;
  unit?: string;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  tenantId: string;
  warehouseId: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  changeAmount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'card' | 'credit';
  transactionId?: string;
  pricingType?: 'retail' | 'wholesale';
  invoiceStatus?: 'paid' | 'partial' | 'due' | 'returned';
  cashierId: string;
  cashierName: string;
  createdAt: string;
  status: 'completed' | 'returned';
}

export interface QuotationItem {
  productId: string;
  productName: string;
  sku: string;
  rate: number;
  quantity: number;
  unit: string;
  subtotal: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  tenantId: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items: QuotationItem[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  validUntil: string;
  status: 'sent' | 'accepted' | 'declined' | 'expired' | 'converted';
  notes?: string;
  createdAt: string;
}

export interface DeliveryChallanItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unit: string;
  packType?: string; // Cartons, Sacks, Packs
}

export interface DeliveryChallan {
  id: string;
  challanNumber: string;
  tenantId: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  transportName: string; // e.g., Sundarban, SA Paribahan, RedX, Own Delivery
  vehicleNumber?: string;
  driverName?: string;
  driverPhone?: string;
  items: DeliveryChallanItem[];
  status: 'dispatched' | 'delivered' | 'pending';
  dispatchDate: string;
  notes?: string;
  createdAt: string;
}

export interface CreditNoteItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  condition: 'good' | 'damaged'; // If good, restock to inventory
}

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  tenantId: string;
  originalInvoiceNumber: string;
  customerId?: string;
  customerName: string;
  items: CreditNoteItem[];
  totalRefundAmount: number;
  reason: string;
  refundMethod: 'cash' | 'adjust_due' | 'wallet';
  createdAt: string;
}

export interface HoldCart {
  id: string;
  note: string;
  createdAt: string;
  items: { product: Product; quantity: number }[];
  customerId?: string;
  discountAmount: number;
  taxPercent: number;
  pricingType: 'retail' | 'wholesale';
}

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'vip';
export type CustomerType = 'retail' | 'wholesale' | 'corporate';

export interface CustomerTransaction {
  id: string;
  customerId: string;
  date: string;
  type: 'invoice' | 'payment' | 'credit_note' | 'opening_balance';
  referenceNo: string;
  description: string;
  debit: number; // Increases due
  credit: number; // Decreases due (payment or return)
  balance: number; // Balance after this transaction
  paymentMethod?: 'cash' | 'bkash' | 'nagad' | 'bank';
  note?: string;
}

export interface CustomerPaymentReceipt {
  id: string;
  receiptNumber: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  discount: number;
  paymentMethod: 'cash' | 'bkash' | 'nagad' | 'bank';
  transactionId?: string;
  bankName?: string;
  previousDue: number;
  remainingDue: number;
  date: string;
  collectedBy: string;
  note?: string;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSpent: number;
  dueAmount: number;
  creditLimit?: number; // e.g. 10000 (0 or undefined for no limit)
  loyaltyTier?: LoyaltyTier;
  customerType?: CustomerType;
  purchaseCount: number;
  lastPurchased: string;
  notes?: string;
  transactions?: CustomerTransaction[];
}

export type EmployeeRole = 'owner' | 'manager' | 'cashier' | 'accountant' | 'auditor' | 'sales_rep';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave';

export interface Employee {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string;
  designation?: string;
  role: EmployeeRole;
  warehouseId?: string;
  nid?: string;
  emergencyPhone?: string;
  address?: string;
  salary: number; // basic salary
  allowance?: number;
  salesTarget?: number; // Target monthly sales
  salesCommissionRate: number; // percentage
  salesThisMonth: number;
  attendanceToday: AttendanceStatus;
  clockInTime?: string;
  clockOutTime?: string;
  status?: 'active' | 'inactive' | 'on_leave';
  joinedDate: string;
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  designation?: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  clockIn?: string;
  clockOut?: string;
  workingHours?: number;
  overtimeHours?: number;
  notes?: string;
}

export interface RolePermission {
  roleId: string;
  roleName: string;
  roleNameBn: string;
  description: string;
  isSystem?: boolean;
  permissions: {
    posBilling: boolean;
    posDiscount: boolean;
    posPriceOverride: boolean;
    posHoldCart: boolean;
    inventoryView: boolean;
    inventoryManage: boolean;
    stockTransfer: boolean;
    customerView: boolean;
    customerDueCollect: boolean;
    customerCreditLimit: boolean;
    sendSmsReminder: boolean;
    quotationsManage: boolean;
    challansManage: boolean;
    creditNotesManage: boolean;
    financialReports: boolean;
    hrmManage: boolean;
    payrollManage: boolean;
    settingsManage: boolean;
  };
}

export interface SalarySlip {
  id: string;
  slipNumber: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  phone: string;
  department?: string;
  month: string;
  payPeriod: string;
  basicSalary: number;
  houseRentAllowance: number;
  conveyanceAllowance: number;
  medicalAllowance: number;
  salesAchieved: number;
  salesTarget: number;
  salesCommissionRate: number;
  salesCommission: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimeAmount: number;
  grossEarnings: number;
  absentDays: number;
  absentDeduction: number;
  advanceDeduction: number;
  providentFund: number;
  totalDeductions: number;
  netPayable: number;
  paymentMethod: 'cash' | 'bkash' | 'bank';
  paymentDate: string;
  status: 'paid' | 'pending';
  note?: string;
}

export interface OnlineOrder {
  id: string;
  orderNumber: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  paymentMethod: 'cod' | 'bkash';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export interface AIInsight {
  id: string;
  type: 'restock' | 'dead_stock' | 'sales_trend' | 'profit_boost';
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'info';
  actionableText: string;
}
