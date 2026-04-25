import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getGenAI() {
  if (!genAI) {
    const meta = import.meta as any;
    const apiKey = meta.env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? (process as any).env.GEMINI_API_KEY : '');
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add GEMINI_API_KEY to your environment variables in AI Studio settings.");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export const getTutorResponse = async (history: any[], userInput: string, userContext: any) => {
  const ai = getGenAI();
  const model = ai.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    systemInstruction: `You are an expert DevOps Tutor and Learning Co-Pilot. 
Your goal is to help users learn Docker, Kubernetes, CI/CD, and Cloud Native concepts iteratively.
Adapt your style based on user responses:
- If they are confused, use real-world analogies.
- If they are experienced, be technical and concise.
- Use Socratic questioning to force them to reason through problems.
- Try to detect shallow understanding and misconceptions.

ALWAYS respond in a conversational and supportive way. Keep responses concise but insightful.`
  });

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
