import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, Upload, CheckCircle, Clock, XCircle, AlertCircle, 
  Ticket, Receipt, ShoppingBag, Droplet, Leaf, Zap, Calendar 
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { ProofDocument } from "@shared/schema";

type ProofType = 
  | 'transport_ticket'
  | 'carpool_receipt'
  | 'shopping_receipt'
  | 'product_receipt'
  | 'energy_bill'
  | 'water_bill'
  | 'other';

const proofTypes: Array<{
  type: ProofType;
  name: string;
  icon: any;
  emoji: string;
  ecoBits: number;
  description: string;
  examples: string[];
}> = [
  {
    type: 'transport_ticket',
    name: 'Public Transport Ticket',
    icon: Ticket,
    emoji: '🎫',
    ecoBits: 5,
    description: 'Bus, train, metro, or public transport ticket',
    examples: ['Bus ticket with date', 'Metro card receipt', 'Train ticket', 'Transit pass']
  },
  {
    type: 'carpool_receipt',
    name: 'Carpool Receipt',
    icon: Receipt,
    emoji: '🚗',
    ecoBits: 5,
    description: 'Proof of carpooling or ride-sharing',
    examples: ['Ride-share app screenshot', 'Carpool confirmation', 'Shared ride receipt']
  },
  {
    type: 'shopping_receipt',
    name: 'Reusable Bag Receipt',
    icon: ShoppingBag,
    emoji: '🛍️',
    ecoBits: 2,
    description: 'Receipt showing use of reusable bags',
    examples: ['Receipt with bag discount', 'Store receipt mentioning reusable bag']
  },
  {
    type: 'product_receipt',
    name: 'Eco Product Receipt',
    icon: Leaf,
    emoji: '🌿',
    ecoBits: 5,
    description: 'Receipt for eco-friendly products',
    examples: ['Eco-product purchase receipt', 'Sustainable goods bill', 'Green product invoice']
  },
  {
    type: 'energy_bill',
    name: 'Energy Bill',
    icon: Zap,
    emoji: '⚡',
    ecoBits: 10,
    description: 'Monthly electricity or energy bill',
    examples: ['Electricity bill', 'Power bill', 'Energy usage statement']
  },
  {
    type: 'water_bill',
    name: 'Water Bill',
    icon: Droplet,
    emoji: '💧',
    ecoBits: 10,
    description: 'Monthly water usage bill',
    examples: ['Water bill', 'Utility bill (water section)', 'Water usage statement']
  },
  {
    type: 'other',
    name: 'Other Proof',
    icon: FileText,
    emoji: '📄',
    ecoBits: 1,
    description: 'Any other proof of eco-friendly action',
    examples: ['Certificate', 'Confirmation email', 'Documentation']
  }
];

