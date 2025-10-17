import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Building2, 
  Plus, 
  DollarSign, 
  Wrench, 
  Package, 
  Users, 
  Settings,
  Zap,
  Calendar,
  Settings2
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/sites', icon: Building2, label: 'Sites' },
    { to: '/expense-types', icon: DollarSign, label: 'Expense Types' },
    { to: '/expenses', icon: Plus, label: 'Expenses' },
    { to: '/machines-tools', icon: Wrench, label: 'Machines & Tools' },
    { to: '/materials', icon: Package, label: 'Materials' },
    { to: '/labour-staff', icon: Users, label: 'Labour & Staff' },
    { to: '/attendance', icon: Calendar, label: 'Attendance' },
    { to: '/tools-machines', icon: Settings2, label: 'Tools & Machines' },
    { to: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <Zap size={20} />
          </div>
          B&G Infrastructures
        </div>
      </div>
      
      <nav>
        <ul className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            
            return (
              <li key={item.to} className="nav-item">
                <Link
                  to={item.to}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  <Icon />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

