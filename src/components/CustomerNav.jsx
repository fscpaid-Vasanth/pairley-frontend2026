import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  ShoppingBag
} from 'lucide-react';
import { ROUTES } from '../utils/constants';
import './CustomerNav.css';

export default function CustomerNav() {
  const location = useLocation();

  const navItems = [
    { 
      label: 'Dashboard', 
      path: ROUTES.CUSTOMER_DASHBOARD, 
      icon: LayoutDashboard 
    },
    { 
      label: 'My Orders & Matches', 
      path: ROUTES.CUSTOMER_ORDERS, 
      icon: ShoppingBag 
    },
    { 
      label: 'Profile Settings', 
      path: ROUTES.CUSTOMER_PROFILE, 
      icon: Settings 
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="customer-nav container max-w-6xl mx-auto px-4 mb-6 print:hidden">
      <div className="customer-nav__inner bg-white border border-slate-200 p-2.5 rounded-2xl shadow-sm flex gap-1.5 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`customer-nav__tab flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition ${
                active 
                  ? 'customer-nav__tab--active bg-[#5B12D6]/5 text-[#5B12D6] border border-[#5B12D6]/10 shadow-sm' 
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

