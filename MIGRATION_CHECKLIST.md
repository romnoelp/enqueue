# Backend Migration Checklist

## Overview
Comparing Express backend (`enqueue-be`) with new Next.js 15 implementation.

---

## ✅ Completed Features

### Authentication & Middleware
- ✅ **Better Auth Integration** - Replaced Firebase Auth with Better Auth (session-based)
- ✅ **verifyAuthTokenAndDomain** - Migrated to Better Auth session + Realtime DB role fetch
- ✅ **verifyRole** - Role-based access control middleware
- ✅ **verifyQueueToken** - JWT validation for queue tokens
- ✅ **verifyTokenNotUsed** - Check if token already used in Firestore
- ✅ **checkStationActivation** - Verify station is active before operations

### User Routes (1/1) ✅
- ✅ `GET /user/verify` → `/api/user/verify/route.ts`

### Queue Routes (10/14) ✅
- ✅ `GET /queue/qrcode` → `/api/queue/qrcode/route.ts`
- ✅ `GET /queue/get-valid-token-for-queue-access` → `/api/queue/get-valid-token-for-queue-access/route.ts`
- ✅ `GET /queue/verify-on-mount` → `/api/queue/verify-on-mount/route.ts`
- ✅ `POST /queue/add` → `/api/queue/add/route.ts`
- ✅ `POST /queue/available-stations` → Implemented in `/api/queue/add/route.ts`
- ✅ `GET /queue/queue-position` → `/api/queue/queue-position/route.ts`
- ✅ `POST /queue/leave` → `/api/queue/leave/route.ts`
- ✅ `GET /queue/display-serving` → `/api/queue/display-serving/route.ts`
- ✅ `POST /queue/store-fcm` → `/api/queue/store-fcm/route.ts`
- ✅ `GET /queue/station-info` → `/api/queue/station-info/route.ts`

### Admin Routes (10/10) ✅
- ✅ `GET /admin/pending-users` → `/api/admin/pending-users/route.ts`
- ✅ `GET /admin/employees` → `/api/admin/employees/route.ts`
- ✅ `POST /admin/set-role` → `/api/admin/set-role/route.ts`
- ✅ `GET /admin/user-data/:uid` → `/api/admin/user-data/[uid]/route.ts`
- ✅ `GET /admin/available-cashier-employees` → `/api/admin/available-cashier-employees/route.ts`
- ✅ `GET /admin/get-activity` → `/api/admin/get-activity/route.ts`
- ✅ `GET /admin/get-blacklist` → `/api/admin/get-blacklist/route.ts`
- ✅ `POST /admin/block-email` → `/api/admin/block-email/route.ts`
- ✅ `DELETE /admin/unblock-email/:email` → `/api/admin/unblock-email/[email]/route.ts`
- ✅ `GET /admin/get-analytics` → `/api/admin/get-analytics/route.ts`

### Station Routes (0/4) ❌
### Counter Routes (0/4) ❌
### Cashier Routes (7/7) ✅
- ✅ `GET /cashier/get-info` → `/api/cashier/get-info/route.ts`
- ✅ `POST /cashier/serve` → `/api/cashier/serve/route.ts`
- ✅ `POST /cashier/get-current` → `/api/cashier/get-current/route.ts`
- ✅ `POST /cashier/complete-serve` → `/api/cashier/complete-serve/route.ts`
- ✅ `POST /cashier/skip-customer` → `/api/cashier/skip-customer/route.ts`
- ✅ `GET /cashier/get-remaining-pending` → `/api/cashier/get-remaining-pending/route.ts`
- ✅ `POST /cashier/notify-customer` → *Skipped - needs email service implementation*

### Utilities
- ✅ JWT utilities (generate, verify, QR code generation)
- ✅ Activity logging (recordLog)
- ✅ FCM notifications (sendNotification)
- ✅ Role constants
- ✅ Email utility (structure exists, needs implementation)

