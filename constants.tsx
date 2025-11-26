import { SubjectCategory, SyllabusNode } from './types';
import { 
  BookOpen, 
  Brain, 
  Calculator, 
  FileText, 
  Globe, 
  Layout, 
  MessageSquare, 
  PenTool, 
  PieChart, 
  Search 
} from 'lucide-react';
import React from 'react';

// Helper to render icons based on name string
export const getIcon = (name: string, className?: string) => {
  const props = { className: className || "w-5 h-5" };
  switch (name) {
    case 'globe': return <Globe {...props} />;
    case 'message-square': return <MessageSquare {...props} />;
    case 'calculator': return <Calculator {...props} />;
    case 'brain': return <Brain {...props} />;
    case 'pie-chart': return <PieChart {...props} />;
    case 'book-open': return <BookOpen {...props} />;
    case 'search': return <Search {...props} />;
    case 'pen-tool': return <PenTool {...props} />;
    case 'layout': return <Layout {...props} />;
    case 'file-text': return <FileText {...props} />;
    default: return <FileText {...props} />;
  }
};

export const MOCK_SYLLABUS: SyllabusNode[] = [
  // --- 行测 (Administrative Aptitude Test) ---
  {
    id: 'xc-1',
    category: SubjectCategory.XINGCE,
    title: '常识判断 (General Knowledge)',
    description: '测查报考者在政治、经济、文化、科技等方面应知应会的基本知识。近年来越来越侧重时政与习近平新时代中国特色社会主义思想。',
    scoreWeight: 10,
    subTopics: [
      '政治理论 (时政、马克思主义哲学)',
      '法律常识 (宪法、民法典、刑法、行政法)',
      '经济常识 (微观/宏观经济、国际贸易)',
      '人文历史 (中国古代史、文学常识)',
      '科技地理 (前沿科技、物理化学常识)'
    ],
    iconName: 'globe'
  },
  {
    id: 'xc-2',
    category: SubjectCategory.XINGCE,
    title: '言语理解与表达 (Language Understanding)',
    description: '测查运用语言文字进行思考和交流的能力。这是行测中题量最大、分值占比极高的模块。',
    scoreWeight: 30,
    subTopics: [
      '逻辑填空 (实词、成语辨析)',
      '片段阅读 (主旨概括、意图推断、细节理解)',
      '语句表达 (语句排序、语句衔接、下文推断)'
    ],
    iconName: 'message-square'
  },
  {
    id: 'xc-3',
    category: SubjectCategory.XINGCE,
    title: '数量关系 (Quantitative Relations)',
    description: '测查理解、把握事物间量化关系和解决数量关系问题的能力。通常被认为是行测中最难的模块。',
    scoreWeight: 10,
    subTopics: [
      '数学运算 (工程问题、行程问题、排列组合)',
      '高频考点 (概率问题、几何问题、容斥原理)',
      '数字推理 (部分省考/事业单位考察)'
    ],
    iconName: 'calculator'
  },
  {
    id: 'xc-4',
    category: SubjectCategory.XINGCE,
    title: '判断推理 (Reasoning)',
    description: '测查对各种事物关系的分析推理能力。题型分类严谨，技巧性强。',
    scoreWeight: 30,
    subTopics: [
      '图形推理 (位置、样式、属性、数量、六面体)',
      '定义判断 (单定义、多定义)',
      '类比推理 (词义关系、逻辑关系、语法关系)',
      '逻辑判断 (翻译推理、加强削弱、真假推理)'
    ],
    iconName: 'brain'
  },
  {
    id: 'xc-5',
    category: SubjectCategory.XINGCE,
    title: '资料分析 (Data Analysis)',
    description: '测查对文字、图表等资料的综合理解与分析加工能力。是行测中"性价比"最高的模块，要求高正确率。',
    scoreWeight: 20,
    subTopics: [
      '基础计算 (增长率、增长量、比重、平均数)',
      '高阶技巧 (倍数、基期现期、混合增长率)',
      '综合分析 (多条数据综合判断)'
    ],
    iconName: 'pie-chart'
  },

  // --- 综合应用/申论 (Comprehensive Application / Shen Lun) ---
  {
    id: 'zh-1',
    category: SubjectCategory.ZONGHE,
    title: '归纳概括 (Summarization)',
    description: '申论考试的基础题型。要求全面把握给定资料的内容，准确提炼事实所包含的观点。',
    scoreWeight: 15,
    subTopics: ['单一式概括', '综合式概括', '归纳分类'],
    iconName: 'book-open'
  },
  {
    id: 'zh-2',
    category: SubjectCategory.ZONGHE,
    title: '综合分析 (Comprehensive Analysis)',
    description: '对给定资料的全部或部分的内容、观点或问题进行分析和归纳，多角度地思考资料内容。',
    scoreWeight: 20,
    subTopics: ['要素分析 (原因、影响、启示)', '词句理解 (解释概念/观点)', '评价分析 (评论现象/观点)'],
    iconName: 'search'
  },
  {
    id: 'zh-3',
    category: SubjectCategory.ZONGHE,
    title: '提出对策 (Problem Solving)',
    description: '准确理解把握给定资料所反映的问题，提出解决问题的措施或办法。侧重实务能力。',
    scoreWeight: 15,
    subTopics: ['单一对策题', '概括+对策复合题', '应急处理 (部分执法类岗)'],
    iconName: 'pen-tool'
  },
  {
    id: 'zh-4',
    category: SubjectCategory.ZONGHE,
    title: '贯彻执行 (Implementation)',
    description: '能够准确理解工作目标和组织意图，依法行政，完成特定文书的撰写。',
    scoreWeight: 20,
    subTopics: ['宣传类文书 (倡议书、公开信)', '方案类文书 (工作方案、调研报告)', '总结类文书 (工作总结、简报)'],
    iconName: 'layout'
  },
  {
    id: 'zh-5',
    category: SubjectCategory.ZONGHE,
    title: '申发论述 (Essay Writing)',
    description: '即"大作文"。熟练使用指定的语种，运用说明、陈述、议论等方式，准确规范、简明畅达地表述思想观点。',
    scoreWeight: 30,
    subTopics: ['策论文 (侧重对策)', '政论文 (侧重分析)', '思辨型作文'],
    iconName: 'file-text'
  }
];