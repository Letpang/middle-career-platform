import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, MessageCircle, Send, X } from 'lucide-react';
import { askChat } from '../api';

interface Msg {
  role: 'user' | 'assistant';
  text: string;
}

const GREETING: Msg = {
  role: 'assistant',
  text: '안녕하세요! 커리어 브릿지 AI 도우미입니다. 일자리, 교육, 상담 신청 등 사이트 이용이 궁금하시거나 이력서·면접 관련 고민이 있으시면 편하게 물어보세요.',
};
const HISTORY = 6;

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, open, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: 'user', text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError(undefined);
    try {
      const res = await askChat(text, next.slice(-1 - HISTORY, -1));
      if (res.reply) setMessages((m) => [...m, { role: 'assistant', text: res.reply! }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', right: '24px', bottom: '24px', zIndex: 1000 }}>
      {open && (
        <div
          className="card"
          style={{
            width: '340px',
            maxWidth: 'calc(100vw - 48px)',
            height: '460px',
            maxHeight: 'calc(100vh - 140px)',
            padding: 0,
            overflow: 'hidden',
            marginBottom: '16px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
            transform: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', backgroundColor: 'var(--primary)', color: '#ffffff', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={20} />
              <span style={{ fontWeight: 700 }}>AI 질문창</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="닫기" style={{ color: '#ffffff', display: 'flex' }}>
              <X size={20} />
            </button>
          </div>
          <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'var(--bg-secondary)' }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  backgroundColor: m.role === 'user' ? 'var(--primary)' : 'var(--bg-primary)',
                  color: m.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                  border: m.role === 'user' ? 'none' : '1px solid var(--border-color)',
                }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <LoaderCircle size={14} className="spin" /> 답변을 생각하고 있어요...
              </div>
            )}
            {error && <div className="notice notice-error" style={{ alignSelf: 'flex-start', fontSize: '0.85rem' }}>{error}</div>}
          </div>
          <div style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '1px solid var(--border-color)', flexShrink: 0, backgroundColor: 'var(--bg-primary)' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="궁금한 점을 입력해 주세요..."
              style={{ flex: 1, minWidth: 0 }}
              disabled={loading}
            />
            <button className="btn btn-primary" onClick={send} disabled={loading || !input.trim()} style={{ padding: '10px 14px' }} aria-label="보내기">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'AI 질문창 닫기' : 'AI 질문창 열기'}
        style={{
          width: '58px',
          height: '58px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(79,70,229,0.35)',
          marginLeft: 'auto',
        }}
      >
        {open ? <X size={26} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
};

export default ChatWidget;
