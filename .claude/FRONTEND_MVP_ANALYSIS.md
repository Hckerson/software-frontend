# Frontend MVP 1.5 Strategic Analysis & Implementation Plan

**Date:** 2026-07-07  
**Backend Status:** MVP 1 Complete ✅  
**Frontend Status:** Bare minimum (auth template, login form, button component)  
**Goal:** Build MVP 1.5 frontend to ship transaction-complete real estate marketplace

---

## 📊 Current Frontend State

### What We Have
- **Next.js 16** App Router starter (setup complete)
- **UI Framework**: Radix UI + Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Styling**: Token-first approach with globals.css
- **Core Libraries**: Motion (animations), Zod (validation), etc.

### Existing Components (Minimal)
- `button.tsx` - Base button component
- `auth-template.tsx` - Auth form wrapper
- `input-template.tsx` - Input wrapper
- `login.tsx` - Login form (partial)
- `motion-wrapper.tsx` - Animation wrapper
- `provider.tsx` - Context/provider setup

### Existing Utilities
- `api-client.ts` - Axios instance for API calls
- `api-routes.ts` - API endpoint constants
- `auth-store.ts` - Zustand auth store
- `date-formatter.ts`, `date-parser.ts` - Date utilities
- `local-storage.ts` - Storage helpers
- `auth.ts` - Zod validation schemas
- Enums, types, interfaces already defined

### NOT Built Yet
- All business pages (properties, connections, messages, etc.)
- Navigation/layout
- Forms (property creation, offers, viewings, etc.)
- Tables/lists (properties, my offers, transactions)
- Dashboards (seller, buyer, admin)
- Payment integration (Stripe)
- Real-time features (WebSockets)

---

## 🏗️ Backend MVP 1 API Surface (Ready to Consume)

### Core Endpoints Available

#### **Auth & Users**
```
POST /auth/register
POST /auth/login
POST /auth/reset-password
GET /users/me
GET /users/:id
PATCH /users/me
```

#### **Properties (Listings)**
```
GET /properties (searchable, filterable)
GET /properties/:id
POST /properties (seller)
PATCH /properties/:id (seller)
POST /properties/:id/images (seller)
DELETE /properties/:id (seller)
```

#### **Connections (Interest Management)**
```
POST /connections (buyer: express interest)
GET /connections/my-interests (buyer)
GET /connections/incoming (seller)
PATCH /connections/:id/accept
PATCH /connections/:id/reject
```

#### **Messages (Chat)**
```
POST /messages
GET /messages/connection/:id
GET /messages/unread/count
```

#### **Viewings (Scheduling)**
```
POST /viewings (buyer: propose times)
GET /viewings/connection/:id
PATCH /viewings/:id/confirm (seller: pick time)
```

#### **Offers (Negotiation)**
```
POST /offers (buyer: make offer)
GET /offers/:id
GET /offers/connection/:id
PATCH /offers/:id/respond (seller: accept/reject/counter)
```

#### **Transactions (Payment)**
```
POST /transactions (buyer: initiate)
POST /transactions/:id/confirm-payment (buyer: verify card)
GET /transactions/:id
GET /transactions/my/purchases (buyer)
GET /transactions/my/sales (seller)
```

#### **Reviews**
```
POST /reviews/transaction/:id (buyer: rate seller)
GET /reviews/user/:id
GET /reviews/user/:id/rating
```

---

## 🎯 MVP 1.5 Frontend Scope

### Critical Path (Must Have for Launch)
1. **Authentication Pages**
   - Register (email-based with JWT)
   - Login
   - Password reset
   - Email verification (TODO: backend MVP 1.5)

2. **User Profiles & Verification**
   - My Profile page (view & edit)
   - User public profile (seller info + reviews)
   - Verification status UI (KYC, phone verification — prep for MVP 1.5)

3. **Property Discovery (Buyer Experience)**
   - Browse/search properties with filters
   - Property detail page with images, description, contact seller
   - Seller information card

