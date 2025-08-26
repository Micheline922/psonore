"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2 } from "lucide-react";

const formSchema = z.object({
  textFragment: z.string().min(10, {
    message: "Le texte doit contenir au moins 10 caractères.",
  }),
  style: z.string({
    required_error: "Veuillez sélectionner un style.",
  }),
});

type CreativeAssistantFormProps = {
  text: string;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isLoading: boolean;
};

export default function CreativeAssistantForm({ text, onSubmit, isLoading }: CreativeAssistantFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      textFragment: text,
      style: "slam",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="textFragment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texte inachevé</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Votre texte à compléter ou enrichir..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Style désiré</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="slam">Slam</SelectItem>
                  <SelectItem value="rap">Rap</SelectItem>
                  <SelectItem value="poesie romantique">Poésie Romantique</SelectItem>
                  <SelectItem value="poesie engagee">Poésie Engagée</SelectItem>
                  <SelectItem value="conte">Conte</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Wand2 className="mr-2 h-4 w-4" />
          )}
          Générer
        </Button>
      </form>
    </Form>
  );
}
