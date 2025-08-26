"use client";

import React, { useState, useEffect } from "react";
import {
  BookText,
  BrainCircuit,
  Lightbulb,
  Mic,
  Music,
  Share2,
  Users,
  Volume2,
  Wind,
  Zap,
} from "lucide-react";
import { generateCreativeText, GenerateCreativeTextOutput } from "@/ai/flows/creative-ai-assistant";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import CreativeAssistantForm from "@/components/creative-assistant-form";
import Logo from "@/components/logo";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  const [text, setText] = useState("");
  const [generatedContent, setGeneratedContent] = useState<GenerateCreativeTextOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  
  // Placeholder for speech recognition
  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setText(prev => prev ? `${prev} ${speechResult}`: speechResult);
    };

    recognition.onspeechend = () => {
      recognition.stop();
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      toast({
        title: "Erreur de dictée",
        description: "La reconnaissance vocale a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
      setIsListening(false);
    };

    if (isListening) {
      recognition.start();
    }

    return () => {
      recognition.stop();
    };
  }, [isListening, toast]);


  const handleGenerate = async (values: { textFragment: string; style: string }) => {
    setIsGenerating(true);
    setGeneratedContent(null);
    try {
      const result = await generateCreativeText(values);
      setGeneratedContent(result);
    } catch (error) {
      console.error("Error generating text:", error);
      toast({
        title: "Erreur de l'IA",
        description: "La génération de texte a échoué. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center gap-4">
          <Logo className="h-12 w-12 text-primary" />
          <div>
            <h1 className="text-4xl font-headline text-primary tracking-wider">Plume Sonore</h1>
            <p className="text-muted-foreground font-body">Votre studio d’écriture dans la poche.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                  <BookText className="text-accent" />
                  Bloc-notes Créatif
                </CardTitle>
                <CardDescription>Écrivez librement vos inspirations, poésies, et punchlines.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Textarea
                    placeholder="Commencez à écrire ici..."
                    className="min-h-[300px] text-base p-4 rounded-lg focus:ring-2 ring-primary/50"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                     <Button variant="ghost" size="icon" onClick={handleMicClick} className={isListening ? 'bg-accent/20 text-accent' : ''}>
                      <Mic className="h-5 w-5" />
                      <span className="sr-only">Dicter du texte</span>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Share2 className="h-5 w-5" />
                      <span className="sr-only">Partager</span>
                    </Button>
                  </div>
                </div>
                {generatedContent && (
                   <Card className="mt-4 bg-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-headline text-xl text-primary">
                        <Zap size={20} className="text-primary"/> Suggestion de l'IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap font-body text-foreground/90">{generatedContent.generatedText}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <BrainCircuit className="text-accent" />
                  Assistant IA Créatif
                </CardTitle>
                <CardDescription>Laissez l'IA vous aider à trouver l'inspiration.</CardDescription>
              </CardHeader>
              <CardContent>
                <CreativeAssistantForm text={text} onSubmit={handleGenerate} isLoading={isGenerating} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <Lightbulb className="text-accent" />
                  Banque d'Inspiration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                    <h3 className="font-headline text-lg mb-2">Proverbe du Jour</h3>
                    <blockquote className="border-l-4 border-accent pl-4 italic text-muted-foreground">
                        "Là où le coeur est, les pieds n'hésitent pas à y aller."
                    </blockquote>
                </div>
                <Separator />
                <div>
                    <h3 className="font-headline text-lg mb-2">Ambiances sonores</h3>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm"><Music size={16} className="mr-2"/>Instrumental</Button>
                        <Button variant="outline" size="sm"><Wind size={16} className="mr-2"/>Nature</Button>
                        <Button variant="outline" size="sm"><Volume2 size={16} className="mr-2"/>Urbain</Button>
                    </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <Mic className="text-accent" />
                  Scène Virtuelle
                </CardTitle>
                 <CardDescription>Entraînez-vous à réciter vos textes.</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                 <p className="text-muted-foreground mb-4">Prêt à monter sur scène ?</p>
                <Button className="w-full" variant="secondary">
                    <Mic size={16} className="mr-2"/>Lancer le micro virtuel
                </Button>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl flex items-center gap-2">
                        <Users className="text-accent" />
                        Communauté
                    </CardTitle>
                    <CardDescription>Connectez-vous avec d'autres artistes.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                      <Avatar>
                          <AvatarImage src="https://picsum.photos/100/100?random=1" data-ai-hint="artist portrait" />
                          <AvatarFallback>A1</AvatarFallback>
                      </Avatar>
                      <Avatar>
                          <AvatarImage src="https://picsum.photos/100/100?random=2" data-ai-hint="musician profile" />
                          <AvatarFallback>A2</AvatarFallback>
                      </Avatar>
                      <Avatar>
                          <AvatarImage src="https://picsum.photos/100/100?random=3" data-ai-hint="writer photo" />
                          <AvatarFallback>A3</AvatarFallback>
                      </Avatar>
                       <Button variant="link" className="pl-2 text-primary">Voir plus</Button>
                  </div>
                </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
