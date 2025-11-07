# Green Intelligence Platform - Design Guidelines

## Design Approach
**Reference-Based Strategy:** Drawing inspiration from Notion (dashboard organization), Strava (progress tracking), Duolingo (gamification), and Linear (clean data presentation). This creates a modern, achievement-focused sustainability platform that makes eco-friendly living engaging and rewarding.

## Core Design Principles
- **Achievement-First:** Gamification elements prominently displayed to drive engagement
- **Data Clarity:** Complex environmental data presented through intuitive visualizations
- **Progressive Disclosure:** Dense information revealed through expandable panels and tabs
- **Trust & Credibility:** Clean, professional aesthetic reinforcing platform reliability

## Typography System
**Font Families:** Inter (UI/data) + Space Grotesk (headings/impact text)
- Hero Headings: 3xl to 5xl, bold
- Section Headers: xl to 2xl, semibold
- Card Titles: lg, medium
- Body Text: base, regular
- Data/Metrics: lg to 2xl, bold (for numbers)
- Labels/Captions: sm, medium

## Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-20
- Card gaps: gap-4 to gap-6
- Icon-text spacing: gap-2

**Grid Structure:**
- Dashboard: 12-column grid with 3-4 column cards on desktop, stack on mobile
- Feature cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Stats panels: grid-cols-2 lg:grid-cols-4

## Component Library

### Authentication Pages
- Centered card layout (max-w-md) on full-height page
- Logo + tagline at top
- Social login buttons (Google, GitHub) with icons from Heroicons
- Email/password input fields with floating labels
- Primary CTA button (large, rounded-lg)
- Toggle between login/signup with subtle link

### Home Dashboard
**Layout:** Sidebar navigation (left, 64-72 wide) + Main content area
- **Top Bar:** Welcome message, points badge (prominent), notification bell, profile avatar
- **Social Feed:** Card-based posts (max-w-2xl centered), each showing: user avatar, name, achievement type, timestamp, impact stats (CO2 saved, points earned), like/share actions
- **Quick Stats Row:** 4 metric cards showing total points, carbon saved, water saved, eco-routes taken

### Energy Predictor
- **Header:** Title + "Analyze Usage" CTA
- **Input Section:** Month selector, manual bill entry OR "Fetch from API" button
- **Prediction Display:** Large metric card showing predicted wastage percentage, trend graph (line chart), AI insights panel with bullet points
- **Comparison View:** Side-by-side current vs. optimized usage bars

### Water Tracker
- **Daily Entry Form:** Date picker, liters used input, activity tags (shower, laundry, dishes)
- **Weekly Overview:** 7-day bar chart with efficiency score
- **Monthly Trends:** Line graph with annotations for high-usage days
- **Tips Panel:** AI-generated conservation suggestions in expandable cards

### Eco-Route Optimizer
- **Input Panel:** Start/end location inputs, vehicle type selector
- **Route Comparison:** 2-3 route cards showing: map thumbnail, distance, time, CO2 emissions (highlighted), points to earn
- **Selection:** Radio buttons + "Navigate with This Route" primary button
- **Impact Visualization:** Circular progress showing CO2 saved vs. standard route

### AI Sustainability Advisor
- **Chat Interface:** Messages left-aligned (user) and right-aligned (AI) with avatars
- **Quick Actions:** Pill-shaped suggestion chips above input ("Reduce energy", "Find eco-products")
- **Input Bar:** Text field + send button with microphone icon
- **Insight Cards:** AI responses formatted as rich cards with icons, bullet points, and action buttons

### Points & Rewards System
**Points Display:** Persistent badge in top bar showing current points with sparkle animation on earn
**Rewards Hub:**
- **Tabs:** "Scratch Cards" | "Discount Coupons" | "My Rewards"
- **Scratch Cards Grid:** 3-column grid, card design with "mystery" overlay, points cost badge, "Scratch Now" CTA
- **Discount Coupons:** Larger cards with brand logos, discount percentage (prominent), validity dates, "Claim" button (disabled if locked)
- **Special Events Banner:** Countdown timers for World Environment Day and App Festival Day at top

