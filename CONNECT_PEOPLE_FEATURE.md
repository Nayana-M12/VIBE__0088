# Connect with People Feature

## What Was Added

### Location: Leaderboard Page (`/leaderboard`)

### New Features:

1. **Community Tab**
   - 4th tab added to the Leaderboard
   - Icon: Users icon
   - Purpose: Dedicated space to connect with other users

2. **Follow/Unfollow Buttons**
   - Appears on ALL user cards in the leaderboard
   - Green "Follow" button with UserPlus icon
   - Changes to "Following" with UserCheck icon when followed
   - Click again to unfollow

3. **User Stats**
   - Shows follower count (e.g., "5 followers")
   - Shows following count (e.g., "3 following")
   - Displayed under each user's name

4. **Your Profile Badge**
   - Shows "You" badge on your own profile
   - No follow button on your own card

## How to Use:

1. **Go to Leaderboard page** (click Leaderboard in navigation)
2. **See the 4 tabs**: EcoBits, Carbon Saved, Water Saved, **Community**
3. **Click Community tab** to see all users
4. **Click "Follow" button** on any user to connect with them
5. **See follower/following counts** update in real-time

## What You Can Do:

- Follow users who inspire you
- See how many followers each user has
- Build your sustainability network
- Connect with top performers
- Unfollow by clicking "Following" button again

## Backend Endpoints Used:

- `GET /api/users/:userId/follow-stats` - Get follower/following counts
- `POST /api/users/:userId/follow` - Follow/unfollow a user

These endpoints already exist in your backend (server/routes.ts).

## Testing:

1. Open the app
2. Navigate to Leaderboard
3. Click the "Community" tab
4. Try following a user
5. Check that the button changes to "Following"
6. Check that follower count increases

## Troubleshooting:

If you don't see the Community tab:
- Make sure the app is running (`npm run dev`)
- Refresh the browser
- Check browser console for errors (F12)

If follow button doesn't work:
- Make sure you're logged in
- Check that backend is running
- Check browser console for API errors
