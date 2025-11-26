
export const AI_PROVIDERS = {
  gemini: {
    modelName: "gemini-2.0-flash-exp",
    temperature: 0.7,
  },
  minimax: {
    url: "https://api.minimax.chat/v1/text/chatcompletion_v2",
    modelName: "abab6.5s-chat",
    temperature: 0.1, // 低温度以保证 JSON 格式稳定
  }
};
