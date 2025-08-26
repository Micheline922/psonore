
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  GraduationCap,
  FolderKanban,
  HelpCircle,
} from "lucide-react";
import { generateCreativeText, GenerateCreativeTextOutput } from "@/ai/flows/creative-ai-assistant";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { Creation } from "@/lib/types";

type Ambiance = "Instrumental" | "Nature" | "Urbain" | null;

const proverbs = [
  "Là où le coeur est, les pieds n'hésitent pas à y aller.",
  "L'art de l'écriture est de peindre avec des mots.",
  "La poésie est la musique de l'âme.",
  "Chaque mot est une couleur sur la toile de l'imagination.",
  "Le silence est parfois le plus beau des poèmes.",
  "Mieux vaut prendre le changement par la main avant qu'il ne nous prenne par la gorge.",
  "On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux."
];

export default function StudioPage() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [slogan, setSlogan] = useState("");
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedGuidance, setGeneratedGuidance] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [activeAmbiance, setActiveAmbiance] = useState<Ambiance>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [artistName, setArtistName] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [proverb, setProverb] = useState("");

  useEffect(() => {
    setProverb(proverbs[Math.floor(Math.random() * proverbs.length)]);
  }, []);

  useEffect(() => {
    const savedArtist = localStorage.getItem("plumeSonoreArtist");
    if (!savedArtist) {
      router.replace("/");
    } else {
      setArtistName(savedArtist);
      const creationId = searchParams.get('id');
      const creationsKey = `plumeSonoreCreations_${savedArtist}`;
      const creations: Creation[] = JSON.parse(localStorage.getItem(creationsKey) || '[]');
      
      if (creationId) {
        const creationToEdit = creations.find(c => c.id === parseInt(creationId));
        if (creationToEdit) {
          setTitle(creationToEdit.title || "");
          setText(creationToEdit.content);
          setSlogan(creationToEdit.slogan || "");
          setEditingId(creationToEdit.id);
        }
      }
    }
  }, [router, searchParams]);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        setAudio(null);
      }
    };
  }, [audio]);

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
    setGeneratedGuidance(null);
    try {
      const result = await generateCreativeText(values);
      const [content, guidance] = result.generatedText.split("---CONSEILS---");
      
      setGeneratedContent(content.trim());
      if(guidance) {
        setGeneratedGuidance(guidance.trim());
      }
      
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
    if (artistName && text.trim() && title.trim()) {
      const creationsKey = `plumeSonoreCreations_${artistName}`;
      const creations: Creation[] = JSON.parse(localStorage.getItem(creationsKey) || '[]');
      
      if (editingId !== null) {
        const index = creations.findIndex(c => c.id === editingId);
        if (index > -1) {
          creations[index].title = title;
          creations[index].content = text;
          creations[index].slogan = slogan;
          creations[index].date = new Date().toISOString();
        }
      } else {
         const newCreation: Creation = {
            id: Date.now(),
            title,
            content: text,
            slogan,
            date: new Date().toISOString(),
          };
          creations.unshift(newCreation);
      }
      
      localStorage.setItem(creationsKey, JSON.stringify(creations));
      
      toast({
        title: "Sauvegardé !",
        description: "Votre création a été sauvegardée.",
      });
      router.push('/creations');
    } else {
         toast({
            title: "Champs requis manquants",
            description: "Le titre et le corps du texte ne peuvent pas être vides.",
            variant: "destructive",
        });
    }
  };

  const handleShare = async () => {
    const shareText = `"${title}" par ${artistName}\n\n${text}${slogan ? `\n\n- ${slogan}` : ''}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `"${title}" par ${artistName}`,
          text: shareText,
        });
        toast({ title: 'Partagé !', description: 'Votre texte a été partagé avec succès.' });
      } catch (error) {
        console.error('Error sharing:', error);
        toast({ title: 'Erreur de partage', description: 'Le partage a été annulé ou a échoué.', variant: 'destructive' });
      }
    } else {
       navigator.clipboard.writeText(shareText);
       toast({ title: 'Copié !', description: 'Votre navigateur ne supporte pas le partage natif. Le texte a été copié dans le presse-papiers.' });
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
            <Card className="shadow-lg border-primary/20 flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                  <BookText className="text-accent" />
                  {editingId ? "Modifier la création" : "Bloc-notes Créatif"}
                </CardTitle>
                <CardDescription>{editingId ? "Modifiez votre oeuvre." : "Écrivez librement vos inspirations, poésies, et punchlines."}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="font-headline">Titre</Label>
                    <Input id="title" placeholder="Le titre de votre oeuvre" value={title} onChange={e => setTitle(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="slogan" className="font-headline">Slogan</Label>
                    <Input id="slogan" placeholder="Votre phrase-clé (optionnel)" value={slogan} onChange={e => setSlogan(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content" className="font-headline">Corps du texte</Label>
                  <div className="relative">
                    <Textarea
                      id="content"
                      placeholder="Commencez à écrire ici..."
                      className="min-h-[250px] text-base p-4 rounded-lg focus:ring-2 ring-primary/50"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                     <div className="absolute top-3 right-3 flex items-center gap-1">
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
                </div>
                {generatedContent && (
                   <Card className="mt-4 bg-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-headline text-xl text-primary">
                        <Zap size={20} className="text-primary"/> Suggestion de l'IA
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap font-body text-foreground/90">{generatedContent}</p>
                    </CardContent>
                  </Card>
                )}
                {generatedGuidance && (
                   <Card className="mt-4 bg-accent/5 border-accent/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 font-headline text-xl text-accent">
                        <HelpCircle size={20} className="text-accent"/> Conseils du Maestro
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap font-body text-foreground/90">{generatedGuidance}</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
               <CardFooter className="justify-center">
                <Button asChild variant="link">
                    <Link href="/creations">
                        <FolderKanban className="mr-2"/>
                        Voir toutes mes créations
                    </Link>
                </Button>
            </CardFooter>
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
                        {proverb ? `"${proverb}"` : "..."}
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

            <Card className="hover:border-primary/60 transition-colors">
                <Link href="/academy" className="block h-full">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2">
                            <GraduationCap className="text-accent" />
                            Académie
                        </CardTitle>
                        <CardDescription>Approfondissez vos connaissances artistiques avec notre tuteur IA.</CardDescription>
                    </CardHeader>
                </Link>
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
