
import {
    Bell,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings as SettingsIcon,
    UserPlus,
    Users
} from 'lucide-react';
import React from 'react';
import { AppAlert, Tenant, Theme, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  user: User;
  alerts: AppAlert[];
  tenants: Tenant[];
  onViewTenant?: (tenant: Tenant) => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, onLogout, user, alerts, tenants, onViewTenant, theme, onThemeChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'tenants', label: 'Tenants', icon: <Users size={20} /> },
    { id: 'enroll', label: 'Enroll New', icon: <UserPlus size={20} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} /> },
  ];

  const bgColor = theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50';
  const sidebarColor = 'bg-slate-900'; 
  const headerColor = theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';


  return (
    <div className={`flex h-screen ${bgColor} overflow-hidden transition-colors duration-300`}>
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-65 ${sidebarColor} text-white transform transition-transform duration-300 ease-in-out z-30
        lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center gap-4">
             <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center p-2 shadow-lg shadow-black/40">
                <img 
                  src="/images/logo.png" 
                  alt="PropTrack Logo" 
                  className="w-full h-full object-contain"
                />
             </div>
             <div>
               <h1 className="text-lg font-black tracking-tight leading-tight">Rental Track<br/><span className="text-indigo-400">Pro</span></h1>
             </div>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all
                  ${activeTab === item.id 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' 
                    : 'text-slate-500 hover:bg-slate-800 hover:text-slate-100'}
                `}
              >
                {item.icon}
                <span className="font-bold text-sm tracking-wide uppercase">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-slate-800 space-y-3">
            <div className="flex items-center gap-4 px-4 py-4 bg-white/5 rounded-3xl">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-lg font-black border-2 border-white/10 shadow-lg overflow-hidden">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-white truncate uppercase tracking-wider">{user.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Manager</p>
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-2xl transition-all border border-transparent hover:border-rose-400/20"
            >
              <LogOut size={20} />
              <span className="font-black text-xs uppercase tracking-widest">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className={`h-24 ${headerColor} border-b flex items-center justify-between px-10 sticky top-0 z-10 transition-colors`}>
          <div className="flex items-center gap-6">
            <button 
              className={`lg:hidden ${theme === 'dark' ? 'text-slate-200' : 'text-slate-600'} p-3 rounded-2xl bg-white/5`}
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex flex-col">
              <h2 className={`text-xs font-black uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {activeTab === 'dashboard' ? 'Performance Insights' : activeTab === 'tenants' ? 'Resident Directory' : activeTab === 'enroll' ? 'New Enrollment' : 'Control Center'}
              </h2>
              <p className={`text-[11px] font-bold mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                Rental Track Management Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-10">
            <div className="relative">
              <button 
                onClick={() => setIsAlertsOpen(!isAlertsOpen)}
                className={`relative p-3.5 rounded-2xl transition-all ${theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:text-indigo-400' : 'bg-slate-100 text-slate-400 hover:text-indigo-600'}`}
              >
                <Bell size={24} />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white ring-2 ring-rose-500/20">
                    {alerts.length}
                  </span>
                )}
              </button>

              {isAlertsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsAlertsOpen(false)} />
                  <div className={`absolute right-0 mt-5 w-96 rounded-3xl shadow-3xl border z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className={`p-5 border-b flex justify-between items-center ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      <h3 className={`font-black uppercase tracking-widest text-[10px] ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>System Notification Center</h3>
                    </div>
                    <div className="max-h-[30rem] overflow-y-auto no-scrollbar">
                      {alerts.length === 0 ? (
                        <div className="p-10 text-center">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No active alerts</p>
                        </div>
                      ) : (
                        alerts.map(alert => (
                          <div 
                            key={alert.id} 
                            className={`p-5 border-b transition-colors cursor-pointer group ${theme === 'dark' ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-50 hover:bg-slate-50'}`}
                            onClick={() => {
                              const tenant = tenants.find(t => t.id === alert.tenantId);
                              if (tenant && onViewTenant) {
                                onViewTenant(tenant);
                                setIsAlertsOpen(false);
                              }
                            }}
                          >
                            <div className="flex gap-4">
                              <div className={`p-3 rounded-2xl h-fit ${alert.type === 'overdue' ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                                <Bell size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-black transition-colors uppercase tracking-tight ${theme === 'dark' ? 'text-slate-200 group-hover:text-indigo-400' : 'text-slate-900 group-hover:text-indigo-600'}`}>{alert.title}</p>
                                <p className={`text-[11px] mt-1 font-medium leading-relaxed ${theme === 'dark' ? 'text-slate-500' : 'text-slate-500'}`}>{alert.description}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="hidden sm:block">
               <div className="w-14 h-14 rounded-3xl bg-indigo-600/10 border-4 border-white shadow-xl overflow-hidden">
                  <img src={user.photoUrl || "https://picsum.photos/seed/manager/100/100"} alt="Avatar" className="w-full h-full object-cover" />
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 relative no-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
