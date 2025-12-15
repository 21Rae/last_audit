import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AuditReport, AuditRequest } from "../types.ts";

const processFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const fileToBase64 = processFile;

export const performAudit = async (request: AuditRequest): Promise<AuditReport> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      overallScore: { type: Type.NUMBER, description: "Overall store score from 0-100" },
      summary: { type: Type.STRING, description: "A brief 2-sentence summary of the audit findings." },
      categories: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Category name e.g. CRO, Trust, Speed" },
            score: { type: Type.NUMBER, description: "Score 0-100" },
            description: { type: Type.STRING, description: "Short assessment of this category" }
          },
          required: ["name", "score", "description"]
        }
      },
      issues: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['CRO', 'Trust', 'Speed', 'SEO', 'Mobile', 'Brand'] },
            title: { type: Type.STRING },
            problem: { type: Type.STRING, description: "What is wrong" },
            impact: { type: Type.STRING, description: "Why it hurts sales" },
            priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
            fix: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              },
              required: ["title", "description", "steps"]
            }
          },
          required: ["id", "category", "title", "problem", "impact", "priority", "fix"]
        }
      }
    },
    required: ["overallScore", "summary", "categories", "issues"]
  };

  let prompt = `You are a world-class Shopify Conversion Rate Optimization (CRO) expert. 
  Perform a simulated, critical audit of the following Shopify store.
  
  Store URL: ${request.url}
  Niche: ${request.niche || 'General E-commerce'}
  Target Market: ${request.targetMarket || 'Global'}

  Focus on these core areas:
  1. CRO (Call to actions, above fold clarity)
  2. Trust (Badges, reviews, policies)
  3. Speed (Simulated assessment of potential bloat)
  4. SEO (Meta structures, headings)
  5. Mobile Experience (Tap targets, layout)
  6. Brand & Messaging (Clarity of value prop)

  Be strict. Most stores have significant issues. Provide at least 5 critical issues with actionable fixes.
  Score the store realistically (most stores score between 40-70 initially).`;

  const parts: any[] = [{ text: prompt }];

  if (request.screenshot) {
    parts.push({
      inlineData: {
        mimeType: 'image/png', // Assuming PNG for simplicity, could be JPEG
        data: request.screenshot
      }
    });
    prompt += `\n\nAnalyze the attached screenshot of the homepage/product page for visual hierarchy, clutter, and design issues.`;
  } else {
    prompt += `\n\nSince no screenshot was provided, infer likely issues based on common pitfalls in the ${request.niche || 'e-commerce'} industry and the structure of typical Shopify themes.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are a brutal but helpful audit AI. Do not be polite about design flaws; be objective. Focus on revenue impact.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    const data = JSON.parse(text) as AuditReport;
    
    // Enrich with metadata
    data.storeUrl = request.url;
    data.timestamp = new Date().toISOString();
    
    return data;

  } catch (error) {
    console.error("Audit failed:", error);
    throw error;
  }
};

export const chatWithAuditor = async (currentReport: AuditReport, message: string, chatHistory: {role: string, parts: any[]}[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const systemInstruction = `You are the AI Auditor who just analyzed this store: ${currentReport.storeUrl}.
    Context of the audit:
    Overall Score: ${currentReport.overallScore}
    Summary: ${currentReport.summary}
    
    Answer the user's questions specifically about their audit results. Keep answers short, punchy, and helpful.`;

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction },
        history: chatHistory.map(h => ({
            role: h.role,
            parts: h.parts
        }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I couldn't generate a response.";
}