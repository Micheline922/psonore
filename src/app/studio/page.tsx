
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BookText,
  BrainCircuit,
  Lightbulb,
  LogOut,
  Mic,
  Save,
  Share2,
  Users,
  GraduationCap,
  FolderKanban,
  HelpCircle,
  Wand2,
  Loader2,
  ChevronRight,
  RefreshCw,
  Star,
} from "lucide-react";
import { generateCreativeText } from "@/ai/flows/creative-ai-assistant";
import {
    generateQuizChallenge,
    evaluatePunchline,
    type EvaluatePunchlineInput,
    type EvaluatePunchlineOutput,
} from "@/ai/flows/punchline-quiz-flow";
import { evaluatePerformance, type EvaluatePerformanceInput, type EvaluatePerformanceOutput } from "@/ai/flows/evaluate-performance-flow";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  const [isDictating, setIsDictating] = useState(false);
  const [artistName, setArtistName] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [proverb, setProverb] = useState("");

  // State for Punchline Quiz
  const [challengeWords, setChallengeWords] = useState<string[]>([]);
  const [punchline, setPunchline] = useState("");
  const [quizResult, setQuizResult] = useState<EvaluatePunchlineOutput | null>(null);
  const [isGeneratingChallenge, setIsGeneratingChallenge] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // State for Virtual Stage
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluatingPerformance, setIsEvaluatingPerformance] = useState(false);
  const [performanceResult, setPerformanceResult] = useState<EvaluatePerformanceOutput | null>(null);
  const recognitionRef = useRef<any>(null);

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
      if (isDictating) {
        setText(prev => prev ? `${prev} ${speechResult}` : speechResult);
      }
      if (isRecording) {
        handlePerformanceEvaluation(speechResult);
      }
    };

    recognition.onspeechend = () => {
      if (isDictating) {
          recognition.stop();
          setIsDictating(false);
      }
       if (isRecording) {
          recognition.stop();
          setIsRecording(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      let errorMessage = "La reconnaissance vocale a échoué. Veuillez réessayer.";
       if (event.error === 'no-speech') {
        errorMessage = "Aucun son n'a été détecté. Assurez-vous que votre micro est activé.";
      } else if (event.error === 'not-allowed') {
        errorMessage = "L'accès au micro a été refusé. Veuillez autoriser l'accès dans les paramètres de votre navigateur.";
      }
      toast({
        title: "Erreur de reconnaissance vocale",
        description: errorMessage,
        variant: "destructive",
      });
      setIsDictating(false);
      setIsRecording(false);
    };
    
    recognitionRef.current = recognition;

  }, [isDictating, isRecording, toast]);


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

  const handleMicDictateClick = () => {
    if (isDictating) {
      recognitionRef.current?.stop();
      setIsDictating(false);
    } else {
      setIsDictating(true);
      recognitionRef.current?.start();
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
  
  const handleVirtualMicRecord = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
        if(text.trim().length < 10) {
             toast({ title: "Texte trop court", description: "Veuillez écrire au moins 10 caractères avant de vous enregistrer.", variant: "destructive" });
             return;
        }
      setIsRecording(true);
      setPerformanceResult(null);
      recognitionRef.current?.start();
       toast({ title: "Enregistrement en cours...", description: "Récitez votre texte. L'enregistrement s'arrêtera automatiquement." });
    }
  }

  const handlePerformanceEvaluation = async (transcript: string) => {
      setIsEvaluatingPerformance(true);
      try {
          const input: EvaluatePerformanceInput = {
              originalText: text,
              userRecitation: transcript,
          };
          const result = await evaluatePerformance(input);
          setPerformanceResult(result);
          toast({ title: "Évaluation terminée !", description: "Le coach IA a analysé votre performance." });
      } catch (error) {
          console.error("Error evaluating performance:", error);
          toast({ title: "Erreur de l'IA", description: "L'évaluation de la performance a échoué.", variant: "destructive" });
      } finally {
          setIsEvaluatingPerformance(false);
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

  const handleNewChallenge = async () => {
    setIsGeneratingChallenge(true);
    setQuizResult(null);
    setPunchline("");
    try {
      const result = await generateQuizChallenge();
      setChallengeWords(result.words);
    } catch (error) {
      console.error("Error generating challenge:", error);
      toast({ title: "Erreur de l'IA", description: "Impossible de générer un nouveau défi.", variant: "destructive" });
    } finally {
      setIsGeneratingChallenge(false);
    }
  };

  const handleEvaluatePunchline = async () => {
    if (punchline.trim().length < 3) {
      toast({ title: "Punchline trop courte", description: "Veuillez écrire une punchline plus longue.", variant: "destructive" });
      return;
    }
    setIsEvaluating(true);
    setQuizResult(null);
    try {
      const input: EvaluatePunchlineInput = {
        challengeWords,
        userPunchline: punchline,
      };
      const result = await evaluatePunchline(input);
      setQuizResult(result);
    } catch (error) {
      console.error("Error evaluating punchline:", error);
      toast({ title: "Erreur de l'IA", description: "L'évaluation a échoué. Veuillez réessayer.", variant: "destructive" });
    } finally {
      setIsEvaluating(false);
    }
  };
  
  if (!artistName) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Logo className="h-24 w-24 text-primary animate-pulse" />
        </div>
    );
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
                       <Button variant="ghost" size="icon" onClick={handleMicDictateClick} className={isDictating ? 'bg-accent/20 text-accent' : ''}>
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
                        <Wand2 size={20} className="text-primary"/> Suggestion de l'IA
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
                    <h3 className="font-headline text-lg mb-2">Comment créer une Punchline</h3>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li><span className="font-semibold text-foreground/80">Soyez bref et percutant :</span> Allez droit au but.</li>
                        <li><span className="font-semibold text-foreground/80">Utilisez des figures de style :</span> Métaphores, comparaisons, assonances.</li>
                        <li><span className="font-semibold text-foreground/80">Créez la surprise :</span> Terminez par une chute inattendue.</li>
                        <li><span className="font-semibold text-foreground/80">Jouez sur les mots :</span> Les doubles sens sont très efficaces.</li>
                    </ul>
                </div>
                 <Separator />
                <div>
                    <h3 className="font-headline text-lg mb-2">Défi Punchline</h3>
                    {!challengeWords.length && (
                        <Button onClick={handleNewChallenge} disabled={isGeneratingChallenge} className="w-full">
                           {isGeneratingChallenge ? <Loader2 className="animate-spin mr-2" /> : <Wand2 className="mr-2" />}
                            Nouveau Défi
                        </Button>
                    )}

                    {challengeWords.length > 0 && (
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">Utilisez ces mots pour créer une punchline :</p>
                            <div className="flex flex-wrap gap-2">
                                {challengeWords.map(word => <Badge key={word} variant="secondary">{word}</Badge>)}
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="punchline">Votre Punchline</Label>
                                <Textarea
                                id="punchline"
                                value={punchline}
                                onChange={(e) => setPunchline(e.target.value)}
                                placeholder="Écrivez votre punchline ici..."
                                disabled={isEvaluating}
                                />
                            </div>
                            <Button onClick={handleEvaluatePunchline} disabled={isEvaluating || !punchline} className="w-full bg-accent hover:bg-accent/90">
                                {isEvaluating ? <Loader2 className="animate-spin mr-2" /> : null}
                                Évaluer ma Punchline
                            </Button>

                            {quizResult && (
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardHeader>
                                        <CardTitle className="font-headline text-xl text-primary flex items-center justify-between">
                                            Résultat
                                            <Badge variant="default" className="text-lg">{quizResult.score}/10</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{quizResult.feedback}</p>
                                        <Button onClick={handleNewChallenge} disabled={isGeneratingChallenge} variant="link" className="mt-2 px-0">
                                            Prochain défi <ChevronRight className="ml-1" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                  <Mic className="text-accent" />
                  Scène Virtuelle
                </CardTitle>
                 <CardDescription>Entraînez-vous et recevez un feedback de l'IA.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant={isRecording ? "destructive" : "secondary"} onClick={handleVirtualMicRecord} disabled={isEvaluatingPerformance}>
                    {isRecording && <div className="mr-2 h-2 w-2 rounded-full bg-white animate-pulse"></div>}
                    {isRecording ? "Arrêter l'enregistrement" : <><Mic size={16} className="mr-2"/>Lancer le coach vocal</>}
                </Button>

                 {(isEvaluatingPerformance || performanceResult) && (
                    <div className="space-y-4 pt-4">
                         <Separator />
                         {isEvaluatingPerformance && (
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="animate-spin" />
                                <p>Analyse de votre performance...</p>
                            </div>
                         )}
                         {performanceResult && (
                            <div>
                                <h3 className="font-headline text-lg mb-2">Analyse du Coach IA</h3>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold">Score Global</span>
                                    <Badge className="text-lg">{performanceResult.score}/10</Badge>
                                </div>
                                <Progress value={performanceResult.score * 10} className="h-2 mb-4" />
                                
                                <h4 className="font-semibold flex items-center gap-2 mb-1"><Star size={16} className="text-primary"/>Points forts :</h4>
                                <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">{performanceResult.positives}</p>

                                <h4 className="font-semibold flex items-center gap-2 mb-1"><RefreshCw size={16} className="text-accent"/>Axes d'amélioration :</h4>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{performanceResult.improvements}</p>
                            </div>
                         )}
                    </div>
                 )}

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
