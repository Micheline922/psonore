
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Send, MessageSquareQuote, GraduationCap, PenLine, BrainCircuit, BookOpen, History, Radio } from "lucide-react";
import { artTutor, ArtTutorInput } from "@/ai/flows/art-tutor-flow";
import { generateAcademyQuiz, evaluateAcademyQuiz, type AcademyQuizQuestion, type AcademyQuizAnswer } from "@/ai/flows/academy-quiz-flow";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


type Message = {
    role: 'user' | 'model';
    content: string;
};

// Content for lessons
const beginnerLessons = [
    { week: "Semaine 1-2: Les Fondamentaux", title: "C'est quoi, un vers ? C'est quoi, une strophe ?", content: "On commence par les bases ! Un vers est une ligne de votre poème. Une strophe est un groupe de vers, comme un paragraphe. On va jouer avec pour construire nos premières idées." },
    { week: "Semaine 3-4: Le Rythme et la Rime", title: "Trouver le tempo de ses mots", content: "La poésie, c'est de la musique. On explore comment les rimes (les sons qui se répètent à la fin des vers) et le rythme (la pulsation de vos phrases) peuvent rendre un texte vivant et mémorable." },
    { week: "Semaine 5-6: Les Figures de Style Simples", title: "Comparer et imaginer", content: "Apprenons à peindre avec les mots. On découvre la comparaison ('rouge comme une tomate') et la métaphore ('cette idée est une lumière') pour créer des images puissantes dans la tête de ceux qui vous lisent." },
    { week: "Semaine 7-8: L'Art de la Punchline", title: "Frapper fort avec les mots", content: "Une punchline, c'est le vers qui marque, celui qu'on retient. On analyse des exemples et on s'entraîne à écrire des phrases courtes, percutantes et pleines de sens." },
    { week: "Semaine 9-10: Vaincre la Page Blanche", title: "Exercices de créativité", content: "Tout le monde bloque parfois. On apprend des techniques simples pour faire jaillir les idées : écriture automatique, jeux de mots, brainstorming... L'important, c'est de se lancer !" }
];

const intermediateLessons = [
    { week: "Semaine 11-12: Le Storytelling", title: "Raconter une histoire en vers", content: "Un poème peut raconter une histoire. On apprend à construire un récit : situation initiale, péripéties, conclusion. Comment faire voyager l'auditeur en quelques strophes ?" },
    { week: "Semaine 13-14: La Voix Narrative", title: "Qui parle dans votre texte ?", content: "Est-ce vous ? Un personnage ? Un observateur ? On explore comment le choix du narrateur (le 'je', le 'tu', le 'il') change complètement la perspective et l'impact d'un texte." },
    { week: "Semaine 15-16: Développer son Style Personnel", title: "Trouver sa signature", content: "Quel est votre univers ? Vos thèmes de prédilection ? Votre manière unique de jouer avec les mots ? On travaille sur l'identité artistique pour rendre vos textes reconnaissables." },
    { week: "Semaine 17-18: Les Figures de Style Avancées", title: "Maîtriser les subtilités", content: "On va plus loin avec l'allitération (répétition de consonnes), l'assonance (répétition de voyelles) et le symbole pour ajouter des couches de sens et de musicalité à vos écrits." },
    { week: "Semaine 19-20: La Réécriture et le Polissage", title: "De la première version à l'oeuvre finale", content: "Le premier jet n'est que le début. On apprend à relire, couper, réorganiser, choisir le mot juste. C'est l'étape cruciale pour transformer une bonne idée en un texte exceptionnel." }
];

