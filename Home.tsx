import React, { useState } from 'react';
import { MOCK_SYLLABUS, getIcon } from './constants';
import { SubjectCategory, SyllabusNode } from './types';
import { ModuleDetail } from './components/ModuleDetail';
import { ChartSection } from './components/ChartSection';
import { StrategyCard } from './components/StrategyCard';
import { GraduationCap, BookOpen, BrainCircuit, ChevronRight } from 'lucide-react';

const Home: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<SyllabusNode | null>(null);
  const [activeTab, setActiveTab] = useState<SubjectCategory>(SubjectCategory.XINGCE);

  const filteredNodes = MOCK_SYLLABUS.filter(node => node.category === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-600 p-2 rounded-lg text-white">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">公务员考试大纲模拟系统</h1>
              <p className="text-xs text-gray-500">2025年度 考试大纲深度解析</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
             <span>Powered by Gemini 2.5 & MiniMax</span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* 引导横幅 */}
        <div className="bg-gradient-to-r from-gray-900 to-slate-800 rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <BrainCircuit className="w-64 h-64" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-bold mb-4">科学备考，精准导航</h2>
            <p className="text-gray-300 text-lg mb-6">
              本系统基于最新公务员录用考试笔试大纲构建，涵盖<b>行政职业能力测验</b>与<b>申论（综合应用能力）</b>两大科目。点击下方模块查看详细考点、题型解析及AI智能备考建议。
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab(SubjectCategory.XINGCE)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === SubjectCategory.XINGCE ? 'bg-white text-gray-900' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'}`}
              >
                行政职业能力测验
              </button>
              <button 
                onClick={() => setActiveTab(SubjectCategory.ZONGHE)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeTab === SubjectCategory.ZONGHE ? 'bg-white text-gray-900' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'}`}
              >
                综合应用能力 / 申论
              </button>
            </div>
          </div>
        </div>

        {/* 仪表盘网格布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 左侧栏：大纲列表 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-gray-500" />
                {activeTab === SubjectCategory.XINGCE ? '行测科目大纲 (XingCe)' : '申论/综合应用大纲 (ZongHe)'}
              </h3>
              <span className="text-sm text-gray-500">点击卡片查看AI考情分析</span>
            </div>

            <div className="grid gap-4">
              {filteredNodes.map((node) => (
                <div 
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="group bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${node.category === 'XINGCE' ? 'bg-blue-500' : 'bg-indigo-500'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${node.category === 'XINGCE' ? 'bg-blue-50 text-blue-600 group-hover:bg-blue-100' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100'} transition-colors`}>
                        {getIcon(node.iconName)}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{node.title}</h4>
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">{node.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {node.subTopics?.slice(0, 3).map((topic, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded border border-gray-100">
                        {topic}
                      </span>
                    ))}
                    {(node.subTopics?.length || 0) > 3 && (
                      <span className="text-xs px-2 py-1 bg-gray-50 text-gray-400 rounded">+{ (node.subTopics?.length || 0) - 3 }</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 右侧栏：统计与信息 */}
          <div className="space-y-6">
            
            {/* 分值分布图 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">预估分值权重</h3>
              <ChartSection category={activeTab} />
              <p className="text-xs text-center text-gray-400 mt-2">*数据基于往年国考/省考真题统计</p>
            </div>

            {/* AI 备考策略卡片 (支持刷新) */}
            <StrategyCard category={activeTab} />

          </div>

        </div>
      </main>

      {/* 详情弹窗 */}
      {selectedNode && (
        <ModuleDetail 
          node={selectedNode} 
          onClose={() => setSelectedNode(null)} 
        />
      )}
    </div>
  );
};

export default Home;