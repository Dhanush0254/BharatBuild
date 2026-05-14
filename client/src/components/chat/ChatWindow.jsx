import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatMessages, sendMessage, markChatAsRead } from '../../api/chatsApi';
import { useAuth } from '../../context/AuthContext';
import { Send, ArrowLeft } from 'lucide-react';

const ChatWindow = ({ chat, onBack }) => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  const otherUser = chat.participants?.find(p => p._id !== user._id);

  const { data, isLoading } = useQuery({
    queryKey: ['chat-messages', chat._id],
    queryFn: () => getChatMessages(chat._id),
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const sendMut = useMutation({
    mutationFn: (text) => sendMessage(chat._id, text),
    onSuccess: () => {
      qc.invalidateQueries(['chat-messages', chat._id]);
      qc.invalidateQueries(['user-chats']);
      setText('');
    },
  });

  // Mark as read on mount
  useEffect(() => {
    markChatAsRead(chat._id).catch(() => {});
  }, [chat._id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMut.mutate(text.trim());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-white flex items-center gap-3">
        <button onClick={onBack} className="p-1 hover:bg-slate-100 rounded-lg lg:hidden">
          <ArrowLeft size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center text-brand font-bold text-sm">
          {otherUser?.name?.[0] || '?'}
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-text-primary text-sm truncate">{otherUser?.name || 'User'}</h3>
          <p className="text-xs text-text-muted capitalize">{otherUser?.role}</p>
        </div>
        {chat.listing && (
          <div className="ml-auto bg-slate-50 rounded-lg px-3 py-1.5 hidden sm:block">
            <p className="text-xs text-text-muted truncate max-w-[150px]">{chat.listing.title}</p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {isLoading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-12 max-w-[60%]" />)}</div>
        ) : data?.messages?.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-sm">No messages yet. Start the conversation!</div>
        ) : (
          data?.messages?.map((msg) => {
            const isMine = msg.sender?._id === user._id || msg.sender === user._id;
            return (
              <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMine
                    ? 'bg-brand text-white rounded-br-md'
                    : 'bg-white border border-slate-200 text-text-primary rounded-bl-md'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${isMine ? 'text-orange-100' : 'text-text-muted'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-border flex gap-2">
        <input
          type="text"
          className="form-input flex-1"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
        />
        <button type="submit" disabled={!text.trim() || sendMut.isPending}
          className="btn-primary px-4">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
