import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AuthService } from '../service/authService';
import LoginScreen from '../pages/LoginScreen';

// يقابل Future<bool> ensureLoggedIn(context, {reason}) في Dart:
// - إذا كانت المستخدمة مسجّلة دخول، يرجع true فورًا
// - إن لم تكن، يفتح شاشة الدخول ويرجع النتيجة (true إذا سجّلت، false إذا ألغت/تابعت كزائرة)
type EnsureLoggedIn = (reason: string) => Promise<boolean>;

const AuthGuardContext = createContext<EnsureLoggedIn | null>(null);

export function AuthGuardProvider({ children }: { children: React.ReactNode }) {
  const [reason, setReason] = useState<string | null>(null);
  const resolverRef = useRef<((result: boolean) => void) | null>(null);

  const ensureLoggedIn: EnsureLoggedIn = useCallback((r: string) => {
    if (AuthService.isLoggedIn) return Promise.resolve(true);
    setReason(r);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = (result: boolean) => {
    setReason(null);
    resolverRef.current?.(result);
    resolverRef.current = null;
  };

  return (
    <AuthGuardContext.Provider value={ensureLoggedIn}>
      {children}
      {reason && (
        <div className="modal-overlay" onClick={() => close(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <LoginScreen
              reason={reason}
              onSuccess={() => close(true)}
              onCancel={() => close(false)}
            />
          </div>
        </div>
      )}
    </AuthGuardContext.Provider>
  );
}

// يستخدم داخل الشاشات بدل استدعاء ensureLoggedIn(context, reason: '...') مباشرة
export function useEnsureLoggedIn(): EnsureLoggedIn {
  const ctx = useContext(AuthGuardContext);
  if (!ctx) throw new Error('useEnsureLoggedIn must be used within AuthGuardProvider');
  return ctx;
}
