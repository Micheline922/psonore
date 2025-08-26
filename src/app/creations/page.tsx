
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Eye, PlusCircle, Trash2, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Creation } from "@/lib/types";

export default function CreationsPage() {
  const [artistName, setArtistName] = useState<string | null>(null);
  const [creations, setCreations] = useState<Creation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
    const savedArtist = localStorage.getItem("plumeSonoreArtist");
    if (!savedArtist) {
      router.replace("/");
    } else {
      setArtistName(savedArtist);
      const savedCreations = JSON.parse(localStorage.getItem(`plumeSonoreCreations_${savedArtist}`) || '[]');
      setCreations(savedCreations);
      setIsLoading(false);
    }
  }, [router]);

  const deleteCreation = (id: number) => {
    if (!artistName) return;
    const newCreations = creations.filter(c => c.id !== id);
    setCreations(newCreations);
    localStorage.setItem(`plumeSonoreCreations_${artistName}`, JSON.stringify(newCreations));
    toast({
      title: "Supprimé !",
      description: "Votre création a été supprimée.",
      variant: "destructive"
    });
  };
  
  const getTitle = (content: string) => {
    const words = content.split(' ');
    if (words.length > 5) {
      return words.slice(0, 5).join(' ') + '...';
    }
    return content || "Sans titre";
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Logo className="h-24 w-24 text-primary animate-pulse" />
      </div>
    );
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
          <h1 className="text-2xl font-headline text-primary tracking-wider text-center">Mes Créations</h1>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/studio">
              <PlusCircle />
              <span className="sr-only">Nouvelle création</span>
            </Link>
          </Button>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {creations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {creations.map(creation => (
              <Card key={creation.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline text-xl">{getTitle(creation.content)}</CardTitle>
                  <CardDescription>
                    {format(new Date(creation.date), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                   <p className="text-sm text-muted-foreground line-clamp-4">{creation.content}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                   <Button variant="outline" size="icon" asChild>
                      <Link href={`/studio?id=${creation.id}`}>
                        <Edit />
                      </Link>
                   </Button>
                   <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                            <Trash2 />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer la création</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Êtes-vous sûr de vouloir supprimer cette création ?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteCreation(creation.id)} className="bg-destructive hover:bg-destructive/90">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-8 border-dashed col-span-full">
            <CardHeader>
              <CardTitle className="flex justify-center items-center gap-2 font-headline text-2xl">
                <FolderKanban className="text-muted-foreground" />
                Aucune création
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Vous n'avez pas encore de création sauvegardée.
              </CardDescription>
            </CardContent>
             <CardFooter className="justify-center">
                 <Button asChild>
                    <Link href="/studio">Commencer à écrire</Link>
                 </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}

    