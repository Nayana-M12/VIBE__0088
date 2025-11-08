// Using Google Gemini AI instead of OpenAI
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
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
  if (!genAI) {
    return {
      predictedWastage: data.consumption * 0.15,
      wastagePercentage: 15,
      insights: "Switch to LED bulbs, unplug devices when not in use, and use energy-efficient appliances. (Gemini API key not configured)",
    };
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `Analyze this electricity usage data and provide insights:
    
Month: ${data.month}
Bill Amount: $${data.billAmount}
Consumption: ${data.consumption} kWh

Provide a JSON response with:
1. predictedWastage (number, in kWh) - estimate how much energy is being wasted
2. wastagePercentage (number) - percentage of total consumption that's wastage
3. insights (string) - 2-3 specific, actionable tips to reduce energy consumption

Be specific and practical. Focus on the most impactful changes. Respond ONLY with valid JSON, no markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up response - remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanText);
    
    return {
      predictedWastage: parsed.predictedWastage || data.consumption * 0.15,
      wastagePercentage: parsed.wastagePercentage || 15,
      insights: parsed.insights || "Consider using energy-efficient appliances and LED bulbs.",
    };
  } catch (error) {
    console.error("Error analyzing energy usage:", error);
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
  if (!genAI) {
    return {
      efficiencyScore: 65,
      insights: "Fix leaky faucets, take shorter showers, and install low-flow fixtures to conserve water. (Gemini API key not configured)",
    };
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const prompt = `Analyze this water usage data and provide insights:
    
Month: ${data.month}
Bill Amount: $${data.billAmount}
Consumption: ${data.consumption} liters

Provide a JSON response with:
1. efficiencyScore (number, 0-100) - how efficient the water usage is (100 = excellent)
2. insights (string) - 2-3 specific, actionable tips to conserve water

Be specific and practical. Respond ONLY with valid JSON, no markdown formatting.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(cleanText);
    
    return {
      efficiencyScore: parsed.efficiencyScore || 65,
      insights: parsed.insights || "Fix leaky faucets, take shorter showers, and install low-flow fixtures.",
    };
  } catch (error) {
    console.error("Error analyzing water usage:", error);
    return {
      efficiencyScore: 65,
      insights: "Fix leaky faucets, take shorter showers, and install low-flow fixtures to conserve water.",
    };
  }
}

export async function chatWithAdvisor(message: string): Promise<string> {
  if (!genAI) {
    return "AI Advisor is currently unavailable (Gemini API key not configured). Please add your GEMINI_API_KEY to the .env file to enable AI features.";
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    const systemPrompt = `You are an expert AI Sustainability Advisor specializing in helping people reduce their carbon footprint and live eco-friendly lives.

Your role:
- Provide SPECIFIC, ACTIONABLE advice with clear steps
- Include real numbers and statistics when relevant
- Suggest eco-friendly products and alternatives
- Explain environmental impact in simple terms
- Be encouraging and positive
- Give practical tips that can be implemented immediately
- Structure responses with bullet ecoBits or numbered lists when appropriate
- Include cost-saving benefits alongside environmental benefits

Topics you excel at:
• Carbon footprint reduction strategies
• Energy efficiency and renewable energy
• Water conservation techniques
• Sustainable transportation options
• Eco-friendly products and alternatives
• Waste reduction and recycling
• Sustainable food choices
• Green home improvements
• Composting and gardening
• Climate change education

Always provide:
1. Immediate action items (what they can do today)
2. Long-term strategies (bigger changes)
3. Expected impact (CO2 saved, money saved, etc.)
4. Additional resources or tips

User question: ${message}

Provide a helpful, detailed, and conversational response with specific actionable steps.`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    
    return text || "I'm here to help you live more sustainably! Ask me anything about reducing your environmental impact.";
  } catch (error: any) {
    console.error("Error in AI advisor chat:", error);
    console.error("Error details:", error.message);
    return `I'm having trouble connecting to the AI service. Error: ${error.message}. Please check your Gemini API key or try again later.`;
  }
}
