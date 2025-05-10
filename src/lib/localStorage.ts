
"use client";

import type { UserPreferences, Meal } from '@/types';

const OLD_PREFERENCES_KEY = 'foodwise-preferences';
const PREFERENCES_KEY = 'whatshouldieat-preferences';
const MEAL_HISTORY_KEY_PREFIX = 'whatshouldieat-meal-history-'; // Suffix with YYYY-MM-DD
const OLD_MEAL_HISTORY_KEY_PREFIX = 'foodwise-meal-history-';


// Preferences
export function savePreferences(preferences: UserPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error("Error saving preferences to localStorage:", error);
  }
}

export function loadPreferences(): UserPreferences | null {
  try {
    let preferencesJson = localStorage.getItem(PREFERENCES_KEY);
    if (!preferencesJson) {
      // Try loading from old key if new one not found (for existing users)
      preferencesJson = localStorage.getItem(OLD_PREFERENCES_KEY);
      if (preferencesJson) {
        // If found under old key, save it under new key and remove old one
        const prefs = JSON.parse(preferencesJson);
        savePreferences(prefs); // This will save it under the new key
        localStorage.removeItem(OLD_PREFERENCES_KEY); // Clean up old key
        return prefs;
      }
    }
    return preferencesJson ? JSON.parse(preferencesJson) : null;
  } catch (error) {
    console.error("Error loading preferences from localStorage:", error);
    return null;
  }
}

export function clearPreferences(): void {
  try {
    localStorage.removeItem(PREFERENCES_KEY);
    localStorage.removeItem(OLD_PREFERENCES_KEY); // Also clear old key if it exists
  } catch (error) {
    console.error("Error clearing preferences from localStorage:", error);
  }
}

// Meal History (includes ratings and notes within Meal objects)
function getMealHistoryKey(date: string): string {
  return `${MEAL_HISTORY_KEY_PREFIX}${date}`;
}
function getOldMealHistoryKey(date: string): string {
  return `${OLD_MEAL_HISTORY_KEY_PREFIX}${date}`;
}


export function saveMealHistory(date: string, meals: Meal[]): void {
  try {
    const key = getMealHistoryKey(date);
    localStorage.setItem(key, JSON.stringify(meals));
  } catch (error) {
    console.error("Error saving meal history to localStorage:", error);
  }
}

export function loadMealHistory(date: string): Meal[] | null {
  try {
    const key = getMealHistoryKey(date);
    let mealsJson = localStorage.getItem(key);

    if (!mealsJson) {
      const oldKey = getOldMealHistoryKey(date);
      mealsJson = localStorage.getItem(oldKey);
      if (mealsJson) {
        const meals = JSON.parse(mealsJson);
        saveMealHistory(date, meals); // Save to new key
        localStorage.removeItem(oldKey); // Remove old key
        return meals;
      }
    }
    return mealsJson ? JSON.parse(mealsJson) : null;
  } catch (error) {
    console.error("Error loading meal history from localStorage:", error);
    return null;
  }
}

export function updateMealInHistory(date: string, updatedMeal: Meal): void {
  try {
    const meals = loadMealHistory(date) || [];
    const mealIndex = meals.findIndex(meal => meal.id === updatedMeal.id);
    if (mealIndex > -1) {
      meals[mealIndex] = updatedMeal;
    } else {
      meals.push(updatedMeal); 
    }
    saveMealHistory(date, meals);
  } catch (error)
    {
    console.error("Error updating meal in localStorage:", error);
  }
}
