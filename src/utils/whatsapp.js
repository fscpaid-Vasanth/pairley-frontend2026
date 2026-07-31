// Shared WhatsApp deep-link helper. Originally scoped to the merchant's own
// outreach (LeadsPage's "Contact" button) after Module 13 removed the
// automatic customer-side wa.me redirect Show Interest used to trigger.
// Bulk-import revision reintroduces a customer-facing use: once a customer
// has shown interest and is entitled to contact details (see
// offerVisibility.ts), InterestButton.jsx links out to the merchant's
// WhatsApp using buildWaLink + buildCustomerInquiryMessage below, same
// helper, opposite direction. This file's generic deal-share links
// (ShareCard.jsx etc.) are a separate concern and live elsewhere.

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

// Sent from the customer's side, once they're entitled to contact details
// (see offerVisibility.ts — expressed interest + an entitled business) —
// the opening message on the merchant's WhatsApp when they tap "WhatsApp"
// in InterestButton.jsx's contact-reveal card.
export function buildCustomerInquiryMessage({ offerName, shopName }) {
  return `Hi ${shopName || 'there'}, I found your offer "${offerName}" on Pairley and I'm interested. Could you share more details?`;
}
