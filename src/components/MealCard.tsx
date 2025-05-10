"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Meal } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from '@/components/ui/textarea';
import { Star, Utensils, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MealCardProps {
  meal: Meal;
  onUpdateMeal: (meal: Meal) => void;
}

export const MealCard: FC<MealCardProps> = ({ meal, onUpdateMeal }) => {
  const [currentRating, setCurrentRating] = useState(meal.rating);
  const [currentNotes, setCurrentNotes] = useState(meal.notes);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setCurrentRating(meal.rating);
    setCurrentNotes(meal.notes);
    setImageError(false); // Reset image error state when meal changes
  }, [meal]);

  const handleRatingChange = (newRating: number) => {
    setCurrentRating(newRating);
    onUpdateMeal({ ...meal, rating: newRating });
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentNotes(event.target.value);
  };

  const saveNotes = () => {
    onUpdateMeal({ ...meal, notes: currentNotes });
    setIsEditingNotes(false);
  };

  const dateObj = new Date(meal.date + 'T00:00:00Z'); // Ensure UTC interpretation
  const formattedDisplayDate = format(dateObj, 'EEEE, MMMM d, yyyy');

  let hint: string;
  if (meal.imageKeywords && meal.imageKeywords.trim() !== '') {
    hint = meal.imageKeywords.trim().toLowerCase().split(/\s+/).slice(0, 2).join(' ');
  } else {
    hint = meal.name.toLowerCase().split(/\s+/).slice(0, 2).join(' ');
  }
  const aiHintKeywords = hint;

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      {meal.imageUrl ? (meal.imageUrl && !imageError ? (
        <div className="relative w-full aspect-video rounded-t-lg overflow-hidden">
          <Image
            src={meal.imageUrl}
            alt={`Image of ${meal.name}`}
            fill
            style={{ objectFit: 'cover' }}
            data-ai-hint={aiHintKeywords}
            onError={() => setImageError(true)}
            priority={false}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        </div>
      ) : meal.imageUrl && imageError ? (
        <div className="relative w-full aspect-video rounded-t-lg overflow-hidden bg-muted flex items-center justify-center">
          <ImageOff className="h-16 w-16 text-muted-foreground" />
          <p className="sr-only">Image failed to load</p>
        </div>
      ) : (
        <div className="relative w-full aspect-video rounded-t-lg overflow-hidden bg-muted flex items-center justify-center">
          <ImageOff className="h-16 w-16 text-muted-foreground" />
          <p className="sr-only">No image available</p>
        </div>
      )) : (
        <div className="relative w-full aspect-video rounded-t-lg overflow-hidden bg-muted flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      )}

      <CardHeader className={cn((!meal.imageUrl || imageError) && "rounded-t-lg")}>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Utensils className="h-6 w-6 text-primary" />
          {meal.name}
        </CardTitle>
        {meal.description && (
          <CardDescription className="text-sm">{meal.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <div>
          <h4 className="font-semibold mb-1 text-sm text-muted-foreground">Rate this meal:</h4>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((starVal) => (
              <Button
                key={starVal}
                variant="ghost"
                size="icon"
                onClick={() => handleRatingChange(starVal)}
                aria-label={`Rate ${starVal} star${starVal > 1 ? 's' : ''}`}
                className={cn(
                  "h-8 w-8 p-0",
                  currentRating >= starVal ? "text-accent" : "text-muted-foreground hover:text-accent/80"
                )}
              >
                <Star className={cn("h-6 w-6", currentRating >= starVal && "fill-accent")} />
              </Button>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-1 text-sm text-muted-foreground">Your notes:</h4>
          {isEditingNotes || !meal.notes ? (
            <>
              <Textarea
                placeholder="What did you think of this meal?"
                value={currentNotes}
                onChange={handleNotesChange}
                rows={3}
              />
              <Button onClick={saveNotes} size="sm" className="mt-2">Save Notes</Button>
              {meal.notes && isEditingNotes && (
                 <Button onClick={() => setIsEditingNotes(false)} variant="outline" size="sm" className="mt-2 ml-2">Cancel</Button>
              )}
            </>
          ) : (
            <div className="p-2 border rounded-md bg-muted/50 min-h-[60px] cursor-pointer hover:bg-muted" onClick={() => setIsEditingNotes(true)}>
              <p className="text-sm whitespace-pre-wrap">{currentNotes}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Suggested for: {formattedDisplayDate}</p>
      </CardFooter>
    </Card>
  );
};
