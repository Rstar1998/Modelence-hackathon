import { Module } from 'modelence/server';
import { dbQuestionGenerations } from './db';

// IMPORTANT: You'll need to install a library to make HTTP requests
// npm install node-fetch
import fetch from 'node-fetch';

// This would be your secret AI API key, stored in environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

export default new Module('questionGenerator', {
  // Include the store we created so Modelence provisions it automatically
  stores: [dbQuestionGenerations],

  queries: {
    // A query to get a specific generation result by its ID
    async getOne({ id }) {
      return await dbQuestionGenerations.findById(id);
    },
    // A query to get all past generations for the logged-in user
    async getAllForUser(args, { user }) {
      return await dbQuestionGenerations.fetch({ userId: user.id });
    }
  },

  mutations: {
    // The core mutation that powers the feature
    async generate(
      { resume, jobDescription }: { resume: string; jobDescription: string },
      { user }
    ) {
      
      const prompt = `
        You are an expert technical recruiter and hiring manager.
        Your task is to generate insightful interview questions based on the provided resume and job description.
        Analyze the resume and compare it to the requirements in the job description.
        Identify areas of strength, potential gaps, and specific projects or skills to probe deeper on.

        Generate a JSON array of 5 to 7 questions with the following structure: { "questionText": string, "category": "Technical" | "Behavioral" | "Situational", "rationale": string }.
        - "Technical" questions should test specific skills mentioned in both documents.
        - "Behavioral" questions should explore past experiences (e.g., "Tell me about a time...").
        - "Situational" questions should pose a hypothetical problem (e.g., "How would you handle...").
        - "rationale" should explain why this is a good question to ask this specific candidate for this specific role.

        ---
        JOB DESCRIPTION:
        ${jobDescription}
        ---
        RESUME:
        ${resume}
        ---
      `;

      // 2. Call the external AI API
    

      const aiResponse = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!aiResponse.ok) {
        const errorBody = await aiResponse.json();
        console.error('AI API Error:', {
            status: aiResponse.status,
            statusText: aiResponse.statusText,
            body: errorBody,
        });
        
        throw new Error(`AI API request failed with status ${aiResponse.status}: ${errorBody.error?.message || 'Check terminal for details'}`);
      }

      const aiData = await aiResponse.json() as any;
      // Extract the text and parse it as JSON
      const responseText = aiData.candidates[0].content.parts[0].text;
     
      let jsonString = responseText;
        const match = responseText.match(/```json\s*([\s\S]*?)\s*```/);

        if (match && match[1]) {
        jsonString = match[1];
        }

      const generatedQuestions = JSON.parse(jsonString);

      // 3. Save the entire session to our database
    //   const { insertedId } = await dbQuestionGenerations.insertOne({
    //     resume,
    //     jobDescription,
    //     generatedQuestions,
    //     userId: "efw",//user.id,
    //     createdAt: new Date(),
    //   });
      
      // 4. Return the generated questions to the client
      return {
        resume,
        jobDescription,
        generatedQuestions,
        createdAt: new Date(),
      };
      //return await dbQuestionGenerations.findById(insertedId);
    },
  },
});