4. **Express Interest & Connections**
   - Button to express interest on property page
   - My Interests page (buyer: properties I'm interested in)
   - Incoming Interests page (seller: who's interested in my properties)
   - Accept/reject flow with notifications

5. **Real-time Chat (Buyer-Seller)**
   - Messages page (list of active connections)
   - Chat UI (conversation view with message history)
   - Unread message count / badge
   - Send/receive messages

6. **Viewing Requests & Scheduling**
   - Request viewing UI (propose multiple time slots)
   - Viewings list (both buyer & seller perspective)
   - Confirm time UI (seller picks one slot)
   - Calendar integration to visualize times

7. **Offer Management**
   - Make offer form (price, terms, expiration)
   - Offer history (per connection)
   - Counter-offer UI (seller: respond with new price/terms)
   - Accept/reject flow

8. **Payment & Transactions**
   - Transaction initiate (final price summary)
   - Stripe payment collection (card details, billing)
   - Transaction confirmation page
   - Purchase history (buyer)
   - Sales history (seller)

9. **Reviews & Ratings**
   - Leave review form (post-purchase)
   - User rating display (average stars + count)
   - Review aggregation

10. **Navigation & Layout**
    - Header (logo, nav, user menu, notifications)
    - Footer (links, legal)
    - Responsive mobile/desktop
    - Role-based routing (buyer vs seller views)

11. **Seller Dashboard (MVP 1.5 prep)**
    - My Properties page (CRUD for listings)
    - Create/edit property forms
    - Image upload UI
    - Property status tracking

---

## 🚨 MVP 1.5 Backend Features (Frontend Must Account For)

These features are NOT yet built but are on the critical path. Frontend should have **UI placeholders / forms ready**:

1. **User Verification** (backend task)
   - Email verification before transaction
   - Phone verification (Twilio)
   - KYC (upload ID, face verification)
   - **Frontend**: Verification status badge, upload form templates

2. **Escrow Holding** (backend + Stripe Connect)
   - Hold money during inspection
   - Release after inspection passes
   - **Frontend**: Show escrow status on transaction page

3. **Dispute Resolution** (backend)
   - File dispute if transaction fails
   - Submit evidence (messages, photos, docs)
   - Admin mediation
   - **Frontend**: Dispute form, dispute history modal

4. **Admin Moderation** (backend)
   - Flag users/properties/messages
   - Suspend users
   - **Frontend**: Admin dashboard pages (admin-only routes)

5. **Audit Logging** (backend)
   - Automatic logging of all actions
   - **Frontend**: Display audit trail in transaction details (info only)

---

## 📋 Page Hierarchy & Routes

### Public Pages
```
/                          - Home/landing (or redirect to /browse)
/login                     - Login form
/register                  - Registration form
/forgot-password           - Password reset form
/users/:id                 - Public seller profile + reviews
/properties/:id            - Property detail view (public)
```

### Protected (Buyer & Seller)
```
/dashboard                 - Role-based dashboard home
/messages                  - Conversation list + chat
/messages/:connectionId    - Chat thread
/transactions/purchases    - My purchases (buyer)
/transactions/sales        - My sales (seller)
/reviews                   - My reviews / leave review
```

### Buyer-Specific
```
/browse                    - Search & filter properties
/saved-properties          - Favorites (MVP 2)
/my-interests              - Interests in properties
/offers                    - My offers & negotiations
/viewings                  - Scheduled viewings
/profile                   - My profile (edit)
```

### Seller-Specific
```
/dashboard/properties      - My listings
/properties/create         - New property form
/properties/:id/edit       - Edit property
/incoming-interests        - Who's interested
/seller-offers             - Incoming & counter offers
/seller-viewings           - Viewing requests
/profile                   - My profile (seller)
/settings/verification     - Verification status (MVP 1.5)
```

### Admin-Only (MVP 1.5)
```
/admin/dashboard           - Overview: GMV, users, flags
/admin/users               - Suspend/manage users
/admin/properties          - Flag/manage properties
/admin/disputes            - Resolve disputes
/admin/audit-logs          - Transaction audit trail
```

---

## 🗂️ Component Structure to Build

### Core Layouts
```
layouts/
  ├── app-layout.tsx            # Authenticated user wrapper
  ├── auth-layout.tsx           # Public auth pages wrapper
  ├── admin-layout.tsx          # Admin pages wrapper
  └── landing-layout.tsx        # Homepage
```

### Feature Components (Organized by Domain)
```
components/
  ├── auth/
  │   ├── login-form.tsx
  │   ├── register-form.tsx
  │   └── password-reset-form.tsx
  │
  ├── properties/
  │   ├── property-card.tsx      # List/grid view card
  │   ├── property-detail.tsx    # Full detail page
  │   ├── property-form.tsx      # Create/edit form
  │   ├── property-images.tsx    # Image upload & gallery
  │   ├── property-filters.tsx   # Search/filter UI
  │   └── property-list.tsx      # Grid/list view
  │
  ├── connections/
  │   ├── interest-button.tsx    # "Express Interest" button
  │   ├── interest-list.tsx      # Buyer's interests
  │   ├── incoming-interests.tsx # Seller's incoming
  │   └── connection-card.tsx
  │
  ├── messages/
  │   ├── chat-thread.tsx        # Message conversation
  │   ├── message-list.tsx       # Conversation list
  │   ├── message-input.tsx      # Message composer
  │   └── message-item.tsx       # Single message
  │
  ├── viewings/
  │   ├── viewing-request-form.tsx    # Propose times
  │   ├── viewing-list.tsx            # Scheduled viewings
  │   ├── viewing-confirmation.tsx    # Seller picks time
  │   └── calendar-picker.tsx         # Date/time selection
  │
  ├── offers/
  │   ├── offer-form.tsx         # Make offer form
  │   ├── offer-list.tsx         # Offer history
  │   ├── offer-card.tsx         # Single offer display
  │   └── counter-offer-form.tsx # Seller response
  │
  ├── transactions/
  │   ├── payment-form.tsx       # Stripe card collection
  │   ├── transaction-summary.tsx # Price & terms review
  │   ├── transaction-history.tsx # List of purchases/sales
  │   └── transaction-detail.tsx  # Single transaction
  │
  ├── reviews/
  │   ├── review-form.tsx        # Leave review
  │   ├── review-list.tsx        # User's reviews
  │   ├── rating-display.tsx     # Stars + count
  │   └── review-item.tsx        # Single review
  │
  ├── user/
  │   ├── profile-card.tsx       # Public seller profile
  │   ├── profile-edit.tsx       # Edit my profile
  │   ├── verification-status.tsx # Verification badges
  │   └── user-menu.tsx          # Header user dropdown
  │
  ├── dashboard/
  │   ├── buyer-dashboard.tsx    # Buyer homepage
  │   ├── seller-dashboard.tsx   # Seller homepage
  │   └── admin-dashboard.tsx    # Admin overview
  │
  ├── admin/
  │   ├── user-management.tsx
  │   ├── property-moderation.tsx
  │   ├── dispute-resolution.tsx
  │   └── audit-logs.tsx
  │
  └── common/
      ├── navigation.tsx         # Header with nav
      ├── user-nav.tsx          # User menu
      ├── footer.tsx
      ├── search-bar.tsx
      ├── filters-panel.tsx
      ├── loading-spinner.tsx
      ├── empty-state.tsx
      └── error-boundary.tsx
```

---

## 🛠️ Hooks to Create

```
hooks/
  ├── use-auth.ts                # Auth context hook
  ├── use-properties.ts          # Property queries
  ├── use-connections.ts         # Connections (interests)
  ├── use-messages.ts            # Messages & chat
  ├── use-viewings.ts            # Viewings/scheduling
  ├── use-offers.ts              # Offers/negotiation
  ├── use-transactions.ts        # Transactions/payment
  ├── use-reviews.ts             # Reviews/ratings
  ├── use-user.ts                # User profile
  ├── use-notification-count.ts  # Unread messages, etc.
  └── use-role-based-nav.ts      # Route access control
```

---

## 📡 API Hooks Integration Pattern

Using React Query + Zustand for state:

```typescript
// Example pattern (use-properties.ts)
export function useProperties(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => api.getProperties(filters),
  });
}

export function usePropertyCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePropertyDto) => api.createProperty(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
```

---

## 🎨 Design System (Already in Code)

### Token-First Styling
- Color tokens from Tailwind theme
- Spacing/sizing via scale classes (`.pad`, `.gap`, etc.)
- Motion tokens for animations
- No inline responsive chains — use token classes

### Component Patterns
1. One component per file (kebab-case name)
2. Prop-driven variants using CVA or Tailwind `clsx`
3. Composition over inheritance
4. Server Components by default (opt into Client with 'use client')

---

## 🚀 Build Sequence (Recommended)

### Phase 1: Foundation (Week 1)
- [ ] Auth pages (login, register, reset-password)
- [ ] Core layouts (app, auth, landing)
- [ ] Navigation header & footer
- [ ] User profile (view & edit)
- [ ] Role-based routing middleware

### Phase 2: Property Discovery (Week 2)
- [ ] Browse properties (search + filter)
- [ ] Property detail page
- [ ] Seller profile view
- [ ] Express interest button

### Phase 3: Connections & Chat (Week 2-3)
- [ ] My interests / incoming interests pages
- [ ] Messages page (conversation list)
- [ ] Chat thread UI
- [ ] Connection management

### Phase 4: Viewings & Offers (Week 3-4)
- [ ] Viewing request form & scheduling
- [ ] Offers management (make, respond, counter)
- [ ] Offer history display

### Phase 5: Transactions & Payment (Week 4-5)
- [ ] Transaction summary review
- [ ] Stripe payment integration
- [ ] Purchase/sales history
- [ ] Transaction detail page

### Phase 6: Reviews & Dashboards (Week 5-6)
- [ ] Review form & history
- [ ] Seller dashboard
- [ ] Buyer dashboard
- [ ] Admin dashboard (basic)

### Phase 7: Polish & Testing (Week 6-7)
- [ ] Edge cases & error handling
- [ ] Mobile responsiveness
- [ ] Accessibility (a11y)
- [ ] Performance optimization
- [ ] E2E testing

---

## ✅ Success Criteria

### MVP 1.5 Frontend Launch
1. ✅ All 11 critical path features built (✓ above)
2. ✅ Pages match backend API contracts exactly
3. ✅ Auth flow works end-to-end (register → login → protected pages)
4. ✅ Complete transaction flow: search → interest → chat → viewing → offer → payment
5. ✅ Seller can create/edit properties
6. ✅ Buyer can express interest and make offers
7. ✅ Responsive (mobile + desktop tested)
8. ✅ No console errors
9. ✅ TypeScript strict mode (no `any`)
10. ✅ Follows CLAUDE.md architecture & STYLE.md patterns
11. ✅ All forms validate with Zod schemas
12. ✅ Error states handled gracefully
13. ✅ Loading states present
14. ✅ Unread message badges work
15. ✅ Role-based access control enforced

---

## 📝 Implementation Principles

From CLAUDE.md (adapted for frontend):
1. **Read STYLE.md first** — master the design system
2. **Match existing architecture** — preserve patterns
3. **Prefer Next.js native features** — App Router, Server Components
4. **Leverage libraries efficiently** — React Query, Zustand, Zod, CVA
5. **Single source of truth** — config tokens, enum-ified constants
6. **Minimize LOC** — prefer shorter solutions
7. **No new patterns** — stick to established ones
8. **No `any` types** — use strict TypeScript

### Frontend-Specific Rules
- Server Components by default (faster, more secure)
- Client Components only when necessary (interactivity, hooks)
- Use `api-client.ts` for all HTTP calls
- Validate with Zod before sending to backend
- Use Zustand for global auth state
- Use React Query for server state
- Token-first styling (no hardcoded values)
- One prop per line for readability

---

## 🎯 Final Goal

**Complete, production-ready, real estate marketplace frontend that:**
- Enables buyers to find & purchase properties
- Enables sellers to list & sell properties
- Facilitates secure transactions with Stripe
- Provides real-time messaging & scheduling
- Enforces role-based access control
- Scales to thousands of concurrent users
- Ready for MVP 1.5 trust/verification features (stubs in place)

**Target Launch:** 6-7 weeks from start  
**Team Size:** 1-2 frontend engineers  
**Tech Stack:** Next.js + React 19 + Tailwind + TypeScript  
**Platform:** Web (mobile-responsive)
