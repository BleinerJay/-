import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, AIStrategyResult, SubjectCategory } from "../types";
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
  getStrategy(category: SubjectCategory): Promise<AIStrategyResult>;
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
   */
  protected createAnalysisPrompt(moduleTitle: string, subTopics: string[]): string {
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
   * 生成备考策略提示词
   */
  protected createStrategyPrompt(category: SubjectCategory): string {
    const subjectName = category === SubjectCategory.XINGCE ? "行政职业能力测验 (行测)" : "综合应用能力 / 申论";
    return `
      你是一位行测/申论高分上岸的导师。请为"${subjectName}"科目提供一条**高价值、差异化**的备考或应试策略。
      不要只给通用的废话，要给具体的技巧（例如：行测蒙题技巧、申论大作文高分结构、特定题型的秒杀法等）。每次生成的内容最好不同。

      请严格按照以下 JSON 格式返回结果（纯 JSON 字符串）：
      {
        "tip": "一条核心的高分策略或实战技巧（100字左右）。",
        "timeAdvice": "关于该科目的时间管理或复习节奏的具体建议（30字以内）。"
      }
    `;
  }

  /**
   * 清洗 AI 返回的文本，尝试提取 JSON 部分。
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

  protected getFallbackStrategy(error: any): AIStrategyResult {
    console.error("AI Strategy Error:", error);
    return {
      tip: "AI 服务暂时繁忙，请稍后重试。保持平稳心态是考试成功的关键。",
      timeAdvice: "合理分配时间，不要纠结难题。"
    };
  }

  abstract analyzeModule(moduleTitle: string, subTopics: string[]): Promise<AIAnalysisResult>;
  abstract getStrategy(category: SubjectCategory): Promise<AIStrategyResult>;
}

// --- 具体实现类：Gemini ---

export class GeminiService extends BaseAIService {
  private ai: GoogleGenAI;

  constructor(config: AIModelConfig) {
    super(config);
    // 确保去除密钥空格，并移除可能存在的引号
    const rawKey = process.env.API_KEY || "";
    const apiKey = rawKey.trim().replace(/^['"]|['"]$/g, '');
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeModule(moduleTitle: string, subTopics: string[]): Promise<AIAnalysisResult> {
    if (!process.env.API_KEY) return this.getFallbackResponse("Missing API Key");

    const prompt = this.createAnalysisPrompt(moduleTitle, subTopics);

    try {
      const response = await this.ai.models.generateContent({
        model: this.config.modelName,
        contents: prompt,
        config: {
          temperature: this.config.temperature,
          responseMimeType: "application/json",
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from Gemini");

      return JSON.parse(text) as AIAnalysisResult;

    } catch (error) {
      return this.getFallbackResponse(error);
    }
  }

  async getStrategy(category: SubjectCategory): Promise<AIStrategyResult> {
    if (!process.env.API_KEY) return this.getFallbackStrategy("Missing API Key");

    const prompt = this.createStrategyPrompt(category);

    try {
      const response = await this.ai.models.generateContent({
        model: this.config.modelName,
        contents: prompt,
        config: {
          temperature: 0.9, // 提高温度以获取多样化的策略
          responseMimeType: "application/json",
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from Gemini");

      return JSON.parse(text) as AIStrategyResult;
    } catch (error) {
      return this.getFallbackStrategy(error);
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

  // 通用 MiniMax 请求封装
  private async callMiniMax(prompt: string, temp: number = 0.1): Promise<string> {
    // 关键修复：强力清洗密钥，去除空格和可能的引号
    const rawKey = process.env.API_KEY || "";
    const apiKey = rawKey.trim().replace(/^['"]|['"]$/g, '');
    
    if (!apiKey) throw new Error("Missing API Key");

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
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
        temperature: temp,
        stream: false
      })
    });

    const data = await response.json();

    if (data.base_resp && data.base_resp.status_code !== 0) {
      throw new Error(`MiniMax API Error: ${data.base_resp.status_msg} (Code: ${data.base_resp.status_code})`);
    }
    
    const content = data.choices?.[0]?.messages?.[0]?.text || data.reply || "";
    
    if (!content) {
      console.error("MiniMax Empty Response:", data);
      throw new Error("Empty response content from MiniMax");
    }

    return content;
  }

  async analyzeModule(moduleTitle: string, subTopics: string[]): Promise<AIAnalysisResult> {
    const prompt = this.createAnalysisPrompt(moduleTitle, subTopics);
    try {
      const content = await this.callMiniMax(prompt, this.config.temperature);
      const cleanJson = this.cleanJsonString(content);
      return JSON.parse(cleanJson) as AIAnalysisResult;
    } catch (error) {
      return this.getFallbackResponse(error);
    }
  }

  async getStrategy(category: SubjectCategory): Promise<AIStrategyResult> {
    const prompt = this.createStrategyPrompt(category);
    try {
      // 提高温度以获得随机性
      const content = await this.callMiniMax(prompt, 0.9);
      const cleanJson = this.cleanJsonString(content);
      return JSON.parse(cleanJson) as AIStrategyResult;
    } catch (error) {
      return this.getFallbackStrategy(error);
    }
  }
}

// --- 服务工厂类 / 实例管理 ---

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
      this.initialize('minimax', {
        apiKey: process.env.API_KEY || '', 
        modelName: AI_PROVIDERS.minimax.modelName,
        temperature: AI_PROVIDERS.minimax.temperature
      });
    }
    return this.instance;
  }
}

// --- 导出外观函数 ---

export const getModuleAnalysis = async (moduleTitle: string, subTopics: string[]): Promise<AIAnalysisResult> => {
  return AIClientFactory.getInstance().analyzeModule(moduleTitle, subTopics);
};

export const getSubjectStrategy = async (category: SubjectCategory): Promise<AIStrategyResult> => {
  return AIClientFactory.getInstance().getStrategy(category);
};