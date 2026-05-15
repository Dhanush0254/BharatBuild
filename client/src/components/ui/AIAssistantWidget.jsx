import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, X, Send, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { chatWithAssistant } from '../../api/mlApi';

const AIAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am the **BharatBuild AI Assistant**. I can help you find workers, machinery, materials, or estimate costs. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatWithAssistant(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I am having trouble connecting right now. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className="fixed bottom-6 right-6 z-50 bg-brand hover:bg-brand-dark text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-105 flex items-center justify-center gap-2 group"
      >
        <Bot size={24} />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-bold text-sm">
          Ask BharatBuild AI
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed right-6 z-50 bg-white border border-border shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isMinimized ? 'bottom-6 w-80 h-16' : 'bottom-6 w-80 sm:w-96 h-[500px]'}`}>
      {/* Header */}
      <div className="bg-brand text-white p-4 flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <h3 className="font-bold text-sm">BharatBuild AI</h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="hover:bg-white/20 p-1 rounded" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button className="hover:bg-white/20 p-1 rounded" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-brand text-white rounded-br-none' : 'bg-white border border-border text-text-primary rounded-bl-none shadow-sm'}`}>

                    <ReactMarkdown 
                      components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                        strong: ({node, ...props}) => <strong className={`font-bold ${msg.role === 'user' ? 'text-white underline' : 'text-brand-dark'}`} {...props} />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl px-4 py-2 text-sm bg-white border border-border rounded-bl-none shadow-sm flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-brand" /> Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-border flex items-center gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about materials, prices..."
              className="flex-1 form-input text-sm h-10 rounded-xl"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="bg-brand text-white p-2.5 rounded-xl disabled:opacity-50 transition-colors hover:bg-brand-dark"
            >
              <Send size={18} />
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default AIAssistantWidget;
