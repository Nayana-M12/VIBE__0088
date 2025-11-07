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
import { Leaf, Droplet, Zap, Heart, MessageCircle, UserPlus } from "lucide-react";
import type { Post, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

type PostWithUser = Post & { user: User };

export default function Home() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [postContent, setPostContent] = useState("");

  const { data: posts, isLoading } = useQuery<PostWithUser[]>({
    queryKey: ["/api/posts"],
  });

  const createPost = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/posts", {
        content,
        achievementType: "general",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setPostContent("");
      toast({
        title: "Post shared!",
        description: "Your sustainability update has been posted to the community.",
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
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">
          Welcome back, {user?.firstName || "there"}!
        </h1>
        <p className="text-muted-foreground">Share your sustainability achievements with the community</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Leaf className="w-5 h-5" />}
          label="Total Points"
          value={user?.points || 0}
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

      {/* Create Post */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Share Your Impact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="What eco-friendly action did you take today?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="min-h-[100px] resize-none"
            data-testid="input-post-content"
          />
          <div className="flex justify-end">
            <Button
              onClick={() => createPost.mutate(postContent)}
              disabled={!postContent.trim() || createPost.isPending}
              data-testid="button-create-post"
            >
              {createPost.isPending ? "Posting..." : "Share"}
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
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-${color}/10 text-${color}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-lg font-semibold truncate" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>{value}</p>
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

  return (
    <Card className="hover-elevate" data-testid={`card-post-${post.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={post.user.profileImageUrl || undefined} alt={post.user.firstName || "User"} className="object-cover" />
            <AvatarFallback>{post.user.firstName?.[0] || post.user.email?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold">
                {post.user.firstName && post.user.lastName
                  ? `${post.user.firstName} ${post.user.lastName}`
                  : post.user.email}
              </p>
              <Badge variant="secondary" className="text-xs">
                {post.achievementType}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {new Date(post.createdAt!).toLocaleDateString()} at {new Date(post.createdAt!).toLocaleTimeString()}
            </p>
            <p className="text-sm mb-4">{post.content}</p>
            {(post.carbonSaved || post.waterSaved || post.pointsEarned) && (
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
                {post.pointsEarned && (
                  <Badge variant="outline" className="gap-1">
                    <Zap className="w-3 h-3" />
                    +{post.pointsEarned} points
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
