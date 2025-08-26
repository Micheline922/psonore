
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle, MessageSquarePlus, PlusCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import CommunityPost from "@/components/community-post";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { generateCommunityFeedback } from "@/ai/flows/generate-community-feedback-flow";

// Mock Data
const initialPosts = [
  {
    id: 1,
    author: "MC Flow",
    avatarUrl: "https://picsum.photos/100/100?random=4",
    content: "La nuit tombe, le bitume luit, sous la lune, mon esprit s'enfuit. Chaque vers est une étincelle, une histoire qui se révèle.",
    likes: 15,
    comments: [
      { id: 1, author: "Poète Anonyme", text: "Profond !" },
      { id: 2, author: "SlamMaster", text: "J'adore la dernière rime." },
    ],
    timestamp: "Il y a 2 heures",
  },
  {
    id: 2,
    author: "Lady Sonnet",
    avatarUrl: "https://picsum.photos/100/100?random=5",
    content: "Un murmure dans le vent, une plume légère, des mots qui dansent et qui espèrent. Le romantisme n'est pas mort, il vit dans chaque accord.",
    likes: 28,
    comments: [],
    timestamp: "Il y a 5 heures",
  },
    {
    id: 3,
    author: "Critique Social",
    avatarUrl: "https://picsum.photos/100/100?random=6",
    content: "Le béton crie, le silence ment. On marche en file, on suit le vent. Mais ma voix s'élève, brise la trêve, pour un monde où le peuple se relève.",
    likes: 42,
    comments: [
        {id: 3, author: "Revolte_Verbale", text: "Puissant. Nécessaire."},
        {id: 4, author: "MC Flow", text: "Respect frérot."},
        {id: 5, author: "Observateur", text: "Ça fait réfléchir..."}
    ],
    timestamp: "Il y a 1 jour",
  },
  {
    id: 4,
    author: "Rimeur Nocturne",
    avatarUrl: "https://picsum.photos/100/100?random=7",
    content: "Quand les ombres dansent et que la ville dort, mes rimes s'éveillent et prennent leur essor. La poésie est mon phare dans le noir.",
    likes: 22,
    comments: [{ id: 6, author: "Lady Sonnet", text: "Superbe image !" }],
    timestamp: "Il y a 2 jours",
  },
  {
    id: 5,
    author: "Plume Agile",
    avatarUrl: "https://picsum.photos/100/100?random=8",
    content: "Des mots comme des flèches, précis et vifs. Je peins la réalité sans artifices. Le quotidien est ma toile, ma source d'inspiration.",
    likes: 31,
    comments: [],
    timestamp: "Il y a 2 jours",
  },
  {
    id: 6,
    author: "Echo Lyrique",
    avatarUrl: "https://picsum.photos/100/100?random=9",
    content: "Mon âme est une harpe, mes vers en sont les cordes. Chaque émotion résonne et s'accorde. Je chante l'amour, la perte, et l'espoir.",
    likes: 18,
    comments: [{ id: 7, author: "Rimeur Nocturne", text: "Très touchant." }],
    timestamp: "Il y a 3 jours",
  },
  {
    id: 7,
    author: "Verse Libre",
    avatarUrl: "https://picsum.photos/100/100?random=10",
    content: "Pas de chaînes, pas de règles, juste le flot des idées. Mes pensées en cascade, brutes et débridées. La liberté est ma seule muse.",
    likes: 50,
    comments: [{ id: 8, author: "Critique Social", text: "J'aime cette énergie." }],
    timestamp: "Il y a 4 jours",
  },
  {
    id: 8,
    author: "Conteur Urbain",
    avatarUrl: "https://picsum.photos/100/100?random=11",
    content: "Les rues racontent des histoires à qui sait écouter. Je suis le traducteur des murmures du quartier. Chaque graffiti est un poème.",
    likes: 35,
    comments: [],
    timestamp: "Il y a 5 jours",
  },
  {
    id: 9,
    author: "Muse Moderne",
    avatarUrl: "https://picsum.photos/100/100?random=12",
    content: "Le néon des enseignes, le scroll infini. Je trouve la poésie dans la technologie. Nos vies numériques, un nouveau chapitre à écrire.",
    likes: 25,
    comments: [{ id: 9, author: "Plume Agile", text: "Perspective intéressante." }],
    timestamp: "Il y a 6 jours",
  },
  {
    id: 10,
    author: "Voix du Silence",
    avatarUrl: "https://picsum.photos/100/100?random=13",
    content: "Ce qui n'est pas dit pèse parfois plus lourd. Je sculpte le silence, je lui donne des contours. Mes poèmes sont des soupirs.",
    likes: 60,
    comments: [
      { id: 10, author: "Echo Lyrique", text: "Magnifique." },
      { id: 11, author: "Verse Libre", text: "Le pouvoir du vide." },
    ],
    timestamp: "Il y a 1 semaine",
  },
];


