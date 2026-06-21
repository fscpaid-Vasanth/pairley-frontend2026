import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Layout & Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';

// Public Pages
import HomePage from './pages/HomePage';
import DealsPage from './pages/DealsPage';
import DealDetailPage from './pages/DealDetailPage';
import HowItWorksPage from './pages/HowItWorksPage';
import AboutPage from './pages/AboutPage';
import SupportPage from './pages/SupportPage';
import RefundPolicyPage from './pages/RefundPolicyPage';

// Auth Pages
import SignUpPage from './pages/auth/SignUpPage';
import LoginPage from './pages/auth/LoginPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage';
import CustomerOrderDetailPage from './pages/customer/CustomerOrderDetailPage';
import CustomerChatPage from './pages/customer/CustomerChatPage';
import CustomerDealChatPage from './pages/customer/CustomerDealChatPage';

// Business Pages
import BusinessDashboard from './pages/business/BusinessDashboard';
import CreateDealPage from './pages/business/CreateDealPage';
import ManageDealsPage from './pages/business/ManageDealsPage';
import BusinessOrdersPage from './pages/business/BusinessOrdersPage';
import BusinessPayoutsPage from './pages/business/BusinessPayoutsPage';
import BusinessSettingsPage from './pages/business/BusinessSettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminDashboard from './pages/admin/AdminDashboard';

// Providers
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';

// Cart & Checkout Pages
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/cart/CheckoutPage';
import OrderSuccessPage from './pages/cart/OrderSuccessPage';

// Routes constants
import { ROUTES } from './utils/constants';

function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isChatPage = location.pathname.includes('/customer/deal-chat');

  const handleSearchClick = () => {
    if (location.pathname !== '/deals') {
      navigate('/deals?focusSearch=true');
    } else {
      window.dispatchEvent(new CustomEvent('focus-deals-search'));
    }
  };

  return (
    <>
      <Navbar onSearchClick={handleSearchClick} />
      <main className="flex-1 flex flex-col">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      {!isChatPage && <Footer />}
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();

  return (
    <div className="app-root flex flex-col min-h-screen">
      <ScrollToTop />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route
            path={ROUTES.HOME}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <HomePage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.DEALS}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <DealsPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.DEAL_DETAIL}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <DealDetailPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.HOW_IT_WORKS}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <HowItWorksPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.ABOUT}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <AboutPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.SUPPORT}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <SupportPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.REFUND_POLICY}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <RefundPolicyPage />
              </AppLayout>
            }
          />

          {/* Auth Routes */}
          <Route 
            path={ROUTES.SIGNUP} 
            element={
              <PageTransition>
                <SignUpPage />
              </PageTransition>
            } 
          />
          <Route 
            path={ROUTES.LOGIN} 
            element={
              <PageTransition>
                <LoginPage />
              </PageTransition>
            } 
          />

          {/* Cart & Checkout Routes */}
          <Route
            path={ROUTES.CART}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <CartPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.CHECKOUT}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <CheckoutPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.ORDER_SUCCESS}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <OrderSuccessPage />
              </AppLayout>
            }
          />

          {/* Customer Dashboard Routes */}
          <Route
            path={ROUTES.CUSTOMER_DASHBOARD}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <CustomerDashboard />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_PROFILE}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <CustomerProfile />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_ORDERS}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <CustomerOrdersPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_ORDER_DETAIL}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <CustomerOrderDetailPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_CHAT}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <CustomerChatPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_DEAL_CHAT}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <CustomerDealChatPage />
              </AppLayout>
            }
          />

          {/* Business Dashboard Routes */}
          <Route
            path={ROUTES.BUSINESS_DASHBOARD}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <BusinessDashboard />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.CREATE_DEAL}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <CreateDealPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.MANAGE_DEALS}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <ManageDealsPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.BUSINESS_ORDERS}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <BusinessOrdersPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.BUSINESS_PAYOUTS}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <BusinessPayoutsPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.BUSINESS_SETTINGS}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <BusinessSettingsPage />
              </AppLayout>
            }
          />          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <AdminDashboard />
              </AppLayout>
            }
          />


          {/* Catch-all 404 Page */}
          <Route
            path="*"
            element={
              <AppLayout onSearchClick={() => setIsSearchOpen(true)}>
                <NotFoundPage />
              </AppLayout>
            }
          />
        </Routes>
      </AnimatePresence>

    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </ToastProvider>
  );
}
