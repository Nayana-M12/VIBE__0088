// Referenced from javascript_openai blueprint
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function analyzeEnergyUsage(data: {
  month: string;
  billAmount: number;
  consumption: number;
}): Promise<{
  predictedWastage: number;
  wastagePercentage: number;
  insights: string;
}> {
  if (!openai) {
    return {
      predictedWastage: data.consumption * 0.15,
      wastagePercentage: 15,
      insights: "Switch to LED bulbs, unplug devices when not in use, and use energy-efficient appliances. (OpenAI API key not configured)",
    };
  }
  
  try {
    const prompt = `Analyze this electricity usage data and provide insights:
    
Month: ${data.month}
Bill Amount: $${data.billAmount}
Consumption: ${data.consumption} kWh

Provide a JSON response with:
1. predictedWastage (number, in kWh) - estimate how much energy is being wasted
2. wastagePercentage (number) - percentage of total consumption that's wastage
3. insights (string) - 2-3 specific, actionable tips to reduce energy consumption

Be specific and practical. Focus on the most impactful changes.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an energy efficiency expert. Analyze usage patterns and provide practical conservation tips. Respond with JSON matching the exact format requested.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      predictedWastage: result.predictedWastage || data.consumption * 0.15,
      wastagePercentage: result.wastagePercentage || 15,
      insights: result.insights || "Consider using energy-efficient appliances and LED bulbs.",
    };
  } catch (error) {
    console.error("Error analyzing energy usage:", error);
    // Fallback to simple calculation
    return {
      predictedWastage: data.consumption * 0.15,
      wastagePercentage: 15,
      insights: "Switch to LED bulbs, unplug devices when not in use, and use energy-efficient appliances.",
    };
  }
}

export async function analyzeWaterUsage(data: {
  month: string;
  billAmount: number;
  consumption: number;
}): Promise<{
  efficiencyScore: number;
  insights: string;
}> {
  if (!openai) {
    return {
      efficiencyScore: 65,
      insights: "Fix leaky faucets, take shorter showers, and install low-flow fixtures to conserve water. (OpenAI API key not configured)",
    };
  }
  
  try {
    const prompt = `Analyze this water usage data and provide insights:
    
Month: ${data.month}
Bill Amount: $${data.billAmount}
Consumption: ${data.consumption} liters

Provide a JSON response with:
1. efficiencyScore (number, 0-100) - how efficient the water usage is (100 = excellent)
2. insights (string) - 2-3 specific, actionable tips to conserve water

Be specific and practical.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a water conservation expert. Analyze usage patterns and provide practical tips. Respond with JSON matching the exact format requested.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      efficiencyScore: result.efficiencyScore || 65,
      insights: result.insights || "Fix leaky faucets, take shorter showers, and install low-flow fixtures.",
    };
  } catch (error) {
    console.error("Error analyzing water usage:", error);
    // Fallback
    return {
      efficiencyScore: 65,
      insights: "Fix leaky faucets, take shorter showers, and install low-flow fixtures to conserve water.",
    };
  }
}

