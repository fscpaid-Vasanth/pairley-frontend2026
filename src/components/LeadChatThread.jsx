import { useState, useEffect, useRef } from 'react';
import { Send, ShieldCheck } from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import './LeadChatThread.css';

/**
 * Module 13 — the anonymous 1:1 chat between a customer and a merchant for
 * one Lead. Shared by CustomerLeadChatPage and BusinessLeadChatPage since
 * the two sides are otherwise identical: free text, polled every 3s (same
 * cadence as the legacy CustomerDealChatPage), backed by
 * GET/POST /leads/:id/messages.
 *
 * Deliberately always anonymous on both sides, regardless of the merchant's
 * "Unlock Customer Details" state — unlocking reveals contact info on the
 * Leads list, not identity inside this thread. `viewerRole` only decides
 * "You" vs the generic label for the other party; no names are ever shown
 * here.
 */
export default function LeadChatThread({ leadId, viewerRole }) {
  const { showToast } = useToast();
  const chatFeedRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);

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

  useEffect(() => {
    if (chatFeedRef.current) {
      chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    api.post(`/leads/${leadId}/messages`, { text: trimmed })
      .then(() => {
        setText('');
        fetchMessages();
      })
      .catch((err) => {
        console.error('Failed to send message:', err);
        showToast(err.message || 'Failed to send message.', 'error');
      })
      .finally(() => setSending(false));
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
            No messages yet. Say hello to get the conversation started.
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

      <form onSubmit={handleSend} className="lead-chat-thread__composer">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message the ${otherPartyLabel.toLowerCase()}...`}
          className="lead-chat-thread__input"
          maxLength={1000}
        />
        <button
          type="submit"
          className="lead-chat-thread__send-btn"
          disabled={sending || !text.trim()}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
