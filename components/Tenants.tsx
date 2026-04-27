
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Edit2,
    Eye,
    FileQuestion,
    MapPin,
    Search,
    Users
} from 'lucide-react';
import React, { useState } from 'react';
import { Tenant, Theme } from '../types';
import DocumentPreviewer from './DocumentPreviewer';

interface TenantsProps {
  tenants: Tenant[];
  onEdit: (tenant: Tenant) => void;
  onViewDetails: (tenant: Tenant) => void;
  theme: Theme;
}

const Tenants: React.FC<TenantsProps> = ({ tenants, onEdit, onViewDetails, theme }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Pending' | 'Terminated'>('All');
  const [previewData, setPreviewData] = useState<{url: string, title: string} | null>(null);

  const filteredTenants = tenants.filter(t => {
    const matchesSearch = t.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          t.propertyAddress.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || t.status === filter;
    return matchesSearch && matchesFilter;
  });

  const getLeaseStatus = (leaseEnd: string) => {
    const today = new Date();
    const end = new Date(leaseEnd);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { label: 'Expired', color: 'bg-rose-500/10 text-rose-500', icon: <AlertTriangle size={12} /> };
    if (diffDays <= 30) return { label: `${diffDays}d Left`, color: 'bg-amber-500/10 text-amber-500', icon: <Clock size={12} /> };
    return { label: 'Secure', color: 'bg-slate-500/10 text-slate-400', icon: null };
  };

  const getVerificationStatus = (tenant: Tenant) => {
    const hasLease = !!tenant.documentUrl;
    const hasAadhar = !!tenant.aadharUrl;

    if (hasLease && hasAadhar) {
      return { label: 'Verified', color: 'bg-emerald-500/10 text-emerald-500', icon: <CheckCircle size={12} /> };
    }
    if (hasLease || hasAadhar) {
      return { label: 'Pending', color: 'bg-amber-500/10 text-amber-500', icon: <FileQuestion size={12} /> };
    }
    return { label: 'Action Required', color: 'bg-rose-500/10 text-rose-500', icon: <AlertTriangle size={12} /> };
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const mutedText = theme === 'dark' ? 'text-slate-500' : 'text-slate-400';
  const cardBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  const filterOptions: ('All' | 'Active' | 'Pending' | 'Terminated')[] = ['All', 'Active', 'Pending', 'Terminated'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div>
          <h2 className={`text-2xl font-black ${textColor}`}>Property Directory</h2>
          <p className={mutedText}>Verified resident database powered by Appseonit Technologies</p>
          
          <div className="flex items-center gap-1 mt-8 p-1.5 bg-slate-100 dark:bg-slate-800/50 w-fit rounded-2xl border border-slate-200 dark:border-slate-800">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`
                  px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                  ${filter === opt 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}
                `}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 items-center">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Find resident..." 
                className={`pl-12 pr-6 py-3 rounded-2xl outline-none w-full sm:w-80 transition-all border ${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white focus:border-indigo-500' : 'bg-white border-slate-200 focus:border-indigo-600'}`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
           </div>
        </div>
      </div>

      <div className={`${cardBg} rounded-[2.5rem] border overflow-hidden transition-colors`}>
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead className={theme === 'dark' ? 'bg-slate-800/50' : 'bg-slate-50'}>
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Resident</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Property</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Verification</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Lease Contract</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rent (₹)</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/10">
              {filteredTenants.map((tenant) => {
                const leaseStatus = getLeaseStatus(tenant.leaseEnd);
                const verification = getVerificationStatus(tenant);
                return (
                  <tr key={tenant.id} className={`${theme === 'dark' ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50'} transition-all group`}>
                    <td className="px-8 py-5">
                      <button 
                        onClick={() => onViewDetails(tenant)}
                        className="flex items-center gap-5 text-left group/btn"
                      >
                        <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-500/10 border-2 border-transparent group-hover/btn:border-indigo-500 overflow-hidden flex-shrink-0 transition-all shadow-sm">
                          <img src={tenant.photoUrl || `https://picsum.photos/seed/${tenant.id}/200/200`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className={`text-sm font-black group-hover/btn:text-indigo-400 transition-colors ${textColor}`}>{tenant.fullName}</p>
                          <p className={`text-[11px] font-bold ${mutedText}`}>{tenant.phone}</p>
                        </div>
                      </button>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <MapPin size={16} className="text-indigo-500 shrink-0" />
                        <span className={`text-xs font-bold truncate ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{tenant.propertyAddress}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 w-fit ${verification.color}`}>
                           {verification.icon} {verification.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                           <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 ${leaseStatus.color}`}>
                             {leaseStatus.icon} {leaseStatus.label}
                           </span>
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">Ends: {tenant.leaseEnd}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col gap-1">
                        <span className={`text-sm font-black ${textColor}`}>₹{tenant.monthlyRent.toLocaleString()}</span>
                        {tenant.yearlyPercentage ? (
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest">+{tenant.yearlyPercentage}% annual</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => onViewDetails(tenant)} className={`p-3 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-indigo-400' : 'bg-white border-slate-100 text-slate-500 hover:text-indigo-600'}`}>
                           <Eye size={18} />
                        </button>
                        <button onClick={() => onEdit(tenant)} className={`p-3 rounded-2xl border transition-all ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-indigo-400' : 'bg-white border-slate-100 text-slate-500 hover:text-indigo-600'}`}>
                           <Edit2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTenants.length === 0 && (
            <div className="py-32 text-center">
              <Users size={64} className="mx-auto text-slate-700 mb-6 opacity-20" />
              <h3 className={`font-black uppercase tracking-widest text-sm ${textColor}`}>Resident not found</h3>
              <p className={mutedText}>Adjust your search filters for Appseonit Directory</p>
            </div>
          )}
        </div>
      </div>

      {previewData && (
        <DocumentPreviewer 
          isOpen={!!previewData} 
          onClose={() => setPreviewData(null)} 
          url={previewData.url} 
          title={previewData.title} 
          theme={theme}
        />
      )}
    </div>
  );
};

export default Tenants;
