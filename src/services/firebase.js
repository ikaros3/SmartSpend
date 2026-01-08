// Firebase 초기화 설정
// Firebase Console에서 복사한 설정으로 교체하세요

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCNakdhJevTPVbynomVQuv5nSsXmPewUAs",
  authDomain: "smartspend-june0311.firebaseapp.com",
  projectId: "smartspend-june0311",
  storageBucket: "smartspend-june0311.firebasestorage.app",
  messagingSenderId: "173532794836",
  appId: "1:173532794836:web:9a4a9dcedb22b5ada31041",
  measurementId: "G-MK724M9C36"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase 서비스 초기화
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// 개발 환경에서 에뮬레이터 연결
const isEmulator = import.meta.env.VITE_USE_EMULATOR === 'true';

if (isEmulator) {
  console.log('🔧 Firebase Emulator 모드 활성화');

  // Auth Emulator 연결
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });

  // Firestore Emulator 연결
  connectFirestoreEmulator(db, '127.0.0.1', 8080);

  console.log('✅ Auth Emulator: http://127.0.0.1:9099');
  console.log('✅ Firestore Emulator: http://127.0.0.1:8080');
  console.log('✅ Emulator UI: http://127.0.0.1:4000');
} else {
  console.log('☁️ 프로덕션 Firebase 연결');

  // Analytics는 프로덕션에서만 활성화
  const analytics = getAnalytics(app);

  // 오프라인 지원 활성화 (IndexedDB 캐싱) - 프로덕션만
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore 오프라인 지원: 다른 탭에서 이미 활성화됨');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore 오프라인 지원: 브라우저가 지원하지 않음');
    }
  });
}

export default app;
