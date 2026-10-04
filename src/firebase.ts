import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// نفس قيم DefaultFirebaseOptions.web في firebase_options.dart
const firebaseConfig = {
  apiKey: 'AIzaSyDb5rZt83FQZ6qOs8w5IO5OTDp3liwYfNw',
  authDomain: 'tamanina-eec18.firebaseapp.com',
  projectId: 'tamanina-eec18',
  storageBucket: 'tamanina-eec18.firebasestorage.app',
  messagingSenderId: '231185922506',
  appId: '1:231185922506:web:c3bd7b3219e93e57cf3733',
  measurementId: 'G-CN89JTYH1B',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
