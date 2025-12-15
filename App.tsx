import React, { useState, useRef, useEffect } from 'react';
import { AgentType, Message } from './types';
import { processUserRequest } from './services/geminiService';
import { ChatMessage } from './components/ChatMessage';
import { AgentSidebar } from './components/AgentSidebar';
import { Icon } from './components/Icon';
import { AGENTS } from './constants';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: 'Selamat datang di Hospital System Navigator. Saya adalah pengendali pusat Integrated AIS Control. Silakan sampaikan kebutuhan Anda terkait keuangan (SIA), rekam medis, informasi pasien, atau penjadwalan janji temu, dan saya akan menghubungkan Anda dengan agen spesialis yang tepat.',
      agent: AgentType.NAVIGATOR,
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<AgentType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, activeAgent]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setIsLoading(true);
    setActiveAgent(AgentType.NAVIGATOR); // Start with Navigator processing

    // Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // Process request via Gemini Service
      // This includes the Navigator decision + Sub-Agent execution
      const result = await processUserRequest(userText);

      // Add "Routing" system message for visual feedback
      const routingMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: `Routing to ${AGENTS[result.routedAgent].name}...`,
        agent: result.routedAgent,
        isRouting: true,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, routingMsg]);
      
      // Update active agent for Sidebar visualization
      setActiveAgent(result.routedAgent);

      // Simulate a small delay for "Agent Thinking" effect
      await new Promise(resolve => setTimeout(resolve, 800));

      // Add Agent Response
      const agentMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'model',
        content: result.responseText,
        agent: result.routedAgent,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, agentMsg]);

    } catch (error) {
      console.error("Error processing request:", error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        content: "Maaf, terjadi kesalahan saat memproses permintaan Anda. Pastikan API Key valid dan coba lagi.",
        agent: AgentType.NAVIGATOR,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      // Reset active agent after interaction completes after a delay
      setTimeout(() => setActiveAgent(null), 3000);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar for Desktop */}
      <AgentSidebar activeAgent={activeAgent} />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header for Mobile/Tablet (Simplified) */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-2">
            <div className="bg-hospital-600 p-1.5 rounded-md text-white">
              <Icon name="Network" size={18} />
            </div>
            <span className="font-bold text-gray-800">Hospital Navigator</span>
          </div>
        </div>
        
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 scroll-smooth">
          <div className="max-w-3xl mx-auto w-full pb-4">
             {messages.map((msg) => (
               <ChatMessage key={msg.id} message={msg} />
             ))}
             
             {isLoading && activeAgent === AgentType.NAVIGATOR && (
               <div className="flex justify-center my-4 animate-pulse">
                 <div className="bg-slate-100 text-slate-500 text-xs px-3 py-1.5 rounded-full flex items-center gap-2">
                   <Icon name="Network" size={14} className="animate-spin" />
                   <span>Navigator analyzing request...</span>
                 </div>
               </div>
             )}
             
             {isLoading && activeAgent && activeAgent !== AgentType.NAVIGATOR && (
                <div className="flex w-full mb-6 justify-start animate-pulse">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${AGENTS[activeAgent].color}`}>
                    <Icon name={AGENTS[activeAgent].icon} className="text-white" size={16} />
                  </div>
                  <div className="bg-gray-100 h-10 w-24 rounded-2xl rounded-tl-none"></div>
                </div>
             )}

             <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4 md:p-6 z-20">
          <div className="max-w-3xl mx-auto relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
               <Icon name="Network" className={isLoading ? "text-hospital-400 animate-pulse" : "text-gray-400"} size={20} />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? "Processing request..." : "Type your request here (e.g., 'Saya ingin membayar tagihan', 'Jadwalkan dokter')..."}
              disabled={isLoading}
              className="w-full pl-12 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all shadow-sm"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`absolute right-2 top-2 bottom-2 aspect-square rounded-xl flex items-center justify-center transition-all ${
                isLoading || !input.trim() 
                  ? 'bg-gray-100 text-gray-300' 
                  : 'bg-hospital-600 text-white hover:bg-hospital-700 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95'
              }`}
            >
              <Icon name="Send" size={20} />
            </button>
          </div>
          <div className="text-center mt-3 text-[10px] text-gray-400">
            Powered by Hospital System Navigator AI • Integrated AIS Control
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;