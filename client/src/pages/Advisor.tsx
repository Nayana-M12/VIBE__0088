import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, Send, Lightbulb, Leaf, Droplet, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const quickSuggestions = [
  { icon: Zap, text: "Reduce energy consumption", color: "chart-1" },
  { icon: Droplet, text: "Save water at home", color: "chart-2" },
  { icon: Leaf, text: "Eco-friendly products", color: "chart-1" },
  { icon: Lightbulb, text: "Sustainable lifestyle tips", color: "chart-3" },
];

export default function Advisor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI Sustainability Advisor. I'm here to help you live a more eco-friendly lifestyle. Ask me anything about reducing your carbon footprint, saving energy, conserving water, or finding sustainable products!",
    },
  ]);
  const [input, setInput] = useState("");

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/advisor/chat", { message });
      return await response.json();
    },
    onSuccess: (data: any) => {
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
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
    setInput(text);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">AI Sustainability Advisor</h1>
        <p className="text-muted-foreground">Get personalized eco-friendly recommendations powered by AI</p>
      </div>

      {/* Quick Suggestions */}
      <div className="flex flex-wrap gap-2">
        {quickSuggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleSuggestionClick(suggestion.text)}
            className="gap-2"
            data-testid={`button-suggestion-${index}`}
          >
            <suggestion.icon className="w-4 h-4" />
            {suggestion.text}
          </Button>
        ))}
      </div>

      {/* Chat Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Chat with AI Advisor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-4 max-h-[500px] overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="w-8 h-8 bg-primary">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                  data-testid={`message-${message.role}-${index}`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && user && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{user.firstName?.[0] || user.email?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Sparkles className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
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
              data-testid="input-chat-message"
            />
            <Button
              type="submit"
              disabled={!input.trim() || chatMutation.isPending}
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
