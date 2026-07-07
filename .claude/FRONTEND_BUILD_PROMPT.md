# 🚀 FRONTEND MVP 1.5 BUILD PROMPT

## Context: What You're Building

You're building the **frontend for a real estate transaction marketplace** that will ship with MVP 1.5 (trust + transactions). The backend API is **complete and production-ready** with 45+ endpoints across 8 modules (auth, properties, connections, messages, viewings, offers, transactions, reviews).

**Your job:** Build the UI/UX that turns those APIs into a seamless buyer-seller experience.

---

## 🎯 Your Mission (Read This First)

Build a **production-ready, fully-functional real estate marketplace frontend** that:

1. ✅ Enables buyers to **search, filter, and express interest** in properties
2. ✅ Enables sellers to **create, edit, and manage listings**
3. ✅ Facilitates **real-time chat** between buyer and seller
4. ✅ Handles **viewing requests** with calendar scheduling
5. ✅ Manages **offer negotiation** (make/counter/accept/reject)
6. ✅ **Collects payment** via Stripe and confirms transactions
7. ✅ Allows **post-purchase reviews** and seller ratings
8. ✅ Provides **role-based dashboards** (buyer, seller, admin)
9. ✅ **Enforces JWT auth** and protects routes by role
10. ✅ Works **beautifully on mobile & desktop**

**Not included in MVP 1.5 (but architecture-ready for):**
- WebSocket real-time (polling OK for now)
- Email verification (form placeholders ready)
- KYC/identity verification (form placeholders ready)
- Escrow system (UI stubs for status display)

---

## 📊 What You Have to Work With

### Backend API (Complete)
- **Base URL:** `http://localhost:3000` (dev)
- **Auth:** JWT token in `Authorization: Bearer <token>` header
- **Response Format:** `{ status, data, message }`
- **45+ endpoints** across 8 modules ready to consume

**Full API docs:** See `FRONTEND_MVP_ANALYSIS.md` in `.claude/` (all endpoints listed)

### Frontend Tech Stack (Already Set Up)
- **Framework:** Next.js 16 (App Router)
- **UI:** Radix UI + Tailwind CSS + CVA
- **State:** Zustand (auth) + React Query (server state)
- **Validation:** Zod
- **HTTP:** Axios (configured in `api-client.ts`)
- **Animation:** Motion
- **Dates:** date-fns
- **Icons:** Lucide React

### Existing Utilities (Leverage These!)
```typescript
// lib/api-client.ts — Configured Axios instance
// lib/api-routes.ts — All endpoint constants (ADD THESE AS YOU BUILD)
// lib/auth-store.ts — Zustand auth store (token, user, logout)
// lib/validations/auth.ts — Zod schemas (EXPAND FOR OTHER FORMS)
// lib/types/types.ts — Shared TypeScript types (ADD ZONED TYPES FOR ENTITIES)
// lib/utils/local-storage.ts — Persist auth token
// lib/utils/date-formatter.ts — Format dates like backend expects
```

### Design System (Token-First)
```css
/* From styles/globals.css — use these, never hardcode */
.base-text, .pad, .gap, .smooth, .rounded
/* Colors: from Tailwind theme (e.g., bg-blue-500, text-gray-700) */
/* Spacing: Tailwind scale (e.g., p-4, gap-6, mb-8) */
/* Animation: motion.ts durations (e.g., 0.3s ease-out) */
```

---

## 🗺️ Recommended Build Sequence

### Week 1: Auth & Navigation (Foundation)
**Goal:** User can register, login, navigate by role

1. **Auth Pages** (30 min each)
   - Register form (`/register`)
   - Login form (`/login`)
   - Password reset form (`/forgot-password`)
   - Form validation with Zod
   - JWT token → Zustand auth store → localStorage

2. **Layouts** (1 hour)
   - `app-layout.tsx` — For authenticated users (header, sidebar, footer)
   - `auth-layout.tsx` — For public pages (centered, minimal)
   - `landing-layout.tsx` — For homepage (hero, nav, footer)
   - Middleware for route protection (`middleware.ts`)

