import React, { useEffect, useState } from 'react';
import { SyllabusNode, AIAnalysisResult } from '../types';
import { getModuleAnalysis } from '../services/geminiService';
import { getIcon } from '../constants';
import { Loader2, Sparkles, BookCheck, Lightbulb, Target, TrendingUp } from 'lucide-react';

interface ModuleDetailProps {
  node: SyllabusNode;
  onClose: () => void;
}

export const ModuleDetail: React.FC<ModuleDetailProps> = ({ node, onClose }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      try {
        const result = await getModuleAnalysis(node.title, node.subTopics || []);
        setAnalysis(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (node) {
      fetchAnalysis();
    }
  }, [node]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* 头部区域 */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${node.category === 'XINGCE' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {getIcon(node.iconName, "w-6 h-6")}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{node.title}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${node.category === 'XINGCE' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                {node.category === 'XINGCE' ? '行政职业能力测验' : '综合应用能力 (申论)'}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 space-y-8">
          
          {/* 静态大纲描述 */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">大纲定义</h3>
            <p className="text-gray-700 leading-relaxed text-lg">{node.description}</p>
          </section>

          {/* 详细题型 / 考察要点 */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">详细题型 / 考察要点</h3>
            <div className="flex flex-wrap gap-2">
              {node.subTopics?.map((topic, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm font-medium border border-gray-200">
                  {topic}
                </span>
              ))}
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* AI 考情分析 */}
          <section className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl p-5 border border-blue-100">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-gray-800">AI 考情深度解析</h3>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="text-sm animate-pulse">正在分析最新命题趋势...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-6">
                
                {/* 核心总结 */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-50">
                  <p className="text-gray-700">{analysis.summary}</p>
                </div>

                {/* 命题趋势 (新板块) */}
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                   <h4 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-2">
                    <TrendingUp className="w-4 h-4" /> 最新命题趋势
                  </h4>
                  <p className="text-sm text-blue-900 leading-relaxed">{analysis.trends}</p>
                </div>

                {/* 核心考点 */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                    <Target className="w-4 h-4" /> 核心考点与技巧
                  </h4>
                  <ul className="space-y-2">
                    {analysis.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 模拟例题 */}
                {analysis.sampleQuestion && (
                  <div className="bg-white rounded-lg border border-indigo-100 overflow-hidden">
                    <div className="bg-indigo-50 px-4 py-2 border-b border-indigo-100 flex items-center gap-2">
                      <BookCheck className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-bold text-indigo-800">经典例题模拟</span>
                    </div>
                    <div className="p-4 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {analysis.sampleQuestion}
                    </div>
                  </div>
                )}

                {/* 备考建议 */}
                <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-lg border border-amber-100 text-amber-900 text-sm">
                  <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <span className="font-bold block mb-1">备考建议</span>
                    {analysis.studyTip}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">无法获取分析数据</div>
            )}
          </section>

        </div>

        {/* 底部操作栏 */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};