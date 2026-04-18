// Firebase initialization — reuses existing tracker-bit config from the legacy app
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAieDmNr2S8SOTVPOoSVqeYbXJ5jc3yWpo',
  authDomain: 'tracker-bit.firebaseapp.com',
  projectId: 'tracker-bit',
  storageBucket: 'tracker-bit.firebasestorage.app',
  messagingSenderId: '861131026283',
  appId: '1:861131026283:web:748348b735255dd690a62e',
  measurementId: 'G-8SD64G40KR',
};

// Initialize Firebase app, auth, and firestore.
// Wrapped in try/catch so the app still runs in offline / restricted environments
// (e.g. Firestore API not enabled for this project). When initialization fails we
// expose a null `db` and api.js falls back to localStorage-only behaviour.
let app = null;
let auth = null;
let db = null;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  // Best-effort anonymous sign-in so writes include a uid.
  signInAnonymously(auth).catch(() => {
    /* anonymous auth not enabled — writes still work against public rules */
  });
} catch {
  // Firebase init failed (bad config, blocked network, etc). App still works
  // with local state only.
}

export {
  app,
  auth,
  db,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
  doc,
  setDoc,
  deleteDoc,
  onAuthStateChanged,
};