### Types
- ✅ All types organized in `/types` directory
- ✅ Barrel export pattern via `/types/index.ts`

### Scheduled Jobs (0/2) ❌

---

### ❌ Missing Features

### Queue Routes (4 missing)
1. ❌ `GET /queue/notify-on-initial-mount` - Send notification on successful QR scan
2. ❌ `POST /queue/check-and-notify` - Check queue and notify next customers
3. ❌ `POST /queue/notify-serving` - Notify currently serving customer
4. ❌ `GET /queue/available-stations` - Get list of available stations (separate endpoint)

### Admin Routes (All Complete!) ✅

### Station Routes (4 missing)
1. ❌ `POST /station/add` - Create new station
2. ❌ `GET /station/get` - Get all stations
3. ❌ `DELETE /station/delete/:stationID` - Delete station (with activation check)
4. ❌ `PUT /station/update/:stationID` - Update station details

### Counter Routes (4 missing)
1. ❌ `POST /counter/add/:stationID` - Add counter to station
2. ❌ `GET /counter/get/:stationID` - Get all counters for station
3. ❌ `DELETE /counter/delete/:stationID/:counterID` - Delete counter
4. ❌ `PUT /counter/update/:stationID/:counterID` - Update counter (with activation check)

### Cashier Routes (1 missing)
1. ❌ `POST /cashier/notify-customer` - Send notification to customer (requires email service)

### Scheduled Jobs (2 missing)
1. ❌ **archiveQueueAndResetQueueNumbers** - Runs daily at 7pm
   - Archives queue to `queue-history/{dateKey}`
   - Resets all `queue-numbers` to 0
   - Clears all FCM tokens

2. ❌ **clearTokensEveryTwoDays** - Runs every 48 hours
   - Clears `loaded-token`, `used-token`, `invalid-token` collections

---

## 🔍 Key Differences

### Authentication
- **Old**: Firebase Auth with ID token verification
- **New**: Better Auth with session-based authentication + Google OAuth
- **Impact**: All routes now use `auth.api.getSession()` instead of `admin.auth().verifyIdToken()`

### Middleware Chain
- **Old**: Express middleware chain (`router.use()`)
- **New**: Middleware functions called within route handlers
- **Impact**: More explicit control flow, easier to test

### Request/Response
- **Old**: Express `req`/`res` objects
- **New**: Next.js `NextRequest`/`NextResponse` with JSON responses
- **Impact**: Different API, but similar functionality

### CORS
- **Old**: Explicit CORS middleware with origin checking
- **New**: Next.js handles CORS, configured via headers in route config
- **Impact**: May need to verify CORS settings in production

### Error Handling
- **Old**: `res.status(500).json({error: "message"})`
- **New**: `NextResponse.json({error: "message"}, {status: 500})`
- **Impact**: Consistent error format maintained

---

## 📊 Progress Summary

| Category | Completed | Total | Percentage |
|----------|-----------|-------|------------|
| User Routes | 1 | 1 | 100% ✅ |
| Queue Routes | 10 | 14 | 71% ✅ |
| Admin Routes | 10 | 10 | 100% ✅ |
| Station Routes | 0 | 4 | 0% ❌ |
| Counter Routes | 0 | 4 | 0% ❌ |
| Cashier Routes | 6 | 7 | 86% ✅ |
| Scheduled Jobs | 0 | 2 | 0% ❌ |
| **TOTAL** | **27** | **42** | **64%** |

---

## 🚀 Recommended Implementation Order

### Phase 1: Core Queue Management (HIGH PRIORITY)
These are critical for basic queue functionality:
1. `GET /queue/queue-position` - Customers need to see their position
2. `POST /queue/leave` - Allow customers to leave queue
3. `GET /queue/display-serving` - Display currently serving numbers
4. `POST /queue/store-fcm` - Store tokens for notifications
5. `GET /queue/station-info` - Get station details