export default function CommunityPage() {
  const [artistName, setArtistName] = useState<string | null>(null);
  const [posts, setPosts] = useState(initialPosts);
  const [newPostContent, setNewPostContent] = useState("");
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const savedArtist = localStorage.getItem("plumeSonoreArtist");
    if (!savedArtist) {
      router.replace("/");
    } else {
      setArtistName(savedArtist);
    }
  }, [router]);

  const handleLike = (postId: number) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleComment = (postId: number, commentText: string) => {
    if (!artistName) return;
    const newComment = { id: Date.now(), author: artistName, text: commentText };
    setPosts(posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p));
  };
  
  const handlePublishPost = async () => {
    if (newPostContent.trim().length < 10) {
        toast({
            title: "Publication trop courte",
            description: "Votre texte doit contenir au moins 10 caractères.",
            variant: "destructive"
        });
        return;
    }

    if(!artistName) return;
    setIsPublishing(true);

    const newPost = {
        id: Date.now(),
        author: artistName,
        avatarUrl: `https://picsum.photos/seed/${artistName}/100/100`,
        content: newPostContent,
        likes: 0,
        comments: [],
        timestamp: "À l'instant",
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
    setIsPostDialogOpen(false);
    
    toast({
        title: "Publié !",
        description: "Votre création a été partagée. L'IA génère des réactions..."
    });

    try {
      const communityArtists = initialPosts.map(p => p.author).filter(name => name !== artistName);
      const feedback = await generateCommunityFeedback({
        postContent: newPost.content,
        postAuthor: newPost.author,
        communityArtists: [...new Set(communityArtists)], // Remove duplicates
      });
      
      const generatedComments = feedback.comments.map(c => ({...c, id: Date.now() + Math.random()}));

      setPosts(currentPosts => currentPosts.map(p => 
        p.id === newPost.id ? { ...p, comments: generatedComments } : p
      ));
      
      toast({
          title: "Nouvelles réactions !",
          description: "La communauté a réagi à votre publication."
      });

    } catch (error) {
        console.error("Error generating community feedback:", error);
        toast({
            title: "Erreur de l'IA",
            description: "Impossible de générer les réactions de la communauté.",
            variant: "destructive"
        });
    } finally {
        setIsPublishing(false);
    }
  }

  if (!artistName) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Logo className="h-24 w-24 text-primary animate-pulse" />
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-4 border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/studio">
                    <ArrowLeft />
                    <span className="sr-only">Retour au studio</span>
                </Link>
            </Button>
            <h1 className="text-2xl font-headline text-primary tracking-wider text-center">Communauté</h1>
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/community/chat">
                        <MessageSquarePlus />
                        <span className="sr-only">Chat</span>
                    </Link>
                </Button>
                <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <PlusCircle />
                            <span className="sr-only">Publier</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                        <DialogTitle className="font-headline text-2xl">Nouvelle Publication</DialogTitle>
                        <DialogDescription>
                            Partagez votre dernière création avec la communauté.
                        </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid w-full gap-1.5">
                                <Label htmlFor="message">Votre texte</Label>
                                <Textarea 
                                    placeholder="Écrivez votre texte ici..." 
                                    id="message"
                                    value={newPostContent}
                                    onChange={e => setNewPostContent(e.target.value)}
                                    className="min-h-32"
                                    disabled={isPublishing}
                                 />
                            </div>
                        </div>
                        <DialogFooter>
                        <Button onClick={handlePublishPost} className="bg-accent hover:bg-accent/90" disabled={isPublishing}>
                            {isPublishing ? <Loader2 className="animate-spin" /> : "Publier"}
                        </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
             </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {posts.length > 0 ? (
            posts.map(post => (
                <CommunityPost 
                    key={post.id} 
                    post={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    currentArtist={artistName}
                />
            ))
        ) : (
             <Card className="text-center p-8 border-dashed">
                <CardHeader>
                    <CardTitle className="flex justify-center items-center gap-2 font-headline text-2xl">
                        <MessageCircle className="text-muted-foreground"/>
                        Le silence...
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <CardDescription>
                        Aucune publication pour le moment. Soyez le premier à partager votre talent !
                    </CardDescription>
                </CardContent>
            </Card>
        )}
      </main>
    </div>
  );
}
