
import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  X, 
  ShieldCheck, 
  Loader2,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { Tenant, Theme } from '../types';
import { uploadToCloudinary } from '../services/uploadService';

interface EnrollTenantProps {
  onAdd: (tenant: Omit<Tenant, 'id'>) => void;
  onCancel: () => void;
  initialData?: Tenant;
  theme: Theme;
}

const EnrollTenant: React.FC<EnrollTenantProps> = ({ onAdd, onCancel, initialData, theme }) => {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    propertyAddress: initialData?.propertyAddress || '',
    leaseStart: initialData?.leaseStart || '',
    leaseEnd: initialData?.leaseEnd || '',
    monthlyRent: initialData?.monthlyRent || 0,
    advancePayment: initialData?.advancePayment || 0,
    status: initialData?.status || 'Active' as 'Active' | 'Pending' | 'Terminated'
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photoUrl || null);
  const [leaseDoc, setLeaseDoc] = useState<File | null>(null);
  const [leaseUrl, setLeaseUrl] = useState<string | null>(initialData?.documentUrl || null);
  const [aadharDoc, setAadharDoc] = useState<File | null>(null);
  const [aadharUrl, setAadharUrl] = useState<string | null>(initialData?.aadharUrl || null);
  
  const [isUploadingLease, setIsUploadingLease] = useState(false);
  const [isUploadingAadhar, setIsUploadingAadhar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const leaseInputRef = useRef<HTMLInputElement>(null);
  const aadharInputRef = useRef<HTMLInputElement>(null);

  const cardClass = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm';
  const labelClass = `text-[10px] font-black mb-1.5 block uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`;
  const inputClass = `w-full px-5 py-3.5 rounded-2xl border outline-none transition-all text-sm font-bold ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500'}`;

  const handleLeaseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLease(true);
    try {
      const url = await uploadToCloudinary(file);
      setLeaseUrl(url);
      setLeaseDoc(file);
    } catch (err) {
      alert("Failed to upload deed.");
    } finally {
      setIsUploadingLease(false);
    }
  };

  const handleAadharUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAadhar(true);
    try {
      const url = await uploadToCloudinary(file);
      setAadharUrl(url);
      setAadharDoc(file);
    } catch (err) {
      alert("Failed to upload ID.");
    } finally {
      setIsUploadingAadhar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalPhotoUrl = photoPreview;
      if (photo) finalPhotoUrl = await uploadToCloudinary(photo);

      onAdd({
        ...formData,
        photoUrl: finalPhotoUrl || undefined,
        documentUrl: leaseUrl || undefined,
        documentName: leaseDoc?.name || initialData?.documentName,
        aadharUrl: aadharUrl || undefined,
        aadharName: aadharDoc?.name || initialData?.aadharName
      });
    } catch (err) {
      alert('Failed to save record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 pb-24">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className={`text-3xl font-black flex items-center gap-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            {initialData ? 'Update Profile' : 'Resident Enrollment'}
          </h2>
          <p className="text-slate-500 font-bold mt-2 uppercase text-[11px] tracking-widest">Digital Asset Management System</p>
        </div>
        <button onClick={onCancel} className={`p-3 rounded-2xl transition-all ${theme === 'dark' ? 'text-slate-500 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}>
          <X size={28} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Identity Section */}
          <div className={`${cardClass} p-10 rounded-[3rem] border flex flex-col items-center`}>
             <h3 className={labelClass}>Visual Identity</h3>
             <div className="relative w-48 h-48 mt-8 mb-10 group cursor-pointer">
                <div className={`w-full h-full rounded-[2.5rem] border-4 border-dashed flex items-center justify-center overflow-hidden transition-all relative ${photoPreview ? 'border-indigo-500' : 'border-slate-700 bg-slate-800/20'}`}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-6">
                      <ImageIcon className="mx-auto text-slate-600 mb-3" size={40} />
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Attach Resident Photo</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setPhoto(file);
                      setPhotoPreview(URL.createObjectURL(file));
                    }
                  }} />
                </div>
             </div>

             <div className="space-y-6 w-full">
                <div>
                   <label className={labelClass}>Legal Full Name</label>
                   <input required className={inputClass} value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div>
                   <label className={labelClass}>Primary Contact Number</label>
                   <input required className={inputClass} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div>
                   <label className={labelClass}>Email Address</label>
                   <input required type="email" className={inputClass} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
             </div>
          </div>

          <div className="lg:col-span-2 space-y-10">
             {/* Financials Section */}
             <div className={`${cardClass} p-10 rounded-[3rem] border`}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className={labelClass}>Financial Commitment & Property</h3>
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-indigo-500" />
                    <select 
                      className={`text-[10px] font-black uppercase tracking-widest border-none bg-transparent outline-none cursor-pointer ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                    >
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
                   <div className="sm:col-span-2">
                      <label className={labelClass}>Assigned Property Address</label>
                      <input required className={inputClass} value={formData.propertyAddress} onChange={e => setFormData({...formData, propertyAddress: e.target.value})} />
                   </div>
                   <div>
                      <label className={labelClass}>Monthly Rent (INR)</label>
                      <input required type="number" className={inputClass} value={formData.monthlyRent} onChange={e => setFormData({...formData, monthlyRent: parseInt(e.target.value)})} />
                   </div>
                   <div>
                      <label className={labelClass}>Advance/Security Deposit (INR)</label>
                      <input type="number" className={inputClass} value={formData.advancePayment} onChange={e => setFormData({...formData, advancePayment: parseInt(e.target.value)})} />
                   </div>
                   <div>
                      <label className={labelClass}>Contract Commencement</label>
                      <input required type="date" className={inputClass} value={formData.leaseStart} onChange={e => setFormData({...formData, leaseStart: e.target.value})} />
                   </div>
                   <div>
                      <label className={labelClass}>Contract Expiry</label>
                      <input required type="date" className={inputClass} value={formData.leaseEnd} onChange={e => setFormData({...formData, leaseEnd: e.target.value})} />
                   </div>
                </div>
             </div>

             {/* Documentation Uploads */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div 
                  onClick={() => leaseInputRef.current?.click()}
                  className={`${cardClass} p-8 rounded-[2.5rem] border cursor-pointer hover:border-indigo-500/50 transition-all flex flex-col items-center text-center group`}
                >
                   <input type="file" ref={leaseInputRef} className="hidden" onChange={handleLeaseUpload} />
                   <div className={`p-5 rounded-3xl mb-5 transition-all ${leaseUrl ? 'bg-indigo-600 text-white' : 'bg-indigo-500/10 text-indigo-400 group-hover:scale-110'}`}>
                      {isUploadingLease ? <Loader2 className="animate-spin" /> : <FileText />}
                   </div>
                   <h4 className="text-[10px] font-black uppercase text-slate-500 mb-2">Legal Rental Deed</h4>
                   <p className="text-[11px] font-bold text-slate-400 max-w-[160px]">
                      {leaseUrl ? 'Document Linked Successfully' : 'Select PDF or Scanned Deed'}
                   </p>
                </div>

                <div 
                  onClick={() => aadharInputRef.current?.click()}
                  className={`${cardClass} p-8 rounded-[2.5rem] border cursor-pointer hover:border-emerald-500/50 transition-all flex flex-col items-center text-center group`}
                >
                   <input type="file" ref={aadharInputRef} className="hidden" onChange={handleAadharUpload} />
                   <div className={`p-5 rounded-3xl mb-5 transition-all ${aadharUrl ? 'bg-emerald-600 text-white' : 'bg-emerald-500/10 text-emerald-400 group-hover:scale-110'}`}>
                      {isUploadingAadhar ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                   </div>
                   <h4 className="text-[10px] font-black uppercase text-slate-500 mb-2">Government ID Proof</h4>
                   <p className="text-[11px] font-bold text-slate-400 max-w-[160px]">
                      {aadharUrl ? 'Aadhar Verified & Uploaded' : 'Scanned Aadhar or Identity Card'}
                   </p>
                </div>
             </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-10 pt-12 border-t border-slate-200/50">
           <button type="button" onClick={onCancel} className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:text-rose-500 transition-colors">Abort Changes</button>
           <button 
             disabled={isSubmitting || isUploadingLease || isUploadingAadhar} 
             type="submit" 
             className="px-16 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-sm shadow-3xl shadow-indigo-900/40 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
           >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              <span className="uppercase tracking-widest">{initialData ? 'Update Dossier' : 'Verify & Complete Enrollment'}</span>
           </button>
        </div>
      </form>
    </div>
  );
};

export default EnrollTenant;