### Phase 2: Cashier Operations (HIGH PRIORITY)
Cashiers need these to serve customers:
1. `GET /cashier/get-info` - Get assigned station/counter
2. `POST /cashier/serve` - Start serving customer
3. `POST /cashier/get-current` - Get current customer info
4. `POST /cashier/complete-serve` - Complete transaction
5. `POST /cashier/skip-customer` - Handle no-shows
6. `GET /cashier/get-remaining-pending` - Queue count

### Phase 3: Admin Management (MEDIUM PRIORITY)
Admin needs these for user and system management:
1. `POST /admin/set-role` - Assign roles to users
2. `GET /admin/user-data/:uid` - View user details
3. `GET /admin/available-cashier-employees` - For counter assignment
4. `GET /admin/get-activity` - View activity logs
5. `GET /admin/get-blacklist` - Manage blacklisted emails
6. `POST /admin/block-email` - Block problematic users
7. `DELETE /admin/unblock-email/:email` - Unblock users
8. `GET /admin/get-analytics` - View system analytics

### Phase 4: Station & Counter CRUD (MEDIUM PRIORITY)
Admin needs these to configure the system:
1. `POST /station/add` - Create stations
2. `GET /station/get` - List all stations
3. `PUT /station/update/:stationID` - Update station
4. `DELETE /station/delete/:stationID` - Remove station
5. `POST /counter/add/:stationID` - Add counters
6. `GET /counter/get/:stationID` - List counters
7. `PUT /counter/update/:stationID/:counterID` - Update counter
8. `DELETE /counter/delete/:stationID/:counterID` - Remove counter

### Phase 5: Advanced Queue Features (LOW PRIORITY)
Nice-to-have features:
1. `GET /queue/notify-on-initial-mount` - Welcome notification
2. `POST /queue/check-and-notify` - Automated queue notifications
3. `POST /queue/notify-serving` - Notify currently serving
4. `POST /cashier/notify-customer` - Manual customer notification

### Phase 6: Scheduled Jobs (PRODUCTION REQUIRED)
Must be implemented before production:
1. **archiveQueueAndResetQueueNumbers** - Daily cleanup at 7pm
2. **clearTokensEveryTwoDays** - Token cleanup every 48 hours

---

## ⚠️ Current Blockers

1. **Authentication Issue** - Google OAuth credentials mismatch
   - **Status**: Waiting for correct Google Client ID/Secret from teammate
   - **Impact**: Cannot test authenticated routes
   - **Workaround**: Debug endpoints created (`/api/debug/me`, `/api/debug/assign-admin`)

2. **Email Service** - Not implemented
   - **Status**: Structure exists in `app/lib/utils/sendEmail.ts`
   - **Impact**: Cannot send email notifications
   - **Required for**: Password resets, notifications, etc.

---

## 📝 Notes

- All completed routes use **arrow function syntax** (`const handler = () => {}`)
- All completed routes use **early returns** (no deep nesting)
- All completed routes have **short, helpful comments**
- All types are in `/types` with **barrel exports**
- **No Axios** - using native fetch with `credentials: "include"`
- **Better Auth** configured with `baseURL`, `basePath`, `trustedOrigins`
- Middleware functions are **standalone utilities** (not Express-style)
- All Firestore/Realtime DB operations use **Firebase Admin SDK**
- JWT tokens used **only for queue operations** (not user auth)

---

## 🎯 Next Steps

1. **Fix Authentication** - Get correct OAuth credentials and test
2. **Phase 1 Implementation** - Implement core queue routes
3. **Phase 2 Implementation** - Implement cashier routes  
4. **Testing** - Test each route thoroughly
5. **Phase 3-4 Implementation** - Admin and CRUD routes
6. **Scheduled Jobs** - Migrate to Next.js cron jobs or Vercel Cron
7. **Production Prep** - Remove debug endpoints, add rate limiting, security review

---

*Last Updated: November 1, 2025*