export default function ProofSubmission() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedType, setSelectedType] = useState<ProofType | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [metadata, setMetadata] = useState({
    date: "",
    amount: "",
    vendor: ""
  });

  const { data: proofDocuments, isLoading } = useQuery<ProofDocument[]>({
    queryKey: ["/api/proof-documents"],
  });

  const submitProof = useMutation({
    mutationFn: async () => {
      if (!selectedType || !selectedFile) {
        throw new Error("Please select proof type and file");
      }

      const formData = new FormData();
      formData.append("proof", selectedFile);
      formData.append("proofType", selectedType);
      if (description) {
        formData.append("description", description);
      }
      if (metadata.date || metadata.amount || metadata.vendor) {
        formData.append("metadata", JSON.stringify(metadata));
      }

      const response = await fetch("/api/proof-documents", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to submit proof" }));
        throw new Error(errorData.message || "Failed to submit proof");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/proof-documents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Reset form
      setSelectedType(null);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setDescription("");
      setMetadata({ date: "", amount: "", vendor: "" });

      const ecoBits = data.ecoBitsAwarded || 0;
      const isAutoApproved = data.verificationStatus === 'auto_approved';

      toast({
        title: isAutoApproved ? "Proof Approved! 🎉" : "Proof Submitted! 📄",
        description: isAutoApproved 
          ? `Your proof was auto-approved! You earned ${ecoBits} ecoBits!`
          : `Your proof is under review. You'll earn ${ecoBits} ecoBits once approved!`,
      });
    },
    onError: (error: Error) => {
      console.error("Proof submission error:", error);
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to submit proof.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit proof. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Only images (JPEG, PNG, WEBP) and PDF files are allowed",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'auto_approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'auto_approved':
        return <Badge className="bg-green-600">✓ Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600">⏳ Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600">✗ Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const selectedProofInfo = proofTypes.find(p => p.type === selectedType);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="glass-card p-6 nature-border eco-shine">
        <h1 className="text-4xl font-display font-bold mb-2 gradient-text">📄 Proof Submission</h1>
        <p className="text-emerald-200/80 text-lg">Submit bills, tickets, and receipts to verify your eco-friendly actions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Select Proof Type */}
          <Card className="glass-card nature-border">
            <CardHeader>
              <CardTitle className="gradient-text text-2xl">Step 1: Select Proof Type</CardTitle>
              <CardDescription className="text-emerald-200/70">Choose what you want to submit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {proofTypes.map((proof) => {
                  const Icon = proof.icon;
                  return (
                    <button
                      key={proof.type}
                      onClick={() => setSelectedType(proof.type)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedType === proof.type
                          ? "border-emerald-500 bg-emerald-50 shadow-lg"
                          : "border-gray-200 hover:border-emerald-300 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          selectedType === proof.type ? "bg-emerald-500" : "bg-emerald-100"
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            selectedType === proof.type ? "text-white" : "text-emerald-600"
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-sm">{proof.emoji} {proof.name}</h3>
                            <Badge variant="outline" className="text-xs">+{proof.ecoBits} EB</Badge>
                          </div>
                          <p className="text-xs text-gray-600">{proof.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Upload File */}
          {selectedType && (
            <Card className="glass-card nature-border">
              <CardHeader>
                <CardTitle className="gradient-text text-2xl">Step 2: Upload Document</CardTitle>
                <CardDescription className="text-emerald-200/70">
                  {selectedProofInfo?.emoji} {selectedProofInfo?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedFile ? (
                  <>
                    <div className="border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center bg-emerald-50/50">
                      <Upload className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                      <h3 className="font-semibold text-emerald-900 mb-2">Upload Your Proof</h3>
                      <p className="text-sm text-emerald-600 mb-4">
                        Images (JPEG, PNG, WEBP) or PDF • Max 10MB
                      </p>
                      <Input
                        id="proof-file"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById("proof-file")?.click()}
                        className="bg-gradient-to-r from-emerald-600 to-green-600"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <p className="font-semibold mb-2">Examples of valid proof:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedProofInfo?.examples.map((example, i) => (
                              <li key={i}>{example}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {previewUrl ? (
                      <div className="relative rounded-lg overflow-hidden border-2 border-emerald-300">
                        <img
                          src={previewUrl}
                          alt="Proof preview"
                          className="w-full max-h-96 object-contain bg-white"
                        />
                      </div>
                    ) : (
                      <div className="bg-white border-2 border-emerald-300 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-medium">{selectedFile.name}</p>
                            <p className="text-sm text-gray-600">
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="w-full"
                    >
                      Change File
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Additional Details */}
          {selectedFile && (
            <Card className="glass-card nature-border">
              <CardHeader>
                <CardTitle className="gradient-text text-2xl">Step 3: Additional Details (Optional)</CardTitle>
                <CardDescription className="text-emerald-200/70">
                  Provide more information for faster verification
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your eco-friendly action..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={metadata.date}
                      onChange={(e) => setMetadata({ ...metadata, date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={metadata.amount}
                      onChange={(e) => setMetadata({ ...metadata, amount: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vendor">Vendor/Store</Label>
                    <Input
                      id="vendor"
                      placeholder="Store name"
                      value={metadata.vendor}
                      onChange={(e) => setMetadata({ ...metadata, vendor: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  onClick={() => {
                    console.log("Submit button clicked", { selectedType, selectedFile: selectedFile?.name });
                    submitProof.mutate();
                  }}
                  disabled={submitProof.isPending || !selectedType || !selectedFile}
                  className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:via-green-500 hover:to-teal-500 text-white font-semibold shadow-lg text-lg py-6"
                >
                  {submitProof.isPending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Submitting...
                    </>
                  ) : (
                    `Submit & Earn ${selectedProofInfo?.ecoBits || 0} ecoBits`
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Submission History */}
        <div className="space-y-6">
          <Card className="glass-card nature-border">
            <CardHeader>
              <CardTitle className="gradient-text">Your Submissions</CardTitle>
              <CardDescription className="text-emerald-200/70">Recent proof documents</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-gray-600">Loading...</p>
              ) : proofDocuments && proofDocuments.length > 0 ? (
                <div className="space-y-3">
                  {proofDocuments.slice(0, 5).map((doc) => {
                    const proofInfo = proofTypes.find(p => p.type === doc.proofType);
                    return (
                      <div key={doc.id} className="bg-white rounded-lg p-3 border">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {proofInfo && <span className="text-lg">{proofInfo.emoji}</span>}
                            <div>
                              <p className="text-sm font-medium">{proofInfo?.name || doc.proofType}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {getStatusIcon(doc.verificationStatus)}
                        </div>
                        <div className="flex items-center justify-between">
                          {getStatusBadge(doc.verificationStatus)}
                          {doc.verificationStatus === 'approved' && (
                            <Badge variant="outline" className="text-green-600">
                              +{doc.ecoBitsAwarded} EB
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">No submissions yet</p>
                  <p className="text-xs text-gray-500 mt-1">Submit your first proof to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card nature-border bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-emerald-900 mb-1">Verification Process</p>
                  <ul className="text-emerald-700 space-y-1 text-xs">
                    <li>• Submissions reviewed within 24 hours</li>
                    <li>• EcoBits awarded after approval</li>
                    <li>• Clear photos get faster approval</li>
                    <li>• Include date for bonus ecoBits</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
