# 🗺️ Mapbox Setup Guide for GreenIntelligence

## Why Mapbox?
Mapbox provides beautiful, interactive maps with real-time routing that shows your eco-friendly routes with:
- ✨ 3D buildings and terrain
- 🎨 Custom styled routes (green for eco-friendly, colors by mode)
- 📍 Animated markers with popups
- 🚴 Real distance and duration calculations
- 🌍 Accurate geocoding for any location

## Quick Setup (5 minutes)

### Step 1: Get Your Free Mapbox Token

1. **Sign up** at [mapbox.com](https://account.mapbox.com/auth/signup/)
   - It's completely FREE for development
   - No credit card required for the free tier
   - 50,000 free map loads per month

2. **Find your token**
   - After signing up, you'll see your **Default public token**
   - It starts with `pk.` (e.g., `pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbHF4eXozeDIwYWJkMmpwY2RreXRjemVkIn0.example`)
   - Click the **Copy** button

### Step 2: Add Token to Your Project

1. **Open** the `.env` file in the `GreenIntelligence-1` folder

2. **Find this line:**
   ```
   MAPBOX_ACCESS_TOKEN=your-mapbox-token-here
   ```

3. **Replace** `your-mapbox-token-here` with your actual token:
   ```
   MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbHF4eXozeDIwYWJkMmpwY2RreXRjemVkIn0.example
   ```

4. **Save** the file

### Step 3: Restart the Server

1. **Stop** the current server (Ctrl+C in terminal)

2. **Start** it again:
   ```bash
   npm run dev
   ```

3. **Refresh** your browser

### Step 4: Test It Out!

1. Go to the **Routes** page
2. Enter any two locations (e.g., "New York, NY" to "Boston, MA")
3. Click **Find Routes**
4. You should now see a beautiful interactive map! 🎉

## What You'll See

### 🎨 Creative Map Features:
- **3D View**: Map tilted at 45° for a modern look
- **Glowing Routes**: Routes have a glow effect based on eco-friendliness
- **Animated Markers**: 
  - 📍 Blue bouncing marker for start
  - 🎯 Green pulsing marker for destination
  - Route info badge in the middle
- **Color-Coded Routes**:
  - 🚴 Cycling: Green (most eco-friendly)
  - 🚶 Walking: Blue (zero emissions)
  - 🚗 Driving: Orange/Red (higher emissions)
- **Interactive Popups**: Click markers to see detailed route info
- **Smooth Animations**: Routes animate when switching modes

### 🎯 Map Controls:
- **Zoom**: +/- buttons or scroll wheel
- **Rotate**: Right-click and drag
- **Tilt**: Ctrl + drag
- **Scale**: Shows distance in km/miles

## Troubleshooting

### Map not showing?
1. Check that your token starts with `pk.`
2. Make sure you saved the `.env` file
3. Restart the server completely
4. Clear browser cache and refresh

### "Token not configured" error?
- Your token is still set to `your-mapbox-token-here`
- Follow Step 2 above to add your real token

### Routes showing but no map?
- Check your internet connection
- Mapbox requires internet to load map tiles
- Check browser console for errors (F12)

### Token limit reached?
- Free tier: 50,000 map loads/month
- Check usage at [mapbox.com/account](https://account.mapbox.com/)
- For production, consider upgrading

## Free Tier Limits

Mapbox free tier includes:
- ✅ 50,000 map loads per month
- ✅ 100,000 geocoding requests
- ✅ 100,000 routing requests
- ✅ All map styles
- ✅ 3D buildings and terrain
- ✅ No credit card required

Perfect for development and small projects!

## Need Help?

- 📚 [Mapbox Documentation](https://docs.mapbox.com/)
- 💬 [Mapbox Community](https://community.mapbox.com/)
- 🎓 [Mapbox Tutorials](https://docs.mapbox.com/help/tutorials/)

---

**Ready to see your eco-routes on a beautiful map? Follow the steps above!** 🌍✨
