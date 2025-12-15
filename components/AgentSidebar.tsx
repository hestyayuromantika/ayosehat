import React from 'react';
import { AGENTS } from '../constants';
import { AgentType } from '../types';
import { Icon } from './Icon';

interface AgentSidebarProps {
  activeAgent: AgentType | null;
}

export const AgentSidebar: React.FC<AgentSidebarProps> = ({ activeAgent }) => {
  // Filter out Navigator for the "Specialist" list
  const specialists = Object.values(AGENTS).filter(a => a.id !== AgentType.NAVIGATOR);

  return (
    <div className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200 h-full p-6">
      <div className="flex items-center gap-3 mb-8 text-hospital-800">
        <div className="p-2 bg-hospital-100 rounded-lg">
          <Icon name="Network" className="text-hospital-600" size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Hospital System</h1>
          <p className="text-xs text-hospital-500 font-medium">Navigator & AIS Control</p>
        </div>
      </div>

      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">
        Active Specialists
      </h2>

      <div className="space-y-3">
        {specialists.map((agent) => {
          const isActive = activeAgent === agent.id;
          return (
            <div 
              key={agent.id}
              className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-gray-50 border border-gray-200 shadow-sm translate-x-1' 
                  : 'hover:bg-gray-50 border border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm ${agent.color}`}>
                <Icon name={agent.icon} size={16} />
              </div>
              <div>
                <h3 className={`text-sm font-semibold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                  {agent.shortName}
                </h3>
                <p className="text-[10px] text-gray-400 leading-tight mt-1">
                  {agent.description}
                </p>
              </div>
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse mt-1.5" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-gray-100">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="Stethoscope" className="text-blue-500" size={16} />
            <span className="text-xs font-bold text-blue-700">System Status</span>
          </div>
          <p className="text-[10px] text-blue-600/80">
            Integrated AIS Control Active.<br/>
            All agents operational.<br/>
            Ready for delegation.
          </p>
        </div>
      </div>
    </div>
  );
};