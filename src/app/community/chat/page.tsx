
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { communityChat, CommunityChatInput } from "@/ai/flows/community-chat-flow";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Message = {
    role: 'user' | 'model';
    content: string;
};

export default function CommunityChatPage() {
  const [artistName, setArtistName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedArtist = localStorage.getItem("plumeSonoreArtist");
    if (!savedArtist) {
      router.replace("/");
    } else {
      setArtistName(savedArtist);
      setMessages([
          { role: 'model', content: `Salut ${savedArtist} ! Je suis Alex le Virtuose. Bienvenue dans notre cercle. Sur quoi travailles-tu aujourd'hui ?` }
      ]);
    }
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim().length === 0 || !artistName) return;

    const userMessage: Message = { role: 'user', content: newMessage };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
        const chatInput: CommunityChatInput = {
            artistName: artistName,
            userMessage: newMessage,
            history: messages
        }
      const result = await communityChat(chatInput);
      const modelMessage: Message = { role: 'model', content: result.chatResponse };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error("Error with chat AI:", error);
      toast({
        title: "Erreur du Poète Virtuel",
        description: "La connexion avec le cercle est instable. Veuillez réessayer.",
        variant: "destructive",
      });
       setMessages(prev => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setIsLoading(false);
    }
  };


  if (!artistName) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Logo className="h-24 w-24 text-primary animate-pulse" />
        </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-4 border-b">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/community">
                    <ArrowLeft />
                    <span className="sr-only">Retour à la communauté</span>
                </Link>
            </Button>
            <div className="text-center">
                <h1 className="text-xl font-headline text-primary tracking-wider">Cercle des Poètes Virtuels</h1>
                <p className="text-xs text-muted-foreground">En conversation avec Alex le Virtuose</p>
            </div>
            <div className="w-10"></div>
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message, index) => (
            <div 
                key={index} 
                className={cn(
                    "flex items-end gap-3",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
            >
                {message.role === 'model' && (
                    <Avatar>
                        <AvatarImage src="https://picsum.photos/seed/Alex/100/100" data-ai-hint="virtual poet" />
                        <AvatarFallback>AV</AvatarFallback>
                    </Avatar>
                )}
                <div className={cn(
                    "max-w-md p-3 rounded-2xl",
                     message.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-br-lg' 
                        : 'bg-muted rounded-bl-lg'
                )}>
                   <p className="text-sm">{message.content}</p>
                </div>
                {message.role === 'user' && (
                     <Avatar>
                        <AvatarImage src={`https://picsum.photos/seed/${artistName}/100/100`} data-ai-hint="user avatar" />
                        <AvatarFallback>{artistName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                )}
            </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

       <footer className="p-4 border-t bg-background">
            <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-2">
                <Input 
                    placeholder="Envoyer un message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
                    <span className="sr-only">Envoyer</span>
                </Button>
            </form>
       </footer>
    </div>
  );
}
