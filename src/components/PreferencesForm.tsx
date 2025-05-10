"use client";

import type { FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserPreferences } from '@/types';
import { BookOpenText, ChefHat, MapPin, Save } from 'lucide-react';

const preferencesSchema = z.object({
  dietaryPreferences: z.string().min(3, { message: "Dietary preferences must be at least 3 characters." }).describe("e.g., low carb, high protein, vegan"),
  location: z.string().min(2, { message: "Location must be at least 2 characters." }).describe("e.g., Lisbon, Portugal"),
  cuisinePreferences: z.string().min(3, { message: "Cuisine preferences must be at least 3 characters." }).describe("e.g., Nigerian, Italian, Thai"),
});

interface PreferencesFormProps {
  initialPreferences?: UserPreferences | null;
  onSubmit: (data: UserPreferences) => void;
  isSubmitting?: boolean;
}

export const PreferencesForm: FC<PreferencesFormProps> = ({ initialPreferences, onSubmit, isSubmitting }) => {
  const form = useForm<UserPreferences>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: initialPreferences || {
      dietaryPreferences: '',
      location: '',
      cuisinePreferences: '',
    },
  });

  const handleSubmit = (data: UserPreferences) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-lg mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <ChefHat className="text-primary h-7 w-7" />
          Your Food Preferences
        </CardTitle>
        <CardDescription>
          Tell us about your tastes and location so we can suggest the best meals for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="dietaryPreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-lg"><BookOpenText className="h-5 w-5 text-primary" />Dietary Preferences</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., low carb, high protein, vegan" {...field} />
                  </FormControl>
                  <FormDescription>Comma-separated list of your dietary needs or goals.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-lg"><MapPin className="h-5 w-5 text-primary" />Your Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Lagos, Nigeria or Lisbon, Portugal" {...field} />
                  </FormControl>
                  <FormDescription>Your current city and country.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cuisinePreferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-lg"><ChefHat className="h-5 w-5 text-primary" />Cuisine Preferences</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Nigerian, Portuguese, Italian" {...field} />
                  </FormControl>
                  <FormDescription>Comma-separated list of cuisines you enjoy.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Preferences & Get Meals'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
