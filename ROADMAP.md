# Pairley Roadmap

## Project Name
Pairley

## Vision
Build India's smartest Hyperlocal Commerce Platform that evolves from a traditional Offer Marketplace into an AI-powered Demand Intelligence Marketplace.

The platform is designed in two phases.

---

## Delivery Status

Tracks module-level delivery against [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md). Updated as each module ships.

| Module | Status |
|---|---|
| Group A — Module 1: Identity & Business Onboarding Foundation | 🟡 IN PROGRESS — Database: Completed · Application Code: Ready for Deployment |

---

## PHASE 1 — Pairley 1.0

### Objective
Build a hyperlocal marketplace where local businesses can easily promote offers and nearby customers can discover them. The focus is rapid merchant onboarding and customer acquisition.

### Merchant Features
- Merchant Registration
- OTP Verification
- Merchant Dashboard
- Create Offer
- Edit Offer
- Delete Offer
- Categories
  - BOGO Offers
  - Combo Deals
  - Seasonal Offers
  - Flat Discounts
  - Cashback Offers
- Publish Offer
- Offer Analytics
- WhatsApp Notifications
- Business Profile
- Gallery
- Store Timing
- Location

### Customer Features
- Registration
- Google Login
- Discover Nearby Offers
- Category Search
- Location Filter
- Offer Details
- Show Interest
- Save Offer
- Share Offer
- Notifications
- Profile

### Admin Features
- Merchant Approval
- Offer Moderation
- Categories
- Analytics
- Reports
- Customer Management
- Merchant Management

### Business Flow
Merchant Registers → Publishes Offer → Customer Discovers Offer → Customer Shows Interest → Merchant Receives Notification → Customer Visits Store

### Objective
Acquire: Merchants, Customers, Offers — create marketplace liquidity.

---

## PHASE 2 — Pairley 2.0

### Objective
Transform Pairley into an AI-powered Demand Intelligence Marketplace. Instead of waiting for merchants to publish offers, Pairley discovers offers automatically using AI.

### AI Offer Engine
AI imports public offers from:
- Business Website
- Instagram
- Facebook
- Offer Posters
- PDFs
- Images
- WhatsApp Flyers

AI extracts:
- Business Name
- Offer Title
- Category
- Original Price
- Discount
- Validity
- Images
- Location
- Contact Number

AI converts them into Pairley's standard offer format.

### AI Confidence Score
Every imported offer should have:
- Confidence %
- Needs Review
- Auto Approved
- Pending Merchant Verification

### Customer Demand Engine
Instead of simply viewing offers, customers can express purchase intent. Each offer includes:
- Show Interest
- Preferred Price Selection (within merchant-defined limits)
- Save Offer
- Notify Me

Store: Customer, Location, Preferred Price, Timestamp

### Merchant Demand Notification
When customers show interest, automatically notify the merchant via WhatsApp.

Example:
> Great news! 42 nearby customers have shown interest in your Summer Sale. Claim your FREE Pairley Merchant Account to view customer insights and manage your offers.

### Merchant Claim Flow
Merchant receives WhatsApp → Clicks Claim Business → OTP Verification → Merchant Dashboard → Views interested customers → Accepts or rejects customer demand.

### AI Features
- **AI Offer Import** — Automatically import public offers.
- **AI OCR** — Read posters, banners, brochures.
- **AI Offer Generator** — Convert posters into beautiful Pairley cards.
- **AI Deal Optimizer** — Suggest better headlines, images, pricing, validity.
- **AI Demand Prediction** — Predict best offer price, expected customer demand, peak shopping hours, popular locations.
- **AI Merchant Assistant** — Chatbot for merchants (e.g. "Create Diwali Offer", "Generate BOGO", "Suggest Weekend Offer", "Improve my conversion").
- **AI Customer Assistant** — Recommend nearby offers, personalized deals, trending offers, favorite categories.

### Public Offer Discovery Engine
Automatically discover public offers from:
- Website
- Instagram
- Facebook
- Google Business
- Digital Posters
- Mall Screens
- Public Advertisements
- Retail Catalogues
- Merchant Flyers

Convert into Pairley Standard Offer Cards.

### Pairley Intelligence Layer
Track:
- Interested Customers
- Price Distribution
- Popular Categories
- Conversion Rate
- Merchant Performance
- Trending Offers
- Local Demand
- Shopping Heatmaps

---

## Long-Term Vision

Pairley evolves through four stages:

1. **Marketplace** — Merchants publish offers.
2. **AI Marketplace** — AI imports public offers.
3. **Demand Intelligence** — Customers express intent; businesses receive qualified demand.
4. **Autonomous Commerce** — AI recommends offers, predicts demand, automates campaigns, optimizes pricing, and provides real-time business insights.

---

## UI Theme
Premium SaaS — inspired by Apple, Stripe, Linear, Notion.
- Glassmorphism
- Purple, Green, White
- Responsive
- PWA
- Capacitor Compatible
- Mobile First

---

## Final Goal
Create the most intelligent hyperlocal commerce platform in India where:
- Customers discover the best local offers.
- Merchants attract nearby customers with minimal effort.
- AI continuously imports and enriches public offers.
- Demand insights help businesses make smarter decisions.
- Pairley becomes the bridge between public offers, customer demand, and merchant growth.
