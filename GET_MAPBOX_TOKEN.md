# 🗺️ How to Get Real Google Maps-like Routes

## Step 1: Get Your FREE Mapbox Token (2 minutes)

1. **Go to Mapbox**: https://account.mapbox.com/auth/signup/
2. **Sign up** with your email (it's FREE - 50,000 requests/month)
3. **After login**, you'll see your **Default public token**
4. **Copy the token** (it starts with `pk.eyJ...`)

## Step 2: Add Token to Your Project

1. **Open** `GreenIntelligence-1/.env` file
2. **Find this line**:
   ```
   MAPBOX_ACCESS_TOKEN=your-mapbox-token-here
   ```
3. **Replace** `your-mapbox-token-here` with your actual token:
   ```
   MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNscXh5ejN4YjBhYmQyanBjZGt5dGN6ZWQifQ.your_actual_token
   ```

## Step 3: Restart the Server

1. **Stop** the current server (press Ctrl+C in terminal)
2. **Start** again: `npm run dev`
3. **Refresh** your browser

## ✅ What You'll Get

- 🗺️ **Real interactive maps** (like Google Maps)
- 🛣️ **Actual street routes** with turn-by-turn paths
- 🚴 **Multiple transport modes** (driving, cycling, walking)
- 🌱 **Carbon emission calculations** based on real distances
- 📍 **Geocoding** - converts addresses to map coordinates
- 🎨 **Color-coded routes** - green for eco-friendly, orange for high emissions

## 🆓 Free Tier Includes

- ✅ 50,000 map loads/month
- ✅ 100,000 geocoding requests/month  
- ✅ 100,000 directions requests/month
- ✅ No credit card required

## 🔍 Example Token Format

Your token should look like this:
```
pk.eyJ1IjoiZWNvZ3JlZW4iLCJhIjoiY2xxeHl6M3hiMGFiZDJqcGNka3l0Y3plZCJ9.dGhpc19pc19hbl9leGFtcGxl
```

## ❓ Troubleshooting

**Problem**: Still seeing fallback routes?
- ✅ Check token is correctly pasted in `.env`
- ✅ No spaces before or after the token
- ✅ Server was restarted after adding token
- ✅ Token starts with `pk.`

**Problem**: Map not loading?
- ✅ Check browser console for errors (F12)
- ✅ Verify internet connection
- ✅ Try refreshing the page

## 🎯 Test It

1. Go to **Routes** page
2. Enter locations like:
   - Start: "New York, NY"
   - End: "Brooklyn, NY"
3. Click **Find Routes**
4. You should see a real map with actual routes! 🎉
