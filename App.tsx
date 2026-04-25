
import { Loader2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import DocumentPreviewer from './components/DocumentPreviewer';
import EnrollTenant from './components/EnrollTenant';
import Layout from './components/Layout';
import Settings from './components/Settings';
import TenantDetails from './components/TenantDetails';
import Tenants from './components/Tenants';
import { MOCK_TENANTS } from './constants';
import { fetchTenants, saveTenantToDB, updateTenantInDB } from './services/tenantService';
import { AppAlert, AuthState, PaymentRecord, Tenant, Theme, User } from './types';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>('login');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);
  const [previewData, setPreviewData] = useState<{url: string, title: string} | null>(null);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const initApp = () => {
      const savedUser = localStorage.getItem('prop_track_user');
      const savedToken = localStorage.getItem('prop_track_token');
      const savedTheme = localStorage.getItem('app_theme') as Theme;

      if (savedUser && savedToken) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        setAuthState('authenticated');
        setTheme(parsedUser.theme || 'light');
      } else if (savedTheme) {
        setTheme(savedTheme);
      }

      if (!savedToken) {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  useEffect(() => {
    const loadTenants = async () => {
      if (!token) {
        return;
      }

      setIsLoading(true);
      try {
        const fetchedTenants = await fetchTenants();
        setTenants(fetchedTenants);
      } catch (error) {
        console.error('Failed to load tenants:', error);
        setTenants(MOCK_TENANTS);
      } finally {
        setIsLoading(false);
      }
    };

    loadTenants();
  }, [token]);

  const alerts: AppAlert[] = useMemo(() => {
    const today = new Date();
    const generatedAlerts: AppAlert[] = [];

    tenants.forEach(tenant => {
      if (tenant.status !== 'Active') return;
      
      const leaseStartDate = new Date(tenant.leaseStart);
      const dueDay = leaseStartDate.getDate();
      const currentDay = today.getDate();
      
      if (currentDay > dueDay) {
        generatedAlerts.push({
          id: `pay-late-${tenant.id}`,
          type: 'overdue',
          title: `${tenant.fullName} - Payment Overdue`,
          description: `Rent payment for the current period is ${currentDay - dueDay} days late.`,
          tenantId: tenant.id,
          date: new Date(today.getFullYear(), today.getMonth(), dueDay).toLocaleDateString(),
          amount: tenant.monthlyRent
        });
      } else if (dueDay - currentDay <= 3 && currentDay <= dueDay) {
        generatedAlerts.push({
          id: `pay-soon-${tenant.id}`,
          type: 'upcoming',
          title: `${tenant.fullName} - Rent Due Soon`,
          description: `Monthly rent payment is due in ${dueDay - currentDay} days.`,
          tenantId: tenant.id,
          date: new Date(today.getFullYear(), today.getMonth(), dueDay).toLocaleDateString(),
          amount: tenant.monthlyRent
        });
      }

      const leaseEndDate = new Date(tenant.leaseEnd);
      const diffTime = leaseEndDate.getTime() - today.getTime();
      const daysToExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (daysToExpiry <= 0) {
        generatedAlerts.push({
          id: `expired-${tenant.id}`,
          type: 'expiry',
          title: `${tenant.fullName} - LEASE EXPIRED`,
          description: `Contract for ${tenant.propertyAddress} expired on ${tenant.leaseEnd}. Immediate action required.`,
          tenantId: tenant.id,
          date: tenant.leaseEnd
        });
      } else if (daysToExpiry <= 30) {
        generatedAlerts.push({
          id: `expiring-${tenant.id}`,
          type: 'expiry',
          title: `${tenant.fullName} - Lease Expiring`,
          description: `Contract expires in ${daysToExpiry} days. Start the renewal process.`,
          tenantId: tenant.id,
          date: tenant.leaseEnd
        });
      }
    });

    return generatedAlerts.sort((a, b) => {
      const priorityMap = { overdue: 1, expiry: 1, upcoming: 2 };
      return (priorityMap[a.type as keyof typeof priorityMap] || 3) - (priorityMap[b.type as keyof typeof priorityMap] || 3);
    });
  }, [tenants]);

  const handleLogin = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    setAuthState('authenticated');
    setTheme(userData.theme || 'light');
    localStorage.setItem('prop_track_user', JSON.stringify(userData));
    localStorage.setItem('prop_track_token', authToken);
    localStorage.setItem('app_theme', userData.theme || 'light');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setAuthState('login');
    localStorage.removeItem('prop_track_user');
    localStorage.removeItem('prop_track_token');
  };

  const handleUpdateUser = (userData: User, authToken?: string) => {
    setUser(userData);
    setTheme(userData.theme || 'light');
    localStorage.setItem('prop_track_user', JSON.stringify(userData));
    localStorage.setItem('app_theme', userData.theme || 'light');
    if (authToken) {
      setToken(authToken);
      localStorage.setItem('prop_track_token', authToken);
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('app_theme', newTheme);
  };

  const handleAddTenant = async (tenantData: Omit<Tenant, 'id'>) => {
    setIsLoading(true);
    try {
      if (editingTenant) {
        const updated = await updateTenantInDB(editingTenant.id, tenantData);
        setTenants(prev => prev.map(t => t.id === editingTenant.id ? { ...updated, paymentHistory: t.paymentHistory || [] } as Tenant : t));
        setEditingTenant(null);
      } else {
        const savedTenant = await saveTenantToDB(tenantData);
        setTenants(prev => [savedTenant, ...prev]);
      }
      setActiveTab('tenants');
    } catch (err) {
      alert("Database error: Could not sync with kfmData.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePayment = async (tenantId: string, payment: PaymentRecord) => {
    setTenants(prev => {
      const updated = prev.map(t => {
        if (t.id === tenantId) {
          const history = t.paymentHistory || [];
          const exists = history.find(p => p.id === payment.id);
          const newHistory = exists 
            ? history.map(p => p.id === payment.id ? payment : p)
            : [payment, ...history];
          
          const sortedHistory = newHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          // Persist the history update to DB
          updateTenantInDB(tenantId, { paymentHistory: sortedHistory });

          return {
            ...t,
            paymentHistory: sortedHistory
          };
        }
        return t;
      });

      if (viewingTenant && viewingTenant.id === tenantId) {
        const t = updated.find(x => x.id === tenantId);
        if (t) setViewingTenant(t);
      }
      return updated;
    });
  };

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setActiveTab('enroll');
  };

  const handleViewTenant = (tenant: Tenant) => {
    setViewingTenant(tenant);
  };

  const renderContent = () => {
    if (isLoading && tenants.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Loader2 className={`animate-spin mb-4 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} size={40} />
          <p className={`text-sm font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Connecting to kfmData Cluster...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard tenants={tenants} alerts={alerts} theme={theme} />;
      case 'tenants':
        return (
          <Tenants 
            tenants={tenants} 
            onEdit={handleEditTenant} 
            onViewDetails={handleViewTenant}
            theme={theme}
          />
        );
      case 'enroll':
        return (
          <EnrollTenant 
            onAdd={handleAddTenant} 
            onCancel={() => {
              setActiveTab('tenants');
              setEditingTenant(null);
            }}
            initialData={editingTenant || undefined}
            theme={theme}
          />
        );
      case 'settings':
        return (
          <Settings 
            user={user!} 
            token={token!}
            onUpdateUser={handleUpdateUser} 
            theme={theme} 
            onThemeChange={handleThemeChange} 
          />
        );
      default:
        return <Dashboard tenants={tenants} alerts={alerts} theme={theme} />;
    }
  };

  if (authState !== 'authenticated' || !user) {
    return <Auth onLogin={handleLogin} initialState={authState} />;
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        user={user}
        alerts={alerts}
        theme={theme}
        onThemeChange={handleThemeChange}
      >
        {renderContent()}

        {viewingTenant && (
          <TenantDetails 
            tenant={viewingTenant} 
            isOpen={!!viewingTenant} 
            onClose={() => setViewingTenant(null)}
            onPreviewDoc={(url, title) => setPreviewData({url, title})}
            onUpdatePayment={handleUpdatePayment}
            theme={theme}
          />
        )}

        {previewData && (
          <DocumentPreviewer 
            isOpen={!!previewData} 
            onClose={() => setPreviewData(null)} 
            url={previewData.url} 
            title={previewData.title} 
            theme={theme}
          />
        )}
      </Layout>
    </div>
  );
};

export default App;
