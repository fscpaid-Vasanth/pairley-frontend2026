import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  MoreVertical,
  Flag,
  UserX,
  Lock,
  X,
  ChevronLeft,
  CalendarClock,
  Clock,
  Users,
  MapPin,
  Ticket,
  ListChecks,
  Crosshair,
} from 'lucide-react';
import { api } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { getUserLocation, reverseGeocode } from '../utils/geo';
import GroupChatMapPicker from './GroupChatMapPicker';
import './GroupChatThread.css';

// Structured (DATE_TIME/LOCATION/POLL) message cards — small, local to this
// file since they're only ever rendered inside GroupChatThread's feed.
// TEXT is a legacy type only (see LegacyPlaceholder below) — no new
// TEXT message can be created any more, see GroupChatThread's header
// comment and GroupChatService.sendMessage().

const POLL_TEMPLATE_ICONS = {
  DATE: CalendarClock,
  TIME: Clock,
  GROUP_SIZE: Users,
  LOCATION: MapPin,
  REDEMPTION: Ticket,
};

const POLL_TEMPLATE_LABELS = {
  DATE: 'Date',
  TIME: 'Time',
  GROUP_SIZE: 'Group Size',
  LOCATION: 'Location',
  REDEMPTION: 'Redemption',
};

const MIN_POLL_OPTIONS = 2;
const MAX_POLL_OPTIONS = 6;

function DateTimeCard({ msg }) {
  return (
    <div className="group-chat-thread__structured-card">
      <div className="group-chat-thread__structured-card-row">
        <CalendarClock size={14} />
        <span>{msg.text.replace(/^📅\s*/, '')}</span>
      </div>
    </div>
  );
}

function LocationCard({ msg }) {
  const { lat, lng, label } = msg.payload || {};
  return (
    <div className="group-chat-thread__structured-card">
      <div className="group-chat-thread__structured-card-row">
        <MapPin size={14} />
        <span>{label || msg.text.replace(/^📍\s*/, '')}</span>
      </div>
      {lat != null && lng != null && (
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group-chat-thread__structured-card-link"
        >
          Open in Maps →
        </a>
      )}
    </div>
  );
}

// Renders only for a template-based poll (payload.templateId present) —
// a legacy pre-template poll never reaches this component at all, see
// the msg.type === 'POLL' early-return check in the feed map below.
function PollCard({ msg, onVote }) {
  const options = msg.payload?.options || [];
  const tallies = msg.tallies || options.map(() => 0);
  const total = tallies.reduce((a, b) => a + b, 0);
  const myVote = msg.myVote;
  return (
    <div className="group-chat-thread__structured-card">
      <div className="group-chat-thread__structured-card-row">
        <ListChecks size={14} />
        <span>{msg.payload?.question || msg.text.replace(/^📊\s*/, '')}</span>
      </div>
      <div className="group-chat-thread__poll-options">
        {options.map((opt, idx) => {
          const count = tallies[idx] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          const isMyVote = myVote === idx;
          return (
            <button
              type="button"
              key={idx}
              className={`group-chat-thread__poll-option ${isMyVote ? 'group-chat-thread__poll-option--selected' : ''}`}
              onClick={() => onVote(msg.id, idx)}
            >
              <span className="group-chat-thread__poll-option-fill" style={{ width: `${pct}%` }} />
              <span className="group-chat-thread__poll-option-label">{opt}</span>
              <span className="group-chat-thread__poll-option-pct">{pct}%</span>
            </button>
          );
        })}
      </div>
      <span className="group-chat-thread__poll-total">{total} vote{total === 1 ? '' : 's'}</span>
    </div>
  );
}

// A pre-V1 free-text message, or a poll created before the poll-template
// system existed. Real content is never sent to the frontend at all —
// GroupChatService.getMessages() replaces it server-side with a neutral
// placeholder before it ever leaves the backend, since an old message
// could contain a phone number, address, or other personal info.
// Rendered as a neutral, unattributed banner (no sender label, no
// left/right alignment, no report/block menu) — never as a normal chat
// bubble — while still keeping its place in the chronological feed.
function LegacyPlaceholder({ msg }) {
  return (
    <div className="group-chat-thread__legacy-text">{msg.text}</div>
  );
}

