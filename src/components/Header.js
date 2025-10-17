import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, Home, Plus, List, BarChart3 } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  
  const getNavLinks = () => {
    const pathSegments = location.pathname.split('/');
    const siteId = pathSegments[2];
    
    if (siteId) {
      return [
        { to: `/dashboard/${siteId}`, icon: BarChart3, label: 'Dashboard' },
        { to: `/add-expense/${siteId}`, icon: Plus, label: 'Add Expense' },
        { to: `/expenses/${siteId}`, icon: List, label: 'Expenses' },
        { to: '/', icon: Home, label: 'Sites' }
      ];
    }
    
    return [
      { to: '/', icon: Home, label: 'Home' }
    ];
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <div className="logo-icon icon-animation">
            <Building2 size={24} />
          </div>
          B&G Infrastructures
        </Link>
        
        <nav className="nav-links">
          {getNavLinks().map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} className="icon-animation" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;

