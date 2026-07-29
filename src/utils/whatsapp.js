// Shared WhatsApp deep-link helper for the merchant's own, explicit outreach
// (LeadsPage's "Contact" button) — a merchant-initiated channel, not the
// primary customer interaction path. Module 13 removed the automatic
// customer-side wa.me redirect this file used to also power (Show
// Interest used to open WhatsApp immediately; it no longer does — see
// InterestButton.jsx and the anonymous in-app lead chat). This file's
// generic deal-share links (ShareCard.jsx etc.) are a separate concern and
// live elsewhere.

function cleanMobile(mobile) {
  return (mobile || '').replace(/\D/g, '').slice(-10);
}

export function buildWaLink(mobile, message) {
  return `https://wa.me/91${cleanMobile(mobile)}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(mobile, message) {
  window.open(buildWaLink(mobile, message), '_blank');
}

// Sent from the merchant's Leads page, independent of when the lead first
// came in.
export function buildContactLeadMessage({ customerName, offerName, shopName }) {
  return `Hi ${customerName || 'there'}, this is ${shopName} on Pairley \u{1F44B}

You showed interest in our offer: "${offerName}".

We'd love to help you with your booking! Let us know if you have any questions.

Thank you,
*${shopName}*`;
}
