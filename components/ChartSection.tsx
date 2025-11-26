import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MOCK_SYLLABUS } from '../constants';
import { SubjectCategory } from '../types';

interface ChartSectionProps {
  category: SubjectCategory;
}

const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'];

export const ChartSection: React.FC<ChartSectionProps> = ({ category }) => {
  const data = MOCK_SYLLABUS
    .filter(item => item.category === category)
    .map(item => ({
      name: item.title,
      value: item.scoreWeight || 0
    }));

  return (
    // Increased height to h-80 to prevent legend overlap on smaller screens within the grid
    // and provide better proportions on full screen.
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy="40%" 
            innerRadius="40%"
            outerRadius="65%"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => `${value}%`}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            iconType="circle"
            wrapperStyle={{ 
              fontSize: '12px', 
              width: '100%', 
              paddingTop: '20px',
              paddingBottom: '10px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};