3. **Navigation** (1.5 hours)
   - Header component (logo, search, nav, user menu, notifications)
   - User menu dropdown (profile, settings, logout)
   - Role-based nav (buyer sees "My Interests", seller sees "My Properties")
   - Mobile responsive navigation

4. **Role-Based Access** (1 hour)
   - Middleware to check JWT token
   - Redirect unauthenticated users to `/login`
   - Redirect buyers away from `/seller/*` routes
   - Redirect sellers away from `/buyer/*` routes

---

### Week 2: Property Discovery (Buyer Experience)
**Goal:** Buyers can search, filter, view properties, express interest

1. **Browse Properties Page** (`/browse`) (2 hours)
   - Grid/list toggle view
   - Search bar (location, keyword)
   - Filters panel: price range, bedrooms, bathrooms, property type
   - Infinite scroll or pagination
   - Property cards with image, price, location, beds/baths

2. **Property Detail Page** (`/properties/:id`) (2 hours)
   - Full image gallery (swiper for carousel)
   - Property info: title, description, amenities, features, status
   - Seller info card (name, avatar, rating, reviews count)
   - "Express Interest" button (creates Connection on backend)
   - Estimated price breakdown or quick mortgage calc (MVP 2)

3. **Express Interest Flow** (30 min)
   - Button on property page
   - POST `/connections` when clicked
   - Success notification
   - Disable if already interested or property sold

4. **Seller Profile Page** (`/users/:id`) (1 hour)
   - Seller's name, avatar, bio, phone
   - Average rating + number of reviews
   - List of reviews (comments + 5-star rating)
   - All properties they've sold (status = SOLD)
   - Responsive time & response rate (MVP 2 prep)

---

### Week 3: Connections & Chat (Engagement)
**Goal:** Buyer & seller can chat about properties in real-time

1. **My Interests Page** (`/my-interests` | buyer-only) (1 hour)
   - List of properties buyer expressed interest in
   - Status: PENDING (awaiting seller), ACCEPTED, REJECTED
   - Filter by status
   - Click to view details or message

2. **Incoming Interests Page** (`/incoming-interests` | seller-only) (1 hour)
   - List of buyers interested in seller's properties
   - Property name + buyer info card
   - Accept/Reject buttons
   - Reply with message

3. **Messages Page** (`/messages`) (1.5 hours)
   - Conversation list (one per Connection)
   - Shows: buyer name, property name, last message preview, unread count
   - Search & filter conversations
   - Click to open chat thread

4. **Chat Thread** (`/messages/:connectionId`) (2 hours)
   - Message history (paginated, load older)
   - Message bubbles (distinguish sender/receiver)
   - Message input + send button
   - Auto-scroll to latest
   - Real-time update (poll backend every 2s for now, WebSocket in MVP 2)
   - Show typing indicators (MVP 2)
   - Mark as read automatically when viewing

5. **Message Notifications** (1 hour)
   - Unread count badge on nav
   - GET `/messages/unread/count` on dashboard load
   - Invalidate count when sending/receiving

---

### Week 4: Viewing Requests & Scheduling
**Goal:** Buyer requests viewings, seller schedules times

1. **Request Viewing Form** (1 hour)
   - Available on property page when Connection is ACCEPTED
   - Date/time picker (propose 3-5 time slots)
   - Each slot shows date + time range
   - Submit creates Viewing record

2. **Viewings List** (Buyer) (`/viewings`) (1 hour)
   - Requested viewings for properties buyer is interested in
   - Status: PENDING, CONFIRMED, COMPLETED, CANCELLED
   - Shows proposed times + seller's confirmed time
   - Cancel if PENDING

3. **Viewing Requests** (Seller) (`/seller-viewings`) (1 hour)
   - Incoming viewing requests for seller's properties
   - Property name + buyer name + proposed times
   - Pick one time, confirm (PATCH `/viewings/:id/confirm`)
   - Show as CONFIRMED to both parties

4. **Calendar Integration** (1 hour)
   - Small calendar widget for date picker
   - Show available times (no time slot conflicts)
   - Highlight already-confirmed viewings

---

### Week 5: Offers & Negotiation
**Goal:** Buyer makes offers, seller negotiates or accepts

