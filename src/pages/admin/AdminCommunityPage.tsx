import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCommunityPosts, useDeletePost } from '../../hooks/queries';

export default function AdminCommunityPage() {
  const { t } = useTranslation();
  const { data: posts, isLoading, isError: postsError } = useCommunityPosts();
  const deletePost = useDeletePost();

  const handleDelete = (id: string) => {
    if (window.confirm(t('admin.confirmDeletePost'))) deletePost.mutate(id);
  };

  return (
    <div>
      <h2 className="text-h2" style={{ marginBottom: 18 }}>
        {t('admin.community')}
      </h2>

      {postsError && <p className="operation-error" role="alert">تعذر تحميل منشورات المجتمع من الخادم.</p>}
      {deletePost.error instanceof Error && <p className="operation-error" role="alert">{deletePost.error.message}</p>}

      {isLoading ? (
        <div className="state-block">
          <div className="spinner" />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('admin.author')}</th>
                <th>{t('admin.content')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {(posts ?? []).map((post, index) => (
                <tr key={post.id ?? index}>
                  <td>{post.is_anonymous ? t('admin.anonymous') : post.author_name ?? '—'}</td>
                  <td style={{ maxWidth: 420, whiteSpace: 'normal' }}>{post.content}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-btn"
                        onClick={() => handleDelete(String(post.id))}
                        aria-label="delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(posts ?? []).length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--ink-faint)' }}>
                    —
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
