
import React, { useState, useEffect } from 'react';
import { SubjectCategory, AIStrategyResult } from '../types';
import { getSubjectStrategy } from '../services/geminiService';
import { Lightbulb, RefreshCw, Clock, Sparkles } from 'lucide-react';

interface StrategyCardProps {
  category: SubjectCategory;
}

const DEFAULT_STRATEGIES: Record<SubjectCategory, AIStrategyResult> = {
  [SubjectCategory.XINGCE]: {
    tip: "行测的核心在于“速度”与“取舍”。言语和资料分析是得分基石，常识靠日常积累，数量关系建议放在最后做，学会合理放弃难题。",
    timeAdvice: "平均每题不超过50秒，每日刷题保持手感。"
  },
  [SubjectCategory.ZONGHE]: {
    tip: "申论/综合应用的核心在于“材料为王”。所有答案要点都隐藏在给定资料中。坚持“问什么答什么”，注意卷面整洁，条理清晰，分条作答。",
    timeAdvice: "小题每题20分钟，大作文预留60分钟。"
  }
};

export const StrategyCard: React.FC<StrategyCardProps> = ({ category }) => {
  const [strategy, setStrategy] = useState<AIStrategyResult>(DEFAULT_STRATEGIES[category]);
  const [loading, setLoading] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  // 当类别切换时，重置为默认策略，或者你可以选择自动加载新的AI策略
  useEffect(() => {
    setStrategy(DEFAULT_STRATEGIES[category]);
    setIsAiGenerated(false);
  }, [category]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const result = await getSubjectStrategy(category);
      setStrategy(result);
      setIsAiGenerated(true);
    } catch (e) {
      console.error("Failed to fetch strategy", e);
    } finally {
      setLoading(false);
    }
  };

  const isXingCe = category === SubjectCategory.XINGCE;
  const bgColor = isXingCe ? 'bg-blue-600' : 'bg-indigo-600';
  const lightTextColor = isXingCe ? 'text-blue-100' : 'text-indigo-100';

  return (
    <div className={`rounded-xl p-6 ${bgColor} text-white shadow-lg transition-colors duration-300 relative overflow-hidden group`}>
      {/* 装饰背景 */}
      <div className="absolute top-0 right-0 p-4 opacity-10 transform rotate-12 group-hover:scale-110 transition-transform duration-500">
        <Lightbulb className="w-24 h-24 text-white" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2">
            {isAiGenerated && <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />}
            {isXingCe ? '行测高分策略' : '申论/综合应用策略'}
          </h3>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className={`p-2 rounded-full hover:bg-white/20 transition-all ${loading ? 'animate-spin' : ''}`}
            title="AI 生成新策略"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className={`min-h-[100px] flex flex-col justify-between ${loading ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
          <p className={`${lightTextColor} text-sm leading-relaxed mb-4 font-medium`}>
            {strategy.tip}
          </p>
          
          <div>
            <div className="w-full bg-white/20 h-px mb-3" />
            <div className="flex items-center gap-2 text-xs text-white/90 bg-black/10 p-2 rounded-lg w-fit">
              <Clock className="w-3 h-3" />
              <span>{strategy.timeAdvice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
