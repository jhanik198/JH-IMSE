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
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended';
  subscriptionExpiry: string;
  monthlyFee: number;
  customDomain?: string;
  storeNotice?: string;
  features: TenantFeatures;
  createdAt: string;
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

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSpent: number;
  dueAmount: number;
  purchaseCount: number;
  lastPurchased: string;
}

export interface Employee {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email: string;
  role: 'owner' | 'manager' | 'cashier';
  salary: number;
  salesCommissionRate: number; // percentage
  salesThisMonth: number;
  attendanceToday: 'present' | 'absent' | 'late';
  joinedDate: string;
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
