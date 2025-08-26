
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Send, BookOpen, Sparkles, MessageSquareQuote, Brain, CheckCircle, XCircle } from "lucide-react";
import { artTutor, ArtTutorInput } from "@/ai/flows/art-tutor-flow";
import { generateAcademyQuiz, evaluateAcademyQuiz, type AcademyQuizQuestion, type EvaluateAcademyQuizInput, type EvaluateAcademyQuizOutput } from "@/ai/flows/academy-quiz-flow";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

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

  // Quiz State
  const [quizQuestion, setQuizQuestion] = useState<AcademyQuizQuestion | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<EvaluateAcademyQuizOutput | null>(null);
  const [isEvaluatingQuiz, setIsEvaluatingQuiz] = useState(false);

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

  const handleNewQuestion = async () => {
    setIsGeneratingQuiz(true);
    setQuizQuestion(null);
    setSelectedAnswer(null);
    setQuizResult(null);
    try {
        const result = await generateAcademyQuiz();
        setQuizQuestion(result.question);
    } catch(e) {
        toast({ title: "Erreur", description: "Impossible de générer une question.", variant: "destructive"})
    } finally {
        setIsGeneratingQuiz(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!selectedAnswer || !quizQuestion) return;
    setIsEvaluatingQuiz(true);
    try {
        const input: EvaluateAcademyQuizInput = {
            question: quizQuestion.question,
            options: quizQuestion.options,
            userAnswer: selectedAnswer
        };
        const result = await evaluateAcademyQuiz(input);
        setQuizResult(result);
    } catch (e) {
         toast({ title: "Erreur", description: "Impossible d'évaluer la réponse.", variant: "destructive"})
    } finally {
        setIsEvaluatingQuiz(false);
    }
  }


  if (!artistName) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Logo className="h-24 w-24 text-primary animate-pulse" />
        </div>
    )
  }

  const renderLessons = (lessons: { title: string, content: string }[]) => (
     <Accordion type="single" collapsible className="w-full">
        {lessons.map((lesson, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{lesson.title}</AccordionTrigger>
                <AccordionContent className="whitespace-pre-wrap">{lesson.content}</AccordionContent>
            </AccordionItem>
        ))}
    </Accordion>
  );

  const beginnerLessons = [
    { title: "Semaine 1: Les Bases de la Rime", content: "La rime est la répétition d'un même son. On distingue les rimes pauvres (1 son commun, ex: pas/chocolat), suffisantes (2 sons, ex: parole/folle), et riches (3 sons+, ex: image/sage). La disposition (AABB, ABAB, ABBA) crée le schéma de rimes." },
    { title: "Semaine 2: Le Rythme et le Pied", content: "Le rythme en poésie est créé par la succession de syllabes accentuées et non accentuées. Le 'pied' est l'unité de base (ex: un alexandrin a 12 pieds/syllabes). Compter les syllabes est essentiel pour donner une cadence à votre texte." },
    { title: "Semaine 3: La Métaphore et la Comparaison", content: "La comparaison rapproche deux éléments avec un outil de comparaison ('comme', 'tel que'). Ex: 'Ses yeux brillaient comme des étoiles'.\nLa métaphore fait la même chose mais sans outil. Ex: 'Ses yeux sont des étoiles'." },
    { title: "Semaine 4: La Structure d'un Quatrain", content: "Un quatrain est une strophe de quatre vers. C'est la structure la plus courante. Elle permet de développer une idée de manière concise. Pratiquez en écrivant des quatrains sur des thèmes simples." },
    { title: "Semaine 5: Trouver l'Inspiration", content: "L'inspiration est partout. Observez le monde, notez des idées, lisez d'autres artistes, écoutez de la musique. L'exercice du 'brainstorming' (lister tous les mots liés à un thème) est très efficace pour démarrer." },
    { title: "Semaine 6: Allitération et Assonance", content: "L'allitération est la répétition d'un son consonne (ex: 'Pour qui sont ces serpents qui sifflent...').\nL'assonance est la répétition d'un son voyelle (ex: 'Tout m'afflige et me nuit et conspire à me nuire'). Elles ajoutent de la musicalité." },
    { title: "Semaine 7: Le Champ Lexical", content: "Un champ lexical est un ensemble de mots se rapportant à une même idée. Ex: pour la mer -> vague, sel, écume, bateau. Utiliser un champ lexical riche renforce l'atmosphère de votre texte." },
    { title: "Semaine 8: Introduction au Storytelling", content: "Le storytelling, c'est l'art de raconter une histoire. Un bon texte a souvent un début (situation initiale), un milieu (un événement, une émotion) et une fin (une résolution, une chute). Pensez à la petite histoire que vous voulez raconter." },
    { title: "Semaine 9: La Personnification", content: "La personnification consiste à attribuer des caractéristiques humaines à un objet ou une idée. Ex: 'Le vent hurlait sa colère'. C'est une technique puissante pour créer des images fortes." },
    { title: "Semaine 10: La Relecture et la Correction", content: "Un texte n'est jamais parfait du premier coup. Laissez-le reposer, puis relisez-le à voix haute pour entendre son rythme. Corrigez les fautes, mais aussi les vers qui 'sonnent' mal. C'est une étape cruciale." },
  ];
  
  const intermediateLessons = [
      { title: "Semaine 11: Le Rythme Binaire et Ternaire", content: "Le rythme binaire (2 temps) est stable, carré (ex: rap old school). Le rythme ternaire (3 temps) est plus dansant, balancé (ex: valse, beaucoup de trap). Jouer avec ces rythmes fait varier le 'flow'." },
      { title: "Semaine 12: Les Rimes Internes et Multisyllabiques", content: "La rime interne se trouve à l'intérieur d'un même vers ('Il pleure dans mon coeur / Comme il pleut sur la ville').\nLa rime multisyllabique fait rimer plusieurs syllabes (ex: 'illégal' / 'ville-Eiffel'). C'est une marque de technicité." },
      { title: "Semaine 13: L'Oxymore et l'Antithèse", content: "L'oxymore allie deux mots de sens contradictoires dans une même expression (ex: 'un silence assourdissant').\nL'antithèse oppose deux idées dans une phrase ou un paragraphe pour créer un contraste saisissant." },
      { title: "Semaine 14: La Structure Narrative (Schéma Quinaire)", content: "Une histoire se structure souvent en 5 étapes: 1. Situation initiale. 2. Élément déclencheur. 3. Péripéties. 4. Dénouement (résolution du problème). 5. Situation finale. Appliquez ceci à vos textes pour les rendre plus captivants." },
      { title: "Semaine 15: Le Point de Vue Narratif", content: "Qui parle ? Vous ('je'), un observateur externe ('il/elle'), ou vous vous adressez au lecteur ('tu'/'vous') ? Changer de point de vue peut transformer radicalement l'impact d'un texte." },
      { title: "Semaine 16: Le Symbole et l'Allégorie", content: "Un symbole est un objet ou une image qui représente une idée abstraite (ex: la colombe pour la paix).\nL'allégorie est une histoire entière qui représente une idée (ex: La Fontaine utilise des animaux pour parler des humains)." },
      { title: "Semaine 17: Le 'Show, Don't Tell'", content: "Au lieu de dire une émotion ('il était triste'), montrez-la par des actions ou des descriptions ('Une larme roula sur sa joue, son regard fixé sur le sol'). C'est beaucoup plus immersif pour l'auditeur." },
      { title: "Semaine 18: Développer son Style Unique", content: "Votre style, c'est votre signature. C'est un mélange de vos thèmes préférés, votre vocabulaire, votre rythme, votre ton. Analysez vos textes et ceux que vous admirez pour comprendre ce qui vous rend unique." },
      { title: "Semaine 19: L'Anaphore et la Répétition", content: "L'anaphore est la répétition d'un mot ou groupe de mots en début de phrase/vers. Elle crée un effet d'insistance puissant (ex: le discours 'I have a dream'). À utiliser pour marteler une idée." },
      { title: "Semaine 20: Le Punchline et la Chute", content: "La punchline est un vers fort, mémorable, qui frappe l'esprit. La chute est la fin surprenante d'un texte. Pour en créer, jouez sur les doubles sens, les contrastes, et les images inattendues." },
  ];
  
  const advancedLessons = [
      { title: "Semaine 21: La Prosodie et l'Intonation", content: "La prosodie est la musicalité de la langue parlée (intonation, accent, pauses). Enregistrez-vous et analysez où placer les accents toniques pour maximiser l'impact émotionnel de vos vers. Votre voix est un instrument." },
      { title: "Semaine 22: La Déconstruction des Formes Classiques", content: "Apprenez les règles du sonnet, de la ballade... puis brisez-les. Comment moderniser un sonnet ? Comment écrire un haïku en français ? Connaître les règles permet de les transgresser avec intention." },
      { title: "Semaine 23: L'Intertextualité", content: "L'intertextualité, c'est le dialogue entre votre texte et d'autres œuvres (livres, films, musiques...). Faire des références subtiles ou des clins d'œil enrichit la lecture et ancre votre œuvre dans une culture plus large." },
      { title: "Semaine 24: Le Métadiscours et la Mise en Abyme", content: "Le métadiscours, c'est quand le texte parle de lui-même (ex: un poème sur la difficulté d'écrire un poème). La mise en abyme est une œuvre dans l'œuvre. Ce sont des techniques complexes pour questionner l'art lui-même." },
      { title: "Semaine 25: Écrire sous Contrainte (Style Oulipo)", content: "Imposez-vous des règles strictes pour stimuler votre créativité. Ex: n'écrivez qu'avec des mots commençant par 'P', ou sans utiliser la lettre 'e'. Ces contraintes forcent à trouver des solutions ingénieuses." },
      { title: "Semaine 26: La Synesthésie", content: "La synesthésie est le mélange des sens. Ex: 'une odeur criarde', 'un silence bleu'. Cette figure de style crée des images poétiques très originales et mémorables en associant des perceptions habituellement séparées." },
      { title: "Semaine 27: La Cohérence d'un Projet (Album, Recueil)", content: "Pensez au-delà du texte unique. Comment vos œuvres se répondent-elles ? Y a-t-il un fil rouge (thématique, stylistique, narratif) ? Construire un projet cohérent donne plus de force à votre message." },
      { title: "Semaine 28: La Critique et l'Auto-Critique Constructive", content: "Apprenez à analyser une œuvre (la vôtre ou celle d'un autre) de manière objective. Séparez l'affectif du technique. Qu'est-ce qui fonctionne ? Qu'est-ce qui pourrait être amélioré et pourquoi ? Savoir critiquer est essentiel pour progresser." },
      { title: "Semaine 29: Le Processus de Publication et de Diffusion", content: "Comment passer de l'écriture à la diffusion ? Scène ouverte, réseaux sociaux, plateformes de streaming, auto-édition... Explorez les différentes voies pour partager votre art avec un public." },
      { title: "Semaine 30: Réinventer son Art", content: "Un artiste ne doit jamais stagner. Après avoir maîtrisé les techniques, comment vous réinventer ? Explorez de nouveaux thèmes, de nouveaux styles, collaborez avec d'autres artistes. Le voyage artistique est sans fin." },
  ];

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
                <p className="text-xs text-muted-foreground">Développez votre art, à votre rythme.</p>
            </div>
            <div className="w-10"></div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
        <div className="lg:col-span-2">
            <Tabs defaultValue="debutant" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="debutant">Débutant</TabsTrigger>
                    <TabsTrigger value="intermediaire">Intermédiaire</TabsTrigger>
                    <TabsTrigger value="evolue">Évolué</TabsTrigger>
                    <TabsTrigger value="quiz"><Sparkles className="mr-2 h-4 w-4"/>Quiz</TabsTrigger>
                </TabsList>
                <TabsContent value="debutant" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Parcours Débutant (0-10 semaines)</CardTitle>
                            <CardDescription>Acquérez les bases fondamentales de l'écriture créative.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderLessons(beginnerLessons)}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="intermediaire" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Parcours Intermédiaire (10-20 semaines)</CardTitle>
                            <CardDescription>Approfondissez votre technique et développez votre style.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {renderLessons(intermediateLessons)}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="evolue" className="mt-4">
                     <Card>
                        <CardHeader>
                            <CardTitle>Parcours Évolué (20+ semaines)</CardTitle>
                            <CardDescription>Maîtrisez les techniques avancées et explorez les limites de votre art.</CardDescription>
                        </Header>
                        <CardContent>
                            {renderLessons(advancedLessons)}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="quiz" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Quiz Interactif</CardTitle>
                            <CardDescription>Testez vos connaissances et apprenez de manière ludique.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {!quizQuestion && !isGeneratingQuiz && (
                                <div className="text-center space-y-4">
                                    <p>Prêt à défier vos neurones poétiques ?</p>
                                    <Button onClick={handleNewQuestion}>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Générer une question
                                    </Button>
                                </div>
                            )}
                            {isGeneratingQuiz && <div className="flex justify-center"><Loader2 className="animate-spin text-primary"/></div>}
                            
                            {quizQuestion && (
                                <div className="space-y-4">
                                    <p className="font-semibold text-lg">{quizQuestion.question}</p>
                                    <RadioGroup
                                        value={selectedAnswer ?? undefined}
                                        onValueChange={setSelectedAnswer}
                                        disabled={!!quizResult}
                                    >
                                        {quizQuestion.options.map((option, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <RadioGroupItem value={option} id={`q1-option${index}`}/>
                                                <Label htmlFor={`q1-option${index}`}>{option}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>

                                    <Button onClick={handleEvaluateAnswer} disabled={!selectedAnswer || isEvaluatingQuiz || !!quizResult}>
                                        {isEvaluatingQuiz ? <Loader2 className="animate-spin mr-2"/> : null}
                                        Valider la réponse
                                    </Button>

                                    {quizResult && (
                                        <div className={cn("p-4 rounded-md", quizResult.isCorrect ? "bg-green-100 dark:bg-green-900/30 border border-green-500/50" : "bg-red-100 dark:bg-red-900/30 border border-red-500/50")}>
                                            <div className="flex items-center gap-2 mb-2">
                                                {quizResult.isCorrect ? <CheckCircle className="text-green-600 dark:text-green-400" /> : <XCircle className="text-red-600 dark:text-red-400"/>}
                                                <h3 className="font-bold text-lg">{quizResult.isCorrect ? "Correct !" : "Incorrect"}</h3>
                                            </div>
                                            <p className="text-sm whitespace-pre-wrap">{quizResult.explanation}</p>
                                            <Button onClick={handleNewQuestion} variant="link" className="mt-2 px-0">Question suivante</Button>
                                        </div>
                                    )}
                                </div>
                            )}

                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>

        {/* Tutor Chat */}
        <div className="flex flex-col h-[calc(100vh-120px)] bg-card rounded-lg border sticky top-24">
            <header className="p-4 border-b flex items-center gap-2">
                <MessageSquareQuote className="h-6 w-6 text-accent" />
                <h2 className="text-lg font-headline">Maestro Plume</h2>
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
      </div>
    </div>
  );
}

    