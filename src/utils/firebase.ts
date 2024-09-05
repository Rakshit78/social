import {
  equalTo,
  getDatabase,
  orderByChild,
  query,
  ref,
} from "firebase/database";
import {
  browserSessionPersistence,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  signInWithPopup,
} from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

export const createFirebaseApp = () => {
  const clientCredentials = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  if (getApps().length <= 0) {
    const app = initializeApp(clientCredentials);
    // Check that `window` is in scope for the analytics module!
    if (typeof window !== "undefined") {
      // Enable analytics. https://firebase.google.com/docs/analytics/get-started
      if ("measurementId" in clientCredentials) {
        getAnalytics();
      }
    }
    return app;
  }
};

export const firebaseApp = createFirebaseApp();

export let auth = getAuth();
export const provider = new GoogleAuthProvider();

export const googleSignin = (callback?: Function) =>
  setPersistence(auth, browserSessionPersistence).then(() => {
    signInWithPopup(auth, provider)
      .then(() => {
        if (typeof callback === "function") {
          callback();
        }
      })
      .catch((error) => {
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.log({ error, credential });
      });
  });

export const firebaseLogout = () => auth.signOut();

export const db = getDatabase();
export const campaignsNodeRef = ref(db, "campaigns");
export const campaignsNodeQuery = (uid?: string) =>
  query(campaignsNodeRef, orderByChild("createdBy"), equalTo(uid ?? ""));

export const campaignsNodePostsRef = (campaignId: string) =>
  ref(db, `campaigns/${campaignId}/posts`);

export const postsNodeRef = ref(db, "posts");
export const postsNodeQuery = (uid?: string) =>
  query(postsNodeRef, orderByChild("createdBy"), equalTo(uid ?? ""));
