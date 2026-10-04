import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { firebaseAuth } from '../firebase';

// استثناء مخصص يُرمى عندما تتطلب ميزة تسجيل دخول ولا يوجد مستخدم حاليًا
export class AuthRequiredException extends Error {
  constructor(message = 'يجب تسجيل الدخول لاستخدام هذه الميزة') {
    super(message);
    this.name = 'AuthRequiredException';
  }
}

type AuthListener = (user: User | null) => void;

class AuthServiceClass {
  private listeners = new Set<AuthListener>();

  constructor() {
    onAuthStateChanged(firebaseAuth, (user) => {
      this.listeners.forEach((cb) => cb(user));
    });
  }

  // المستخدم الحالي (null إن كان في وضع الزائر)
  get currentUser(): User | null {
    return firebaseAuth.currentUser;
  }

  get isLoggedIn(): boolean {
    return firebaseAuth.currentUser !== null;
  }

  // يقابل authStateChanges.listen(...) — يرجع دالة لإلغاء الاشتراك
  onAuthStateChanged(listener: AuthListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // إنشاء حساب جديد
  async signUp(params: { email: string; password: string; displayName?: string }): Promise<User | null> {
    const credential = await createUserWithEmailAndPassword(firebaseAuth, params.email, params.password);
    if (params.displayName && params.displayName.length > 0) {
      await updateProfile(credential.user, { displayName: params.displayName });
    }
    return credential.user;
  }

  // تسجيل الدخول
  async signIn(params: { email: string; password: string }): Promise<User | null> {
    const credential = await signInWithEmailAndPassword(firebaseAuth, params.email, params.password);
    return credential.user;
  }

  signOut(): Promise<void> {
    return firebaseSignOut(firebaseAuth);
  }

  // Firebase ID Token لإرساله للباك اند (Authorization: Bearer <token>) — null في وضع الزائر
  async getIdToken(): Promise<string | null> {
    const user = firebaseAuth.currentUser;
    if (!user) return null;
    return user.getIdToken();
  }

  // نفس الشيء لكن يرمي استثناء إن لم يكن المستخدم مسجلاً
  async requireIdToken(): Promise<string> {
    const token = await this.getIdToken();
    if (token === null) throw new AuthRequiredException();
    return token;
  }

  // ترجمة أكواد أخطاء Firebase الشائعة لرسائل عربية مفهومة
  friendlyError(error: unknown): string {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          return 'هذا البريد الإلكتروني مستخدم من قبل';
        case 'auth/invalid-email':
          return 'صيغة البريد الإلكتروني غير صحيحة';
        case 'auth/weak-password':
          return 'كلمة المرور ضعيفة جدًا (6 أحرف على الأقل)';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          return 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        case 'auth/too-many-requests':
          return 'محاولات كثيرة جدًا، حاول لاحقًا';
        default:
          return error.message || 'حدث خطأ في المصادقة';
      }
    }
    return String(error);
  }
}

export const AuthService = new AuthServiceClass();