/**
 * Anonymous Customer-to-Customer Offer Group Chat — a structured
 * coordination tool only. Every customer who has shown interest in this
 * offer can share a Date & Time, a Location, a Pairley-approved Poll
 * template, or tap a Quick Reply here under a stable "Pairley Member N"
 * identity. The merchant is never a participant; there is no
 * merchant-facing variant of this component.
 *
 * V1 product decision: free-form text messaging is permanently disabled,
 * both here and at the backend (GroupChatService.sendMessage() rejects
 * every call with 403) — this is deliberately not a general social chat,
 * to avoid customers sharing phone numbers, addresses, or other personal
 * info with strangers. Polls carry the same rule: a customer can only
 * pick a Pairley-approved poll template and select from its predefined
 * options (or, for the Location template, share structured locations via
 * the same Current Location/Pick on Map mechanism as a standalone
 * Location message) — never type a custom question or option. This
 * component only ever submits a templateId + optionIds (or location
 * entries), fetched from the server-side catalog, never client-typed
 * text — see groupChatMessageTypes.ts for the server-side enforcement
 * that makes this non-bypassable via direct API calls too.
 *
 * Server-authoritative throughout: this component never decides on its
 * own that the chat is closed — it only reacts to a 403 from a send
 * attempt, since the backend's offer.status/end_date check is the actual
 * source of truth (see GroupChatService.assertOfferOpen()).
 */
