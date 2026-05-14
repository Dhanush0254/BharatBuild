import { useState, useEffect } from 'react';
import { Loader2, ServerCog } from 'lucide-react';

const ServerWakeupLoader = () => {
  const [isWaking, setIsWaking] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "Waking up the server...",
    "Spinning up the database...",
    "Preparing your marketplace...",
    "Almost there! This is a free server...",
  ];

  useEffect(() => {
    const handleWaking = () => setIsWaking(true);
    const handleAwake = () => setIsWaking(false);

    window.addEventListener('backend-waking', handleWaking);
    window.addEventListener('backend-awake', handleAwake);

    return () => {
      window.removeEventListener('backend-waking', handleWaking);
      window.removeEventListener('backend-awake', handleAwake);
    };
  }, []);

  useEffect(() => {
    if (!isWaking) {
      setMessageIndex(0);
      return;
    }
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => Math.min(prev + 1, messages.length - 1));
    }, 6000);
    
    return () => clearInterval(interval);
  }, [isWaking]);

  if (!isWaking) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-brand/30 animate-ping rounded-full duration-1000"></div>
          <div className="relative bg-brand text-white p-5 rounded-full shadow-lg">
            <ServerCog size={36} className="animate-pulse" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Connecting...</h3>
        <p className="text-slate-500 font-medium h-12 flex items-center justify-center transition-all duration-300">
          {messages[messageIndex]}
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-brand font-bold bg-brand/10 px-4 py-2 rounded-full">
          <Loader2 size={16} className="animate-spin" />
          <span>Please wait</span>
        </div>
      </div>
    </div>
  );
};

export default ServerWakeupLoader;
