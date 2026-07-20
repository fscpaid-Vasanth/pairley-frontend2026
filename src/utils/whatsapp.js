// Shared WhatsApp deep-link helpers — previously duplicated inline in
// InterestButton.jsx (with its own digit-cleaning) and hand-rolled
// differently again in DealDetailPage.jsx/ShareCard.jsx's unrelated
// "share a deal" links. This file only covers the customer<->merchant
// contact use case (Show Interest notification, "Contact Lead"); the
// generic deal-share links stay as they are, a different concern.

function cleanMobile(mobile) {
  return (mobile || '').replace(/\D/g, '').slice(-10);
}

export function buildWaLink(mobile, message) {
  return `https://wa.me/91${cleanMobile(mobile)}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(mobile, message) {
  window.open(buildWaLink(mobile, message), '_blank');
}

// Opens one link per mobile, staggered — browsers commonly block multiple
// window.open() popups fired synchronously from a single user action.
export function openWhatsAppMultiple(mobiles, message) {
  (mobiles || []).forEach((mobile, index) => {
    if (index === 0) {
      openWhatsApp(mobile, message);
    } else {
      setTimeout(() => openWhatsApp(mobile, message), index * 1000);
    }
  });
}

// Sent from the customer's browser to the merchant at the moment they show
// interest (InterestButton.jsx) — a best-effort nicety, not the merchant's
// only signal now that Module 5 also sends a server-side notification.
export function buildNewLeadMessage({ offerName, shopName, customerName, customerMobile }) {
  return `\u{1F525} New Customer Interest on Pairley

\u{1F4CC} Offer: ${offerName}
\u{1F3EA} Shop: ${shopName}

\u{1F464} Customer Name: ${customerName}
\u{1F4DE} Mobile Number: ${customerMobile}

The customer has shown interest in this offer.

Please contact the customer to confirm availability and complete the booking.

Thank you,
*Pairley*`;
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
