import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Upload, X, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react";

interface ProofUploadProps {
  achievementType: string;
  onProofSelected: (file: File | null) => void;
  selectedProof: File | null;
}

const proofTypeInfo: Record<string, { name: string; icon: string; examples: string[] }> = {
  public_transport: {
    name: "Transport Ticket",
    icon: "🎫",
    examples: ["Bus ticket", "Metro card", "Train ticket"]
  },
  carpool: {
    name: "Carpool Receipt",
    icon: "🚗",
    examples: ["Ride-share receipt", "Carpool confirmation"]
  },
  reusable_bag: {
    name: "Shopping Receipt",
    icon: "🛍️",
    examples: ["Receipt with bag discount", "Store receipt"]
  },
  water_bottle: {
    name: "Product Photo",
    icon: "💧",
    examples: ["Photo of reusable bottle", "Purchase receipt"]
  },
  eco_products: {
    name: "Product Receipt",
    icon: "🌿",
    examples: ["Eco-product receipt", "Purchase confirmation"]
  },
  general: {
    name: "Proof Document",
    icon: "📄",
    examples: ["Any relevant proof", "Photo or receipt"]
  }
};

export function ProofUpload({ achievementType, onProofSelected, selectedProof }: ProofUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const info = proofTypeInfo[achievementType] || proofTypeInfo.general;

  const handleFileSelect = (file: File) => {
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("File size must be less than 10MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only images (JPEG, PNG, WEBP) and PDF files are allowed");
      return;
    }

    onProofSelected(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const removeProof = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onProofSelected(null);
  };

  return (
    <Card className="border-2 border-dashed border-emerald-300 bg-emerald-50/50">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <div>
              <h4 className="font-semibold text-sm text-emerald-900">
                {info.icon} Upload Proof (Optional)
              </h4>
              <p className="text-xs text-emerald-600">{info.name}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs bg-white">
            +2 EB Bonus
          </Badge>
        </div>

        {!selectedProof ? (
          <>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive
                  ? "border-emerald-500 bg-emerald-100"
                  : "border-emerald-300 bg-white hover:border-emerald-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-emerald-900 mb-1">
                Drop your proof here or click to browse
              </p>
              <p className="text-xs text-emerald-600 mb-3">
                Images (JPEG, PNG, WEBP) or PDF • Max 10MB
              </p>
              <Input
                id="proof-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("proof-upload")?.click()}
                className="border-emerald-400 text-emerald-700 hover:bg-emerald-50"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-semibold mb-1">Examples of valid proof:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {info.examples.map((example, i) => (
                      <li key={i}>{example}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {previewUrl ? (
              <div className="relative rounded-lg overflow-hidden border-2 border-emerald-300">
                <img
                  src={previewUrl}
                  alt="Proof preview"
                  className="w-full max-h-48 object-contain bg-white"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 shadow-lg"
                  onClick={removeProof}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="bg-white border-2 border-emerald-300 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-900">{selectedProof.name}</p>
                      <p className="text-xs text-emerald-600">
                        {(selectedProof.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={removeProof}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-xs font-semibold text-green-800">
                  Proof uploaded! You'll earn +2 bonus ecoBits after verification
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-emerald-600">
          <AlertCircle className="w-3 h-3" />
          <span>Proof will be verified within 24 hours. EcoBits awarded after approval.</span>
        </div>
      </CardContent>
    </Card>
  );
}
