import { describe, it, expect } from 'vitest';
import { getItemInteraction, buildSchedulePayload } from './leadMessageTemplates';

// Module 13 Phase 2 — Deal Coordination Assistant. getItemInteraction is
// the dispatch table LeadChatThread uses to decide what a catalog-item
// click does; it's the one piece of real logic in that component that's
// worth pinning down without a component-rendering harness.
describe('getItemInteraction', () => {
  it('sends immediately for a fixed (no-payload) template — e.g. every Meeting/Confirmation/fixed-Location item', () => {
    expect(getItemInteraction({ key: 'MEETING_WHEN', requiresPayload: false, messageType: 'STATEMENT' })).toBe(
      'SEND_IMMEDIATELY',
    );
    expect(
      getItemInteraction({ key: 'LOCATION_SHOP_COUNTER', requiresPayload: false, messageType: 'LOCATION' }),
    ).toBe('SEND_IMMEDIATELY');
  });

  it('opens the schedule picker for any SCHEDULE template, regardless of which of the three keys', () => {
    for (const key of ['SCHEDULE_AVAILABLE_ON', 'SCHEDULE_REACH_BY', 'SCHEDULE_MEET_ON']) {
      expect(getItemInteraction({ key, requiresPayload: true, messageType: 'SCHEDULE' })).toBe(
        'OPEN_SCHEDULE_PICKER',
      );
    }
  });

  it('requests live location specifically for LOCATION_LIVE, not any payload-requiring LOCATION item', () => {
    expect(
      getItemInteraction({ key: 'LOCATION_LIVE', requiresPayload: true, messageType: 'LOCATION' }),
    ).toBe('REQUEST_LIVE_LOCATION');
  });

  it('falls back to UNSUPPORTED for a future template type this UI does not yet know how to fill in — fail safe, not a crash', () => {
    expect(
      getItemInteraction({ key: 'PAYMENT_CONFIRMATION', requiresPayload: true, messageType: 'PAYMENT' }),
    ).toBe('UNSUPPORTED');
  });

  it('handles a missing item without throwing', () => {
    expect(getItemInteraction(null)).toBe('SEND_IMMEDIATELY');
    expect(getItemInteraction(undefined)).toBe('SEND_IMMEDIATELY');
  });
});

describe('buildSchedulePayload', () => {
  it('builds a payload once both date and time are present', () => {
    expect(buildSchedulePayload('2026-07-29', '17:30')).toEqual({ date: '2026-07-29', time: '17:30' });
  });

  it('returns null while incomplete — gates the Send button', () => {
    expect(buildSchedulePayload('', '17:30')).toBeNull();
    expect(buildSchedulePayload('2026-07-29', '')).toBeNull();
    expect(buildSchedulePayload('', '')).toBeNull();
    expect(buildSchedulePayload(undefined, undefined)).toBeNull();
  });
});
