# 🌿 GreenIntelligence - Sustainability Tracking Platform

A comprehensive sustainability tracking application that helps users monitor their environmental impact, earn rewards, and connect with eco-conscious communities.

## ✨ Features

### 🔋 Energy Predictor
- Track electricity consumption
- AI-powered wastage prediction
- Get personalized energy-saving insights
- Earn ecoBits for efficient energy use

### 💧 Water Tracker
- Monitor water usage
- Efficiency scoring system
- AI recommendations for water conservation
- Track water savings over time

### 🗺️ Eco-Route Optimizer
- Calculate carbon-efficient routes
- Compare driving, cycling, and walking options
- Interactive map visualization with Mapbox
- Earn ecoBits for choosing eco-friendly routes

### 🎁 Rewards System
- **Scratch Cards** (10-50 EcoBits) - Win discounts from Zepto, Bioq, Naava
- **Golden Tier Coupons** (60-150 EB, 10-15% off) - Okai, Vilvah, Blinkit, Slurrp Farm
- **Platinum Tier Coupons** (160-250 EB, 15-20% off) - Amazon, Nykaa, Savana, Souled Store
- **Platinum Premium Coupons** (260-400+ EB, 20-25% off) - IKEA, Forest Essentials, Minimalist
- Special occasion coupons for World Warrior Drive, Earth Impact Fest, Green Diwali Fiesta

### 🤝 Bond (Community)
- Connect with sustainability champions
- Send and accept connection requests
- View follower/following counts
- Build your eco-warrior network

### 🏆 Leaderboard
- Compete on EcoBits earned
- Track top carbon savers
- See water conservation leaders
- Connect with top performers

### 📊 Progress Tracking
- Visualize your sustainability journey
- Track lifetime impact (carbon saved, water saved)
- View ecoBits earned over time
- Unlock achievement milestones

### 🤖 AI Advisor
- Get personalized sustainability advice
- Ask questions about eco-friendly practices
- Powered by Google Gemini AI

### 📸 Social Feed
- Share sustainability achievements
- Upload photos/videos of eco-actions
- Earn ecoBits for posts (1-5 EB based on achievement type)
- Like, comment, and engage with community
- Edit and delete your posts

### 📄 Proof Submission
- Submit proof of eco-friendly actions
- Upload receipts, tickets, photos
- Auto-approval for verified actions
- Earn ecoBits for verified proofs

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **TanStack Query** for data fetching
- **Wouter** for routing
- **Tailwind CSS** for styling
- **Shadcn/ui** components
- **Recharts** for data visualization
- **Mapbox GL** for interactive maps

### Backend
- **Express.js** server
- **PostgreSQL** database (Neon)
- **Drizzle ORM** for database operations
- **Passport.js** for authentication
- **Multer** for file uploads
- **Google Gemini AI** for insights
- **Mapbox API** for route calculations

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (or Neon account)
- Mapbox API token
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Nayana-M12/VIBE__0088.git
cd VIBE__0088
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL=your_postgresql_connection_string
MAPBOX_ACCESS_TOKEN=your_mapbox_token
GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=your_session_secret
```

4. Push database schema:
```bash
npm run db:push
```

5. Seed the database (optional):
```bash
npx tsx server/seed.ts
```

6. Start the development server:
```bash
npm run dev
```

7. Open your browser to `http://localhost:5000`

## 📦 Project Structure

```
GreenIntelligence-1/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utility functions
├── server/              # Backend Express server
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database operations
│   ├── seed.ts          # Database seeding
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema
└── uploads/             # User uploaded files
```

## 🎮 Usage

### Earning EcoBits
- **Energy Analysis**: Track electricity usage
- **Water Tracking**: Monitor water consumption
- **Eco Routes**: Choose sustainable transportation
- **Social Posts**: Share achievements (1-5 EB)
- **Proof Submission**: Upload verified eco-actions

### Redeeming Rewards
1. Navigate to **Rewards** page
2. Browse **Scratch Cards** or **Discount Coupons**
3. Redeem using your ecoBits
4. View in **My Rewards** tab

### Connecting with Others
1. Go to **Bond** page
2. Click **Join With** on user profiles
3. Wait for them to accept your request
4. Build your sustainability network

## 🌟 Key Features Explained

### Connection Request System
- Send connection requests to other users
- Requests must be accepted before connecting
- Three button states: "Join With", "Request Sent", "Joined"
- Cancel requests or disconnect anytime

### Coupon Tiers
- **Golden**: Budget-friendly eco-products
- **Platinum**: Premium sustainable brands
- **Platinum Premium**: Luxury eco-conscious products + special events

### Achievement Types
- Public Transport: +5 EB
- Carpooling: +5 EB
- Eco Products: +5 EB
- Reusable Bag: +2 EB
- Reusable Bottle: +2 EB
- General: +1 EB

## 📝 License

MIT

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Issues

If you find any bugs or have feature requests, please create an issue on GitHub.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with 💚 for a sustainable future
