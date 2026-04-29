
export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'Bank Transfer' | 'Cash' | 'Check' | 'Online';
  status: 'Paid' | 'Pending' | 'Overdue';
  reference?: string;
}

export interface Tenant {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  leaseStart: string;
  leaseEnd: string;
  tenantSince?: string;
  monthlyRent: number;
  yearlyPercentage?: number;
  advancePayment?: number;
  status: 'Active' | 'Pending' | 'Terminated';
  photoUrl?: string;
  documentUrl?: string;
  documentName?: string;
  aadharUrl?: string;
  aadharName?: string;
  createdAt?: string;
  paymentHistory?: PaymentRecord[];
}

export interface AppAlert {
  id: string;
  type: 'overdue' | 'upcoming' | 'expiry';
  title: string;
  description: string;
  tenantId: string;
  date: string;
  amount?: number;
}

export interface FinancialStats {
  expectedIncomeYear: number;
  collectedIncomeYear: number;
  outstandingBalance: number;
  monthlyData: {
    month: string;
    expected: number;
    actual: number;
  }[];
}

export type Theme = 'light' | 'dark';

export type AuthState = 'login' | 'register' | 'authenticated';

export interface User {
  id?: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  root: boolean;
  avatar: string;
  activated: boolean;
  photoUrl?: string; 
  theme?: Theme;
  addresses?: any[];
}
