import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");
const modelName = process.env.GOOGLE_GEMINI_MODEL || "gemini-2.0-flash-001";

export class GeminiService {
  private static model = genAI.getGenerativeModel({ model: modelName });

  static async generateContent(prompt: string): Promise<string> {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error("GOOGLE_GEMINI_API_KEY não configurada.");
    }

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      console.error("[GeminiService] Error:", error.message);
      throw error;
    }
  }

  /**
   * Extrai e faz o parse de um JSON dentro de uma string de texto,
   * lidando com possíveis blocos de código markdown ou lixo.
   */
  static parseJsonResponse<T>(text: string): T {
    const startIdx = text.indexOf('[');
    const endIdx = text.lastIndexOf(']');
    
    if (startIdx === -1 || endIdx === -1) {
      // Tentar chaves se não encontrar colchetes (objeto único)
      const objStart = text.indexOf('{');
      const objEnd = text.lastIndexOf('}');
      if (objStart === -1 || objEnd === -1) {
        throw new Error("Resposta da IA não contém JSON válido.");
      }
      return JSON.parse(text.substring(objStart, objEnd + 1));
    }
    
    const jsonStr = text.substring(startIdx, endIdx + 1);
    return JSON.parse(jsonStr);
  }
}
