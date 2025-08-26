
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookText,
  BrainCircuit,
  Lightbulb,
  LogOut,
  Mic,
  Music,
  Save,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Ambiance = "Instrumental" | "Nature" | "Urbain" | null;

export default function StudioPage() {
  const [text, setText] = useState("");
  const [generatedContent, setGeneratedContent] = useState<GenerateCreativeTextOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [activeAmbiance, setActiveAmbiance] = useState<Ambiance>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [artistName, setArtistName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedArtist = localStorage.getItem("plumeSonoreArtist");
    if (!savedArtist) {
      router.replace("/");
    } else {
      setArtistName(savedArtist);
      const savedText = localStorage.getItem(`plumeSonoreText_${savedArtist}`);
      if (savedText) {
        setText(savedText);
      }
    }
  }, [router]);

  useEffect(() => {
    // Cleanup audio on component unmount
    return () => {
      if (audio) {
        audio.pause();
        setAudio(null);
      }
    };
  }, [audio]);

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
  
  const handleSave = () => {
    if (artistName) {
      localStorage.setItem(`plumeSonoreText_${artistName}`, text);
      toast({
        title: "Sauvegardé !",
        description: "Votre texte a été sauvegardé localement.",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Ma création Plume Sonore',
          text: text,
        });
        toast({ title: 'Partagé !', description: 'Votre texte a été partagé avec succès.' });
      } catch (error) {
        console.error('Error sharing:', error);
        toast({ title: 'Erreur de partage', description: 'Le partage a été annulé ou a échoué.', variant: 'destructive' });
      }
    } else {
      toast({ title: 'Partage non supporté', description: 'Votre navigateur ne supporte pas le partage natif. Copiez le texte manuellement.', variant: 'destructive' });
    }
  };

  const handleAmbianceClick = (ambiance: Ambiance) => {
    if (audio) {
      audio.pause();
    }

    if (activeAmbiance === ambiance) {
      setActiveAmbiance(null);
      setAudio(null);
      return;
    }

    setActiveAmbiance(ambiance);
    let soundFile = '';
    if (ambiance === 'Instrumental') soundFile = 'https://storage.googleapis.com/fweb-sounds-priority/instrumental_ambiance.mp3';
    if (ambiance === 'Nature') soundFile = 'https://storage.googleapis.com/fweb-sounds-priority/nature_ambiance.mp3';
    if (ambiance === 'Urbain') soundFile = 'https://storage.googleapis.com/fweb-sounds-priority/urban_ambiance.mp3';

    if(soundFile){
      const newAudio = new Audio(soundFile);
      newAudio.loop = true;
      newAudio.play();
      setAudio(newAudio);
      toast({ title: `Ambiance ${ambiance}`, description: "L'ambiance sonore a commencé." });
    }
  };

  const handleVirtualMic = () => {
    if ('speechSynthesis' in window) {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        toast({ title: 'Lecture arrêtée' });
        return;
      }
      if (text.trim().length === 0) {
        toast({ title: 'Texte vide', description: 'Veuillez écrire quelque chose avant de lancer le micro.', variant: 'destructive'});
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.onend = () => {
        toast({ title: 'Lecture terminée' });
      };
      speechSynthesis.speak(utterance);
      toast({ title: 'Lecture en cours...' });
    } else {
      toast({ title: 'Fonctionnalité non supportée', description: 'La synthèse vocale n\'est pas supportée par votre navigateur.', variant: 'destructive'});
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("plumeSonoreArtist");
    router.push("/");
    toast({
      title: "Déconnecté",
      description: "Vous avez été déconnecté.",
    });
  };
  
  if (!artistName) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Logo className="h-24 w-24 text-primary animate-pulse" />
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <main className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo className="h-12 w-12 text-primary" />
            <div>
              <h1 className="text-4xl font-headline text-primary tracking-wider">Plume Sonore</h1>
              <p className="text-muted-foreground font-body">Bienvenue, {artistName}.</p>
            </div>
          </div>
           <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <LogOut className="h-5 w-5"/>
                    <span className="sr-only">Se déconnecter</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Se déconnecter</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir vous déconnecter ? Votre travail non sauvegardé sera perdu.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                    Se déconnecter
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
                    <Button variant="ghost" size="icon" onClick={handleSave}>
                      <Save className="h-5 w-5" />
                      <span className="sr-only">Sauvegarder</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleShare}>
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
                        <Button variant={activeAmbiance === 'Instrumental' ? 'default' : 'outline'} size="sm" onClick={() => handleAmbianceClick('Instrumental')}><Music size={16} className="mr-2"/>Instrumental</Button>
                        <Button variant={activeAmbiance === 'Nature' ? 'default' : 'outline'} size="sm" onClick={() => handleAmbianceClick('Nature')}><Wind size={16} className="mr-2"/>Nature</Button>
                        <Button variant={activeAmbiance === 'Urbain' ? 'default' : 'outline'} size="sm" onClick={() => handleAmbianceClick('Urbain')}><Volume2 size={16} className="mr-2"/>Urbain</Button>
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
                 <p className="text-muted-foreground mb-4">Votre texte du bloc-notes sera lu ici.</p>
                <Button className="w-full" variant="secondary" onClick={handleVirtualMic}>
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
                       <Button variant="link" asChild className="pl-2 text-primary">
                        <Link href="/community">Voir plus</Link>
                       </Button>
                  </div>
                </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
