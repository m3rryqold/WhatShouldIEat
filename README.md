# WhatShouldIEat

WhatShouldIEat is a NextJS application designed to help you discover delicious and personalized meal plans. By providing your dietary preferences (e.g., low carb, high protein, vegan), your current location, and your favorite cuisines (e.g., Nigerian, Portuguese, Italian), WhatShouldIEat generates meal suggestions tailored to your specific needs and tastes.

The application utilizes the Gemini AI model to create meal suggestions and can also generate images of the suggested meals.

To get started, take a look at src/app/page.tsx.

## Setting up the Gemini API Key

1.  Create a `.env` file in the `src` directory.
2.  Add the following line to the `.env` file, replacing `YOUR_GEMINI_API_KEY` with your actual Gemini API key:

    ```
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```
3.  Deploy your application to Vercel. The API key will be securely accessed from the environment variables.
