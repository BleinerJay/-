import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

// --- Configuration & Interfaces ---

export interface AIModelConfig {
  apiKey: string;
  modelName: string;
  temperature?: number;
  [key: string]: any; // Allow for provider-specific config
}

export interface IAIService {
  analyzeModule(moduleTitle: string, subTopics: string[]): Promise<AIAnalysisResult>;
}

// --- Base Class (Common Logic Extraction) ---

/**
 * Abstract base class that holds common logic for any AI provider.
 * This ensures prompt consistency and unified error handling across different models.
 */
export abstract class BaseAIService implements IAIService {
  protected config: AIModelConfig;

  constructor(config: AIModelConfig) {
    this.config = config;
  }

  /**
   * Generates the standardized prompt for the exam syllabus analysis.
   * Centralizing this ensures all models receive the same context instructions.
   */
  protected createPrompt(moduleTitle: string, subTopics: string[]): string {
    return `
      你是一位资深的中国公务员考试（国考/省考）培训专家。请针对考试大纲中的"${moduleTitle}"模块进行深入解析。
      该模块包含以下具体考点：${subTopics.join(', ')}。

      请返回一个 JSON 对象，包含以下内容：
      1. summary: 对该模块在考试中的地位和考察能力的简要总结（100字以内）。
      2. keyPoints: 3-5个高频核心考点或必备解题技巧。
      3. sampleQuestion: 一个该模块的经典模拟题（包含题目描述和核心解题思路，纯文本格式）。
      4. studyTip: 一条针对该模块的高效备考建议。
      5. trends: 近年（2024-2025）该模块的命题趋势或变化（例如：反套路化、政治理论占比增加等）。
    `;
  }

  /**
   * Provides a safe fallback response structure in case of API failures.
   */
  protected getFallbackResponse(error: any): AIAnalysisResult {
    console.error("AI Service Error:", error);
    return {
      summary: "暂时无法获取AI解析，请检查网络或API配置。",
      keyPoints: ["服务暂时不可用"],
      sampleQuestion: "数据加载失败",
      studyTip: "建议参考官方大纲原文。",
      trends: "暂无数据"
    };
  }

  abstract analyzeModule(moduleTitle: string, subTopics: string[]): Promise<AIAnalysisResult>;
}

// --- Concrete Implementation: Gemini ---

export class GeminiService extends BaseAIService {
  private ai: GoogleGenAI;

  constructor(config: AIModelConfig) {
    super(config);
    // API key must be obtained exclusively from process.env.API_KEY and used directly.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeModule(moduleTitle: string, subTopics: string[]): Promise<AIAnalysisResult> {
    if (!process.env.API_KEY) return this.getFallbackResponse("Missing API Key");

    const prompt = this.createPrompt(moduleTitle, subTopics);

    try {
      const response = await this.ai.models.generateContent({
        model: this.config.modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              keyPoints: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              sampleQuestion: { type: Type.STRING },
              studyTip: { type: Type.STRING },
              trends: { type: Type.STRING }
            },
            required: ["summary", "keyPoints", "studyTip", "trends"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from Gemini");

      return JSON.parse(text) as AIAnalysisResult;

    } catch (error) {
      return this.getFallbackResponse(error);
    }
  }
}

// --- Service Factory / Instance Management ---

/**
 * Factory to manage AI service instances.
 * Future expansion: add cases for 'openai', 'deepseek', etc.
 */
export class AIClientFactory {
  private static instance: IAIService;

  static initialize(provider: 'gemini' | 'other', config: AIModelConfig) {
    switch (provider) {
      case 'gemini':
        this.instance = new GeminiService(config);
        break;
      default:
        // Default to Gemini or throw error
        this.instance = new GeminiService(config);
        break;
    }
  }

  static getInstance(): IAIService {
    if (!this.instance) {
      // Default initialization if not explicitly configured
      this.initialize('gemini', {
        apiKey: process.env.API_KEY || '',
        modelName: 'gemini-2.5-flash'
      });
    }
    return this.instance;
  }
}

// --- Exported Facade (Maintains API compatibility with UI components) ---

export const getModuleAnalysis = async (moduleTitle: string, subTopics: string[]): Promise<AIAnalysisResult> => {
  return AIClientFactory.getInstance().analyzeModule(moduleTitle, subTopics);
};
