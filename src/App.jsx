import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { AnimatePresence } from 'framer-motion';
import { getGoogleRedirectResult } from './firebase';
import { api } from './utils/api';


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
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

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
  const navigate = useNavigate();

  /**
   * Android Google Sign-In: Capture redirect result on app mount.
   * signInWithRedirect() sends the user to a Chrome Custom Tab;
   * when they return, getRedirectResult() resolves the credential.
   * This runs on every mount but is a no-op when no redirect is pending.
   */
  useEffect(() => {
    getGoogleRedirectResult()
      .then(async (firebaseUser) => {
        if (!firebaseUser) return; // no pending redirect
        try {
          // Register / log in user with Pairley backend
          const payload = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            phone: firebaseUser.phoneNumber || '',
            profilePicture: firebaseUser.photoURL,
            authProvider: 'google',
          };
          const data = await api.post('/users/register', payload);
          if (data?.token) {
            localStorage.setItem('pairley_token', data.token);
            localStorage.setItem('pairley_user', JSON.stringify(data.user));
          }
          // Redirect based on role
          const role = data?.user?.role;
          if (role === 'business') navigate('/business/dashboard', { replace: true });
          else if (role === 'admin') navigate('/admin/dashboard', { replace: true });
          else navigate('/customer/dashboard', { replace: true });
        } catch (err) {
          console.error('Post-redirect auth error:', err);
        }
      })
      .catch((err) => console.error('Redirect result error:', err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle native push notifications registration
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const setupPush = async () => {
      try {
        let permStatus = await PushNotifications.checkPermissions();
        
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== 'granted') {
          console.warn('User denied push notification permissions.');
          return;
        }

        await PushNotifications.register();

        // On success, save token and register on backend if logged in
        await PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration success, token:', token.value);
          localStorage.setItem('pairley_push_token', token.value);
          
          const activeToken = localStorage.getItem('pairley_token');
          if (activeToken) {
            try {
              await api.post('/notifications/register-token', {
                token: token.value,
                platform: Capacitor.getPlatform()
              }, activeToken);
              console.log('Successfully registered push token with backend');
            } catch (err) {
              console.error('Failed to register push token with backend:', err);
            }
          }
        });

        await PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on push registration:', error);
        });

        await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received:', notification);
          window.dispatchEvent(new CustomEvent('pairley-notification-received', { detail: notification }));
        });

        await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          console.log('Push notification action performed:', action);
        });
      } catch (err) {
        console.error('Push notifications setup error:', err);
      }
    };

    setupPush();
    
    return () => {
      try {
        PushNotifications.removeAllListeners();
      } catch (err) {}
    };
  }, []);

  // Register push token whenever user sessions are updated/initialized
  useEffect(() => {
    const activeToken = localStorage.getItem('pairley_token');
    const pushToken = localStorage.getItem('pairley_push_token');
    
    if (activeToken && pushToken && Capacitor.isNativePlatform()) {
      api.post('/notifications/register-token', {
        token: pushToken,
        platform: Capacitor.getPlatform()
      }, activeToken)
        .then(() => console.log('Associated push token with logged-in user'))
        .catch(err => console.error('Failed to associate push token:', err));
    }
  }, [location.pathname]);

  return (
    <div className="app-root flex flex-col min-h-screen">
      <ScrollToTop />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route
            path={ROUTES.HOME}
            element={
              <AppLayout>
                <HomePage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.DEALS}
            element={
              <AppLayout>
                <DealsPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.DEAL_DETAIL}
            element={
              <AppLayout>
                <DealDetailPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.HOW_IT_WORKS}
            element={
              <AppLayout>
                <HowItWorksPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.ABOUT}
            element={
              <AppLayout>
                <AboutPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.SUPPORT}
            element={
              <AppLayout>
                <SupportPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.REFUND_POLICY}
            element={
              <AppLayout>
                <RefundPolicyPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.PRIVACY_POLICY}
            element={
              <AppLayout>
                <PrivacyPolicyPage />
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
              <AppLayout>
                <CartPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.CHECKOUT}
            element={
              <AppLayout>
                <CheckoutPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.ORDER_SUCCESS}
            element={
              <AppLayout>
                <OrderSuccessPage />
              </AppLayout>
            }
          />

          {/* Customer Dashboard Routes */}
          <Route
            path={ROUTES.CUSTOMER_DASHBOARD}
            element={
              <AppLayout>
                <CustomerDashboard />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_PROFILE}
            element={
              <AppLayout>
                <CustomerProfile />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_ORDERS}
            element={
              <AppLayout>
                <CustomerOrdersPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_ORDER_DETAIL}
            element={
              <AppLayout>
                <CustomerOrderDetailPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_CHAT}
            element={
              <AppLayout>
                <CustomerChatPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.CUSTOMER_DEAL_CHAT}
            element={
              <AppLayout>
                <CustomerDealChatPage />
              </AppLayout>
            }
          />

          {/* Business Dashboard Routes */}
          <Route
            path={ROUTES.BUSINESS_DASHBOARD}
            element={
              <AppLayout>
                <BusinessDashboard />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.CREATE_DEAL}
            element={
              <AppLayout>
                <CreateDealPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.MANAGE_DEALS}
            element={
              <AppLayout>
                <ManageDealsPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.BUSINESS_ORDERS}
            element={
              <AppLayout>
                <BusinessOrdersPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.BUSINESS_PAYOUTS}
            element={
              <AppLayout>
                <BusinessPayoutsPage />
              </AppLayout>
            }
          />
          <Route
            path={ROUTES.BUSINESS_SETTINGS}
            element={
              <AppLayout>
                <BusinessSettingsPage />
              </AppLayout>
            }
          />          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <AppLayout>
                <AdminDashboard />
              </AppLayout>
            }
          />


          {/* Catch-all 404 Page */}
          <Route
            path="*"
            element={
              <AppLayout>
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
