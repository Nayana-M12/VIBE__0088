/**
 * Proof Verification System
 * 
 * This module handles verification of proof documents (bills, tickets, receipts)
 * for eco-friendly actions to ensure authenticity before awarding ecoBits
 */

export type ProofType = 
  | 'transport_ticket'
  | 'carpool_receipt'
  | 'shopping_receipt'
  | 'product_receipt'
  | 'energy_bill'
  | 'water_bill'
  | 'other';

export type VerificationStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'auto_approved';

export interface ProofDocument {
  id: string;
  userId: string;
  postId?: string;
  proofType: ProofType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  verificationStatus: VerificationStatus;
  verifiedAt?: Date;
  verifiedBy?: string;
  rejectionReason?: string;
  ecoBitsAwarded: number;
  metadata?: {
    date?: string;
    amount?: number;
    vendor?: string;
    description?: string;
  };
}

/**
 * Validate proof document file
 */
export function validateProofFile(file: Express.Multer.File): { valid: boolean; error?: string } {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Check file type (images and PDFs only)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, error: 'Only images (JPEG, PNG, WEBP) and PDF files are allowed' };
  }

  return { valid: true };
}

/**
 * Auto-approve proof based on criteria
 * Returns true if proof can be auto-approved
 */
export function canAutoApprove(proofType: ProofType, userId: string, userHistory?: any): boolean {
  // Auto-approve for trusted users (users with good history)
  if (userHistory?.approvalRate > 0.9 && userHistory?.totalSubmissions > 10) {
    return true;
  }

  // Auto-approve certain proof types that are easy to verify
  const autoApproveTypes: ProofType[] = ['energy_bill', 'water_bill'];
  if (autoApproveTypes.includes(proofType)) {
    return true;
  }

  // For new users or sensitive proof types, require manual verification
  return false;
}

/**
 * Calculate ecoBits based on proof type and verification
 */
export function calculateProofEcoBits(proofType: ProofType, metadata?: any): number {
  const baseRewards: Record<ProofType, number> = {
    transport_ticket: 5,
    carpool_receipt: 5,
    shopping_receipt: 2,
    product_receipt: 5,
    energy_bill: 10,
    water_bill: 10,
    other: 1
  };

  let ecoBits = baseRewards[proofType] || 1;

  // Bonus for verified metadata
  if (metadata?.amount && metadata.amount > 0) {
    ecoBits += 2; // Bonus for providing amount
  }

  if (metadata?.date) {
    ecoBits += 1; // Bonus for providing date
  }

  return ecoBits;
}

/**
 * Get proof type display information
 */
export function getProofTypeInfo(proofType: ProofType): { 
  name: string; 
  icon: string; 
  description: string;
  examples: string[];
} {
  const info: Record<ProofType, any> = {
    transport_ticket: {
      name: 'Transport Ticket',
      icon: '🎫',
      description: 'Bus, train, metro, or public transport ticket',
      examples: ['Bus ticket', 'Metro card receipt', 'Train ticket', 'Transit pass']
    },
    carpool_receipt: {
      name: 'Carpool Receipt',
      icon: '🚗',
      description: 'Proof of carpooling or ride-sharing',
      examples: ['Ride-share receipt', 'Carpool app screenshot', 'Shared ride confirmation']
    },
    shopping_receipt: {
      name: 'Shopping Receipt',
      icon: '🛍️',
      description: 'Receipt showing use of reusable bags',
      examples: ['Store receipt with bag discount', 'Receipt mentioning reusable bag', 'Shopping bill']
    },
    product_receipt: {
      name: 'Product Receipt',
      icon: '🌿',
      description: 'Receipt for eco-friendly products',
      examples: ['Eco-product purchase', 'Sustainable goods receipt', 'Green product bill']
    },
    energy_bill: {
      name: 'Energy Bill',
      icon: '⚡',
      description: 'Monthly electricity or energy bill',
      examples: ['Electricity bill', 'Power bill', 'Energy statement']
    },
    water_bill: {
      name: 'Water Bill',
      icon: '💧',
      description: 'Monthly water usage bill',
      examples: ['Water bill', 'Utility bill (water)', 'Water usage statement']
    },
    other: {
      name: 'Other Proof',
      icon: '📄',
      description: 'Any other proof of eco-friendly action',
      examples: ['Certificate', 'Confirmation', 'Documentation']
    }
  };

  return info[proofType] || info.other;
}

/**
 * Extract metadata from proof document (basic implementation)
 * In production, this could use OCR or AI to extract information
 */
export function extractProofMetadata(file: Express.Multer.File, proofType: ProofType): any {
  // Basic metadata extraction
  const metadata: any = {
    fileName: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
    uploadDate: new Date().toISOString()
  };

  // In a real implementation, you would use OCR or AI here
  // For now, we'll return basic metadata
  return metadata;
}

/**
 * Verify proof document authenticity (placeholder for AI/ML verification)
 */
export async function verifyProofAuthenticity(fileUrl: string, proofType: ProofType): Promise<{
  isAuthentic: boolean;
  confidence: number;
  issues?: string[];
}> {
  // Placeholder for AI-based verification
  // In production, this would:
  // 1. Use OCR to extract text from image/PDF
  // 2. Verify date is recent
  // 3. Check for tampering
  // 4. Validate vendor/issuer
  // 5. Cross-reference with known patterns

  // For now, return a basic response
  return {
    isAuthentic: true,
    confidence: 0.85,
    issues: []
  };
}

/**
 * Get verification requirements for proof type
 */
export function getVerificationRequirements(proofType: ProofType): {
  required: string[];
  optional: string[];
  tips: string[];
} {
  const requirements: Record<ProofType, any> = {
    transport_ticket: {
      required: ['Clear photo of ticket', 'Date visible', 'Route/destination visible'],
      optional: ['Ticket number', 'Price'],
      tips: [
        'Take photo in good lighting',
        'Ensure all text is readable',
        'Include full ticket, not cropped'
      ]
    },
    carpool_receipt: {
      required: ['Ride confirmation', 'Date and time', 'Shared ride indicator'],
      optional: ['Number of passengers', 'Route'],
      tips: [
        'Screenshot from ride-share app works',
        'Show "shared ride" or "carpool" label',
        'Include date and time'
      ]
    },
    shopping_receipt: {
      required: ['Store name', 'Date', 'Reusable bag mention or discount'],
      optional: ['Total amount', 'Items purchased'],
      tips: [
        'Highlight reusable bag line',
        'Ensure date is visible',
        'Full receipt preferred'
      ]
    },
    product_receipt: {
      required: ['Product name', 'Eco-friendly label', 'Date'],
      optional: ['Price', 'Store name'],
      tips: [
        'Show eco-friendly certification',
        'Include product details',
        'Clear photo of receipt'
      ]
    },
    energy_bill: {
      required: ['Utility company name', 'Billing period', 'Consumption amount'],
      optional: ['Account number (can be hidden)', 'Charges'],
      tips: [
        'You can hide personal info',
        'Show consumption in kWh',
        'Include billing month'
      ]
    },
    water_bill: {
      required: ['Utility company name', 'Billing period', 'Usage amount'],
      optional: ['Account number (can be hidden)', 'Charges'],
      tips: [
        'You can hide personal info',
        'Show usage in liters/gallons',
        'Include billing month'
      ]
    },
    other: {
      required: ['Clear documentation', 'Date', 'Description of eco-action'],
      optional: ['Issuer/vendor', 'Amount'],
      tips: [
        'Provide context in description',
        'Ensure document is legible',
        'Include relevant details'
      ]
    }
  };

  return requirements[proofType] || requirements.other;
}
