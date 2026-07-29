import { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Calendar, Clock, Send, LocateFixed, Loader2 } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { getItemInteraction, buildSchedulePayload } from '../utils/leadMessageTemplates';
import './LeadChatThread.css';

const SECTION_META = {
  QUICK_ACTIONS: '⚡ Quick Actions',
  SCHEDULE: '📆 Schedule Meeting',
  LOCATION: '📍 Share Location',
  OFFER_STATUS: '📦 Offer Status',
};

/**
 * Deal Coordination Assistant — Module 13 Phase 2b: a guided workflow, not
 * a chat window. There is no text input, no keyboard typing, no
 * send-arbitrary-message affordance anywhere in this component — every
 * message is one of a small set of structured coordination prompts
 * (fetched from GET /leads/message-templates, the same catalog the backend
 * enforces server-side; see leadMessageTemplates.ts).
 *
 * All four sections render stacked and always visible — no tabs to switch,
 * matching "present the conversation as a guided workflow" rather than a
 * messaging app. Quick Actions/Location/Offer Status render as a generic
 * chip row (any future fixed-text template lands here with zero UI change,
 * per the extensibility requirement); Schedule is the one section with
 * dedicated UI — a standing date+time picker, not a click-to-reveal prompt,
 * since it's the one interaction needing structured input beyond a fixed
 * string.
 *
 * Shared by CustomerLeadChatPage and BusinessLeadChatPage. Always
 * anonymous on both sides regardless of unlock state — unlocking reveals
 * contact info on the Leads list, not identity inside this thread.
 */
export default function LeadChatThread({ leadId, viewerRole }) {
  const { showToast } = useToast();
  const chatFeedRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [catalog, setCatalog] = useState([]);
  const [sendingKey, setSendingKey] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const otherPartyLabel = viewerRole === 'CUSTOMER' ? 'Merchant' : 'Customer';

  const fetchMessages = () => {
    if (!leadId) return;
    api.get(`/leads/${leadId}/messages`)
      .then((data) => {
        setMessages(data);
        setLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load chat messages:', err);
        setLoaded(true);
      });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [leadId]);

  // Catalog is static per session — fetched once, not on the 3s poll.
  useEffect(() => {
    api.get('/leads/message-templates')
      .then((data) => setCatalog(data))
      .catch((err) => console.error('Failed to load message templates:', err));
  }, []);

  useEffect(() => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }, [messages]);

  const sendTemplate = (templateKey, payload) => {
    setSendingKey(templateKey);
    api.post(`/leads/${leadId}/messages`, payload ? { templateKey, payload } : { templateKey })
      .then(() => {
        fetchMessages();
        setScheduleDate('');
        setScheduleTime('');
      })
      .catch((err) => {
        console.error('Failed to send message:', err);
        showToast(err.message || 'Failed to send message.', 'error');
      })
      .finally(() => setSendingKey(null));
  };

  const handleItemClick = (item) => {
    if (sendingKey) return;
    switch (getItemInteraction(item)) {
      case 'SEND_IMMEDIATELY':
        sendTemplate(item.key);
        return;
      case 'REQUEST_LIVE_LOCATION':
        if (!navigator.geolocation) {
          showToast('Live location isn’t available on this device.', 'error');
          return;
        }
        setSendingKey(item.key);
        navigator.geolocation.getCurrentPosition(
          (pos) => sendTemplate(item.key, { lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => {
            showToast('Location permission denied.', 'error');
            setSendingKey(null);
          },
          { timeout: 8000 },
        );
        return;
      default:
        // Covers OPEN_SCHEDULE_PICKER (Schedule renders its own dedicated
        // widget below, never as a clickable chip) and any future template
        // type this UI doesn't know how to fill in yet — fail safe rather
        // than send a malformed request.
        showToast('This action needs an app update to use.', 'error');
    }
  };

  const handleSendSchedule = (scheduleItemKey) => {
    const payload = buildSchedulePayload(scheduleDate, scheduleTime);
    if (!payload) return;
    sendTemplate(scheduleItemKey, payload);
  };

  return (
    <div className="lead-chat-thread">
      <div className="lead-chat-thread__banner">
        <ShieldCheck size={13} />
        Anonymous &amp; secure — identities stay private in this chat.
      </div>

      <div ref={chatFeedRef} className="lead-chat-thread__feed">
        {loaded && messages.length === 0 && (
          <div className="lead-chat-thread__empty">
            No messages yet. Pick an action below to start coordinating.
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_role === viewerRole;
          return (
            <div
              key={msg.id}
              className={`lead-chat-thread__row ${isMine ? 'lead-chat-thread__row--mine' : ''}`}
            >
              <div className="lead-chat-thread__bubble-wrap">
                <span className="lead-chat-thread__sender">{isMine ? 'You' : otherPartyLabel}</span>
                <div className="lead-chat-thread__bubble">{msg.text}</div>
                <span className="lead-chat-thread__time">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="lead-chat-thread__panel">
        {catalog.map((section) => {
          const isSchedule = section.category === 'SCHEDULE';
          const scheduleItem = isSchedule ? section.items[0] : null;
          return (
            <div key={section.category} className="lead-chat-thread__section">
              <div className="lead-chat-thread__section-head">
                {SECTION_META[section.category] || section.category}
              </div>

              {isSchedule ? (
                scheduleItem && (
                  <div className="lead-chat-thread__schedule">
                    <div className="lead-chat-thread__schedule-field">
                      <label><Calendar size={12} /> Date</label>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                      />
                    </div>
                    <div className="lead-chat-thread__schedule-field">
                      <label><Clock size={12} /> Time</label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="lead-chat-thread__schedule-send"
                      disabled={!scheduleDate || !scheduleTime || sendingKey === scheduleItem.key}
                      onClick={() => handleSendSchedule(scheduleItem.key)}
                    >
                      <Send size={13} /> Send
                    </button>
                  </div>
                )
              ) : (
                <div className="lead-chat-thread__items">
                  {section.items.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      disabled={sendingKey === item.key}
                      className="lead-chat-thread__item"
                      onClick={() => handleItemClick(item)}
                    >
                      {sendingKey === item.key ? <Loader2 size={13} className="lead-chat-thread__spin" /> : null}
                      {item.key === 'LOCATION_LIVE' ? <LocateFixed size={13} /> : null}
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