export async function chatWithAdvisor(message: string): Promise<string> {
  // Mock responses for common questions (works without API key)
  const mockResponses: Record<string, string> = {
    energy: `🔋 **Your Personalized Energy Reduction Plan**

**✅ START TODAY (0-24 hours):**
1. 💡 Replace your 5 most-used bulbs with LEDs
   → Cost: $15 | Saves: $75/year | Impact: 450 kg CO2/year
2. 🔌 Unplug phone chargers, coffee makers when not in use
   → Saves: $100/year from "vampire power"
3. 🌡️ Lower thermostat to 68°F (winter) or raise to 78°F (summer)
   → Saves: 10% on heating/cooling bills
4. 🧺 Wash clothes in cold water
   → Saves: 90% of washing machine energy

**📅 THIS WEEK:**
1. Buy smart power strips for TV/computer areas ($25)
2. Clean refrigerator coils (improves efficiency 30%)
3. Close curtains at night to retain heat
4. Use microwave instead of oven when possible

**📆 THIS MONTH:**
1. Install a programmable thermostat ($50-150)
   → Saves: $180/year automatically
2. Seal air leaks around windows/doors with weatherstripping
3. Schedule a free home energy audit (check with utility company)

**🎯 LONG-TERM GOALS (3-12 months):**
1. Upgrade to ENERGY STAR appliances when replacing old ones
2. Add attic insulation (R-38 recommended)
3. Consider solar panels (30% federal tax credit available!)
   → ROI: 6-8 years | Saves: $1,000+/year

**💰 YOUR POTENTIAL SAVINGS:**
- Year 1: $300-500
- Year 5: $2,000-3,000
- Lifetime: $10,000+

**🌍 ENVIRONMENTAL IMPACT:**
- Reduce CO2 by 2-3 tons/year
- Equivalent to planting 50 trees annually!

**❓ FOLLOW-UP QUESTIONS FOR YOU:**
- Do you own or rent? (Different strategies apply)
- What's your biggest energy expense? (Heating, cooling, appliances?)
- Are you interested in solar panels?

**🎁 BONUS RESOURCES:**
- EnergyStar.gov - Find efficient appliances
- Your utility company - Free energy audits
- Database of State Incentives for Renewables (DSIRE)

**💬 Want more specific advice?** Ask me:
- "Best smart thermostats for my home"
- "How to calculate solar panel ROI"
- "Energy-efficient space heaters"`,

    water: `💧 **Your Personalized Water Conservation Plan**

**✅ START RIGHT NOW:**
1. 🚿 Set a 5-minute shower timer (use your phone!)
   → Saves: 3,650 gallons/year | $50/year
2. 🪥 Turn off tap while brushing teeth
   → Saves: 8 gallons/day = 2,920 gallons/year
3. 🔧 Check for leaks (put food coloring in toilet tank)
   → One leak wastes 3,000 gallons/year!
4. 🍽️ Scrape dishes instead of pre-rinsing
   → Saves: 6,500 gallons/year

**📅 THIS WEEK ($20-50 investment):**
1. Install low-flow showerhead ($15-30)
   → Saves: 2,700 gallons/year | $40/year
2. Add faucet aerators to all sinks ($5 each)
   → Reduces flow by 30% without noticing
3. Fix that dripping faucet (DIY or call plumber)
4. Put a bucket in shower to catch warm-up water (use for plants!)

**📆 THIS MONTH:**
1. 🌱 Water lawn early morning (5-7am) or evening
   → Reduces evaporation by 50%
2. 🧺 Only run full loads in dishwasher/washing machine
3. 🚗 Wash car at commercial car wash (uses less water)
4. 🍃 Mulch garden beds (retains moisture)

**🎯 LONG-TERM UPGRADES (3-12 months):**
1. Install dual-flush toilet ($200-400)
   → Saves: 13,000 gallons/year | $150/year
2. Replace old washing machine with ENERGY STAR model
   → Uses 33% less water
3. Install rain barrel ($50-150)
   → Free water for garden!
4. Consider drought-resistant landscaping
   → Saves: 50% of outdoor water use

**💰 YOUR POTENTIAL SAVINGS:**
- Year 1: $150-250
- Year 5: $1,000-1,500
- Lifetime: $5,000+

**🌍 ENVIRONMENTAL IMPACT:**
- Save 25,000-40,000 gallons/year
- Enough to fill a swimming pool!
- Reduce strain on local water supply

**📊 WATER USAGE BREAKDOWN:**
- Toilet: 27% (biggest opportunity!)
- Washing machine: 22%
- Shower: 17%
- Faucet: 16%
- Leaks: 14% (fix these first!)

**❓ PERSONALIZED QUESTIONS:**
- Do you have a lawn? (Outdoor water = 30% of home use)
- How many people in your household?
- Do you have old appliances (pre-2000)?

**🎁 BONUS TIPS:**
- Keep a pitcher of water in fridge (no running tap for cold water)
- Reuse pasta cooking water for plants (let it cool!)
- Install a shut-off nozzle on garden hose

**💬 Want more specific advice?** Ask me:
- "Best low-flow showerheads"
- "How to install a rain barrel"
- "Drought-resistant plants for my area"`,

    carbon: `🌍 **Your Carbon Footprint Reduction Roadmap**

**📊 AVERAGE US CARBON FOOTPRINT: 16 tons CO2/year**
**🎯 YOUR GOAL: Reduce to 8 tons (50% reduction)**

**✅ QUICK WINS (Start Today!):**

**🚗 Transportation (40% of footprint):**
1. Walk/bike for trips under 2 miles
   → Saves: 2.4 tons CO2/year | Gets you fit!
2. Carpool 2 days/week
   → Saves: 1.5 tons CO2/year | $500/year gas
3. Combine errands into one trip
   → Saves: 0.5 tons CO2/year
4. Keep tires properly inflated
   → Improves fuel efficiency 3%

**🍽️ Food (20% of footprint):**
1. Eat plant-based 3 days/week ("Meatless Monday")
   → Saves: 1.2 tons CO2/year
2. Buy local, seasonal produce
   → Reduces transportation emissions 50%
3. Reduce food waste by 50%
   → Saves: 0.8 tons CO2/year
4. Compost food scraps
   → Diverts waste from landfills

**⚡ Energy (30% of footprint):**
1. Switch to LED bulbs (all of them!)
   → Saves: 0.5 tons CO2/year
2. Unplug vampire devices
   → Saves: 0.3 tons CO2/year
3. Air dry clothes instead of dryer
   → Saves: 0.4 tons CO2/year
4. Use programmable thermostat
   → Saves: 0.6 tons CO2/year

**🛍️ Consumption (10% of footprint):**
1. Buy secondhand when possible
   → Reduces manufacturing emissions
2. Avoid fast fashion
   → Fashion = 10% of global emissions!
3. Choose products with minimal packaging
4. Repair instead of replace

**📅 30-DAY CHALLENGE:**
- Week 1: Transportation changes
- Week 2: Food changes
- Week 3: Energy changes
- Week 4: Consumption changes

**🎯 LONG-TERM GOALS (6-24 months):**

**🚙 Transportation:**
- Consider electric/hybrid vehicle (saves 4 tons/year)
- Move closer to work (if possible)
- Work from home 2+ days/week

**🏡 Home:**
- Switch to renewable energy provider (saves 3 tons/year)
- Install solar panels (saves 4 tons/year)
- Improve insulation (saves 1 ton/year)

**✈️ Travel:**
- Reduce air travel (1 round-trip flight = 1 ton CO2)
- Choose direct flights (20% less emissions)
- Offset unavoidable flights

**💰 YOUR POTENTIAL SAVINGS:**
- Year 1: $800-1,200
- Year 5: $5,000-8,000
- Plus: Better health, cleaner air!

**🌍 YOUR IMPACT:**
Following this plan, you could:
- Reduce CO2 by 6-8 tons/year
- Equivalent to:
  - Planting 150 trees
  - Taking 2 cars off the road
  - Powering 1 home with renewable energy

**❓ PERSONALIZED ASSESSMENT:**
- How far is your commute?
- How often do you eat meat?
- Do you have solar panels?
- How many flights per year?

**🎁 CARBON OFFSET OPTIONS:**
If you can't reduce further, offset remaining emissions:
- Terrapass.com
- CarbonFund.org
- Cool Effect
Cost: $10-20 per ton

**💬 Want specific guidance?** Ask me:
- "Best electric cars for 2024"
- "How to switch to renewable energy"
- "Plant-based meal planning"
- "Calculate my exact carbon footprint"`,

    products: `🛒 **Eco-Friendly Products for Your Home**

**Cleaning Products:**
1. Seventh Generation - plant-based cleaners
2. Method - biodegradable, non-toxic
3. DIY: vinegar + baking soda works great!

**Personal Care:**
1. Bamboo toothbrushes (biodegradable)
2. Reusable cotton rounds
3. Shampoo bars (zero plastic)
4. Safety razors (reduce plastic waste)

**Kitchen:**
1. Beeswax food wraps (replace plastic wrap)
2. Stainless steel straws
3. Glass food containers
4. Compostable sponges

**Home:**
1. LED bulbs (last 25x longer)
2. Reusable shopping bags
3. Water filter (avoid bottled water)
4. Smart power strips

**Where to Buy:**
- Package Free Shop
- EarthHero
- Grove Collaborative
- Local zero-waste stores

**Bonus:** Look for certifications: USDA Organic, Fair Trade, B Corp!`,

    recycle: `♻️ **Guide to Recycling and Composting**

**Recycling Basics:**
1. **Paper/Cardboard:** Clean, dry, flatten boxes
2. **Plastic:** Check numbers 1, 2, 5 (most accepted)
3. **Glass:** All colors, rinse clean
4. **Metal:** Aluminum cans, steel cans
5. **DON'T:** Plastic bags, food-soiled items, styrofoam

**Composting at Home:**

**What to Compost:**
- Fruit/vegetable scraps
- Coffee grounds, tea bags
- Eggshells
- Yard waste, leaves
- Shredded paper

**DON'T Compost:**
- Meat, dairy, oils
- Pet waste
- Diseased plants

**Easy Setup:**
1. Get a compost bin ($30-100)
2. Layer "greens" (food) and "browns" (leaves)
3. Keep moist, turn weekly
4. Ready in 2-3 months!

**Impact:**
- Diverts 30% of household waste from landfills
- Creates nutrient-rich soil
- Reduces methane emissions

**Bonus:** Many cities offer free compost bins!`,

    home: `🏡 **Make Your Home More Sustainable**

**Energy Efficiency:**
1. Seal air leaks around windows/doors
2. Add weatherstripping
3. Install ceiling fans (reduce AC use)
4. Use thermal curtains

**Water Conservation:**
1. Install low-flow fixtures
2. Fix leaks promptly
3. Add rain barrel for garden
4. Use drought-resistant landscaping

**Indoor Air Quality:**
1. Add houseplants (spider plant, snake plant)
2. Use natural cleaning products
3. Open windows for ventilation
4. Avoid VOC paints

**Renewable Energy:**
1. Solar panels (federal tax credit available)
2. Solar water heater
3. Small wind turbine (if applicable)

**Smart Home:**
1. Smart thermostat (Nest, Ecobee)
2. Smart lighting
3. Energy monitoring system
4. Smart power strips

**Expected Savings:**
- Energy: $200-500/year
- Water: $100-200/year
- Increased home value: 3-4%

**Bonus:** Many utilities offer free energy audits!`,
  };

  const lowerMessage = message.toLowerCase();
  
  // Match keywords to responses
  if (lowerMessage.includes('energy') || lowerMessage.includes('electricity') || lowerMessage.includes('power')) {
    return mockResponses.energy;
  }
  if (lowerMessage.includes('water')) {
    return mockResponses.water;
  }
  if (lowerMessage.includes('carbon') || lowerMessage.includes('footprint') || lowerMessage.includes('co2')) {
    return mockResponses.carbon;
  }
  if (lowerMessage.includes('product') || lowerMessage.includes('buy') || lowerMessage.includes('shopping')) {
    return mockResponses.products;
  }
  if (lowerMessage.includes('recycle') || lowerMessage.includes('compost') || lowerMessage.includes('waste')) {
    return mockResponses.recycle;
  }
  if (lowerMessage.includes('home') || lowerMessage.includes('house') || lowerMessage.includes('sustainable')) {
    return mockResponses.home;
  }

  // Default response with general tips
  return `🌱 **I'm here to help you live more sustainably!**

Based on your question, here are some personalized suggestions:

**🎯 Top 3 Actions I Recommend for You:**

1. **Start with Energy** 💡
   - Switch 5 bulbs to LED this week (saves $75/year)
   - Unplug devices when not in use
   - Lower thermostat by 2°F
   
2. **Reduce Water Waste** 💧
   - Take 5-minute showers (saves 3,650 gallons/year)
   - Fix any leaky faucets today
   - Install a low-flow showerhead ($20, saves $100/year)

3. **Cut Carbon Emissions** 🌍
   - Walk or bike for trips under 2 miles
   - Eat one plant-based meal per day
   - Buy local produce at farmers markets

**📊 Your Potential Impact:**
If you do all three, you could:
- Save $200-300 per year
- Reduce CO2 by 1-2 tons annually
- Save 5,000+ gallons of water

**💬 I can give you detailed advice on:**
- 🔋 **Energy efficiency** - "How can I reduce my home energy consumption?"
- 💧 **Water conservation** - "What are the best ways to save water daily?"
- 🌍 **Carbon footprint** - "How to reduce my carbon footprint?"
- 🛒 **Eco products** - "Recommend eco-friendly products for my home"
- ♻️ **Recycling & composting** - "Guide me on recycling and composting"
- 🏡 **Sustainable home** - "Make my home more sustainable"
- 🚗 **Green transportation** - "Best eco-friendly transportation options"
- 🍽️ **Sustainable food** - "How to eat more sustainably"

**🎁 Pro Tip:** Start with ONE change this week. Small steps lead to big impact!

**❓ What would you like to tackle first?** Just ask me about any topic above, and I'll give you a detailed action plan!`;
}
