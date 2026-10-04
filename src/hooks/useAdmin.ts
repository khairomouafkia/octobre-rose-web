import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { AuthService } from '../service/authService';

// نتحقق من صلاحية admin عبر custom claim على توكن Firebase (الطريقة الآمنة القياسية:
// لا يمكن للمستخدمة التلاعب بها من المتصفح لأنها موقّعة من الباك اند عبر Firebase Admin SDK).
// راجع scripts/set-admin-claim.mjs لمعرفة كيفية منح هذه الصلاحية لمستخدمة معيّنة.
export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = جاري التحقق

  useEffect(() => {
    let cancelled = false;

    const check = async (user: User | null) => {
      if (!user) {
        if (!cancelled) setIsAdmin(false);
        return;
      }
      try {
        const tokenResult = await user.getIdTokenResult();
        if (!cancelled) setIsAdmin(tokenResult.claims.admin === true);
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    };

    check(AuthService.currentUser);
    const unsubscribe = AuthService.onAuthStateChanged((user) => check(user));
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  return isAdmin; // null: جاري التحقق، true/false: نتيجة نهائية
}
