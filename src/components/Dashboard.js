import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Building2, 
  DollarSign, 
  Users, 
  Package,
  Wrench,
  Zap,
  Calendar,
  Settings
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalSites: 0,
    totalExpenses: 0,
    totalAmount: 0,
    totalStaff: 0,
    totalMaterials: 0,
    totalMachines: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch sites count
      const sitesSnapshot = await getDocs(collection(db, 'sites'));
      const totalSites = sitesSnapshot.size;

      // Fetch expenses count and total amount
      const expensesSnapshot = await getDocs(collection(db, 'expenses'));
      const totalExpenses = expensesSnapshot.size;
      const totalAmount = expensesSnapshot.docs.reduce((sum, doc) => {
        return sum + (doc.data().amount || 0);
      }, 0);

      // Fetch staff count
      const staffSnapshot = await getDocs(collection(db, 'labourStaff'));
      const totalStaff = staffSnapshot.size;

      // Fetch materials count
      const materialsSnapshot = await getDocs(collection(db, 'materials'));
      const totalMaterials = materialsSnapshot.size;

      // Fetch machines count
      const machinesSnapshot = await getDocs(collection(db, 'machinesTools'));
      const totalMachines = machinesSnapshot.size;

      setStats({
        totalSites,
        totalExpenses,
        totalAmount,
        totalStaff,
        totalMaterials,
        totalMachines
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="header">
        <div className="header-title">
          <BarChart3 />
          Dashboard
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading" style={{ fontSize: '2rem' }}>⏳</div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <div className="header-title">
          <Zap />
          B&G Infrastructures - Dashboard
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalSites}</div>
          <div className="stat-label">Total Sites</div>
          <Building2 size={24} style={{ marginTop: '10px', opacity: 0.7 }} />
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.totalExpenses}</div>
          <div className="stat-label">Total Expenses</div>
          <DollarSign size={24} style={{ marginTop: '10px', opacity: 0.7 }} />
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{formatAmount(stats.totalAmount)}</div>
          <div className="stat-label">Total Amount</div>
          <TrendingUp size={24} style={{ marginTop: '10px', opacity: 0.7 }} />
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.totalStaff}</div>
          <div className="stat-label">Staff Members</div>
          <Users size={24} style={{ marginTop: '10px', opacity: 0.7 }} />
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.totalMaterials}</div>
          <div className="stat-label">Materials</div>
          <Package size={24} style={{ marginTop: '10px', opacity: 0.7 }} />
        </div>
        
        <div className="stat-card">
          <div className="stat-value">{stats.totalMachines}</div>
          <div className="stat-label">Machines & Tools</div>
          <Wrench size={24} style={{ marginTop: '10px', opacity: 0.7 }} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        
        <div className="grid grid-4">
          <a href="/sites" className="btn" style={{ textAlign: 'center', padding: '20px', flexDirection: 'column', gap: '12px' }}>
            <Building2 size={24} />
            <div>Manage Sites</div>
          </a>
          
          <a href="/expenses" className="btn btn-success" style={{ textAlign: 'center', padding: '20px', flexDirection: 'column', gap: '12px' }}>
            <DollarSign size={24} />
            <div>Add Expense</div>
          </a>
          
          <a href="/attendance" className="btn btn-warning" style={{ textAlign: 'center', padding: '20px', flexDirection: 'column', gap: '12px' }}>
            <Calendar size={24} />
            <div>Attendance</div>
          </a>
          
          <a href="/tools-machines" className="btn btn-secondary" style={{ textAlign: 'center', padding: '20px', flexDirection: 'column', gap: '12px' }}>
            <Settings size={24} />
            <div>Tools & Machines</div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Activity</h3>
        </div>
        
        <div style={{ padding: '20px', textAlign: 'center', color: '#7f8c8d' }}>
          <BarChart3 size={40} style={{ marginBottom: '15px', opacity: 0.5 }} />
          <p>No recent activity to display</p>
          <p style={{ fontSize: '0.9rem' }}>Start adding sites, expenses, and managing your infrastructure projects</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
