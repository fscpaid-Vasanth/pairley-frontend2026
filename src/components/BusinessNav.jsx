import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Settings,
  Wallet,
  Truck,
  Tag,
  Users
} from 'lucide-react';
import { ROUTES } from '../utils/constants';
import './BusinessNav.css';

export default function BusinessNav() {
  const location = useLocation();

  const navItems = [
    { 
      label: 'Dashboard', 
      path: ROUTES.BUSINESS_DASHBOARD, 
      icon: LayoutDashboard 
    },
    {
      label: 'Deals Manager',
      path: ROUTES.MANAGE_DEALS,
      icon: Tag
    },
    {
      label: 'Leads',
      path: ROUTES.BUSINESS_LEADS,
      icon: Users
    },
    {
      label: 'Fulfillment & Orders',
      path: ROUTES.BUSINESS_ORDERS,
      icon: Truck
    },
    { 
      label: 'Payouts & Earnings', 
      path: ROUTES.BUSINESS_PAYOUTS, 
      icon: Wallet 
    },
    { 
      label: 'Store Settings', 
      path: ROUTES.BUSINESS_SETTINGS, 
      icon: Settings 
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="business-nav container max-w-6xl mx-auto px-4 mb-6 print:hidden">
      <div className="business-nav__inner bg-white border border-slate-200 p-2.5 rounded-2xl shadow-sm flex gap-1.5 overflow-x-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`business-nav__tab flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
                active 
                  ? 'business-nav__tab--active bg-[#5B12D6]/5 text-[#5B12D6] border border-[#5B12D6]/10 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <IconComponent size={14} className={active ? 'text-[#5B12D6]' : 'text-slate-400'} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

