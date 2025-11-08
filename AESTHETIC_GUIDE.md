# 🌿 GreenIntelligence Dark Eco-Aesthetic Design System

## 🎨 Color Palette

### Primary Colors
- **Deep Forest Background**: `#050f08` → `#071812` → `#0a1f15`
- **Emerald Primary**: `#10b981` (rgb(16, 185, 129))
- **Green Secondary**: `#22c55e` (rgb(34, 197, 94))
- **Teal Accent**: `#14b8a6` (rgb(20, 184, 166))

### Text Colors
- **Primary Text**: `#d1fae5` (Emerald 100)
- **Secondary Text**: `rgba(209, 250, 229, 0.7)` (70% opacity)
- **Muted Text**: `rgba(209, 250, 229, 0.6)` (60% opacity)

### Background Layers
- **Body**: Multi-layered radial gradients with deep forest tones
- **Cards**: `rgba(8, 20, 12, 0.98)` → `rgba(5, 15, 10, 0.95)`
- **Overlays**: Subtle emerald glows at 3-8% opacity

## ✨ Glass Morphism System

### Glass Card
```css
background: linear-gradient(135deg, rgba(8, 20, 12, 0.98), rgba(5, 15, 10, 0.95));
backdrop-filter: blur(24px);
border: 1px solid rgba(34, 197, 94, 0.25);
box-shadow: 
  0 8px 32px 0 rgba(0, 0, 0, 0.6),
  0 0 60px 0 rgba(34, 197, 94, 0.05),
  inset 0 1px 0 0 rgba(34, 197, 94, 0.15);
```

### Nature Border
```css
border: 2px solid transparent;
background: 
  linear-gradient(135deg, rgba(15, 35, 20, 0.95), rgba(10, 25, 15, 0.9)) padding-box,
  linear-gradient(135deg, rgba(34, 197, 94, 0.5), rgba(16, 185, 129, 0.3)) border-box;
```

## 🎭 Component Styles

### Buttons
**Primary Button:**
```css
background: linear-gradient(to right, #059669, #16a34a, #14b8a6);
border: 2px solid rgba(34, 197, 94, 0.4);
box-shadow: 0 4px 20px rgba(34, 197, 94, 0.15);
```

**Hover State:**
```css
background: linear-gradient(to right, #10b981, #22c55e, #2dd4bf);
box-shadow: 0 8px 40px rgba(34, 197, 94, 0.25);
transform: translateY(-2px);
```

### Badges
**Active Badge:**
```css
background: linear-gradient(to right, #059669, #16a34a);
border: 1px solid rgba(34, 197, 94, 0.5);
color: white;
```

**Inactive Badge:**
```css
background: rgba(34, 197, 94, 0.2);
border: 1px solid rgba(34, 197, 94, 0.4);
color: rgba(209, 250, 229, 0.9);
```

### Icons
**Icon Container:**
```css
background: linear-gradient(135deg, 
  rgba(16, 185, 129, 0.3),
  rgba(34, 197, 94, 0.2),
  rgba(20, 184, 166, 0.3));
backdrop-filter: blur(12px);
border-radius: 1rem;
box-shadow: 0 4px 16px rgba(34, 197, 94, 0.2);
```

## 🌟 Special Effects

### Pulse Glow
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.4); }
  50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); }
}
```

### Leaf Float
```css
@keyframes leaf-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(2deg); }
  75% { transform: translateY(-8px) rotate(-2deg); }
}
```

### Eco Shine
```css
.eco-shine::after {
  background: linear-gradient(45deg,
    transparent 30%,
    rgba(34, 197, 94, 0.1) 50%,
    transparent 70%);
  animation: eco-shine 3s infinite;
}
```

### Ambient Glow
```css
@keyframes ambient-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}
```

## 📐 Layout Patterns

### Page Header
```tsx
<div className="glass-card p-6 nature-border eco-shine">
  <h1 className="text-4xl font-display font-bold mb-2 gradient-text">
    🌿 Page Title
  </h1>
  <p className="text-emerald-200/80 text-lg">Description</p>
</div>
```

### Stat Card
```tsx
<Card className="glass-card nature-border hover:border-emerald-400/60 transition-all duration-300 group organic-shadow">
  <CardContent className="p-5">
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/30 via-green-500/20 to-teal-500/30 pulse-glow">
        <Icon className="text-emerald-400" />
      </div>
      <div>
        <p className="text-xs text-emerald-200/60 uppercase">Label</p>
        <p className="text-2xl font-bold gradient-text">Value</p>
      </div>
    </div>
  </CardContent>
</Card>
```

### Action Button
```tsx
<Button className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:via-green-500 hover:to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-emerald-400/40 eco-shine organic-shadow px-8 py-3">
  <span className="relative z-10 flex items-center gap-2">
    🌱 Action Text
  </span>
</Button>
```

## 🎯 Usage Guidelines

### DO's
✅ Use gradient text for headings
✅ Add emojis to buttons and titles
✅ Apply pulse-glow to important icons
✅ Use nature-border on all cards
✅ Add eco-shine to interactive elements
✅ Include leaf-pattern backgrounds
✅ Use organic-shadow for depth

### DON'Ts
❌ Don't use pure white backgrounds
❌ Don't use harsh borders
❌ Don't skip backdrop-filter blur
❌ Don't forget hover states
❌ Don't use flat colors
❌ Don't ignore animation timing

## 🔧 Utility Classes

### Core Classes
- `.glass-card` - Dark glass morphism card
- `.nature-border` - Gradient border effect
- `.gradient-text` - Emerald gradient text
- `.eco-shine` - Diagonal shine animation
- `.pulse-glow` - Pulsing glow effect
- `.leaf-float` - Floating leaf animation
- `.leaf-pattern` - Subtle leaf background
- `.organic-shadow` - Multi-layered shadows
- `.eco-glow` - Ambient green glow

### Responsive Behavior
All effects scale appropriately on mobile devices with reduced animation intensity for performance.

## 🌍 Accessibility
- Maintains WCAG AA contrast ratios
- Respects prefers-reduced-motion
- Keyboard navigation fully supported
- Screen reader friendly with proper ARIA labels

---

**Design Philosophy**: Nature-inspired, premium dark theme that emphasizes sustainability through deep forest colors, organic animations, and glowing emerald accents.
