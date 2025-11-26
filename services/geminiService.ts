
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";
import { AI_PROVIDERS } from "./aiConfig";

// --- 配置与接口定义 ---

export interface AIModelConfig {
  apiKey: string;
  modelName: string;
  temperature?: number;
  [key: string]: any; // 允许提供商特定的配置
}

export interface IAIService {
  analyzeModule(moduleTitle: string, subTopics: string[]): Promise<AIAnalysisResult>;
}

// --- 基础类 (通用逻辑提取) ---

/**
 * 抽象基类：包含所有 AI 提供商的通用逻辑。
 * 这确保了不同模型之间的 Prompt 一致性和统一的错误处理。
 */
export abstract class BaseAIService implements IAIService {
  protected config: AIModelConfig;

  constructor(config: AIModelConfig) {
    this.config = config;
  }

  /**
   * 生成标准化的考试大纲分析提示词。
   * 集中管理此处逻辑，确保所有模型接收到的上下文指令是一致的。
   */
  protected createPrompt(moduleTitle: string, subTopics: string[]): string {
    return `
      你是一位资深的中国公务员考试（国考/省考）培训专家。请针对考试大纲中的"${moduleTitle}"模块进行深入解析。
      该模块包含以下具体考点：${subTopics.join(', ')}。

      请严格按照以下 JSON 格式返回结果（不要包含 Markdown 代码块标记，只返回纯 JSON 字符串）：
      {
        "summary": "对该模块在考试中的地位和考察能力的简要总结（100字以内）。",
        "keyPoints": ["3-5个高频核心考点或必备解题技巧"],
        "sampleQuestion": "一个该模块的经典模拟题（包含题目描述和核心解题思路，纯文本格式）。",
        "studyTip": "一条针对该模块的高效备考建议。",
        "trends": "近年（2024-2025）该模块的命题趋势或变化（例如：反套路化、政治理论占比增加等）。"
      }
    `;
  }

  /**
   * 清洗 AI 返回的文本，尝试提取 JSON 部分。
   * 许多模型（包括 MiniMax）喜欢用 ```json ... ``` 包裹内容，需要去除。
   */
  protected cleanJsonString(text: string): string {
    let clean = text.trim();
    // 去除 markdown 代码块标记
    clean = clean.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "");
    return clean;
  }

  /**
   * 提供 API 调用失败时的兜底数据结构。
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

// --- 具体实现类：Gemini ---

export class GeminiService extends BaseAIService {
  private ai: GoogleGenAI;

  constructor(config: AIModelConfig) {
    super(config);
    // API 密钥必须直接从 process.env.API_KEY 获取并直接使用。
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
          temperature: this.config.temperature,
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

// --- 具体实现类：MiniMax ---

export class MiniMaxService extends BaseAIService {
  private baseUrl: string;

  constructor(config: AIModelConfig) {
    super(config);
    this.baseUrl = AI_PROVIDERS.minimax.url;
  }

  async analyzeModule(moduleTitle: string, subTopics: string[]): Promise<AIAnalysisResult> {
    if (!process.env.API_KEY) return this.getFallbackResponse("Missing API Key");

    const prompt = this.createPrompt(moduleTitle, subTopics);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.API_KEY}`
        },
        body: JSON.stringify({
          model: this.config.modelName,
          messages: [
            {
              sender_type: "USER",
              sender_name: "User",
              text: prompt
            }
          ],
          reply_constraints: {
            sender_type: "BOT",
            sender_name: "Assistant"
          },
          temperature: this.config.temperature,
          stream: false
        })
      });

      const data = await response.json();

      // 1. 检查 API 层级的错误码 (base_resp)
      if (data.base_resp && data.base_resp.status_code !== 0) {
        throw new Error(`MiniMax API Error: ${data.base_resp.status_msg} (Code: ${data.base_resp.status_code})`);
      }
      
      // 2. 健壮地尝试获取内容
      const content = data.choices?.[0]?.messages?.[0]?.text || data.reply || "";

      if (!content) {
        // 如果内容为空，打印完整响应以便调试
        console.error("MiniMax Empty Response Data:", data);
        throw new Error("Empty response content from MiniMax (Check console for details)");
      }

      const cleanJson = this.cleanJsonString(content);
      return JSON.parse(cleanJson) as AIAnalysisResult;

    } catch (error) {
      return this.getFallbackResponse(error);
    }
  }
}

// --- 服务工厂类 / 实例管理 ---

/**
 * 工厂类：用于管理 AI 服务实例。
 */
export class AIClientFactory {
  private static instance: IAIService;

  static initialize(provider: 'gemini' | 'minimax', config: AIModelConfig) {
    switch (provider) {
      case 'minimax':
        this.instance = new MiniMaxService(config);
        break;
      case 'gemini':
      default:
        this.instance = new GeminiService(config);
        break;
    }
  }

  static getInstance(): IAIService {
    if (!this.instance) {
      // 默认使用 MiniMax 配置
      this.initialize('minimax', {
        apiKey: process.env.API_KEY || '', 
        modelName: AI_PROVIDERS.minimax.modelName,
        temperature: AI_PROVIDERS.minimax.temperature
      });
    }
    return this.instance;
  }
}

// --- 导出外观函数 (保持与 UI 组件的 API 兼容性) ---

export const getModuleAnalysis = async (moduleTitle: string, subTopics: string[]): Promise<AIAnalysisResult> => {
  return AIClientFactory.getInstance().analyzeModule(moduleTitle, subTopics);
};
