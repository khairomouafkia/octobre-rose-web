import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthService } from '../service/authService';

interface LoginScreenProps {
  reason?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function LoginScreen({ reason, onSuccess, onCancel }: LoginScreenProps) {
  const { t } = useTranslation();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignup) {
        await AuthService.signUp({ email: email.trim(), password, displayName: name.trim() });
      } else {
        await AuthService.signIn({ email: email.trim(), password });
      }
      onSuccess();
    } catch (err) {
      setError(AuthService.friendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h3 className="text-h3" style={{ color: 'var(--navy-800)' }}>
        {isSignup ? t('auth.signupTitle') : t('auth.loginTitle')}
      </h3>
      {reason && (
        <p className="text-small" style={{ marginTop: 6 }}>
          {reason}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: 16 }} aria-busy={loading}>
        {isSignup && (
          <div className="field">
            <label>{t('auth.name')}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div className="field">
          <label>{t('auth.email')}</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>{t('auth.password')}</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {error && <p className="field-error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
          {loading ? t('common.loading') : isSignup ? t('auth.submitSignup') : t('auth.submitLogin')}
        </button>
      </form>

      <div className="auth-links">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsSignup((v) => !v)}>
          {isSignup ? t('auth.toggleToLogin') : t('auth.toggleToSignup')}
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>
          {t('auth.continueAsGuest')}
        </button>
      </div>
    </div>
  );
}
