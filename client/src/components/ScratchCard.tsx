import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface ScratchCardProps {
  prize: string;
  onComplete: () => void;
  cardName: string;
}

export function ScratchCard({ prize, onComplete, cardName }: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2; // Higher resolution
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Draw metallic scratch-off layer with gradient
    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, "#c0c0c0");
    gradient.addColorStop(0.25, "#e8e8e8");
    gradient.addColorStop(0.5, "#a8a8a8");
    gradient.addColorStop(0.75, "#d0d0d0");
    gradient.addColorStop(1, "#b0b0b0");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Add metallic shine effect
    const shineGradient = ctx.createLinearGradient(0, 0, rect.width, 0);
    shineGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    shineGradient.addColorStop(0.4, "rgba(255, 255, 255, 0)");
    shineGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.3)");
    shineGradient.addColorStop(0.6, "rgba(255, 255, 255, 0)");
    shineGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = shineGradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Add texture pattern for realistic scratch surface
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const size = Math.random() * 3;
      ctx.fillRect(x, y, size, size);
    }

    // Add darker spots for depth
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;
      const size = Math.random() * 2;
      ctx.fillRect(x, y, size, size);
    }

    // Add border shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(5, 5, rect.width - 10, rect.height - 10);
    ctx.shadowBlur = 0;

    // Add "SCRATCH HERE" text with glow
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 4;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SCRATCH HERE", rect.width / 2, rect.height / 2 - 25);
    
    ctx.shadowBlur = 2;
    ctx.font = "16px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fillText("👆 Drag to reveal your prize", rect.width / 2, rect.height / 2 + 15);

    // Add decorative sparkles with glow
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
    ctx.font = "24px Arial";
    ctx.fillStyle = "#ffd700";
    ctx.fillText("✨", rect.width / 5, rect.height / 4);
    ctx.fillText("✨", (rect.width * 4) / 5, rect.height / 4);
    ctx.fillText("✨", rect.width / 5, (rect.height * 3) / 4);
    ctx.fillText("✨", (rect.width * 4) / 5, (rect.height * 3) / 4);
    
    // Add corner decorations
    ctx.font = "20px Arial";
    ctx.fillText("🎁", rect.width / 2, rect.height / 6);
    ctx.fillText("🎉", rect.width / 2, (rect.height * 5) / 6);
    
    ctx.shadowBlur = 0;
  }, []);

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.globalCompositeOperation = "destination-out";
    
    // Create a more realistic scratch effect with irregular shape
    const brushSize = 35 * scaleX;
    ctx.beginPath();
    ctx.arc(x * scaleX, y * scaleY, brushSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Add some randomness for realistic scratching
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * 10 * scaleX;
      const offsetY = (Math.random() - 0.5) * 10 * scaleY;
      const size = brushSize * (0.3 + Math.random() * 0.4);
      ctx.beginPath();
      ctx.arc(x * scaleX + offsetX, y * scaleY + offsetY, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Calculate scratch percentage
    checkScratchPercentage();
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) {
        transparent++;
      }
    }

    const percentage = (transparent / (pixels.length / 4)) * 100;
    setScratchPercentage(percentage);

    // Auto-reveal when 50% scratched
    if (percentage > 50 && !isRevealed) {
      setIsRevealed(true);
      setTimeout(() => {
        onComplete();
      }, 500);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsScratching(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      scratch(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      scratch(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const handleMouseUp = () => {
    setIsScratching(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    setIsScratching(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      scratch(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isScratching) return;
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      scratch(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
    }
  };

  const handleTouchEnd = () => {
    setIsScratching(false);
  };

  return (
    <Card className="glass-card nature-border overflow-hidden relative">
      <CardContent className="p-0">
        <div className="relative w-full h-64">
          {/* Prize underneath */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-6 overflow-hidden">
            {/* Animated background circles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-40 h-40 bg-green-200/30 rounded-full blur-2xl animate-pulse" style={{ animationDelay: "1s" }}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-teal-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
            </div>

            {/* Confetti particles */}
            {isRevealed && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full animate-confetti"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `-10px`,
                      backgroundColor: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#f59e0b'][Math.floor(Math.random() * 5)],
                      animationDelay: `${Math.random() * 0.5}s`,
                      animationDuration: `${1 + Math.random()}s`
                    }}
                  />
                ))}
              </div>
            )}

            <div className="text-center space-y-4 relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 shadow-2xl animate-bounce">
                <Sparkles className="w-12 h-12 text-white animate-spin" style={{ animationDuration: "3s" }} />
              </div>
              <div>
                <p className="text-base text-emerald-600 font-bold mb-3 animate-pulse">🎉 Congratulations! 🎉</p>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border-2 border-emerald-300">
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent animate-pulse">
                    {prize}
                  </p>
                </div>
              </div>
              <p className="text-sm text-emerald-600/80 font-medium">{cardName}</p>
              <div className="flex justify-center gap-2 text-2xl animate-bounce" style={{ animationDelay: "0.2s" }}>
                <span>🎊</span>
                <span>✨</span>
                <span>🎁</span>
              </div>
            </div>
          </div>

          {/* Scratch layer */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full touch-none scratch-cursor"
            style={{ 
              opacity: isRevealed ? 0 : 1,
              transition: "opacity 0.5s ease-out",
              cursor: isScratching ? 'grabbing' : 'grab'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />

          {/* Instruction tooltip - shows initially */}
          {scratchPercentage === 0 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg animate-bounce pointer-events-none">
              <p className="text-xs font-bold flex items-center gap-2">
                <span>👆</span>
                <span>Start scratching!</span>
              </p>
            </div>
          )}

          {/* Progress indicator */}
          {scratchPercentage > 0 && scratchPercentage < 50 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <div className="bg-white/95 backdrop-blur-sm px-5 py-2.5 rounded-full shadow-xl border-2 border-emerald-300">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${scratchPercentage * 2}%` }}
                    />
                  </div>
                  <p className="text-xs font-bold text-emerald-600">
                    {Math.round(scratchPercentage)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Almost there message */}
          {scratchPercentage >= 40 && scratchPercentage < 50 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-2 rounded-full shadow-lg animate-pulse pointer-events-none">
              <p className="text-xs font-bold">
                🎉 Almost there! Keep scratching!
              </p>
            </div>
          )}

          {/* Reveal animation */}
          {isRevealed && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" 
                   style={{ 
                     animation: "shimmer 1s ease-out",
                     backgroundSize: "200% 100%"
                   }} 
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
