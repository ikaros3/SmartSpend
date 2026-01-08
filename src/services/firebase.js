// Firebase 초기화 설정
// Firebase Console에서 복사한 설정으로 교체하세요

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// TODO: Firebase Console에서 복사한 설정으로 교체
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
const analytics = getAnalytics(app);

// Firebase 서비스 내보내기
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// 오프라인 지원 활성화 (IndexedDB 캐싱)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // 여러 탭이 열려 있는 경우
    console.warn('Firestore 오프라인 지원: 다른 탭에서 이미 활성화됨');
  } else if (err.code === 'unimplemented') {
    // 브라우저가 지원하지 않는 경우
    console.warn('Firestore 오프라인 지원: 브라우저가 지원하지 않음');
  }
});

export default app;
