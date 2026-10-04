import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../../service/apiService';
import { AuthService } from '../../service/authService';
import { useEnsureLoggedIn } from '../../utils/authGuard';
import type { ChatMessage } from '../../types';

export default function AssistantPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const ensureLoggedIn = useEnsureLoggedIn();
  const [ready, setReady] = useState(AuthService.isLoggedIn);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // الوصول لهذه الصفحة يتطلب تسجيل دخول، تمامًا كتبويب "المساعد" في نسخة فلاتر
  useEffect(() => {
    if (AuthService.isLoggedIn) {
      setReady(true);
      return;
    }
    ensureLoggedIn(t('chat.loginReason')).then((loggedIn) => {
      if (loggedIn) setReady(true);
      else navigate('/app', { replace: true });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, error]);

  if (!ready) return null;

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const history = messages;
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await ApiService.sendMessageToAI(text, history);
      setMessages((prev) => [...prev, { role: 'model', content: aiResponse }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('chat.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="section-head">
        <span className="section-eyebrow">معلومات عامة</span>
        <h1 className="page-title">المساعد التوعوي</h1>
        <p className="page-subtitle">معلومات عامة حول سرطان الثدي والاكتشاف المبكر، داخل مساحة آمنة وداعمة.</p>
      </div>

      <div className="chat-panel">
        <div className="page-card">
          <div className="assistant-messages" aria-live="polite" aria-relevant="additions text">
            {messages.length === 0 ? (
              <div className="chat-placeholder">
                <span className="empty-card-icon">💬</span>
                <h3>اكتبي سؤالك التوعوي</h3>
                <p>يمكنك السؤال عن سرطان الثدي أو الفحص المبكر.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div className={`assistant-message ${message.role}`} key={`${message.role}-${index}`}>
                  <p className={`assistant-bubble ${message.role}`}>{message.content}</p>
                </div>
              ))
            )}
            {isLoading && <p className="assistant-status">جارٍ إعداد الرد...</p>}
            {error && <p className="assistant-error" role="alert">{error}</p>}
            <div ref={bottomRef} />
          </div>

          <form
            className="chat-input-row"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
          >
            <input
              className="chat-input"
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isLoading}
              placeholder="اكتبي رسالتك هنا..."
              aria-label="رسالتك للمساعد التوعوي"
              autoComplete="off"
            />
            <button className="primary-btn assistant-send-btn" type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? 'جارٍ الإرسال...' : 'إرسال'}
            </button>
          </form>
        </div>

        <aside className="page-card">
          <h3 className="section-title" style={{ fontSize: '1.4rem' }}>معلومات عامة</h3>

          <div className="info-card" style={{ marginTop: 16 }}>
            <div className="info-card-icon">🩺</div>
            <h4>التوعية المبكرة</h4>
            <p>الاكتشاف المبكر يساعد على اختيار خطة متابعة مناسبة ويفتح فرصًا أفضل للشفاء.</p>
          </div>

          <div className="info-card" style={{ marginTop: 16 }}>
            <div className="info-card-icon">💗</div>
            <h4>الفحص الذاتي</h4>
            <p>التعرف على التغييرات الطبيعية يساهم في الشعور بالوعي والراحة بين الفحوص المنتظمة.</p>
          </div>

          <div className="info-card" style={{ marginTop: 16 }}>
            <div className="info-card-icon">📌</div>
            <h4>المتابعة</h4>
            <p>إذا لاحظتِ تغيرات غير مألوفة، يفضّل متابعة الطبيب المختص للحصول على تقييم مناسب.</p>
          </div>
        </aside>
      </div>

      <div className="callout-bar" style={{ marginTop: 22 }}>
        المعلومات الواردة هنا عامة ولا تغني عن استشارة المختص الطبي.
      </div>
    </div>
  );
}
