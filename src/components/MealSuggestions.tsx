
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { UserPreferences, Meal } from '@/types';
import { PreferencesForm } from '@/components/PreferencesForm';
import { MealCard } from '@/components/MealCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { savePreferences, loadPreferences, saveMealHistory, loadMealHistory, updateMealInHistory, clearPreferences } from '@/lib/localStorage';
import { generateMealSuggestions, type GenerateMealSuggestionsOutput } from '@/ai/flows/generate-meal-suggestions';
import { adaptMealSuggestionsToLocation, type AdaptMealSuggestionsToLocationOutput } from '@/ai/flows/adapt-meal-suggestions-to-location';
import { generateMealImage, type GenerateMealImageOutput } from '@/ai/flows/generate-meal-image';
import { useToast } from '@/hooks/use-toast';
import { format, addDays, subDays, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Edit3, RotateCw, AlertTriangle, Info, CalendarDays, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function formatDateToYYYYMMDD(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function MealSuggestions() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // For loading preferences
  const [isDateInitialized, setIsDateInitialized] = useState(false); // For initializing selectedDate
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  const fetchAndSetMeals = useCallback(async (dateToFetchFor: Date, currentPrefs: UserPreferences) => {
    if (!currentPrefs) {
      toast({ title: "Preferences Missing", description: "Please set your preferences first.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setError(null);
    setMeals([]); // Clear existing meals while loading new ones

    try {
      const genInput = {
        dietaryPreferences: currentPrefs.dietaryPreferences,
        location: currentPrefs.location,
        cuisinePreferences: currentPrefs.cuisinePreferences,
      };
      const initialMealObjects: GenerateMealSuggestionsOutput = await generateMealSuggestions(genInput);
      
      if (!initialMealObjects || initialMealObjects.length === 0) {
        toast({ title: "No initial suggestions", description: "The AI couldn't generate initial meal ideas. Try different preferences."});
        setIsLoading(false);
        return;
      }

      const adaptInput = {
        mealSuggestions: initialMealObjects,
        userLocation: currentPrefs.location,
        userPreferences: `Diet: ${currentPrefs.dietaryPreferences}. Cuisine: ${currentPrefs.cuisinePreferences}.`,
      };
      const adaptedMealObjects: AdaptMealSuggestionsToLocationOutput = await adaptMealSuggestionsToLocation(adaptInput);

      if (!adaptedMealObjects || adaptedMealObjects.length === 0) {
        toast({ title: "No adapted suggestions", description: "The AI couldn't adapt meals for your location. Try different preferences." });
        setIsLoading(false);
        return;
      }
      
      const dateString = formatDateToYYYYMMDD(dateToFetchFor);

      // Show meals with placeholder text/icons immediately
      const mealsWithPlaceholders = adaptedMealObjects.map(mealObj => ({
        id: crypto.randomUUID(),
        name: mealObj.name,
        description: mealObj.description,
        imageKeywords: mealObj.imageKeywords,
        // Use a generic or loading placeholder, or temporarily picsum
        imageUrl: undefined,
        date: dateString,
        rating: 0,
        notes: '',
      }));
      setMeals(mealsWithPlaceholders);


      // Asynchronously generate images for each meal
      const finalMealsPromises = adaptedMealObjects.map(async (mealObj) => {
        const mealId = mealsWithPlaceholders.find(m => m.name === mealObj.name)?.id || crypto.randomUUID(); // find existing id or generate new
        let finalImageUrl = `https://picsum.photos/seed/${encodeURIComponent((mealObj.imageKeywords || mealObj.name).trim().replace(/\s+/g, '-'))}/400/300`; // default placeholder
        try {
          if (mealObj.imageKeywords && mealObj.imageKeywords.trim() !== '') {
            const imageResult: GenerateMealImageOutput = await generateMealImage({ imageKeywords: mealObj.imageKeywords });
            finalImageUrl = imageResult.imageDataUri;
          } else {
             // Fallback if no keywords, maybe try name, or just keep placeholder
            const imageResult: GenerateMealImageOutput = await generateMealImage({ imageKeywords: mealObj.name });
            finalImageUrl = imageResult.imageDataUri;
          }
        } catch (imgErr) {
          console.error(`Failed to generate image for ${mealObj.name}:`, imgErr);
          toast({ title: "Image Generation Issue", description: `Could not create an image for "${mealObj.name}". Using a placeholder.`, variant: "default", duration: 5000 });
          // Keep placeholder in case of error
        }
        return {
          id: mealId,
          name: mealObj.name,
          description: mealObj.description,
          imageKeywords: mealObj.imageKeywords,
          imageUrl: finalImageUrl,
          date: dateString,
          rating: 0,
          notes: '',
        };
      });
      
      const newMealsWithGeneratedImages = await Promise.all(finalMealsPromises);
      setMeals(newMealsWithGeneratedImages);
      saveMealHistory(dateString, newMealsWithGeneratedImages);
      toast({ title: "Meal suggestions updated!", description: `Found ${newMealsWithGeneratedImages.length} meals for ${format(dateToFetchFor, 'PPP')}.` });

    } catch (err) {
      console.error("Error fetching meal suggestions:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to fetch meal suggestions: ${errorMessage}`);
      toast({ title: "Error", description: `Could not fetch suggestions. ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadMealsForDate = useCallback((date: Date) => {
    const dateString = formatDateToYYYYMMDD(date);
    const storedMeals = loadMealHistory(dateString);
    if (storedMeals) {
      setMeals(storedMeals);
    } else {
      setMeals([]); 
      if (preferences) {
         fetchAndSetMeals(date, preferences);
      }
    }
  }, [preferences, fetchAndSetMeals]);

  useEffect(() => {
    const loadedPrefs = loadPreferences();
    setPreferences(loadedPrefs);
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    // Initialize selectedDate on client mount
    if (typeof window !== 'undefined' && !selectedDate) {
      setSelectedDate(new Date());
      setIsDateInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!isInitializing && isDateInitialized && selectedDate) {
      if (preferences) {
        loadMealsForDate(selectedDate);
      } else {
        setMeals([]);
      }
    }
  }, [selectedDate, preferences, isInitializing, isDateInitialized, loadMealsForDate]);


  const handlePreferencesSubmit = (data: UserPreferences) => {
    savePreferences(data);
    setPreferences(data);
    toast({ title: "Preferences Saved!", description: "We'll use these for future suggestions." });
    if (selectedDate) {
      fetchAndSetMeals(selectedDate, data);
    }
  };

  const handleUpdateMeal = (updatedMeal: Meal) => {
    const dateString = formatDateToYYYYMMDD(parseISO(updatedMeal.date));
    updateMealInHistory(dateString, updatedMeal);
    setMeals(prevMeals => prevMeals.map(m => m.id === updatedMeal.id ? updatedMeal : m));
    toast({ title: "Meal Updated", description: `${updatedMeal.name} details saved.` });
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    setSelectedDate(currentDate => {
      if (!currentDate) return new Date(); 
      return direction === 'prev' ? subDays(currentDate, 1) : addDays(currentDate, 1);
    });
  };
  
  const handleEditPreferences = () => {
    setPreferences(null); 
  };

  const handleClearPreferencesAndHistory = () => {
    clearPreferences();
    // Additionally clear all meal history from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('foodwise-meal-history-') || key.startsWith('whatshouldieat-meal-history-')) { // Ensure this matches the actual prefix used
        localStorage.removeItem(key);
      }
    });
    setPreferences(null);
    setMeals([]); 
    setSelectedDate(new Date()); // Reset to today
    toast({ title: "Data Cleared", description: "Your preferences and all meal history have been cleared." });
  };

  if (isInitializing || !isDateInitialized || !selectedDate) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-1/2 mx-auto" />
        <Skeleton className="h-64 w-full max-w-lg mx-auto" />
      </div>
    );
  }

  if (!preferences) {
    return <PreferencesForm onSubmit={handlePreferencesSubmit} isSubmitting={isLoading} />;
  }

  return (
    <div className="space-y-8">
      <div className="p-6 bg-card rounded-xl shadow-xl border">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 pb-6 border-b">
          <div>
            <h2 className="text-3xl font-bold text-primary flex items-center gap-2">
              <CalendarDays className="h-7 w-7"/>
              Meals for {format(selectedDate, 'PPP')}
            </h2>
            <p className="text-muted-foreground">Your personalized meal plan for the day.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleEditPreferences} variant="outline" size="sm" className="w-full sm:w-auto">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Preferences
            </Button>
             <Button onClick={handleClearPreferencesAndHistory} variant="destructive" size="sm" className="w-full sm:w-auto">
              <Trash2 className="mr-2 h-4 w-4" /> Clear All Data
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
          <Button onClick={() => handleDateChange('prev')} variant="outline" size="icon" aria-label="Previous day">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button onClick={() => fetchAndSetMeals(selectedDate, preferences)} disabled={isLoading} variant="default" className="px-4 sm:px-6 py-3 text-base flex-grow sm:flex-grow-0 max-w-xs">
            <RotateCw className={cn("mr-2 h-5 w-5", isLoading && "animate-spin")} />
            {isLoading ? 'Refreshing...' : `Refresh for ${format(selectedDate, 'MMM d')}`}
          </Button>
          <Button onClick={() => handleDateChange('next')} variant="outline" size="icon" aria-label="Next day">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-5 w-5"/>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && meals.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3 bg-card p-4 rounded-lg shadow-md border">
                <Skeleton className="h-40 w-full rounded-md bg-muted/50" /> 
                <Skeleton className="h-8 w-3/4 mt-2 bg-muted/50" />
                <Skeleton className="h-4 w-1/2 bg-muted/50" />
                <Skeleton className="h-16 w-full bg-muted/50" />
                <Skeleton className="h-10 w-full bg-muted/50" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && meals.length === 0 && !error && (
           <Alert className="mb-6 bg-accent/10 border-accent/30 text-accent-foreground">
            <Info className="h-5 w-5 text-accent"/>
            <AlertTitle>No Meals Yet</AlertTitle>
            <AlertDescription>
              No meals found for {format(selectedDate, 'PPP')}. 
              {preferences ? 'Try clicking the "Refresh" button to get new suggestions.' : 'Please set your preferences first.'}
            </AlertDescription>
          </Alert>
        )}

        {meals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {meals.map(meal => (
              <MealCard key={meal.id} meal={meal} onUpdateMeal={handleUpdateMeal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
