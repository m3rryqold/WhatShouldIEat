export interface UserPreferences {
  dietaryPreferences: string; // Comma-separated, e.g., "low carb, high protein"
  location: string; // User's current location
  cuisinePreferences: string; // Comma-separated, e.g., "Nigerian, Portuguese"
}

export interface Meal {
  id: string; // Unique identifier (e.g., UUID)
  name: string; // Name of the meal
  description?: string; // Optional description from AI
  date: string; // Date for which the meal is suggested (YYYY-MM-DD)
  rating: number; // 0-5 (0 for unrated, 1-5 for rated)
  notes: string; // User's notes about the meal
  imageUrl?: string; // Optional URL for the meal image
  imageKeywords?: string; // Optional keywords for image search
}
