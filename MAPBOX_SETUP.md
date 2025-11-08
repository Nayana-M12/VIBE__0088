# Mapbox Setup Guide

## Get Your Free Mapbox API Key

1. **Sign up for Mapbox** (Free tier includes 50,000 requests/month)
   - Go to: https://account.mapbox.com/auth/signup/
   - Create a free account

2. **Get Your Access Token**
   - After signing in, go to: https://account.mapbox.com/
   - Copy your "Default public token" (starts with `pk.`)

3. **Add Token to .env File**
   - Open `GreenIntelligence-1/.env`
   - Replace `your-mapbox-token-here` with your actual token:
   ```
   MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbHF4eXozeDIwYWJkMmpwY2RreXRjemVkIn0.example
   ```

4. **Update Frontend Token**
   - Open `GreenIntelligence-1/client/src/components/MapboxRouteMap.tsx`
   - Replace the `MAPBOX_TOKEN` constant with your public token (line 20)

5. **Restart the Server**
   - Stop the current server (Ctrl+C)
   - Run `npm run dev` again

## Features Enabled

✅ **Interactive Maps** - Real Mapbox maps with street view
✅ **Actual Routes** - Real routing data from Mapbox Directions API
✅ **Geocoding** - Convert addresses to coordinates
✅ **Multiple Transport Modes** - Driving, cycling, walking routes
✅ **Carbon Calculations** - Accurate emissions based on real distances
✅ **Visual Route Comparison** - Color-coded routes (green = eco-friendly)

## Route Colors

- 🟢 **Green Routes** - Zero or low carbon emissions (cycling, walking)
- 🟠 **Orange Routes** - Higher carbon emissions (driving)

## Free Tier Limits

- 50,000 map loads per month
- 100,000 geocoding requests per month
- 100,000 directions requests per month

This is more than enough for development and testing!
