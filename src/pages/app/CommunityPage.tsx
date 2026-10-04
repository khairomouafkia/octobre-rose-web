import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthService } from '../../service/authService';
import { AuthRequiredException } from '../../service/authService';
import { useEnsureLoggedIn } from '../../utils/authGuard';
import { useCommunityPosts, useCreatePost } from '../../hooks/queries';

export default function CommunityPage() {
  const { t } = useTranslation();
  const ensureLoggedIn = useEnsureLoggedIn();
  const { data: posts, isLoading, isError } = useCommunityPosts();
  const createPost = useCreatePost();

  const [showDialog, setShowDialog] = useState(false);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const userName = AuthService.currentUser?.displayName ?? t('common.guest');

  const handlePublish = async () => {
    if (!content.trim()) return;
    if (!(await ensureLoggedIn(t('community.postReason')))) return;

    createPost.mutate(
      { authorName: userName, isAnonymous, content: content.trim() },
      {
        onSuccess: (success) => {
          if (success) {
            setShowDialog(false);
            setContent('');
          } else {
            window.alert(t('community.publishError'));
          }
        },
        onError: (e) => {
          window.alert(e instanceof AuthRequiredException ? e.message : String(e));
        },
      },
    );
  };

  return (
    <div>
      <div className="section-head">
        <span className="section-eyebrow">مجتمع داعم</span>
        <h1 className="page-title">لستِ وحدكِ</h1>
        <p className="page-subtitle">مساحة عامّة للقراءة والدعم الاجتماعي داخل بيئة آمنة وخصوصية محترمة.</p>
      </div>

      <div className="toolbar-row">
        <span className="section-badge">مساحة عامة للقراءة</span>
        <button className="primary-btn" type="button" onClick={() => setShowDialog(true)} disabled={createPost.isPending}>
          + اكتبي مشاركة
        </button>
      </div>

      {isLoading ? (
        <div className="state-block"><div className="spinner" /></div>
      ) : isError ? (
        <p className="operation-error" role="alert">تعذر تحميل المشاركات. تحققي من اتصال الخادم ثم أعيدي المحاولة.</p>
      ) : (posts ?? []).length === 0 ? (
        <div className="empty-card">
          <span className="empty-card-icon">💬</span>
          <h3>لا توجد مشاركات للعرض</h3>
          <p>ستظهر هنا المشاركات عند توفر محتوى جديد في هذه المساحة.</p>
          <span className="empty-tag">مساحة آمنة</span>
        </div>
      ) : (
        <div className="stack-grid">
          {(posts ?? []).map((post) => (
            <article className="post-card" key={post.id}>
              <div className="post-header"><span className="post-author">{post.is_anonymous ? 'مشاركة مجهولة' : post.author_name ?? 'عضوة المجتمع'}</span></div>
              <p className="post-content">{post.content}</p>
            </article>
          ))}
        </div>
      )}

      <div className="page-card" style={{ marginTop: 20 }}>
        <div className="page-warning" style={{ marginTop: 0 }}>
          <span className="icon-wrap">🛡️</span>
          <span>الكرامة والخصوصية أولاً، والنشر يتطلب حساباً.</span>
        </div>
      </div>

      <div className="callout-bar" style={{ marginTop: 20 }}>
        المشاركة تحتاج إلى حساب، وتُعرض في مساحة آمنة ومتحكمة بالخصوصية.
      </div>

      {showDialog && (
        <div className="modal-overlay" onClick={() => setShowDialog(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>اكتبي مشاركة</h3>
            <p>تأكدي من خلو المشاركة من المعلومات الشخصية أو الطبية الحساسة.</p>
            <div className="field">
              <label htmlFor="community-post-content">نص المشاركة</label>
              <textarea id="community-post-content" rows={5} value={content} onChange={(event) => setContent(event.target.value)} />
            </div>
            <label className="community-anonymous-toggle">
              <input type="checkbox" checked={isAnonymous} onChange={(event) => setIsAnonymous(event.target.checked)} />
              النشر دون إظهار اسمي
            </label>
            {createPost.error instanceof Error && <p className="operation-error" role="alert">{createPost.error.message}</p>}
            <div className="modal-actions">
              <button className="ghost-btn" type="button" onClick={() => setShowDialog(false)} disabled={createPost.isPending}>إغلاق</button>
              <button className="primary-btn" type="button" onClick={handlePublish} disabled={createPost.isPending || !content.trim()}>
                {createPost.isPending ? 'جارٍ النشر...' : 'نشر'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
