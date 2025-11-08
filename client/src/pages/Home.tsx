import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Leaf, Droplet, Zap, Heart, MessageCircle, UserPlus, Image as ImageIcon, Video, X, Trash2, Edit, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Post, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ProofUpload } from "@/components/ProofUpload";

type PostWithUser = Post & { user: User };

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [postContent, setPostContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [achievementType, setAchievementType] = useState("general");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const { data: posts, isLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts"],
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 50MB for videos, 10MB for images)
      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: file.type.startsWith('video/') 
            ? "Please select a video smaller than 50MB" 
            : "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const createPost = useMutation({
    mutationFn: async (content: string) => {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("achievementType", achievementType);
      
      if (selectedFile) {
        formData.append("media", selectedFile);
      }
      
      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to create post");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setPostContent("");
      setAchievementType("general");
      removeFile();
      
      const ecoBits = data.ecoBitsEarned || 0;
      toast({
        title: "Post shared!",
        description: ecoBits > 0 
          ? `Your achievement has been posted! You earned ${ecoBits} ecoBits! 🎉`
          : "Your sustainability achievement has been posted to the community.",
      });
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
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Welcome Header */}
      <div className="glass-card p-6 nature-border eco-shine">
        <h1 className="text-4xl font-display font-bold mb-2 gradient-text">
          Welcome back, {user?.firstName || "there"}! 🌿
        </h1>
        <p className="text-emerald-200/80 text-lg">Share your sustainability achievements with the community</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Leaf className="w-5 h-5" />}
          label="Total EcoBits"
          value={user?.ecoBits || 0}
          color="primary"
        />
        <StatCard
          icon={<Leaf className="w-5 h-5" />}
          label="Carbon Saved"
          value={`${(user?.totalCarbonSaved || 0).toFixed(1)} kg`}
          color="primary"
        />
        <StatCard
          icon={<Droplet className="w-5 h-5" />}
          label="Water Saved"
          value={`${(user?.totalWaterSaved || 0).toFixed(0)} L`}
          color="primary"
        />
        <StatCard
          icon={<Zap className="w-5 h-5" />}
          label="Eco Actions"
          value={posts?.length || 0}
          color="primary"
        />
      </div>

      {/* Post Eco-Friendly Achievement */}
      <Card className="glass-card nature-border overflow-hidden relative leaf-pattern">
        <div className="absolute inset-0 nature-gradient pointer-events-none"></div>
        <CardHeader className="relative">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white shadow-lg pulse-glow leaf-float">
              <Leaf className="w-7 h-7" />
            </div>
            <div>
              <CardTitle className="text-2xl gradient-text font-bold">Post Your Eco-Friendly Achievement</CardTitle>
              <p className="text-sm text-emerald-200/70">Share your sustainable actions with the community</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* Achievement Type Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-emerald-700">What did you do? 🌟</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setAchievementType("public_transport")}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    achievementType === "public_transport"
                      ? "border-emerald-500 bg-emerald-50 shadow-md"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="text-2xl mb-1">🚌</div>
                  <div className="text-xs font-medium">Public Transport</div>
                  <div className="text-xs text-emerald-600 font-bold">+5 EB</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setAchievementType("carpool")}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    achievementType === "carpool"
                      ? "border-emerald-500 bg-emerald-50 shadow-md"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="text-2xl mb-1">🚗</div>
                  <div className="text-xs font-medium">Carpooling</div>
                  <div className="text-xs text-emerald-600 font-bold">+5 EB</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setAchievementType("reusable_bag")}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    achievementType === "reusable_bag"
                      ? "border-emerald-500 bg-emerald-50 shadow-md"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="text-2xl mb-1">🛍️</div>
                  <div className="text-xs font-medium">Reusable Bag</div>
                  <div className="text-xs text-emerald-600 font-bold">+2 EB</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setAchievementType("water_bottle")}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    achievementType === "water_bottle"
                      ? "border-emerald-500 bg-emerald-50 shadow-md"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="text-2xl mb-1">💧</div>
                  <div className="text-xs font-medium">Reusable Bottle</div>
                  <div className="text-xs text-emerald-600 font-bold">+2 EB</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setAchievementType("eco_products")}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    achievementType === "eco_products"
                      ? "border-emerald-500 bg-emerald-50 shadow-md"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="text-2xl mb-1">🌿</div>
                  <div className="text-xs font-medium">Eco Products</div>
                  <div className="text-xs text-emerald-600 font-bold">+5 EB</div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setAchievementType("general")}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    achievementType === "general"
                      ? "border-emerald-500 bg-emerald-50 shadow-md"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="text-2xl mb-1">🌱</div>
                  <div className="text-xs font-medium">Other</div>
                  <div className="text-xs text-emerald-600 font-bold">+1 EB</div>
                </button>
              </div>
            </div>
            
            <Textarea
              placeholder="Share your eco-friendly achievement! Tell us what you did and inspire others..."
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-[100px] resize-none"
              data-testid="input-post-content"
            />
            
            {/* File Preview */}
            {previewUrl && (
              <div className="relative rounded-lg overflow-hidden border bg-muted">
                {selectedFile?.type.startsWith("image/") ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full max-h-96 object-contain"
                  />
                ) : selectedFile?.type.startsWith("video/") ? (
                  <video 
                    src={previewUrl} 
                    controls 
                    className="w-full max-h-96 object-contain"
                  />
                ) : null}
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 shadow-lg"
                  onClick={removeFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">🌱 Sustainability</Badge>
              <Badge variant="outline" className="text-xs">♻️ Eco-Friendly</Badge>
              <Badge variant="outline" className="text-xs">🌍 Green Living</Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Input
                id="video-upload"
                type="file"
                accept="video/mp4,video/mov,video/avi,video/webm"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("image-upload")?.click()}
                disabled={!!selectedFile}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Image
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("video-upload")?.click()}
                disabled={!!selectedFile}
              >
                <Video className="w-4 h-4 mr-2" />
                Video
              </Button>
              <p className="text-xs text-muted-foreground hidden sm:block">
                💡 Add photos or videos of your achievement!
              </p>
            </div>
            <Button
              onClick={() => createPost.mutate(postContent)}
              disabled={(!postContent.trim() && !selectedFile) || createPost.isPending}
              className="relative bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-500 hover:via-green-500 hover:to-teal-500 text-white font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-sm border-2 border-emerald-400/40 eco-shine organic-shadow px-8 py-3 text-base"
              data-testid="button-create-post"
            >
              <span className="relative z-10 flex items-center gap-2">
                {createPost.isPending ? "Posting..." : "🌱 Post Achievement"}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Community Feed */}
      <div>
        <h2 className="text-2xl font-display font-semibold mb-4">Community Feed</h2>
        <div className="space-y-4">
          {isLoading ? (
            <>
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </>
          ) : posts && posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No posts yet. Be the first to share your sustainability journey!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <Card className="glass-card nature-border hover:border-emerald-400/60 transition-all duration-300 group organic-shadow">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/30 via-green-500/20 to-teal-500/30 backdrop-blur-sm shadow-lg group-hover:shadow-xl transition-all duration-300 pulse-glow">
            <div className="text-emerald-400 group-hover:text-emerald-300 transition-colors">
              {icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-emerald-200/60 font-medium uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold truncate gradient-text" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PostCard({ post }: { post: PostWithUser }) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const { data: likeData } = useQuery({
    queryKey: [`/api/posts/${post.id}/likes`],
  });

  const { data: comments } = useQuery({
    queryKey: [`/api/posts/${post.id}/comments`],
    enabled: showComments,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${post.id}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/likes`] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/posts/${post.id}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
      setCommentContent("");
      toast({
        title: "Comment posted!",
        description: "Your comment has been added.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update post");
      }
      
      return response.json();
    },
    onSuccess: async () => {
      await queryClient.refetchQueries({ queryKey: ["/api/posts"] });
      setIsEditing(false);
      toast({
        title: "Post updated",
        description: "Your post has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      console.error("Edit error:", error);
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to update post",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to delete post");
      }
      
      return response.json();
    },
    onSuccess: async () => {
      // Force refetch of posts
      await queryClient.refetchQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post deleted",
        description: "Your post has been removed.",
      });
    },
    onError: (error: Error) => {
      console.error("Delete error:", error);
      if (isUnauthorizedError(error)) {
        window.location.href = "/api/login";
        return;
      }
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="glass-card nature-border hover:border-emerald-400/50 leaf-pattern" data-testid={`card-post-${post.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={post.user.profileImageUrl || undefined} alt={post.user.firstName || "User"} className="object-cover" />
            <AvatarFallback>{post.user.firstName?.[0] || post.user.email?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">
                  {post.user.firstName && post.user.lastName
                    ? `${post.user.firstName} ${post.user.lastName}`
                    : post.user.email}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {post.achievementType}
                </Badge>
              </div>
              {currentUser && post.userId === currentUser.id && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsEditing(true);
                      setEditContent(post.content);
                    }}
                    disabled={isEditing}
                    data-testid={`button-edit-${post.id}`}
                    title="Edit post"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (window.confirm("Are you sure you want to delete this post?")) {
                        deleteMutation.mutate();
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${post.id}`}
                    title="Delete post"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {new Date(post.createdAt!).toLocaleDateString()} at {new Date(post.createdAt!).toLocaleTimeString()}
            </p>
            
            {isEditing ? (
              <div className="space-y-2 mb-4">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px] resize-none"
                  placeholder="Edit your post..."
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (editContent.trim()) {
                        editMutation.mutate(editContent);
                      }
                    }}
                    disabled={!editContent.trim() || editMutation.isPending}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500"
                  >
                    {editMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(post.content);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm mb-4 whitespace-pre-wrap">{post.content}</p>
            )}
            
            {/* Display media if available */}
            {(post as any).mediaUrl && (
              <div className="mb-4 rounded-lg overflow-hidden border bg-muted">
                {(post as any).mediaType === 'image' ? (
                  <img 
                    src={(post as any).mediaUrl} 
                    alt="Post media" 
                    className="w-full max-h-[500px] object-contain cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => window.open((post as any).mediaUrl, '_blank')}
                  />
                ) : (post as any).mediaType === 'video' ? (
                  <video 
                    src={(post as any).mediaUrl} 
                    controls 
                    className="w-full max-h-[500px] object-contain"
                  />
                ) : null}
              </div>
            )}
            
            {(post.carbonSaved || post.waterSaved || post.ecoBitsEarned) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.carbonSaved && (
                  <Badge variant="outline" className="gap-1">
                    <Leaf className="w-3 h-3" />
                    {post.carbonSaved.toFixed(1)} kg CO₂ saved
                  </Badge>
                )}
                {post.waterSaved && (
                  <Badge variant="outline" className="gap-1">
                    <Droplet className="w-3 h-3" />
                    {post.waterSaved.toFixed(0)} L saved
                  </Badge>
                )}
                {post.ecoBitsEarned && (
                  <Badge variant="outline" className="gap-1">
                    <Zap className="w-3 h-3" />
                    +{post.ecoBitsEarned} ecoBits
                  </Badge>
                )}
              </div>
            )}
            <div className="flex items-center gap-4 mb-4">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => likeMutation.mutate()}
                disabled={likeMutation.isPending}
                data-testid={`button-like-${post.id}`}
              >
                <Heart className={`w-4 h-4 ${likeData?.hasLiked ? 'fill-primary text-primary' : ''}`} />
                {likeData?.count || post.likes || 0}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => setShowComments(!showComments)}
                data-testid={`button-comments-${post.id}`}
              >
                <MessageCircle className="w-4 h-4" />
                {comments?.length || 0}
              </Button>
            </div>

            {showComments && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-3">
                  {comments && comments.length > 0 ? (
                    comments.map((comment: any) => (
                      <div key={comment.id} className="flex items-start gap-2" data-testid={`comment-${comment.id}`}>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={comment.user?.profileImageUrl || undefined} className="object-cover" />
                          <AvatarFallback className="text-xs">{comment.user?.firstName?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{comment.user?.firstName || "User"}</p>
                          <p className="text-sm text-muted-foreground">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">No comments yet</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    className="min-h-[60px] resize-none"
                    data-testid={`input-comment-${post.id}`}
                  />
                  <Button
                    onClick={() => commentMutation.mutate(commentContent)}
                    disabled={!commentContent.trim() || commentMutation.isPending}
                    data-testid={`button-submit-comment-${post.id}`}
                  >
                    {commentMutation.isPending ? "Posting..." : "Post"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PostSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