const advancedLessons = [
    { week: "Semaine 21-22: La Poésie Expérimentale", title: "Briser les codes", content: "Et si on oubliait les règles ? On explore le vers libre, la poésie visuelle, les structures non conventionnelles. L'objectif : repousser les limites de l'expression." },
    { week: "Semaine 23-24: L'Écriture Engagée", title: "Mettre sa plume au service d'une cause", content: "L'art peut changer le monde. On étudie comment des artistes ont utilisé leurs mots pour dénoncer, inspirer le changement et défendre des idées. Comment allier message et forme poétique ?" },
    { week: "Semaine 25-26: La Performance Scénique", title: "Incarner son texte", content: "Le slam et la poésie sont des arts vivants. On travaille la diction, la posture, la gestion du silence, l'interaction avec le public. Comment faire de votre texte une expérience inoubliable ?" },
    { week: "Semaine 27-28: L'Intertextualité", title: "Dialoguer avec d'autres oeuvres", content: "Vos textes ne naissent pas de rien. Ils sont en conversation avec d'autres poèmes, chansons, films... On apprend à utiliser les références et les clins d'oeil pour enrichir ses créations." },
    { week: "Semaine 29-30: Le Projet Artistique", title: "Construire un recueil ou un spectacle", content: "Comment passer de plusieurs textes à un projet cohérent ? On aborde la thématique, le fil rouge, l'organisation des textes pour créer une oeuvre complète et aboutie. Le voyage artistique est sans fin." }
];


