// Referenced from javascript_openai blueprint
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeEnergyUsage(data: {
  month: string;
  billAmount: number;
  consumption: number;
}): Promise<{
  predictedWastage: number;
  wastagePercentage: number;
  insights: string;
}> {
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
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an AI sustainability advisor helping users live more eco-friendly lives. Provide practical, actionable advice about reducing carbon footprint, saving energy, conserving water, and finding sustainable products. Be encouraging and specific.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_completion_tokens: 500,
    });

    return response.choices[0].message.content || "I'm here to help you live more sustainably! Ask me anything about reducing your environmental impact.";
  } catch (error) {
    console.error("Error in AI advisor chat:", error);
    return "I'm having trouble connecting right now, but I'm here to help you with sustainability tips! Try asking about energy savings, water conservation, or eco-friendly products.";
  }
}
