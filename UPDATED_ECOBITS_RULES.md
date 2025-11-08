# 🪙 Updated EcoBits Distribution Rules

## ⚡ Energy Bills - Consumption-Based Rewards

### New Rules:

| Consumption Range | EcoBits | Description |
|-------------------|---------|-------------|
| **0-200 units** | **10 EB** | Excellent! Low energy consumption |
| **201-400 units** | **5 EB** | Good! Moderate consumption |
| **Above 400 units** | **2 EB** | Tracking reward |

### Examples:

**Example 1: Low Consumer**
```
Monthly consumption: 150 kWh
EcoBits earned: 10 EB ✨
Message: "Excellent energy saving!"
```

**Example 2: Moderate Consumer**
```
Monthly consumption: 350 kWh
EcoBits earned: 5 EB
Message: "Good energy management!"
```

**Example 3: High Consumer**
```
Monthly consumption: 500 kWh
EcoBits earned: 2 EB
Message: "Keep tracking to improve!"
```

---

## 💧 Water Bills - Consumption-Based Rewards

### New Rules:

| Consumption Range | EcoBits | Description |
|-------------------|---------|-------------|
| **0-12 kiloliters** | **10 EB** | Excellent! Low water usage |
| **12-20 kiloliters** | **5 EB** | Good! Moderate usage |
| **Above 20 kiloliters** | **2 EB** | Tracking reward |

**Note**: 1 kiloliter (kL) = 1,000 liters

### Examples:

**Example 1: Low Consumer**
```
Monthly consumption: 8,000 liters (8 kL)
EcoBits earned: 10 EB ✨
Message: "Excellent water conservation!"
```

**Example 2: Moderate Consumer**
```
Monthly consumption: 15,000 liters (15 kL)
EcoBits earned: 5 EB
Message: "Good water management!"
```

**Example 3: High Consumer**
```
Monthly consumption: 25,000 liters (25 kL)
EcoBits earned: 2 EB
Message: "Keep tracking to improve!"
```

---

## 📊 Comparison: Old vs New

### Energy Bills:

**Old System:**
- Complex formula based on percentage below average
- Range: 5-30+ ecoBits
- Hard to predict rewards

**New System:**
- Simple consumption-based tiers
- Clear thresholds: 0-200, 201-400, 400+
- Easy to understand and predict

### Water Bills:

**Old System:**
- Based on efficiency score (0-100)
- Formula: 1 ecoBit per 5 efficiency points
- Range: 0-20 ecoBits

**New System:**
- Based on actual consumption
- Clear thresholds: 0-12 kL, 12-20 kL, 20+ kL
- Easier to track and improve

---

## 🎯 Benefits of New System

### 1. **Simplicity**
- Clear consumption targets
- Easy to understand
- No complex calculations

### 2. **Motivation**
- Users know exactly what to aim for
- 200 units for energy = 10 ecoBits
- 12 kL for water = 10 ecoBits

### 3. **Fairness**
- Rewards actual conservation
- Not based on averages
- Same rules for everyone

### 4. **Transparency**
- See your consumption
- Know your reward immediately
- Track progress easily

---

## 💡 Tips to Maximize EcoBits

### For Energy (Target: 0-200 units):

**Daily Actions:**
- Turn off lights when leaving rooms
- Unplug devices not in use
- Use LED bulbs
- Set AC to 24-26°C
- Use natural light during day

**Monthly Goal:**
- Stay under 200 kWh
- Earn 10 ecoBits every month!

### For Water (Target: 0-12 kL):

**Daily Actions:**
- Fix leaky taps immediately
- Take shorter showers (5 min)
- Turn off tap while brushing teeth
- Use bucket instead of hose
- Reuse water when possible

**Monthly Goal:**
- Stay under 12,000 liters
- Earn 10 ecoBits every month!

---

## 📈 Monthly Earning Potential

### Conservative User:
```
Energy: 180 units → 10 EB
Water: 10 kL → 10 EB
Total: 20 ecoBits/month from bills
```

### Moderate User:
```
Energy: 350 units → 5 EB
Water: 15 kL → 5 EB
Total: 10 ecoBits/month from bills
```

### Combined with Other Actions:
```
Energy bill: 10 EB
Water bill: 10 EB
Public transport (20 days): 100 EB
Reusable items (10 times): 20 EB
Eco products (2 times): 10 EB
Total: 150 ecoBits/month! 🎉
```

---

## 🔄 How It Works

### Energy Tracking:
1. Enter your monthly consumption (kWh)
2. System checks consumption range
3. Awards ecoBits based on tier
4. Shows your achievement level

### Water Tracking:
1. Enter your monthly consumption (liters)
2. System converts to kiloliters
3. Awards ecoBits based on tier
4. Shows your achievement level

---

## 🎨 User Feedback Messages

### Energy:

**0-200 units (10 EB):**
```
🌟 Excellent! You're an energy-saving champion!
You earned 10 ecoBits for keeping consumption under 200 units.
```

**201-400 units (5 EB):**
```
👍 Good job! You're managing energy well.
You earned 5 ecoBits. Try to reduce to under 200 units for 10 ecoBits!
```

**Above 400 units (2 EB):**
```
📊 Thanks for tracking! You earned 2 ecoBits.
Tip: Reduce consumption to under 400 units to earn 5 ecoBits.
```

### Water:

**0-12 kL (10 EB):**
```
💧 Amazing! You're a water conservation hero!
You earned 10 ecoBits for keeping usage under 12 kiloliters.
```

**12-20 kL (5 EB):**
```
👍 Well done! You're conserving water effectively.
You earned 5 ecoBits. Try to reduce to under 12 kL for 10 ecoBits!
```

**Above 20 kL (2 EB):**
```
📊 Thanks for tracking! You earned 2 ecoBits.
Tip: Reduce usage to under 20 kL to earn 5 ecoBits.
```

---

## 📱 Implementation

### Updated Files:
- ✅ `server/ecoBitsCalculator.ts` - New calculation logic
- ✅ `server/routes.ts` - Updated water route to use consumption

### Changes:
1. **Energy**: Simple tier-based system (0-200, 201-400, 400+)
2. **Water**: Consumption-based tiers (0-12 kL, 12-20 kL, 20+ kL)
3. **Clear thresholds**: Easy to understand and achieve

---

## 🎯 Summary

**Energy Bills:**
- 0-200 units = 10 ecoBits ⚡
- 201-400 units = 5 ecoBits
- Above 400 = 2 ecoBits

**Water Bills:**
- 0-12 kL = 10 ecoBits 💧
- 12-20 kL = 5 ecoBits
- Above 20 kL = 2 ecoBits

**Goal**: Stay in the lowest tier to maximize ecoBits! 🌟

---

**Last Updated**: November 8, 2025
**Status**: ✅ Active
**Version**: 2.0