const renderLessons = (lessons: { week: string; title: string; content: string; }[]) => {
    return (
         <Accordion type="single" collapsible className="w-full">
            {lessons.map((lesson, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex flex-col">
                            <p className="text-sm font-semibold text-primary">{lesson.week}</p>
                            <h4 className="font-headline text-lg">{lesson.title}</h4>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <p className="whitespace-pre-wrap">{lesson.content}</p>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
};


export default function AcademyPage() {
  const [artistName, setArtistName] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<AcademyQuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [isQuizFinished, setIsQuizFinished] = useState(false);


  useEffect(() => {
    const savedArtist = localStorage.getItem("plumeSonoreArtist");
    if (!savedArtist) {
      router.replace("/");
    } else {
      setArtistName(savedArtist);
      setMessages([
          { role: 'model', content: `Bonjour ${savedArtist}, je suis Maestro Plume. Bienvenue à l'Académie. Pose-moi une question sur une des leçons, ou explore les différents parcours !` }
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
       setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const startNewQuiz = async () => {
    setIsGeneratingQuiz(true);
    setQuizFeedback(null);
    setSelectedAnswer(null);
    setQuizScore(0);
    setCurrentQuestionIndex(0);
    setIsQuizFinished(false);
    try {
        const {questions} = await generateAcademyQuiz();
        setQuizQuestions(questions);
    } catch(e) {
        toast({ title: "Erreur", description: "Impossible de créer le quiz.", variant: "destructive"});
    } finally {
        setIsGeneratingQuiz(false);
    }
  }

  const handleAnswerSubmit = async () => {
      if (!selectedAnswer || !quizQuestions) return;

      const answer: AcademyQuizAnswer = {
          question: quizQuestions[currentQuestionIndex],
          selectedAnswer: selectedAnswer,
      }
      const { feedback, isCorrect } = await evaluateAcademyQuiz(answer);
      setQuizFeedback(feedback);
      if(isCorrect) {
          setQuizScore(s => s + 1);
      }
  }
  
  const handleNextQuestion = () => {
      if(currentQuestionIndex < quizQuestions.length - 1) {
          setCurrentQuestionIndex(i => i + 1);
          setSelectedAnswer(null);
          setQuizFeedback(null);
      } else {
          setIsQuizFinished(true);
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
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <Button variant="ghost" size="icon" asChild>
                <Link href="/studio">
                    <ArrowLeft />
                    <span className="sr-only">Retour au studio</span>
                </Link>
            </Button>
            <div className="text-center">
                <h1 className="text-xl font-headline text-primary tracking-wider flex items-center gap-2"><GraduationCap/>Académie Plume Sonore</h1>
            </div>
            <div className="w-10"></div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Tabs defaultValue="beginner">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="beginner"><PenLine className="mr-2" />Débutant</TabsTrigger>
                    <TabsTrigger value="intermediate"><BrainCircuit className="mr-2"/>Intermédiaire</TabsTrigger>
                    <TabsTrigger value="advanced"><BookOpen className="mr-2"/>Évolué</TabsTrigger>
                    <TabsTrigger value="quiz"><Radio className="mr-2"/>Quiz Interactif</TabsTrigger>
                </TabsList>
                <TabsContent value="beginner">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Parcours Débutant</CardTitle>
                            <CardDescription>De 0 à 10 semaines : apprenez les bases de l'écriture créative.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {renderLessons(beginnerLessons)}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="intermediate">
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Parcours Intermédiaire</CardTitle>
                            <CardDescription>De 10 à 20 semaines : affinez votre style et vos techniques narratives.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderLessons(intermediateLessons)}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="advanced">
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Parcours Évolué</CardTitle>
                            <CardDescription>20 semaines et plus : repoussez les limites de votre art.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderLessons(advancedLessons)}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="quiz">
                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Quiz Interactif</CardTitle>
                            <CardDescription>Testez vos connaissances et apprenez en vous amusant.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                            {isGeneratingQuiz && <Loader2 className="animate-spin h-8 w-8 text-primary" />}
                            
                            {!isGeneratingQuiz && quizQuestions.length === 0 && (
                                <Button onClick={startNewQuiz}>Commencer un nouveau quiz</Button>
                            )}
                            
                            {!isGeneratingQuiz && quizQuestions.length > 0 && !isQuizFinished && (
                                <div className="w-full text-left space-y-4">
                                    <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} / {quizQuestions.length}</p>
                                    <h3 className="font-semibold text-lg">{quizQuestions[currentQuestionIndex].questionText}</h3>
                                    
                                    <RadioGroup value={selectedAnswer ?? ''} onValueChange={setSelectedAnswer} disabled={!!quizFeedback}>
                                        {quizQuestions[currentQuestionIndex].options.map(option => (
                                            <div key={option} className="flex items-center space-x-2">
                                                <RadioGroupItem value={option} id={option} />
                                                <Label htmlFor={option}>{option}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>

                                    {quizFeedback && (
                                        <div className={cn(
                                            "p-3 rounded-md text-sm",
                                            quizFeedback.includes("Correct") ? "bg-green-500/10 text-green-700 border border-green-500/20" : "bg-red-500/10 text-red-700 border border-red-500/20"
                                        )}>
                                            {quizFeedback}
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-end gap-2">
                                        {!quizFeedback && (
                                             <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer}>Valider</Button>
                                        )}
                                        {quizFeedback && (
                                            <Button onClick={handleNextQuestion}>
                                                {currentQuestionIndex < quizQuestions.length - 1 ? "Question suivante" : "Terminer le quiz"}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {isQuizFinished && (
                                <div className="text-center space-y-4">
                                     <h3 className="font-headline text-2xl text-primary">Quiz Terminé !</h3>
                                     <p>Votre score : <Badge className="text-lg">{quizScore} / {quizQuestions.length}</Badge></p>
                                     <p className="text-muted-foreground max-w-md mx-auto">
                                        {quizScore === quizQuestions.length ? "Excellent travail ! Vous maîtrisez le sujet." : "Continuez à apprendre avec les leçons et le tuteur. Chaque erreur est une opportunité !"}
                                     </p>
                                     <Button onClick={startNewQuiz}>Recommencer un quiz</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>

        <aside className="h-full">
             <div className="flex flex-col h-full bg-card rounded-lg border sticky top-24">
                <header className="p-4 border-b flex items-center gap-2">
                    <MessageSquareQuote className="h-6 w-6 text-accent" />
                    <h2 className="text-lg font-headline">Maestro Plume</h2>
                </header>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
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
                                "max-w-sm p-3 rounded-2xl text-sm",
                                 message.role === 'user' 
                                    ? 'bg-primary text-primary-foreground rounded-br-lg' 
                                    : 'bg-muted rounded-bl-lg'
                            )}>
                               <p className="whitespace-pre-wrap">{message.content}</p>
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
                </div>
                 <footer className="p-4 border-t bg-background rounded-b-lg">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <Input 
                            placeholder="Posez votre question..."
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
        </aside>
      </main>
    </div>
  );
}

    