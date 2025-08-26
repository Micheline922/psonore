
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Send, BookOpen, Sparkles, MessageSquareQuote } from "lucide-react";
import { artTutor, ArtTutorInput } from "@/ai/flows/art-tutor-flow";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type Message = {
    role: 'user' | 'model';
    content: string;
};

export default function AcademyPage() {
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
          { role: 'model', content: `Bonjour ${savedArtist}, je suis Maestro Plume. Bienvenue à l'Académie. Quelle est ta première question sur l'art de l'écriture ?` }
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
        const tutorInput: ArtTutorInput = {
            artistName: artistName,
            userMessage: newMessage,
            history: messages
        }
      const result = await artTutor(tutorInput);
      const modelMessage: Message = { role: 'model', content: result.tutorResponse };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error("Error with tutor AI:", error);
      toast({
        title: "Erreur du Maestro",
        description: "La connexion avec l'académie est instable. Veuillez réessayer.",
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
    <div className="min-h-screen bg-background text-foreground">
       <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm p-4 border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/studio">
                    <ArrowLeft />
                    <span className="sr-only">Retour au studio</span>
                </Link>
            </Button>
            <div className="text-center">
                <h1 className="text-xl font-headline text-primary tracking-wider">Académie Plume Sonore</h1>
                <p className="text-xs text-muted-foreground">Avec votre tuteur, Maestro Plume</p>
            </div>
            <div className="w-10"></div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
        {/* Tutor Chat */}
        <div className="md:col-span-2 flex flex-col h-[calc(100vh-120px)] bg-card rounded-lg border">
            <header className="p-4 border-b flex items-center gap-2">
                <MessageSquareQuote className="h-6 w-6 text-accent" />
                <h2 className="text-lg font-headline">Conversation avec Maestro Plume</h2>
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
                                <AvatarImage src="https://picsum.photos/seed/Maestro/100/100" data-ai-hint="wise tutor" />
                                <AvatarFallback>MP</AvatarFallback>
                            </Avatar>
                        )}
                        <div className={cn(
                            "max-w-md p-3 rounded-2xl",
                             message.role === 'user' 
                                ? 'bg-primary text-primary-foreground rounded-br-lg' 
                                : 'bg-muted rounded-bl-lg'
                        )}>
                           <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        {message.role === 'user' && (
                             <Avatar>
                                <AvatarImage src={`https://picsum.photos/seed/${artistName}/100/100`} data-ai-hint="user avatar" />
                                <AvatarFallback>{artistName.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-end gap-3 justify-start">
                        <Avatar>
                            <AvatarImage src="https://picsum.photos/seed/Maestro/100/100" data-ai-hint="wise tutor" />
                            <AvatarFallback>MP</AvatarFallback>
                        </Avatar>
                        <div className="max-w-md p-3 rounded-2xl bg-muted rounded-bl-lg">
                            <Loader2 className="animate-spin text-primary" />
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </main>
             <footer className="p-4 border-t bg-background rounded-b-lg">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Input 
                        placeholder="Posez votre question à Maestro Plume..."
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

        {/* Learning Resources */}
        <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <BookOpen className="text-accent" />
                  Ressources
                </CardTitle>
                <CardDescription>Quelques notions pour commencer.</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Qu'est-ce qu'une rime ?</AccordionTrigger>
                    <AccordionContent>
                      La rime est la répétition d'un même son à la fin de plusieurs mots. En poésie, elle crée un rythme et une musicalité. On distingue plusieurs types de rimes : plates (AABB), croisées (ABAB), embrassées (ABBA)...
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>La métaphore expliquée</AccordionTrigger>
                    <AccordionContent>
                      Une métaphore est une figure de style qui consiste à désigner une chose par une autre qui lui ressemble. C'est une comparaison sans outil de comparaison (comme, tel que...). Exemple : "Cette femme est une lionne."
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3">
                    <AccordionTrigger>Le secret d'un bon flow</AccordionTrigger>
                    <AccordionContent>
                      En rap ou en slam, le "flow" est la manière dont le rappeur ou le slameur pose sa voix sur l'instrumentale. Il dépend du rythme, de l'intonation, et des pauses. Un bon flow est unique, captivant et sert le propos du texte.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <Sparkles className="text-accent" />
                  Exercice du Jour
                </CardTitle>
                <CardDescription>Mettez la théorie en pratique.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                    Écrivez un quatrain (4 vers) sur le thème "la ville s'endort" en utilisant des rimes croisées (ABAB) et au moins une métaphore. <br/><br/>
                    N'hésitez pas à demander de l'aide ou un retour à <span className="font-bold text-primary">Maestro Plume</span> !
                </p>
              </CardContent>
            </Card>
        </aside>
      </div>
    </div>
  );
}
