# 🚀 Quick Start - Get Your Maps Working!

## Current Status: ⚠️ Map Token Needed

Your route map is **ready to go** but needs a Mapbox token to display actual maps.

## What You'll See Now:

Without a token, you'll see a beautiful **preview screen** with:
- 📏 Distance cards
- ⏱️ Duration info
- 💨 CO₂ emissions
- 🌱 Carbon savings
- Simple route visualization

## What You'll Get With Token:

With a token, you'll see an **interactive 3D map** with:
- 🗺️ Real map with streets and buildings
- 🎨 Glowing colored route lines
- 📍 Animated bouncing markers
- 🎯 Interactive popups
- 🌍 Zoom, rotate, tilt controls

---

## 3-Minute Setup

### Step 1: Get Free Token (2 minutes)

1. Go to: **https://account.mapbox.com/auth/signup/**
2. Sign up (email + password)
3. You'll see your **Default public token**
4. Click **Copy** button

### Step 2: Add to Project (30 seconds)

1. Open file: `GreenIntelligence-1/.env`
2. Find line: `MAPBOX_ACCESS_TOKEN=your-mapbox-token-here`
3. Replace with: `MAPBOX_ACCESS_TOKEN=pk.your_actual_token_here`
4. Save file

### Step 3: Restart (30 seconds)

1. Stop server (Ctrl+C in terminal)
2. Start again: `npm run dev`
3. Refresh browser

### Step 4: Test! (30 seconds)

1. Go to **Routes** page
2. Enter: "New York" → "Boston"
3. Click **Find Routes**
4. **See your beautiful map!** 🎉

---

## Example Token Format

```
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbHF4eXozeDIwYWJkMmpwY2RreXRjemVkIn0.example_token_here
```

**Important**: 
- Token MUST start with `pk.`
- No spaces before or after
- No quotes needed

---

## Troubleshooting

### "Token not configured" error?
→ Check that you saved the `.env` file and restarted the server

### Map still not showing?
→ Clear browser cache (Ctrl+Shift+R) and refresh

### Token doesn't work?
→ Make sure you copied the **public token** (starts with `pk.`), not the secret token

---

## Free Tier Limits

✅ **50,000 map loads/month** - More than enough for development!
✅ **No credit card required**
✅ **All features included**

---

## Need Help?

1. Check `MAPBOX_SETUP_GUIDE.md` for detailed instructions
2. Check `ROUTE_MAP_FEATURES.md` to see all creative features
3. Visit https://docs.mapbox.com/ for Mapbox documentation

---

**Ready? Let's get your maps working!** 🗺️✨

Current server: http://localhost:5000