1. **Make Offer Form** (1 hour)
   - Available after Connection ACCEPTED
   - Price field (default to property listing price)
   - Terms field (text: e.g., "as-is", "contingent on inspection")
   - Expiration date picker (default 7 days)
   - Submit POST `/offers`

2. **Offers History** (`/offers`) (1.5 hours)
   - Per-connection offer list
   - Show: offered price, status, seller's response
   - Status: PENDING (awaiting seller), ACCEPTED, REJECTED, COUNTERED
   - If COUNTERED: show seller's counter price + terms
   - Filter by status

3. **Counter-Offer Response** (Seller) (1 hour)
   - On incoming offer, seller sees form
   - Options: ACCEPT, REJECT, COUNTER
   - If COUNTER: seller enters new price + feedback
   - PATCH `/offers/:id/respond`

4. **Offer Timeline** (1 hour)
   - Visual timeline of back-and-forth counter offers
   - Each offer card shows: who, price, terms, timestamp
   - Highlight current active offer (not yet responded)

---

### Week 6: Payment & Transactions
**Goal:** Buyer pays via Stripe, transaction completes

1. **Transaction Initiate** (1 hour)
   - After offer ACCEPTED by seller
   - Summary page: property, final price, terms
   - "Proceed to Payment" button → POST `/transactions`
   - Response includes Stripe clientSecret

2. **Stripe Payment Form** (2 hours)
   - Stripe Elements or Stripe Payment Element
   - Collect: card number, expiry, CVC, billing zip
   - Handle 3DS/SCA if needed
   - Error messages (card declined, etc.)
   - Success → POST `/transactions/:id/confirm-payment`

3. **Transaction Confirmation** (1 hour)
   - Show success message
   - Display: property purchased, final price, purchase date
   - "View Agreement PDF" link (sent via email by backend)
   - Redirect to purchases history

4. **Purchase History** (`/transactions/purchases` | buyer) (1 hour)
   - List all completed transactions (COMPLETED status)
   - Shows: property, purchase date, final price, seller
   - Click to view agreement PDF
   - "Leave Review" button (only if COMPLETED)

5. **Sales History** (`/transactions/sales` | seller) (1 hour)
   - List all completed sales
   - Shows: property, buyer, sale date, final price
   - View transaction details
   - View buyer's review (if left)

---

### Week 7: Reviews & Dashboards
**Goal:** Post-purchase ratings, role dashboards

1. **Leave Review Form** (1 hour)
   - After transaction COMPLETED
   - 5-star rating picker
   - Optional comment/feedback
   - Submit POST `/reviews/transaction/:id`

2. **Reviews Display** (1 hour)
   - Seller's average rating (stars) + count
   - List of all reviews for a user
   - Show: reviewer name, rating, comment, date

3. **Buyer Dashboard** (`/dashboard` | buyer) (1.5 hours)
   - Welcome message
   - Quick stats: properties saved (MVP 2), active interests, pending viewings
   - Recent searches (MVP 2)
   - Shortcuts to: browse, my interests, messages, purchases
   - Alerts: pending viewings, new messages

4. **Seller Dashboard** (`/dashboard` | seller) (1.5 hours)
   - Welcome message
   - Quick stats: total listings, active listings, pending offers, sales
   - My properties (CRUD table)
   - Create property button
   - Incoming interests widget
   - Pending viewings widget

5. **Admin Dashboard** (`/admin/dashboard`) (2 hours)
   - Overview: total GMV, total users, total transactions, chargeback rate
   - Recent transactions
   - New user signups
   - Quick links to: user management, property moderation, disputes

---

### Week 8: Polish & Launch
**Goal:** Bug fixes, mobile, accessibility, testing

1. **Responsive Design** (3 hours)
   - Test all pages on mobile (iPhone 12, iPad, desktop)
   - Fix layout, touch targets, navigation on small screens
   - Sidebar collapses to hamburger menu
   - Forms stack vertically

2. **Error Handling** (2 hours)
   - Network errors (offline, 500)
   - Form validation errors (Zod)
   - API errors (401 Unauthorized, 403 Forbidden, 404 Not Found)
   - User-friendly error messages
   - Retry buttons where appropriate

