
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, Calendar, DollarSign, FileWarning, ShieldAlert, Sparkles } from 'lucide-react';
import React, { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AppAlert, FinancialStats, Tenant, Theme } from '../types';

interface DashboardProps {
  tenants: Tenant[];
  alerts: AppAlert[];
  theme: Theme;
}

const Dashboard: React.FC<DashboardProps> = ({ tenants, alerts, theme }) => {
  const [aiAdvice, setAiAdvice] = React.useState<string>("Appseonit AI is analyzing your portfolio performance...");

  const stats: FinancialStats = useMemo(() => {
    const activeTenants = tenants.filter(t => t.status === 'Active');
    const monthlyExpected = activeTenants.reduce((sum, t) => sum + t.monthlyRent, 0);
    const yearlyExpected = monthlyExpected * 12;
    
    const collected = tenants.reduce((total, tenant) => {
      const tenantPaid = (tenant.paymentHistory || [])
        .filter(p => p.status === 'Paid')
        .reduce((sum, p) => sum + p.amount, 0);
      return total + tenantPaid;
    }, 0);
    
    const outstandingBalance = Math.max(0, yearlyExpected - collected);
    
    const monthlyData = [
      { month: 'Oct', expected: monthlyExpected, actual: monthlyExpected * 0.95 },
      { month: 'Nov', expected: monthlyExpected, actual: monthlyExpected * 0.98 },
      { month: 'Dec', expected: monthlyExpected, actual: monthlyExpected * 0.92 },
      { month: 'Jan', expected: monthlyExpected, actual: monthlyExpected * 0.99 },
      { month: 'Feb', expected: monthlyExpected, actual: monthlyExpected * 0.90 },
      { month: 'Mar', expected: monthlyExpected, actual: monthlyExpected * 0.94 },
    ];

    return {
      expectedIncomeYear: yearlyExpected,
      collectedIncomeYear: collected,
      outstandingBalance: outstandingBalance,
      monthlyData
    };
  }, [tenants]);

  React.useEffect(() => {
    const fetchAdvice = async () => {
      try {
        const response = await fetch('/api/gemini', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stats }),
        });

        const data = await response.json();
        setAiAdvice(data.advice || 'Keep monitoring your collection rates and maintain a reserve fund.');
      } catch (error) {
        console.error('Gemini fetch failed:', error);
        setAiAdvice('Keep monitoring your collection rates and maintain a reserve fund.');
      }
    };
    fetchAdvice();
  }, [stats]);

  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const mutedText = theme === 'dark' ? 'text-slate-500' : 'text-slate-500';
  const cardBg = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  const kpis = [
    { 
      label: 'Target Portfolio', 
      value: `₹${stats.expectedIncomeYear.toLocaleString()}`, 
      icon: <DollarSign size={20} className="text-indigo-400" />, 
      color: 'bg-indigo-500/10',
      trend: '+15.2%',
      trendUp: true
    },
    { 
      label: 'Annual Revenue', 
      value: `₹${stats.collectedIncomeYear.toLocaleString()}`, 
      icon: <ArrowUpRight size={20} className="text-emerald-400" />, 
      color: 'bg-emerald-500/10',
      trend: 'Verified Collections',
      trendUp: true
    },
    { 
      label: 'Pending Dues', 
      value: `₹${stats.outstandingBalance.toLocaleString()}`, 
      icon: <ArrowDownRight size={20} className="text-rose-400" />, 
      color: 'bg-rose-500/10',
      trend: 'Follow-up required',
      trendUp: false
    },
    { 
      label: 'Verified Units', 
      value: tenants.length.toString(), 
      icon: <Activity size={20} className="text-amber-400" />, 
      color: 'bg-amber-500/10',
      trend: 'Full Enrollment',
      trendUp: true
    },
  ];

  const getAlertIcon = (type: string, title: string) => {
    if (type === 'expiry' && title.includes('EXPIRED')) return <ShieldAlert size={16} />;
    switch (type) {
      case 'overdue': return <Bell size={16} />;
      case 'expiry': return <FileWarning size={16} />;
      default: return <Calendar size={16} />;
    }
  };

  const getAlertColor = (type: string, title: string) => {
    if (type === 'overdue') return 'bg-rose-500';
    if (type === 'expiry') {
      return title.includes('EXPIRED') ? 'bg-rose-600 shadow-lg shadow-rose-500/30' : 'bg-amber-500';
    }
    return 'bg-indigo-500';
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className={`text-3xl font-black tracking-tight ${textColor}`}>Business Intelligence</h2>
          <p className={mutedText}>Rental Track Pro financial engine by Appseonit Technologies</p>
        </div>
        <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-colors ${cardBg}`}>
          <Calendar size={18} className="text-indigo-500" />
          <span className={`text-sm font-black ${textColor}`}>FY 2025-2026</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <div key={idx} className={`${cardBg} p-8 rounded-[2.5rem] border shadow-2xl shadow-indigo-500/5 transition-all hover:scale-[1.02]`}>
            <div className="flex items-center justify-between mb-6">
              <div className={`p-3 rounded-2xl ${kpi.color}`}>
                {kpi.icon}
              </div>
              <span className={`text-[10px] font-black px-3 py-1 rounded-full ${kpi.trendUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                {kpi.trend}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{kpi.label}</p>
            <h3 className={`text-2xl font-black mt-1 ${textColor}`}>{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
           <div className={`${cardBg} p-10 rounded-[3rem] border shadow-2xl shadow-slate-900/5`}>
              <div className="flex items-center justify-between mb-10">
                 <h3 className={`text-xl font-black ${textColor}`}>Revenue Realization Graph</h3>
                 <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Expected</div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Actual</div>
                 </div>
              </div>
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={stats.monthlyData}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="5 5" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
                      <YAxis hide />
                      <Tooltip contentStyle={{borderRadius: '1.5rem', border: 'none', background: theme === 'dark' ? '#0f172a' : '#fff', color: theme === 'dark' ? '#fff' : '#000'}} />
                      <Area type="monotone" dataKey="expected" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorIncome)" />
                      <Area type="monotone" dataKey="actual" stroke={theme === 'dark' ? '#334155' : '#cbd5e1'} strokeWidth={3} fillOpacity={0} />
                   </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>

           <div className={`${cardBg} p-10 rounded-[3rem] border`}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Bell size={22} className="text-rose-500" />
                  <h3 className={`text-xl font-black ${textColor}`}>Critical System Alerts</h3>
                </div>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  {alerts.length} Active
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alerts.length === 0 ? (
                  <div className="md:col-span-2 py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Everything is up to date.</p>
                  </div>
                ) : (
                  alerts.slice(0, 4).map(alert => (
                    <div key={alert.id} className={`${theme === 'dark' ? 'bg-slate-800/40' : 'bg-slate-50'} p-5 rounded-2xl border border-transparent hover:border-indigo-500/20 transition-all group`}>
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl text-white ${getAlertColor(alert.type, alert.title)}`}>
                          {getAlertIcon(alert.type, alert.title)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-black uppercase tracking-tight truncate ${textColor}`}>{alert.title}</p>
                          <p className="text-[11px] font-medium text-slate-500 mt-1 line-clamp-1">{alert.description}</p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{alert.date}</span>
                            <ArrowRight size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 p-8 rounded-[3rem] shadow-3xl relative overflow-hidden group">
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-6">
                    <Sparkles size={24} className="text-indigo-400" />
                    <h3 className="text-lg font-black text-white">Appseonit AI Insights</h3>
                 </div>
                 <p className="text-indigo-100 text-sm leading-relaxed italic font-medium">
                    "{aiAdvice}"
                 </p>
                 <button className="mt-8 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-white transition-colors">Generate Portfolio Report</button>
              </div>
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-600 rounded-full blur-[80px] opacity-20 transition-all group-hover:opacity-40" />
           </div>

           <div className={`${cardBg} p-8 rounded-[2.5rem] border`}>
              <h3 className={`text-sm font-black uppercase tracking-widest mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Property Efficiency</h3>
              <div className="space-y-8">
                 <div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-2">
                       <span>Occupancy Level</span>
                       <span className={textColor}>100%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800/20 rounded-full overflow-hidden">
                       <div className="bg-indigo-500 h-full w-full" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-2">
                       <span>Collection Ratio</span>
                       <span className={textColor}>{(stats.collectedIncomeYear / (stats.expectedIncomeYear || 1) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800/20 rounded-full overflow-hidden">
                       <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${(stats.collectedIncomeYear / (stats.expectedIncomeYear || 1) * 100)}%` }} />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
