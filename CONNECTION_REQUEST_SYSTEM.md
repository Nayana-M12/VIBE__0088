# Connection Request System

## Overview
Changed from instant "follow" to a request-based connection system where users must accept invitations.

## Database Changes

### Schema Update (shared/schema.ts)
Added to `userFollows` table:
- `status`: "pending", "accepted", "rejected"
- `respondedAt`: timestamp when request was accepted/rejected

## Backend Changes

### Storage Methods (server/storage.ts)
**New Methods:**
- `sendConnectionRequest()` - Send a connection request
- `acceptConnectionRequest()` - Accept a pending request
- `rejectConnectionRequest()` - Reject a pending request
- `cancelConnectionRequest()` - Cancel/remove a connection
- `getConnectionStatus()` - Get status between two users
- `getPendingRequests()` - Get all pending requests for a user

**Updated Methods:**
- `getFollowerCount()` - Only counts accepted connections
- `getFollowingCount()` - Only counts accepted connections

### API Endpoints (server/routes.ts)
**Modified:**
- `POST /api/users/:userId/follow` - Now sends/cancels connection requests
- `GET /api/users/:userId/follow-stats` - Returns connectionStatus

**New:**
- `POST /api/connection-requests/:requestId/accept` - Accept a request
- `POST /api/connection-requests/:requestId/reject` - Reject a request
- `GET /api/connection-requests/pending` - Get pending requests

## Frontend Changes Needed

### Button States:
1. **Not Connected** - "Join With" button (green)
2. **Request Pending** - "Request Sent" button (outline, disabled)
3. **Connected** - "Joined" button (outline, can click to disconnect)

### New Features Needed:
1. **Pending Requests Page/Section** - Show incoming connection requests
2. **Accept/Reject Buttons** - On pending requests
3. **Request Sent Indicator** - Show when you've sent a request

## To Apply Changes:

1. Run database migration:
```bash
npm run db:push
```

2. Update frontend components (Community.tsx, Leaderboard.tsx)
3. Add a "Requests" section to show pending invitations

## User Flow:

1. User A clicks "Join With" on User B's profile
2. Request is sent (status: "pending")
3. User B sees notification/request
4. User B can Accept or Reject
5. If accepted, both users are "Joined"
6. Either user can disconnect anytime
