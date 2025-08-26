
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/logo";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [artistName, setArtistName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const savedArtist = localStorage.getItem("plumeSonoreArtist");
    if (savedArtist) {
      router.replace("/studio");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogin = () => {
    if (artistName.trim().length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir votre nom d'artiste.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
        toast({
            title: "Erreur",
            description: "Le mot de passe doit contenir au moins 6 caractères.",
            variant: "destructive",
        });
        return;
    }

    localStorage.setItem("plumeSonoreArtist", artistName);
    toast({
        title: `Bienvenue, ${artistName}!`,
        description: "Vous êtes maintenant connecté.",
    });
    router.push("/studio");
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Logo className="h-24 w-24 text-primary animate-pulse" />
        </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo className="h-20 w-20 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline text-primary tracking-wider">
            Plume Sonore
          </CardTitle>
          <CardDescription className="font-body">
            Connectez-vous pour entrer dans votre studio d'écriture.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="artistName" className="font-headline">Nom d'artiste</Label>
            <Input
              id="artistName"
              placeholder="Votre nom de scène"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password"  className="font-headline">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="6 caractères minimum"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-accent hover:bg-accent/90" onClick={handleLogin}>
            Entrer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