### Progress Tracking
- **Hero Stats:** Large metric cards (3-column) showing lifetime impact: Total CO2 saved, Water conserved, Points earned
- **Timeline View:** Vertical timeline showing monthly achievements with icons and brief descriptions
- **Charts Section:** Tabbed interface (Energy | Water | Routes) with interactive line/bar charts
- **Leaderboard Panel:** Top 10 users with ranks, avatars, points (foster community engagement)

### Social Sharing
- **Share Modal:** Preview of achievement card, platform selection (Twitter, Facebook, LinkedIn icons), custom message input, "Post to Community" checkbox
- **Achievement Cards:** Pre-designed cards with user stats, badge graphics, platform branding

## Navigation Structure
**Sidebar Menu Items:** (with Heroicons)
- Home (newspaper icon)
- Energy Predictor (lightning-bolt icon)
- Water Tracker (beaker icon)
- Eco Routes (map icon)
- AI Advisor (sparkles icon)
- Rewards (gift icon)
- Progress (chart-bar icon)
- Profile (user-circle icon)

**Mobile:** Bottom tab bar (5 key items) + hamburger menu for secondary items

## Visual Elements

### Icons
**Library:** Heroicons (outline for navigation, solid for status indicators)
- Use consistently across platform (16px to 24px)
- Environmental icons: leaf, globe, water-drop, lightning-bolt
- Gamification: trophy, star, gift, badge-check

### Cards & Containers
- Rounded corners: rounded-lg to rounded-xl
- Subtle shadows: shadow-sm to shadow-md
- Bordered cards with hover lift effect (transition-transform)
- Dashboard cards: White/neutral background, organized content hierarchy

### Data Visualizations
- Line charts for trends (energy/water over time)
- Bar charts for comparisons (daily/weekly usage)
- Circular progress for goals and targets
- Heatmaps for urban optimization dashboards (if implemented)
- Use chart.js or recharts library

### Badges & Indicators
- Points badges: pill-shaped, medium size, positioned top-right in cards
- Status indicators: Small circular dots (online, active streaks)
- Achievement badges: Medal/trophy icons with tier levels (bronze, silver, gold)

### Forms & Inputs
- Input fields: Bordered, rounded-md, adequate padding (p-3)
- Focus states: Ring effect (ring-2)
- Labels: Above inputs, text-sm semibold
- Helper text: Below inputs, text-xs
- Error states: Red accent on border + error message

### Buttons
- Primary: Large, rounded-lg, prominent (for main actions)
- Secondary: Outlined style (for alternative actions)
- Text buttons: For tertiary actions
- Icon buttons: For quick actions (like, share, delete)
- All buttons: Smooth hover transitions, scale on press

## Images Section
**Hero Image:** No traditional hero - Dashboard opens directly with action-focused layout

**Strategic Image Placement:**
1. **Rewards Section:** Product images for scratch card items and coupon brands (rectangular cards, rounded corners)
2. **Achievement Posts:** User-generated environmental action photos in social feed (square thumbnails, 400x400)
3. **Empty States:** Friendly illustrations for "No data yet" screens (centered, max 300px width)
4. **AI Advisor:** Small icon/avatar representing AI assistant (48x48, rounded-full)
5. **Eco-Route Maps:** Simplified map thumbnails in route comparison cards (16:9 aspect ratio)

**Image Treatment:** All images use rounded-lg, object-cover, with subtle shadow-sm

## Special Interactions
- **Scratch Card Reveal:** Overlay fades on click, reveal animation for prize
- **Points Animation:** Confetti burst or sparkle effect when points are earned
- **Progress Milestones:** Celebratory modal when user hits savings targets
- **Real-time Updates:** Subtle pulse animation on dashboard cards when new data arrives
- **Smooth Transitions:** Page transitions, expandable panels use ease-in-out timing

## Accessibility Features
- Clear focus indicators on all interactive elements
- Sufficient contrast ratios for text (WCAG AA minimum)
- Screen reader labels for icons and charts
- Keyboard navigation support throughout
- Loading states with descriptive text ("Analyzing your usage...")

## Responsive Behavior
- Desktop (lg+): Full sidebar, multi-column grids, side-by-side comparisons
- Tablet (md): Collapsible sidebar, 2-column grids
- Mobile: Bottom navigation, single-column stacks, full-width cards, condensed stats

This design creates a comprehensive, engaging sustainability platform that balances data-driven insights with gamification, making eco-friendly living both measurable and rewarding.