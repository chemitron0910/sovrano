import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = Platform.select({
ios:{
  apiKey: 'AIzaSyDxR685T4q14EAh-_lI3hJH1oEg1eVRATA',
  authDomain: 'sovrano-2d0d3.firebaseapp.com',
  projectId: 'sovrano-2d0d3',
  storageBucket: 'sovrano-2d0d3.firebasestorage.app',
  messagingSenderId: '849373199215',
  appId: '1:849373199215:ios:8219014717ebc0826bc69a',
},
android:{
  apiKey: 'AIzaSyCX9txSSSMuUsSWjE9-V4Beb4POaG-jFK0',
  authDomain: 'sovrano-2d0d3.firebaseapp.com',
  projectId: 'sovrano-2d0d3',
  storageBucket: 'sovrano-2d0d3.firebasestorage.app',
  messagingSenderId: '849373199215',
  appId: '1:849373199215:android:22e6e7ecfa2d8f196bc69a',
}
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
