import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../hooks/useNotifications';
import { formatNotificationTime } from '../utils/notifications';
import { ROUTES } from '../utils/constants';
import './NotificationCenter.css';

export default function NotificationCenter({ user }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL');
  
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications(user);

  const getEmojiForType = (type) => {
    switch (type) {
      case 'DEAL_EXPIRY': return '⏰';
      case 'GROUP_COMPLETE': return '🎉';
      case 'CHAT': return '💬';
      case 'ORDER': return '📦';
      case 'NEARBY': return '📍';
      case 'PARTNER_JOINED': return '🤝';
      case 'NEW_DEAL': return '🔥';
      default: return '🔔';
    }
  };

  const handleNotificationClick = async (notif) => {
    await markAsRead(notif.id);
    setIsOpen(false);
    
    // Navigation routes mapping
    if (notif.type === 'NEW_DEAL') {
      navigate(ROUTES.DEALS || '/deals');
    } else if (notif.type === 'PARTNER_JOINED') {
      if (user?.role?.toLowerCase() === 'business' || user?.role?.toLowerCase() === 'merchant') {
        navigate('/business/dashboard');
      } else {
        navigate(ROUTES.CUSTOMER_ORDERS || '/customer/orders');
      }
    } else if (notif.type === 'CHAT') {
      navigate(user?.role?.toLowerCase() === 'business' ? '/business/dashboard' : '/customer/orders');
    } else if (notif.type === 'ORDER') {
      navigate(user?.role?.toLowerCase() === 'business' ? '/business/orders' : '/customer/orders');
    } else {
      navigate('/');
    }
  };

  // Filter notifications by activeTab
  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'DEALS') return n.type === 'NEW_DEAL' || n.type === 'DEAL_EXPIRY';
    if (activeTab === 'CHATS') return n.type === 'CHAT' || n.type === 'PARTNER_JOINED';
    if (activeTab === 'ORDERS') return n.type === 'ORDER';
    return true;
  });

  return (
    <>
      {/* Trigger Button */}
      <button 
        className="notif-trigger" 
        onClick={() => setIsOpen(true)}
        aria-label={`View notifications, ${unreadCount} unread`}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge notif-badge--pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              className="notif-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <motion.div 
              className="notif-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="notif-drawer__header">
                <h3 className="notif-drawer__title">Notifications</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {unreadCount > 0 && (
                    <button className="notif-drawer__mark-all" onClick={markAllAsRead}>
                      <Check size={14} style={{ marginRight: 4 }} />
                      Mark all read
                    </button>
                  )}
                  <button className="notif-close-btn" onClick={() => setIsOpen(false)}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="notif-tabs">
                {['ALL', 'DEALS', 'CHATS', 'ORDERS'].map(tab => (
                  <button 
                    key={tab}
                    className={`notif-tab ${activeTab === tab ? 'notif-tab--active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0) + tab.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="notif-list">
                {filteredNotifications.length === 0 ? (
                  <div className="notif-empty">
                    <span style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>🔔</span>
                    No notifications yet
                  </div>
                ) : (
                  filteredNotifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={`notif-item ${!notif.read ? 'notif-item--unread' : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="notif-item__icon">
                        {getEmojiForType(notif.type)}
                      </div>
                      <div className="notif-item__body">
                        <span className="notif-item__title">{notif.title}</span>
                        <p className="notif-item__text">{notif.body}</p>
                        <span className="notif-item__time">{formatNotificationTime(notif.createdAt)}</span>
                      </div>
                      {!notif.read && <div className="notif-item__dot" />}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

