import React from 'react';
import { Message, AgentType } from '../types';
import { AGENTS } from '../constants';
import { Icon } from './Icon';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  if (message.isRouting) {
    const targetAgent = message.agent ? AGENTS[message.agent] : null;
    return (
      <div className="flex justify-center my-4 animate-fade-in-up">
        <div className="bg-gray-100 border border-gray-200 text-gray-500 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
          <Icon name="Network" size={14} className="text-gray-400" />
          <span>Navigator routing to: <span className="font-semibold text-gray-700">{targetAgent?.name || 'Agent'}</span></span>
        </div>
      </div>
    );
  }

  const agentConfig = message.agent ? AGENTS[message.agent] : AGENTS[AgentType.NAVIGATOR];

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      {!isUser && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${agentConfig.color} shadow-md`}>
          <Icon name={agentConfig.icon} className="text-white" size={16} />
        </div>
      )}

      <div className={`max-w-[80%] rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
        isUser 
          ? 'bg-hospital-600 text-white rounded-tr-none' 
          : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
      }`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 border-b border-gray-100 pb-2">
            <span className={`font-semibold text-xs uppercase tracking-wider ${
              agentConfig.id === AgentType.FINANCIAL ? 'text-emerald-700' :
              agentConfig.id === AgentType.MEDICAL_RECORDS ? 'text-blue-700' :
              agentConfig.id === AgentType.PATIENT_INFO ? 'text-violet-700' :
              agentConfig.id === AgentType.SCHEDULER ? 'text-orange-700' : 'text-gray-700'
            }`}>
              {agentConfig.name}
            </span>
          </div>
        )}
        <div className="prose prose-sm max-w-none dark:prose-invert">
           {/* Simple renderer for text, could be enhanced for Markdown */}
           <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
        <div className={`text-[10px] mt-2 text-right opacity-70 ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

       {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center ml-3">
          <Icon name="User" className="text-slate-500" size={16} />
        </div>
      )}
    </div>
  );
};