export default function GroupChatThread({ offerId }) {
  const { showToast } = useToast();
  const feedRef = useRef(null);

  const [joining, setJoining] = useState(true);
  const [joinError, setJoinError] = useState('');
  const [myMemberId, setMyMemberId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [closed, setClosed] = useState(false);
  const [openMenuFor, setOpenMenuFor] = useState(null); // message id

  // Server-side catalogs only — a customer can tap/select from these,
  // never type free text. Fetched once each; the backend (not these
  // lists) is what actually enforces which ids are valid.
  const [quickReplies, setQuickReplies] = useState([]);
  const [pollTemplates, setPollTemplates] = useState([]);

  // Structured message composer state
  const [activeForm, setActiveForm] = useState(null); // null | 'DATE_TIME' | 'LOCATION' | 'POLL'
  const [structuredSending, setStructuredSending] = useState(false);
  const [dtDate, setDtDate] = useState('');
  const [dtTime, setDtTime] = useState('');
  const [locating, setLocating] = useState(false);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  // Which flow the map picker's result feeds into — a standalone Location
  // share, or one location option inside a Location poll being built.
  const [mapPickerMode, setMapPickerMode] = useState('SHARE'); // 'SHARE' | 'POLL'

  // Poll-builder state — template selection, then either a fixed-option
  // checklist or (Location template only) a repeated location picker.
  const [pollStep, setPollStep] = useState('TEMPLATE'); // 'TEMPLATE' | 'OPTIONS'
  const [selectedPollTemplate, setSelectedPollTemplate] = useState(null);
  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const [pollLocations, setPollLocations] = useState([]);

  const fetchMessages = useCallback(() => {
    if (!offerId) return;
    api.get(`/offers/${offerId}/group/messages`)
      .then((data) => setMessages(data))
      .catch((err) => {
        console.error('Failed to fetch group chat messages:', err);
      });
  }, [offerId]);

  // Join once on mount, then start polling. Joining is idempotent
  // server-side, so this is safe even if the component remounts.
  useEffect(() => {
    if (!offerId) return;
    let cancelled = false;
    setJoining(true);
    setJoinError('');
    api.post(`/offers/${offerId}/group/join`)
      .then((res) => {
        if (cancelled) return;
        setMyMemberId(res?.member?.id || null);
        setJoining(false);
        fetchMessages();
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to join group chat:', err);
        setJoinError(err.message || 'Could not open this group chat.');
        setJoining(false);
      });
    return () => { cancelled = true; };
  }, [offerId, fetchMessages]);

  useEffect(() => {
    if (!offerId) return;
    api.get(`/offers/${offerId}/group/quick-replies`)
      .then((data) => setQuickReplies(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to fetch quick replies:', err));
    api.get(`/offers/${offerId}/group/poll-templates`)
      .then((data) => setPollTemplates(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to fetch poll templates:', err));
  }, [offerId]);

  useEffect(() => {
    if (joining || joinError) return;
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [joining, joinError, fetchMessages]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages]);

  const handleReportMessage = (messageId) => {
    setOpenMenuFor(null);
    api.post(`/offers/${offerId}/group/messages/${messageId}/report`, {})
      .then(() => showToast('Message reported. Thanks for flagging it.', 'success'))
      .catch((err) => showToast(err.message || 'Failed to report message.', 'error'));
  };

  const handleBlockMember = (memberId) => {
    setOpenMenuFor(null);
    api.post(`/offers/${offerId}/group/members/${memberId}/block`)
      .then(() => {
        showToast('Member blocked — you will no longer see their messages.', 'success');
        fetchMessages();
      })
      .catch((err) => showToast(err.message || 'Failed to block member.', 'error'));
  };

  const resetPollBuilder = () => {
    setPollStep('TEMPLATE');
    setSelectedPollTemplate(null);
    setSelectedOptionIds([]);
    setPollLocations([]);
  };

  const sendStructured = (type, payload) => {
    setStructuredSending(true);
    return api.post(`/offers/${offerId}/group/messages/structured`, { type, payload })
      .then(() => {
        fetchMessages();
        setActiveForm(null);
        setDtDate('');
        setDtTime('');
        resetPollBuilder();
      })
      .catch((err) => {
        console.error('Failed to send structured group chat message:', err);
        if (err.status === 403) {
          setClosed(true);
        } else {
          showToast(err.message || 'Failed to send message.', 'error');
        }
      })
      .finally(() => setStructuredSending(false));
  };

  const handleQuickReply = (replyId) => {
    sendStructured('QUICK_REPLY', { replyId });
  };

  const handleVote = (messageId, optionIndex) => {
    api.post(`/offers/${offerId}/group/messages/${messageId}/vote`, { optionIndex })
      .then(fetchMessages)
      .catch((err) => showToast(err.message || 'Failed to vote.', 'error'));
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      const { lat, lng } = await getUserLocation();
      const geo = await reverseGeocode(lat, lng);
      await sendStructured('LOCATION', {
        lat,
        lng,
        label: geo.formattedAddress || 'My location',
        source: 'CURRENT',
      });
    } catch (err) {
      showToast(err.message || 'Could not get your location.', 'error');
    } finally {
      setLocating(false);
    }
  };

  const addPollLocation = (payload) => {
    setPollLocations((prev) => (prev.length < MAX_POLL_OPTIONS ? [...prev, payload] : prev));
  };

  const handleAddPollLocationCurrent = async () => {
    setLocating(true);
    try {
      const { lat, lng } = await getUserLocation();
      const geo = await reverseGeocode(lat, lng);
      addPollLocation({
        lat,
        lng,
        label: geo.formattedAddress || 'My location',
        source: 'CURRENT',
      });
    } catch (err) {
      showToast(err.message || 'Could not get your location.', 'error');
    } finally {
      setLocating(false);
    }
  };

  const removePollLocation = (idx) => {
    setPollLocations((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMapConfirm = (payload) => {
    setMapPickerOpen(false);
    if (mapPickerMode === 'POLL') {
      addPollLocation(payload);
    } else {
      sendStructured('LOCATION', payload);
    }
  };

  const handleSelectPollTemplate = (template) => {
    setSelectedPollTemplate(template);
    setSelectedOptionIds([]);
    setPollLocations([]);
    setPollStep('OPTIONS');
  };

  const toggleOptionId = (optionId) => {
    setSelectedOptionIds((prev) => {
      if (prev.includes(optionId)) return prev.filter((id) => id !== optionId);
      if (prev.length >= MAX_POLL_OPTIONS) return prev;
      return [...prev, optionId];
    });
  };

  const handleCreatePoll = () => {
    if (!selectedPollTemplate) return;
    if (selectedPollTemplate.id === 'LOCATION') {
      if (pollLocations.length < MIN_POLL_OPTIONS) return;
      sendStructured('POLL', { templateId: 'LOCATION', options: pollLocations });
    } else {
      if (selectedOptionIds.length < MIN_POLL_OPTIONS) return;
      sendStructured('POLL', { templateId: selectedPollTemplate.id, optionIds: selectedOptionIds });
    }
  };

  const closeActionForm = () => {
    setActiveForm(null);
    resetPollBuilder();
  };

  const openPollForm = () => {
    resetPollBuilder();
    setActiveForm('POLL');
  };

  if (joining) {
    return (
      <div className="group-chat-thread group-chat-thread--centered">
        <div className="group-chat-thread__spinner" />
      </div>
    );
  }

  if (joinError) {
    return (
      <div className="group-chat-thread group-chat-thread--centered">
        <p className="group-chat-thread__join-error">{joinError}</p>
      </div>
    );
  }

  return (
    <div className="group-chat-thread">
      <div className="group-chat-thread__banner">
        <ShieldCheck size={13} />
        Your identity and contact details are hidden from other members.
      </div>

      <div ref={feedRef} className="group-chat-thread__feed">
        {messages.length === 0 && (
          <div className="group-chat-thread__empty">
            No activity yet. Share a date &amp; time, a location, or a poll below.
          </div>
        )}
        {messages.map((msg) => {
          if (msg.is_system) {
            return (
              <div key={msg.id} className="group-chat-thread__system">
                {msg.text}
              </div>
            );
          }
          if (msg.type === 'TEXT' || (msg.type === 'POLL' && !msg.payload?.templateId)) {
            return <LegacyPlaceholder key={msg.id} msg={msg} />;
          }
          const isMine = typeof msg.isMine === 'boolean' ? msg.isMine : msg.member_id === myMemberId;
          return (
            <div
              key={msg.id}
              className={`group-chat-thread__row ${isMine ? 'group-chat-thread__row--mine' : ''}`}
            >
              <div className="group-chat-thread__bubble-wrap">
                <span className="group-chat-thread__sender">
                  {isMine ? 'You' : `Pairley Member ${msg.member_number}`}
                </span>
                <div className="group-chat-thread__bubble-row">
                  <div className="group-chat-thread__bubble">
                    {msg.type === 'DATE_TIME' ? (
                      <DateTimeCard msg={msg} />
                    ) : msg.type === 'LOCATION' ? (
                      <LocationCard msg={msg} />
                    ) : msg.type === 'POLL' ? (
                      <PollCard msg={msg} onVote={handleVote} />
                    ) : (
                      msg.text
                    )}
                  </div>
                  {!isMine && (
                    <div className="group-chat-thread__menu-wrap">
                      <button
                        type="button"
                        className="group-chat-thread__menu-btn"
                        onClick={() => setOpenMenuFor(openMenuFor === msg.id ? null : msg.id)}
                        aria-label="Message options"
                      >
                        <MoreVertical size={14} />
                      </button>
                      {openMenuFor === msg.id && (
                        <div className="group-chat-thread__menu">
                          <button type="button" onClick={() => handleReportMessage(msg.id)}>
                            <Flag size={12} /> Report message
                          </button>
                          <button type="button" onClick={() => handleBlockMember(msg.member_id)}>
                            <UserX size={12} /> Block this member
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span className="group-chat-thread__time">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {closed ? (
        <div className="group-chat-thread__closed">
          <Lock size={13} />
          This offer has ended. The conversation is no longer active.
        </div>
      ) : activeForm ? (
        <div className="group-chat-thread__structured-form">
          {activeForm === 'DATE_TIME' && (
            <>
              <div className="group-chat-thread__structured-form-header">
                <span><CalendarClock size={14} /> Share date & time</span>
                <button type="button" onClick={closeActionForm} aria-label="Cancel"><X size={14} /></button>
              </div>
              <div className="group-chat-thread__structured-form-row">
                <input type="date" value={dtDate} onChange={(e) => setDtDate(e.target.value)} />
                <input type="time" value={dtTime} onChange={(e) => setDtTime(e.target.value)} />
              </div>
              <button
                type="button"
                className="group-chat-thread__structured-form-submit"
                disabled={!dtDate || !dtTime || structuredSending}
                onClick={() => sendStructured('DATE_TIME', { date: dtDate, time: dtTime })}
              >
                Share
              </button>
            </>
          )}

          {activeForm === 'LOCATION' && (
            <>
              <div className="group-chat-thread__structured-form-header">
                <span><MapPin size={14} /> Share location</span>
                <button type="button" onClick={closeActionForm} aria-label="Cancel"><X size={14} /></button>
              </div>
              <div className="group-chat-thread__structured-form-actions">
                <button type="button" onClick={handleUseCurrentLocation} disabled={locating || structuredSending}>
                  <Crosshair size={14} /> {locating ? 'Locating…' : 'Use Current Location'}
                </button>
                <button
                  type="button"
                  onClick={() => { setMapPickerMode('SHARE'); setMapPickerOpen(true); }}
                  disabled={structuredSending}
                >
                  <MapPin size={14} /> Pick on Map
                </button>
              </div>
              <p className="group-chat-thread__structured-form-hint">
                Your location is only shared when you choose it here — never automatically.
              </p>
            </>
          )}

          {activeForm === 'POLL' && pollStep === 'TEMPLATE' && (
            <>
              <div className="group-chat-thread__structured-form-header">
                <span><ListChecks size={14} /> Create a poll</span>
                <button type="button" onClick={closeActionForm} aria-label="Cancel"><X size={14} /></button>
              </div>
              <p className="group-chat-thread__structured-form-hint">
                What would you like to decide?
              </p>
              <div className="group-chat-thread__poll-template-grid">
                {pollTemplates.map((t) => {
                  const Icon = POLL_TEMPLATE_ICONS[t.id] || ListChecks;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className="group-chat-thread__poll-template-btn"
                      onClick={() => handleSelectPollTemplate(t)}
                    >
                      <Icon size={18} />
                      {POLL_TEMPLATE_LABELS[t.id] || t.id}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {activeForm === 'POLL' && pollStep === 'OPTIONS' && selectedPollTemplate?.id !== 'LOCATION' && (
            <>
              <div className="group-chat-thread__structured-form-header">
                <span>
                  <button
                    type="button"
                    className="group-chat-thread__poll-back-btn"
                    onClick={() => setPollStep('TEMPLATE')}
                    aria-label="Back to templates"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {selectedPollTemplate.question}
                </span>
                <button type="button" onClick={closeActionForm} aria-label="Cancel"><X size={14} /></button>
              </div>
              <div className="group-chat-thread__poll-option-checklist">
                {(selectedPollTemplate.options || []).map((opt) => {
                  const checked = selectedOptionIds.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      className={`group-chat-thread__poll-checklist-item ${checked ? 'group-chat-thread__poll-checklist-item--checked' : ''}`}
                      onClick={() => toggleOptionId(opt.id)}
                    >
                      <span className="group-chat-thread__poll-checklist-box">{checked ? '☑' : '☐'}</span>
                      {opt.text}
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className="group-chat-thread__structured-form-submit"
                disabled={selectedOptionIds.length < MIN_POLL_OPTIONS || structuredSending}
                onClick={handleCreatePoll}
              >
                Create Poll
              </button>
            </>
          )}

          {activeForm === 'POLL' && pollStep === 'OPTIONS' && selectedPollTemplate?.id === 'LOCATION' && (
            <>
              <div className="group-chat-thread__structured-form-header">
                <span>
                  <button
                    type="button"
                    className="group-chat-thread__poll-back-btn"
                    onClick={() => setPollStep('TEMPLATE')}
                    aria-label="Back to templates"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <MapPin size={14} /> {selectedPollTemplate.question}
                </span>
                <button type="button" onClick={closeActionForm} aria-label="Cancel"><X size={14} /></button>
              </div>
              {pollLocations.length > 0 && (
                <div className="group-chat-thread__poll-location-list">
                  {pollLocations.map((loc, idx) => (
                    <div key={idx} className="group-chat-thread__poll-location-item">
                      <span>{loc.label}</span>
                      <button type="button" onClick={() => removePollLocation(idx)} aria-label="Remove location">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {pollLocations.length < MAX_POLL_OPTIONS && (
                <div className="group-chat-thread__structured-form-actions">
                  <button type="button" onClick={handleAddPollLocationCurrent} disabled={locating || structuredSending}>
                    <Crosshair size={14} /> {locating ? 'Locating…' : 'Use Current Location'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMapPickerMode('POLL'); setMapPickerOpen(true); }}
                    disabled={structuredSending}
                  >
                    <MapPin size={14} /> Pick on Map
                  </button>
                </div>
              )}
              <button
                type="button"
                className="group-chat-thread__structured-form-submit"
                disabled={pollLocations.length < MIN_POLL_OPTIONS || structuredSending}
                onClick={handleCreatePoll}
              >
                Create Poll
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="group-chat-thread__share-row">
          <span className="group-chat-thread__share-label">Share with the group</span>
          <div className="group-chat-thread__share-actions">
            <button type="button" onClick={() => setActiveForm('DATE_TIME')}>
              <CalendarClock size={16} /> Date & Time
            </button>
            <button type="button" onClick={() => { setMapPickerMode('SHARE'); setActiveForm('LOCATION'); }}>
              <MapPin size={16} /> Location
            </button>
            <button type="button" onClick={openPollForm}>
              <ListChecks size={16} /> Poll
            </button>
          </div>

          {quickReplies.length > 0 && (
            <>
              <span className="group-chat-thread__share-label group-chat-thread__share-label--replies">
                💬 Quick Replies
              </span>
              <div className="group-chat-thread__quick-replies">
                {quickReplies.map((qr) => (
                  <button
                    key={qr.id}
                    type="button"
                    className="group-chat-thread__quick-reply"
                    disabled={structuredSending}
                    onClick={() => handleQuickReply(qr.id)}
                  >
                    {qr.text}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {mapPickerOpen && (
        <GroupChatMapPicker onConfirm={handleMapConfirm} onCancel={() => setMapPickerOpen(false)} />
      )}
    </div>
  );
}