3. **Loading States** (2 hours)
   - Skeletons or spinners for async operations
   - Disabled buttons during submission
   - Loading indicators on pages (lazy routes)

4. **Accessibility** (2 hours)
   - Keyboard navigation (Tab, Enter, Escape)
   - Color contrast ratios
   - ARIA labels on buttons/inputs
   - Focus management in modals

5. **Performance** (1 hour)
   - Image optimization (Next.js Image component)
   - Code splitting (lazy load heavy pages)
   - Memoization of expensive components

6. **Testing** (2 hours)
   - Manual E2E: register → login → search → interest → chat → offer → payment
   - Test on multiple browsers (Chrome, Safari, Firefox)
   - Edge cases: network errors, form validation, role access

---

## 🛠️ Development Workflow

### Before You Write Code
1. Read `CLAUDE.md` in `.claude/` (architecture rules)
2. Read `STYLE.md` if it exists (design tokens & patterns)
3. Check `lib/api-routes.ts` for endpoint constants
4. Check existing types in `lib/types/types.ts`

### As You Build
1. **One component per file** — kebab-case name matching export
2. **Use absolute imports** — `@/components/...` never `../../../`
3. **Server-first** — use Server Components by default
4. **Client markers sparingly** — only `'use client'` when needed (forms, hooks)
5. **Validate with Zod** — define schemas in `lib/validations/`
6. **Query with React Query** — see `lib/hooks/use-auth.ts` pattern
7. **Type everything** — no `any`, use Zod `.infer`
8. **Token-first styling** — Tailwind tokens, no hardcoding

### API Integration Pattern
```typescript
// lib/hooks/use-properties.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/api-routes';

export function useProperties(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => apiClient.get(API_ROUTES.PROPERTIES.LIST, { params: filters }),
  });
}

export function usePropertyCreate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePropertyDto) =>
      apiClient.post(API_ROUTES.PROPERTIES.CREATE, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

// Usage in component
function PropertiesPage() {
  const { data, isLoading, error } = useProperties({ status: 'AVAILABLE' });
  // ...
}
```

### Form Validation Pattern
```typescript
// lib/validations/property.ts
import { z } from 'zod';

export const createPropertySchema = z.object({
  title: z.string().min(5, 'Title too short'),
  price: z.number().min(0, 'Price must be positive'),
  bedrooms: z.number().int().min(0),
  // ...
});

export type CreatePropertyDto = z.infer<typeof createPropertySchema>;
```

---

## ✅ Pre-Launch Checklist

Before committing any page:
- [ ] Component matches backend DTO & response shape (no surprises)
- [ ] Zod schema validates all form inputs
- [ ] TypeScript strict mode (no `any`)
- [ ] No `console.log` statements
- [ ] Error states handled (loading, error, empty)
- [ ] Mobile responsive (tested on iPhone + desktop)
- [ ] Accessible (keyboard nav, color contrast)
- [ ] Follows `CLAUDE.md` rules (one-liner per file, tokens, etc.)
- [ ] Tests pass: `pnpm error` (tsc), `pnpm lint`

---

## 🎯 Your Next Step

**Ready to build?** Start with Phase 1 (Auth & Navigation):

1. Build `app/login/page.tsx` → wire up login form to backend
2. Build `app/register/page.tsx` → create new users
3. Build middleware to protect `/dashboard/*` and role routes
4. Build header/nav with user menu
5. Build `/dashboard` landing page

Once Phase 1 works, continue sequentially.

---

## 📞 Questions?

If unclear on:
- **API contract:** Check `FRONTEND_MVP_ANALYSIS.md` (all endpoints + DTOs listed)
- **Component pattern:** Look at existing `components/` (login.tsx, motion-wrapper.tsx)
- **Styling:** Check `styles/globals.css` for token classes
- **Type definitions:** Look at `lib/types/types.ts` & `lib/interface/`
- **Architecture:** Read `CLAUDE.md` (8 rules are law)

---

## 🚀 Let's Go!

You have everything you need. Backend is ready. Tech stack is set up. Architecture is documented. **Time to build the best real estate marketplace UI.** 

**Commit every feature, test E2E, ship with confidence.**

Good luck! 🎯
