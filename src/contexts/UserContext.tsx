import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, signInWithGoogle } from '../lib/firebase';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import { DEVOPS_ROADMAP } from '../constants/roadmap';

interface UserContextType {
  user: User | null;
  loading: boolean;
  profile: any;
  userConcepts: Record<string, any>;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userConcepts, setUserConcepts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Fetch or create profile
        const userRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(userRef);
        
        if (!docSnap.exists()) {
          const newProfile = {
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            totalMastery: 0,
            learningVelocity: 0,
            createdAt: new Date().toISOString()
          };
          await setDoc(userRef, newProfile);
          setProfile(newProfile);
        } else {
          setProfile(docSnap.data());
        }

        // Sync concepts
        const conceptsRef = collection(db, 'users', u.uid, 'concepts');
        const unsubConcepts = onSnapshot(conceptsRef, (snapshot) => {
          const concepts: Record<string, any> = {};
          snapshot.forEach((doc) => {
            concepts[doc.id] = doc.data();
          });
          setUserConcepts(concepts);
        });

        return () => unsubConcepts();
      } else {
        setProfile(null);
        setUserConcepts({});
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    await signInWithGoogle();
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <UserContext.Provider value={{ user, profile, userConcepts, loading, signIn, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
