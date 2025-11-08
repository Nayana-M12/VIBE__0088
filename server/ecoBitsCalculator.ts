/**
 * EcoBits Distribution System
 * 
 * This module calculates ecoBits rewards for various eco-friendly activities
 */

export type AchievementType = 
  | 'public_transport'
  | 'carpool'
  | 'reusable_bag'
  | 'water_bottle'
  | 'eco_products'
  | 'cycling'
  | 'walking'
  | 'energy_saving'
  | 'water_saving'
  | 'general';

export interface EcoBitsReward {
  ecoBits: number;
  category: string;
  description: string;
}

/**
 * Calculate ecoBits based on achievement type
 */
export function calculateEcoBitsByAchievement(achievementType: AchievementType): EcoBitsReward {
  const rewards: Record<AchievementType, EcoBitsReward> = {
    // Transportation (5 ecoBits)
    public_transport: {
      ecoBits: 5,
      category: 'Transportation',
      description: 'Used public transport instead of personal vehicle'
    },
    carpool: {
      ecoBits: 5,
      category: 'Transportation',
      description: 'Shared ride with others (carpooling)'
    },
    
    // Reusable Items (2 ecoBits)
    reusable_bag: {
      ecoBits: 2,
      category: 'Reusable Items',
      description: 'Used reusable shopping bag'
    },
    water_bottle: {
      ecoBits: 2,
      category: 'Reusable Items',
      description: 'Used reusable water bottle'
    },
    
    // Eco-Friendly Products (5 ecoBits)
    eco_products: {
      ecoBits: 5,
      category: 'Eco Products',
      description: 'Used eco-friendly products at home'
    },
    
    // Active Transportation (calculated separately based on distance)
    cycling: {
      ecoBits: 0, // Calculated based on carbon saved
      category: 'Active Transport',
      description: 'Cycled instead of driving'
    },
    walking: {
      ecoBits: 0, // Calculated based on carbon saved
      category: 'Active Transport',
      description: 'Walked instead of driving'
    },
    
    // Resource Saving (calculated separately)
    energy_saving: {
      ecoBits: 0, // Calculated based on consumption
      category: 'Energy',
      description: 'Reduced energy consumption'
    },
    water_saving: {
      ecoBits: 0, // Calculated based on efficiency
      category: 'Water',
      description: 'Efficient water usage'
    },
    
    // General
    general: {
      ecoBits: 1,
      category: 'General',
      description: 'General eco-friendly action'
    }
  };

  return rewards[achievementType] || rewards.general;
}

/**
 * Calculate ecoBits for route-based activities (cycling, walking)
 * Formula: 10 ecoBits per kg of CO2 saved
 */
export function calculateEcoBitsForRoute(carbonSaved: number, mode: 'cycling' | 'walking' | 'driving'): number {
  if (mode === 'driving') {
    return 0; // No reward for driving
  }
  
  // 10 ecoBits per kg of CO2 saved
  return Math.round(carbonSaved * 10);
}

/**
 * Calculate ecoBits for energy saving
 * Formula: 10 ecoBits if consumption is between 0-200 units (kWh)
 */
export function calculateEcoBitsForEnergy(consumption: number): number {
  // Reward 10 ecoBits for low consumption (0-200 kWh)
  if (consumption >= 0 && consumption <= 200) {
    return 10;
  }
  
  // Reward 5 ecoBits for moderate consumption (201-400 kWh)
  if (consumption <= 400) {
    return 5;
  }
  
  // Minimum reward for tracking
  return 2;
}

/**
 * Calculate ecoBits for water saving
 * Formula: 10 ecoBits if consumption is between 0-12 kiloliters (12,000 liters)
 */
export function calculateEcoBitsForWater(consumption: number): number {
  // Convert liters to kiloliters for easier comparison
  const kiloliters = consumption / 1000;
  
  // Reward 10 ecoBits for low consumption (0-12 kL)
  if (kiloliters >= 0 && kiloliters <= 12) {
    return 10;
  }
  
  // Reward 5 ecoBits for moderate consumption (12-20 kL)
  if (kiloliters <= 20) {
    return 5;
  }
  
  // Minimum reward for tracking
  return 2;
}

/**
 * Get achievement type display name
 */
export function getAchievementDisplayName(achievementType: AchievementType): string {
  const names: Record<AchievementType, string> = {
    public_transport: '🚌 Public Transport',
    carpool: '🚗 Carpooling',
    reusable_bag: '🛍️ Reusable Bag',
    water_bottle: '💧 Reusable Bottle',
    eco_products: '🌿 Eco Products',
    cycling: '🚴 Cycling',
    walking: '🚶 Walking',
    energy_saving: '⚡ Energy Saving',
    water_saving: '💧 Water Saving',
    general: '🌱 Eco Action'
  };
  
  return names[achievementType] || names.general;
}

/**
 * Get all achievement types with their rewards
 */
export function getAllAchievementTypes(): Array<{ type: AchievementType; reward: EcoBitsReward; displayName: string }> {
  const types: AchievementType[] = [
    'public_transport',
    'carpool',
    'reusable_bag',
    'water_bottle',
    'eco_products'
  ];
  
  return types.map(type => ({
    type,
    reward: calculateEcoBitsByAchievement(type),
    displayName: getAchievementDisplayName(type)
  }));
}
