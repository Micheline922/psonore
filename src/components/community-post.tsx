
"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Heart, MessageSquare, Send } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

type Comment = {
  id: number;
  author: string;
  text: string;
};

type Post = {
  id: number;
  author: string;
  avatarUrl: string;
  content: string;
  likes: number;
  comments: Comment[];
  timestamp: string;
};

type CommunityPostProps = {
  post: Post;
  onLike: (postId: number) => void;
  onComment: (postId: number, commentText: string) => void;
  currentArtist: string | null;
};

export default function CommunityPost({ post, onLike, onComment, currentArtist }: CommunityPostProps) {
  const [commentText, setCommentText] = useState("");
  const { toast } = useToast();

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText("");
      toast({
        title: "Commentaire ajouté !",
      });
    }
  };

  return (
    <Card className="w-full shadow-lg border-primary/20">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={post.avatarUrl} data-ai-hint="artist portrait" />
          <AvatarFallback>{post.author.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="font-bold text-primary">{post.author}</p>
          <p className="text-xs text-muted-foreground">{post.timestamp}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap font-body text-foreground/90">{post.content}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4">
        <div className="flex items-center gap-4 text-muted-foreground">
          <Button variant="ghost" size="sm" onClick={() => onLike(post.id)} className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-accent" />
            <span>{post.likes}</span>
          </Button>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <span>{post.comments.length}</span>
          </div>
        </div>
        
        <Separator />

        <div className="w-full space-y-3">
            {post.comments.map(comment => (
                <div key={comment.id} className="text-sm flex items-start gap-2">
                    <span className="font-semibold text-primary/90">{comment.author}:</span>
                    <p className="text-muted-foreground flex-1">{comment.text}</p>
                </div>
            ))}
        </div>

        <form onSubmit={handleCommentSubmit} className="w-full flex items-center gap-2">
          <Input 
            placeholder="Ajouter un commentaire..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Button type="submit" size="icon" variant="ghost">
            <Send className="h-5 w-5 text-accent" />
            <span className="sr-only">Envoyer</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
