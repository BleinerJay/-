export enum SubjectCategory {
  XINGCE = 'XINGCE', // 行政职业能力测验
  ZONGHE = 'ZONGHE', // 综合应用能力
}

export interface SyllabusNode {
  id: string;
  title: string;
  category: SubjectCategory;
  description: string;
  scoreWeight?: number; // Approximate percentage
  subTopics?: string[];
  iconName: string;
}

export interface AIAnalysisResult {
  summary: string;
  keyPoints: string[];
  sampleQuestion?: string;
  studyTip: string;
  trends: string; // New field for exam trends
}