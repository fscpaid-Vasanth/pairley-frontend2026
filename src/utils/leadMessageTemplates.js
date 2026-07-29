// Module 13 Phase 2 — Deal Coordination Assistant. Decides how
// LeadChatThread should react to a catalog item click, kept as a pure
// function so it's testable without a component-rendering harness (this
// repo only has vitest/jsdom, no @testing-library/react).
//
// Every item from GET /leads/message-templates falls into one of three
// interactions today. A template of a genuinely new kind (not fixed text,
// not date+time, not lat/lng) added to the backend catalog in the future
// would come back as 'UNSUPPORTED' here rather than crash — the UI can
// disable it and prompt an app update instead of guessing, which is the
// deliberate defensive fallback for "extensible without redesigning the
// UI" not covering itself with certainty.
export function getItemInteraction(item) {
  if (!item || !item.requiresPayload) return 'SEND_IMMEDIATELY';
  if (item.messageType === 'SCHEDULE') return 'OPEN_SCHEDULE_PICKER';
  if (item.key === 'LOCATION_LIVE') return 'REQUEST_LIVE_LOCATION';
  return 'UNSUPPORTED';
}

// Null when incomplete — callers use this to gate the Send button and to
// know whether a click is ready to submit.
export function buildSchedulePayload(date, time) {
  if (!date || !time) return null;
  return { date, time };
}
