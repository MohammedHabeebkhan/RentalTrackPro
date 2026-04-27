
import {
    AlertTriangle,
    ArrowUpRight,
    Calendar,
    Check,
    CheckCircle2,
    ChevronRight,
    CreditCard,
    Download,
    Edit3,
    FileText,
    History,
    Loader2,
    Mail,
    MapPin,
    Phone,
    Plus,
    ShieldCheck,
    TrendingUp,
    Wallet,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { calculateEffectiveMonthlyRent, getNextRentIncreaseDate } from '../lib/rent';
import { exportTenantStatement, generateInvoicePDF } from '../services/pdfService';
import { PaymentRecord, Tenant, Theme } from '../types';

interface TenantDetailsProps {
  tenant: Tenant;
  isOpen: boolean;
  onClose: () => void;
  onPreviewDoc: (url: string, title: string) => void;
  onUpdatePayment?: (tenantId: string, payment: PaymentRecord) => void;
  theme: Theme;
}

const TenantDetails: React.FC<TenantDetailsProps> = ({ tenant, isOpen, onClose, onPreviewDoc, onUpdatePayment, theme }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  
  const currentRent = calculateEffectiveMonthlyRent(tenant);
  const nextIncreaseDate = getNextRentIncreaseDate(tenant);

  const [paymentForm, setPaymentForm] = useState<Omit<PaymentRecord, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    amount: currentRent,
    method: 'Online',
    status: 'Paid',
    reference: ''
  });

  // Clear toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!isOpen) return null;

  const totalPaid = tenant.paymentHistory?.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.amount, 0) || 0;
  const pendingAmount = tenant.paymentHistory?.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0) || 0;

  // Get lease status with color scheme matching Tenants.tsx
  const getLeaseStatus = (leaseEnd: string) => {
    const today = new Date();
    const end = new Date(leaseEnd);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { label: 'Expired', color: 'bg-rose-500/10 text-rose-500' };
    if (diffDays <= 30) return { label: `${diffDays}d Left`, color: 'bg-amber-500/10 text-amber-500' };
    
    // For remaining time > 30 days, show months and days
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    let label = '';
    
    if (months > 0 && days > 0) {
      label = `${months}m ${days}d`;
    } else if (months > 0) {
      label = `${months}m`;
    } else {
      label = `${days}d`;
    }
    
    return { label, color: 'bg-slate-500/10 text-slate-400' };
  };

  const leaseStatus = getLeaseStatus(tenant.leaseEnd);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      exportTenantStatement(tenant);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRaiseInvoice = async () => {
    setIsGeneratingInvoice(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      generateInvoicePDF(tenant, currentRent);
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleEditPayment = (payment: PaymentRecord) => {
    setEditingPaymentId(payment.id);
    setPaymentForm({
      date: payment.date,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      reference: payment.reference || ''
    });
    setIsAddingPayment(true);
    setToast(null);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for duplicate records in the same month/year
    const newDate = new Date(paymentForm.date);
    const newMonth = newDate.getMonth();
    const newYear = newDate.getFullYear();

    const isDuplicate = tenant.paymentHistory?.some(p => {
      // If we are editing, don't count the record itself as a duplicate
      if (editingPaymentId && p.id === editingPaymentId) return false;
      
      const pDate = new Date(p.date);
      return pDate.getMonth() === newMonth && pDate.getFullYear() === newYear;
    });

    if (isDuplicate) {
      setToast({
        message: `Record already exists for ${newDate.toLocaleString('default', { month: 'long' })} ${newYear}`,
        type: 'error'
      });
      return;
    }

    if (onUpdatePayment) {
      const record: PaymentRecord = {
        ...paymentForm,
        id: editingPaymentId || Math.random().toString(36).substr(2, 9)
      };
      onUpdatePayment(tenant.id, record);
      
      setToast({
        message: `Payment record ${editingPaymentId ? 'updated' : 'added'} successfully`,
        type: 'success'
      });

      setIsAddingPayment(false);
      setEditingPaymentId(null);
      setPaymentForm({
        date: new Date().toISOString().split('T')[0],
        amount: currentRent,
        method: 'Online',
        status: 'Paid',
        reference: ''
      });
    }
  };

  const modalBg = theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50';
  const cardBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-top-4 fade-in duration-300">
           <div className={`${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} text-white px-8 py-4 rounded-3xl shadow-3xl flex items-center gap-4 border border-white/20`}>
              {toast.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
              <span className="text-[11px] font-black uppercase tracking-widest">{toast.message}</span>
              <button onClick={() => setToast(null)} className="ml-4 opacity-50 hover:opacity-100"><X size={16} /></button>
           </div>
        </div>
      )}

      <div className={`${modalBg} w-full max-w-6xl h-[92vh] rounded-[3rem] overflow-hidden shadow-3xl flex flex-col border border-white/10`}>
        {/* Header */}
        <div className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-white'} px-10 py-8 border-b transition-colors flex items-center justify-between`}>
          <div className="flex items-center gap-8">
            <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-500/10 border-4 border-indigo-500/20 overflow-hidden shrink-0">
               <img src={tenant.photoUrl || `https://picsum.photos/seed/${tenant.id}/200/200`} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
               <div className="flex items-center gap-4">
                  <h2 className={`text-3xl font-black tracking-tight ${textColor}`}>{tenant.fullName}</h2>
                  <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${tenant.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {tenant.status}
                  </span>
               </div>
               <div className="flex flex-col gap-3 mt-3">
                  <div className="flex items-center gap-6 text-sm text-slate-500 font-bold">
                     <div className="flex items-center gap-2"><Mail size={16} className="text-indigo-400" /> {tenant.email}</div>
                     <div className="flex items-center gap-2"><Phone size={16} className="text-indigo-400" /> {tenant.phone}</div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold">
                     <div className="flex items-center gap-2 text-slate-500"><Calendar size={14} className="text-indigo-400" /> Start: {new Date(tenant.leaseStart).toLocaleDateString('default', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                     <div className="flex items-center gap-2 text-slate-500"><Calendar size={14} className="text-indigo-400" /> End: {new Date(tenant.leaseEnd).toLocaleDateString('default', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                     <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${leaseStatus.color}`}>{leaseStatus.label}</span>
                  </div>
               </div>
            </div>
          </div>
          <button onClick={onClose} className={`p-4 rounded-[1.5rem] transition-all ${theme === 'dark' ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}>
            <X size={32} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className={`${cardBg} p-8 rounded-[2.5rem] border`}>
                <TrendingUp size={24} className="text-indigo-500 mb-4" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lease Status</p>
                <p className={`text-xl font-black mt-1 ${textColor}`}>{new Date(tenant.leaseEnd) > new Date() ? 'Secure' : 'Expiring'}</p>
             </div>
             <div className={`${cardBg} p-8 rounded-[2.5rem] border`}>
                <CreditCard size={24} className="text-emerald-500 mb-4" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Collections</p>
                <p className={`text-xl font-black mt-1 ${textColor}`}>₹{totalPaid.toLocaleString()}</p>
             </div>
             <div className={`${cardBg} p-8 rounded-[2.5rem] border`}>
                <Wallet size={24} className="text-amber-500 mb-4" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Advance Payment</p>
                <p className={`text-xl font-black mt-1 ${textColor}`}>₹{(tenant.advancePayment || 0).toLocaleString()}</p>
             </div>
             <div className={`${cardBg} p-8 rounded-[2.5rem] border`}>
                <Calendar size={24} className="text-indigo-500 mb-4" />
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Monthly Rent</p>
                <p className={`text-xl font-black mt-1 ${textColor}`}>₹{currentRent.toLocaleString()}</p>
                {tenant.yearlyPercentage ? (
                  <>
                    <p className="text-[10px] mt-2 text-slate-500">Annual increase: {tenant.yearlyPercentage}%</p>
                    {nextIncreaseDate ? (
                      <p className="text-[10px] mt-1 text-slate-500">Next {tenant.yearlyPercentage}% increase on {nextIncreaseDate.toLocaleDateString()}</p>
                    ) : null}
                  </>
                ) : null}
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3">
                      <History size={24} className="text-indigo-500" />
                      <h3 className={`text-xl font-black ${textColor}`}>Payment Ledger</h3>
                   </div>
                   <div className="flex items-center gap-4">
                      <button 
                        onClick={() => { setIsAddingPayment(!isAddingPayment); setEditingPaymentId(null); setToast(null); }}
                        className="px-6 py-2 bg-indigo-600/10 text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600/20 transition-all flex items-center gap-2"
                      >
                         {isAddingPayment ? <X size={14} /> : <Plus size={14} />} {isAddingPayment ? 'Close Form' : 'Add Record'}
                      </button>
                      <button onClick={handleExportPDF} disabled={isExporting} className="p-2 text-slate-500 hover:text-indigo-400 transition-colors">
                         {isExporting ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
                      </button>
                   </div>
                </div>

                {isAddingPayment && (
                   <form onSubmit={handleSavePayment} className={`${cardBg} p-8 rounded-[2.5rem] border space-y-6 animate-in slide-in-from-top-4 duration-300`}>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                         <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Date</label>
                            <input required type="date" className={`w-full px-4 py-2 rounded-xl text-xs font-bold border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} />
                         </div>
                         <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Amount (₹)</label>
                            <input required type="number" className={`w-full px-4 py-2 rounded-xl text-xs font-bold border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: parseInt(e.target.value)})} />
                         </div>
                         <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1.5">Method</label>
                            <select className={`w-full px-4 py-2 rounded-xl text-xs font-bold border ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} value={paymentForm.method} onChange={e => setPaymentForm({...paymentForm, method: e.target.value as any})}>
                               <option value="Online">Online</option>
                               <option value="Cash">Cash</option>
                               <option value="Bank Transfer">Bank Transfer</option>
                            </select>
                         </div>
                         <div className="flex items-end">
                            <button type="submit" className="w-full h-10 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 hover:bg-indigo-700">
                               <Check size={16} /> {editingPaymentId ? 'Update' : 'Confirm'}
                            </button>
                         </div>
                      </div>
                   </form>
                )}

                <div className={`${cardBg} rounded-[2.5rem] border overflow-hidden`}>
                   <table className="w-full text-left">
                      <thead className={theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}>
                         <tr>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Method</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Amount</th>
                            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Edit</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/20">
                         {tenant.paymentHistory?.map(payment => (
                            <tr key={payment.id} className={`${theme === 'dark' ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'} transition-all group`}>
                               <td className={`px-8 py-5 text-sm font-bold ${textColor}`}>{new Date(payment.date).toLocaleDateString()}</td>
                               <td className="px-8 py-5 text-center">
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>{payment.method}</span>
                                </td>
                               <td className={`px-8 py-5 text-sm font-black text-right ${textColor}`}>₹{payment.amount.toLocaleString()}</td>
                               <td className="px-8 py-5 text-right">
                                  <button onClick={() => handleEditPayment(payment)} className="p-2 text-slate-500 hover:text-indigo-400 group-hover:scale-110 transition-transform">
                                     <Edit3 size={16} />
                                  </button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>

             <div className="space-y-8">
                <div className={`${cardBg} p-8 rounded-[2.5rem] border`}>
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Property Assignment</h3>
                   <div className="flex items-start gap-4">
                      <MapPin size={24} className="text-indigo-500 shrink-0 mt-1" />
                      <p className={`text-sm font-bold leading-relaxed ${textColor}`}>{tenant.propertyAddress}</p>
                   </div>
                </div>

                <div className="bg-indigo-600 p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-900/40 relative overflow-hidden">
                   <div className="relative z-10">
                      <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Outstanding Balance</p>
                      <h4 className="text-3xl font-black text-white mb-8">₹{pendingAmount.toLocaleString()}</h4>
                      <button 
                        onClick={handleRaiseInvoice}
                        disabled={isGeneratingInvoice}
                        className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-3"
                      >
                         {isGeneratingInvoice ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
                         {isGeneratingInvoice ? 'Drafting...' : 'Raise Digital Invoice'}
                      </button>
                   </div>
                   <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                <div className={`${cardBg} p-8 rounded-[2.5rem] border`}>
                   <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Verified Vault</h3>
                   <div className="space-y-4">
                      {tenant.documentUrl && (
                        <button onClick={() => onPreviewDoc(tenant.documentUrl!, 'Rental Agreement')} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                           <div className="flex items-center gap-4">
                              <FileText size={20} className="text-indigo-400" />
                              <span className={`text-xs font-bold ${textColor}`}>Rental Agreement</span>
                           </div>
                           <ChevronRight size={16} className="text-slate-600" />
                        </button>
                      )}
                      {tenant.aadharUrl && (
                        <button onClick={() => onPreviewDoc(tenant.aadharUrl!, 'Aadhar Verification')} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-100 hover:bg-slate-50'}`}>
                           <div className="flex items-center gap-4">
                              <ShieldCheck size={20} className="text-emerald-400" />
                              <span className={`text-xs font-bold ${textColor}`}>Aadhar ID Vault</span>
                           </div>
                           <ChevronRight size={16} className="text-slate-600" />
                        </button>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDetails;
