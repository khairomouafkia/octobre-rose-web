// يمنح custom claim باسم "admin: true" لمستخدمة معيّنة عبر بريدها الإلكتروني.
// الاستخدام:
//   1) حمّلي مفتاح حساب الخدمة (Service Account) من:
//      Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
//   2) ضعي الملف باسم serviceAccountKey.json في جذر المشروع (لا ترفعيه إلى Git!)
//   3) شغّلي: npm run set-admin -- admin@example.com
import { readFileSync } from 'node:fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const email = process.argv[2];
if (!email) {
  console.error('الاستخدام: npm run set-admin -- <email>');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(new URL('../serviceAccountKey.json', import.meta.url)));

initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const user = await auth.getUserByEmail(email);
await auth.setCustomUserClaims(user.uid, { admin: true });

console.log(`تم منح صلاحية admin للمستخدمة: ${email}`);
console.log('على المستخدمة تسجيل الخروج والدخول مجددًا (أو تحديث التوكن) لتفعيل الصلاحية في الواجهة.');
