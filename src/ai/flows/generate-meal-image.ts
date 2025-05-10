
'use server';
/**
 * @fileOverview Generates a meal image using AI.
 *
 * - generateMealImage - A function that generates an image for a meal.
 * - GenerateMealImageInput - The input type for the generateMealImage function.
 * - GenerateMealImageOutput - The return type for the generateMealImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMealImageInputSchema = z.object({
  imageKeywords: z.string().describe('Keywords describing the meal for image generation (e.g., "grilled salmon lemon dill").'),
});
export type GenerateMealImageInput = z.infer<typeof GenerateMealImageInputSchema>;

const GenerateMealImageOutputSchema = z.object({
  imageDataUri: z.string().describe("The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateMealImageOutput = z.infer<typeof GenerateMealImageOutputSchema>;

export async function generateMealImage(input: GenerateMealImageInput): Promise<GenerateMealImageOutput> {
  return generateMealImageFlow(input);
}

// Note: Image generation is an experimental feature.
// The 'googleai/gemini-2.0-flash-exp' model is specifically used here for its image generation capabilities.
const generateMealImageFlow = ai.defineFlow(
  {
    name: 'generateMealImageFlow',
    inputSchema: GenerateMealImageInputSchema,
    outputSchema: GenerateMealImageOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-exp', // Specific model for image generation
      prompt: `Generate a vibrant, appetizing, realistic food photography image of ${input.imageKeywords}. The image should be well-lit and focus primarily on the food. Ensure the style is suitable for a meal suggestion app.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // Must request TEXT and IMAGE for this model
        // Optional: Adjust safety settings if needed, though default should be fine for food.
        // safetySettings: [
        //   { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
        //   { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        // ],
      },
    });

    if (!media?.url) {
      throw new Error('Image generation failed or returned no media URL.');
    }
    
    // The media.url will be a data URI, e.g., "data:image/png;base64,..."
    return { imageDataUri: media.url };
  }
);
