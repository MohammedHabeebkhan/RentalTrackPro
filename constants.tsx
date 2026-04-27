
import { Tenant } from './types';

export const MOCK_TENANTS: Tenant[] = [
  {
    id: '1',
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '555-0101',
    propertyAddress: '123 Maple St, Apt 4B',
    leaseStart: '2023-01-01',
    leaseEnd: '2025-01-01',
    monthlyRent: 1200,
    yearlyPercentage: 5,
    status: 'Active',
    photoUrl: 'https://picsum.photos/seed/john/200/200',
    paymentHistory: [
      { id: 'p1', date: '2024-03-01', amount: 1200, method: 'Online', status: 'Paid', reference: 'TXN-9921' },
      { id: 'p2', date: '2024-02-01', amount: 1200, method: 'Bank Transfer', status: 'Paid', reference: 'TXN-8810' },
      { id: 'p3', date: '2024-01-01', amount: 1200, method: 'Online', status: 'Paid', reference: 'TXN-7705' }
    ]
  },
  {
    id: '2',
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    phone: '555-0102',
    propertyAddress: '456 Oak Ave, Suite 12',
    leaseStart: '2023-06-15',
    leaseEnd: '2024-06-15',
    monthlyRent: 1550,
    yearlyPercentage: 3,
    status: 'Active',
    photoUrl: 'https://picsum.photos/seed/jane/200/200',
    paymentHistory: [
      { id: 'p4', date: '2024-03-15', amount: 1550, method: 'Check', status: 'Pending' },
      { id: 'p5', date: '2024-02-15', amount: 1550, method: 'Bank Transfer', status: 'Paid', reference: 'TXN-4421' }
    ]
  },
  {
    id: '3',
    fullName: 'Robert Wilson',
    email: 'robert@example.com',
    phone: '555-0103',
    propertyAddress: '789 Pine Ln',
    leaseStart: '2022-11-01',
    leaseEnd: '2023-11-01',
    monthlyRent: 2100,
    yearlyPercentage: 4,
    status: 'Pending',
    photoUrl: 'https://picsum.photos/seed/robert/200/200',
    paymentHistory: []
  }
];

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
