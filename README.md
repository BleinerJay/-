# 公务员考试大纲模拟系统 (Civil Service Exam Syllabus Simulator)

本项目是一个基于 React 和 Google Gemini API 构建的交互式公务员考试大纲模拟系统。旨在帮助考生清晰地梳理“行测”与“申论（综合应用）”的知识体系，并提供智能化的备考建议。

## 1. 系统主线业务 (Business Logic)

系统围绕考生的核心备考需求，设计了以下三条主线功能：

### 1.1 双科目大纲结构化展示
- **行政职业能力测验 (XingCe)**: 涵盖常识判断、言语理解、数量关系、判断推理、资料分析五大模块。
- **综合应用能力/申论 (ZongHe)**: 涵盖归纳概括、综合分析、提出对策、贯彻执行、申发论述五大题型。
- 用户可以通过顶部的 Tab 快速切换科目，查看不同科目的知识架构。

### 1.2 AI 智能考情分析
- 系统集成了 **Google Gemini 2.5 Flash** 模型。
- 当用户点击具体的模块（如“判断推理”）时，系统会实时调用 AI 接口。
- AI 返回该模块的：
    - **Summary**: 核心考点总结。
    - **Trends**: 近年（2024-2025）最新的命题趋势。
    - **KeyPoints**: 高频考点与解题技巧。
    - **SampleQuestion**: 经典例题模拟。
    - **StudyTip**: 针对性的备考建议。

### 1.3 权重可视化与策略导航
- **分值分布图**: 利用饼图（Pie Chart）直观展示各模块在考试中的大致分值权重，帮助考生识别复习重点（如行测中言语和判断占比最高）。
- **备考策略卡片**: 根据当前选择的科目，动态展示高分策略（如行测的“取舍之道” vs 申论的“材料为王”）。

---

## 2. 项目文件结构 (File Structure)

```text
/
├── index.html                  # 项目入口 HTML，包含 Tailwind CSS CDN 和 Import Map 配置
├── index.tsx                   # React 应用挂载点
├── App.tsx                     # 主应用组件，负责页面布局、状态管理（Tab切换）和核心视图渲染
├── types.ts                    # TypeScript 类型定义（SyllabusNode, AIAnalysisResult 等）
├── constants.tsx               # 静态数据文件，包含完整的模拟大纲数据 (MOCK_SYLLABUS) 和图标渲染逻辑
├── README.md                   # 项目说明文档
│
├── components/                 # UI 组件目录
│   ├── ModuleDetail.tsx        # 模块详情弹窗组件，负责展示大纲细节并处理 AI 数据请求
│   └── ChartSection.tsx        # 图表组件，使用 Recharts 渲染分值权重饼图
│
└── services/                   # 服务层目录
    └── geminiService.ts        # 封装 Google GenAI API 调用逻辑，包含 Prompt 设计和 JSON 响应解析
```

## 3. 技术栈
- **Frontend**: React 19, Tailwind CSS
- **Visualization**: Recharts
- **AI Integration**: @google/genai (Gemini 2.5 Flash)
- **Icons**: Lucide React
