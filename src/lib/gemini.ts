import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const model = genAI.getGenerativeModel({ 
  model: "gemini-2.0-flash",
  systemInstruction: `You are an expert DevOps Tutor and Learning Co-Pilot. 
Your goal is to help users learn Docker, Kubernetes, CI/CD, and Cloud Native concepts iteratively.
Adapt your style based on user responses:
- If they are confused, use real-world analogies.
- If they are experienced, be technical and concise.
- Use Socratic questioning to force them to reason through problems.
- detected shallow understanding and misconceptions.

ALWAYS respond in JSON format if requested, but for chat, be conversational and supportive.`
});

export const getTutorResponse = async (history: any[], userInput: string, userContext: any) => {
  const chat = model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  const prompt = `User Context: ${JSON.stringify(userContext)}
  
User said: "${userInput}"

Respond as the DevOps Tutor. If you see a misconception, gently correct it. If the user seems to understand, offer the 'Next Best Concept' from the DevOps roadmap.`;

  const result = await chat.sendMessage(prompt);
  const response = await result.response;
  return response.text();
};
