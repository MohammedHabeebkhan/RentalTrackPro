
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLeaseTerms = async (tenantData: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this tenant lease data and provide a professional summary of their financial stability and lease health: ${JSON.stringify(tenantData)}`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI analysis unavailable at the moment.";
  }
};

export const generateFinancialReportAdvice = async (stats: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As a financial property advisor, analyze these stats and give 3 bullet points of advice: ${JSON.stringify(stats)}`,
      config: {
        temperature: 0.6,
      }
    });
    return response.text;
  } catch (error) {
    return "Keep monitoring your collection rates and maintain a reserve fund.";
  }
};

export const draftPaymentReminder = async (tenantName: string, amount: number, dueDate: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Draft a very polite but professional email reminder for a tenant named ${tenantName} for a rent payment of $${amount} that was due on ${dueDate}. Keep it friendly but clear.`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    return `Hi ${tenantName}, this is a friendly reminder that your rent payment of $${amount} is currently outstanding. Please settle this at your earliest convenience.`;
  }
};
