import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Send, Lightbulb, Leaf, Droplet, Zap, Recycle, TreePine, Home, ShoppingBag } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const quickSuggestions = [
  { icon: Zap, text: "How can I reduce my home energy consumption?", category: "Energy", color: "bg-yellow-500" },
  { icon: Droplet, text: "What are the best ways to save water daily?", category: "Water", color: "bg-blue-500" },
  { icon: Leaf, text: "Recommend eco-friendly products for my home", category: "Products", color: "bg-green-500" },
  { icon: TreePine, text: "How to reduce my carbon footprint?", category: "Carbon", color: "bg-emerald-600" },
  { icon: Recycle, text: "Guide me on recycling and composting", category: "Waste", color: "bg-teal-500" },
  { icon: Home, text: "Make my home more sustainable", category: "Home", color: "bg-orange-500" },
];

const topicCards = [
  {
    title: "🌍 Carbon Footprint",
    icon: Leaf,
    color: "border-green-500",
    suggestions: [
      "Calculate my carbon footprint",
      "How to offset my carbon emissions?",
      "Best ways to reduce CO2 at home",
      "Carbon-neutral transportation options",
    ],
  },
  {
    title: "⚡ Energy Efficiency",
    icon: Zap,
    color: "border-yellow-500",
    suggestions: [
      "Energy-efficient appliances recommendations",
      "Solar panel installation guide",
      "Smart home energy-saving tips",
      "LED vs traditional bulbs comparison",
    ],
  },
  {
    title: "💧 Water Conservation",
    icon: Droplet,
    color: "border-blue-500",
    suggestions: [
      "Install low-flow fixtures guide",
      "Rainwater harvesting tips",
      "Fix water leaks checklist",
      "Greywater recycling at home",
    ],
  },
  {
    title: "♻️ Sustainable Living",
    icon: Recycle,
    color: "border-teal-500",
    suggestions: [
      "Zero waste lifestyle guide",
      "Composting at home tips",
      "Sustainable shopping habits",
      "Reduce plastic usage ideas",
    ],
  },
  {
    title: "🛒 Eco Products",
    icon: ShoppingBag,
    color: "border-purple-500",
    suggestions: [
      "Best eco-friendly cleaning products",
      "Sustainable fashion brands",
      "Biodegradable alternatives",
      "Green beauty products",
    ],
  },
  {
    title: "🏡 Green Home",
    icon: Home,
    color: "border-orange-500",
    suggestions: [
      "Indoor plants for air quality",
      "Natural insulation methods",
      "Eco-friendly home renovations",
      "Green building materials",
    ],
  },
];

export default function Advisor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello${user?.firstName ? ` ${user.firstName}` : ''}! 🌱 I'm your AI Sustainability Advisor. I'm here to help you live a more eco-friendly lifestyle.\n\nI can help you with:\n• Reducing your carbon footprint\n• Saving energy and water\n• Finding sustainable products\n• Creating eco-friendly habits\n• Understanding environmental impact\n\nWhat would you like to know today?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [showTopics, setShowTopics] = useState(true);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/advisor/chat", { message });
      return await response.json();
    },
    onSuccess: (data: any) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      setShowTopics(false);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    chatMutation.mutate(userMessage);
  };

  const handleSuggestionClick = (text: string) => {
    setMessages(prev => [...prev, { role: "user", content: text }]);
    chatMutation.mutate(text);
    setShowTopics(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="glass-card p-6 nature-border eco-shine text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 shadow-lg pulse-glow leaf-float">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-display font-bold mb-2 gradient-text">AI Sustainability Advisor</h1>
        <p className="text-emerald-200/80 text-lg">Get personalized eco-friendly recommendations powered by AI</p>
      </div>

      {/* Quick Action Chips */}
      <div className="flex flex-wrap gap-3 justify-center">
        {quickSuggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleSuggestionClick(suggestion.text)}
            className="gap-2 glass-card nature-border hover:border-emerald-400/60 hover:scale-105 transition-all duration-300 px-4 py-2"
            data-testid={`button-suggestion-${index}`}
          >
            <suggestion.icon className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline text-emerald-200">{suggestion.text}</span>
            <span className="sm:hidden text-emerald-200">{suggestion.category}</span>
          </Button>
        ))}
      </div>

      {/* Topic Cards - Show before first message */}
      {showTopics && messages.length === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topicCards.map((topic, index) => (
            <Card key={index} className="glass-card nature-border hover:border-emerald-400/60 transition-all duration-300 leaf-pattern">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 via-green-500/20 to-teal-500/30 pulse-glow">
                    <topic.icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="gradient-text">{topic.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {topic.suggestions.map((suggestion, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2 px-3"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className="text-sm">{suggestion}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Chat Messages */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-green-600" />
            Chat with AI Advisor
          </CardTitle>
          <CardDescription>
            Ask me anything about sustainability, carbon reduction, and eco-friendly living
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto pr-2">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 flex-shrink-0">
                    <AvatarFallback className="bg-transparent text-white">
                      <Sparkles className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-md"
                      : "bg-muted shadow-sm"
                  }`}
                  data-testid={`message-${message.role}-${index}`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
                {message.role === "user" && user && (
                  <Avatar className="w-10 h-10 flex-shrink-0 bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {user.firstName?.[0] || user.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600">
                  <AvatarFallback className="bg-transparent text-white">
                    <Sparkles className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-2xl p-4 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
            <Input
              placeholder="Ask me anything about sustainability..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={chatMutation.isPending}
              className="flex-1"
              data-testid="input-chat-message"
            />
            <Button
              type="submit"
              disabled={!input.trim() || chatMutation.isPending}
              className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800"
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          {/* Tips */}
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Lightbulb className="w-4 h-4" />
            <span>Tip: Be specific in your questions for better personalized advice!</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
