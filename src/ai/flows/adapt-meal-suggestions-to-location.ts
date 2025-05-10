
'use server';

/**
 * @fileOverview Adapts meal suggestions based on the user's location.
 *
 * - adaptMealSuggestionsToLocation - A function that adapts meal suggestions based on the user's location.
 * - AdaptMealSuggestionsToLocationInput - The input type for the adaptMealSuggestionsToLocation function.
 * - AdaptMealSuggestionsToLocationOutput - The return type for the adaptMealSuggestionsToLocation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MealSuggestionObjectSchema = z.object({
  name: z.string().describe('The name or title of the meal.'),
  description: z.string().optional().describe('A short, appealing description of the meal (1-2 sentences).'),
  imageKeywords: z.string().optional().describe("1-3 descriptive keywords for generating an appetizing food photography image (e.g., 'local seafood stew', 'regional pastry'). These keywords will be directly used to generate an image."),
});

const AdaptMealSuggestionsToLocationInputSchema = z.object({
  mealSuggestions: z.array(MealSuggestionObjectSchema).describe('An array of meal suggestion objects, each with name, optional description, and optional imageKeywords.'),
  userLocation: z.string().describe('The current location of the user.'),
  userPreferences: z.string().optional().describe('The user meal preferences (e.g., dietary, cuisine).'),
});
export type AdaptMealSuggestionsToLocationInput = z.infer<typeof AdaptMealSuggestionsToLocationInputSchema>;

const AdaptMealSuggestionsToLocationOutputSchema = z.array(MealSuggestionObjectSchema).describe('An array of adapted meal suggestion objects based on the user location and preferences.');
export type AdaptMealSuggestionsToLocationOutput = z.infer<typeof AdaptMealSuggestionsToLocationOutputSchema>;

export async function adaptMealSuggestionsToLocation(input: AdaptMealSuggestionsToLocationInput): Promise<AdaptMealSuggestionsToLocationOutput> {
  return adaptMealSuggestionsToLocationFlow(input);
}

const adaptMealSuggestionsToLocationPrompt = ai.definePrompt({
  name: 'adaptMealSuggestionsToLocationPrompt',
  input: {
    schema: AdaptMealSuggestionsToLocationInputSchema,
  },
  output: {
    schema: AdaptMealSuggestionsToLocationOutputSchema,
  },
  prompt: `You are a meal suggestion expert. The user is currently in {{userLocation}}.
Given the following meal suggestions:

{{#each mealSuggestions}}
- Name: {{{this.name}}}
  {{#if this.description}}Description: {{{this.description}}}{{/if}}
  {{#if this.imageKeywords}}Image Keywords: {{{this.imageKeywords}}}{{/if}}
{{/each}}

Adapt these meal suggestions to be more relevant to the user's location. If user preferences are provided (User preferences: {{userPreferences}}), also use them to adapt the meal suggestions.
If a meal is perfectly suitable, you can keep it as is. If it needs adaptation, modify its name and/or description.
Try to preserve or adapt the 'imageKeywords' to remain relevant to the adapted meal, ensuring they are 1-3 descriptive keywords suitable for generating appetizing food photography. These keywords will be directly used to generate an image.
Each adapted suggestion must be an object with "name" (string), "description" (string, optional), and "imageKeywords" (string, optional, 1-3 words for food photography image generation).

Respond with ONLY a valid JSON array of the adapted meal objects, maintaining the structure.
Example of a single adapted meal object:
{
  "name": "Local Fisherman's Stew",
  "description": "A hearty stew featuring fresh, locally caught seafood from {{userLocation}}, simmered in a savory broth.",
  "imageKeywords": "seafood stew local catch"
}
`,  
});

const adaptMealSuggestionsToLocationFlow = ai.defineFlow(
  {
    name: 'adaptMealSuggestionsToLocationFlow',
    inputSchema: AdaptMealSuggestionsToLocationInputSchema,
    outputSchema: AdaptMealSuggestionsToLocationOutputSchema,
  },
  async input => {
    const {output} = await adaptMealSuggestionsToLocationPrompt(input);
    return output!;
  }
);

