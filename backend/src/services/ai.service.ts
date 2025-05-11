import { Groq } from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY as string,
});

export const generateKnowledgeSummary = async (
  transcript: string
): Promise<string> => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that helps with knowledge management. Extract key information from this exit interview transcript and create a structured summary of the employee's knowledge, responsibilities, and recommendations.",
        },
        {
          role: "user",
          content: transcript,
        },
      ],
      model: "llama3-70b-8192",
      temperature: 0.5,
      max_tokens: 2048,
    });

    return (
      completion.choices[0]?.message?.content || "Failed to generate summary"
    );
  } catch (error) {
    console.error("GROQ API error:", error);
    throw new Error("Failed to generate knowledge summary");
  }
};

export const detectSpofs = async (knowledgeData: any): Promise<any> => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that helps with identifying Single Points of Failure (SPOFs) in organizational knowledge. Analyze the provided knowledge data and identify potential SPOFs.",
        },
        {
          role: "user",
          content: JSON.stringify(knowledgeData),
        },
      ],
      model: "llama3-70b-8192",
      temperature: 0.3,
      max_tokens: 2048,
    });

    return JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error("GROQ API error:", error);
    throw new Error("Failed to detect SPOFs");
  }
};

export const generateHandoverPlan = async (
  employeeData: any,
  knowledgeData: any
): Promise<any> => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant that helps with employee handovers. Generate a comprehensive handover plan based on the employee data and their knowledge areas.",
        },
        {
          role: "user",
          content: JSON.stringify({
            employee: employeeData,
            knowledge: knowledgeData,
          }),
        },
      ],
      model: "llama3-70b-8192",
      temperature: 0.4,
      max_tokens: 2048,
    });

    return JSON.parse(completion.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error("GROQ API error:", error);
    throw new Error("Failed to generate handover plan");
  }
};
