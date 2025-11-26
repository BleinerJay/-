
export enum SubjectCategory {
  XINGCE = 'XINGCE', // 行政职业能力测验
  ZONGHE = 'ZONGHE', // 综合应用能力
}

export interface SyllabusNode {
  id: string;
  title: string;
  category: SubjectCategory;
  description: string;
  scoreWeight?: number; // 大致分值权重（百分比）
  subTopics?: string[];
  iconName: string;
}

export interface AIAnalysisResult {
  summary: string;
  keyPoints: string[];
  sampleQuestion?: string;
  studyTip: string;
  trends: string; // 新增字段：考情趋势
}

export interface AIStrategyResult {
  tip: string;       // 核心策略文本
  timeAdvice: string; // 时间分配建议
}
