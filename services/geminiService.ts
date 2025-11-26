import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const modelName = 'gemini-2.5-flash';

export const getModuleAnalysis = async (moduleTitle: string, subTopics: string[]): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const prompt = `
    你是一位资深的中国公务员考试（国考/省考）培训专家。请针对考试大纲中的"${moduleTitle}"模块进行深入解析。
    该模块包含以下具体考点：${subTopics.join(', ')}。

    请返回一个 JSON 对象，包含以下内容：
    1. summary: 对该模块在考试中的地位和考察能力的简要总结（100字以内）。
    2. keyPoints: 3-5个高频核心考点或必备解题技巧。
    3. sampleQuestion: 一个该模块的经典模拟题（包含题目描述和核心解题思路，纯文本格式）。
    4. studyTip: 一条针对该模块的高效备考建议。
    5. trends: 近年（2024-2025）该模块的命题趋势或变化（例如：反套路化、政治理论占比增加等）。
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
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
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Error fetching AI analysis:", error);
    return {
      summary: "暂时无法获取AI解析，请检查网络或API配置。",
      keyPoints: ["请稍后重试"],
      sampleQuestion: "数据加载失败",
      studyTip: "建议参考官方大纲原文。",
      trends: "暂无数据"
    };
  }
};