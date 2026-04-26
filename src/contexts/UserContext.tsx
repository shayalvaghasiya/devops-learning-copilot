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
  const [profile, setProfile] = useState<any>(() => {
    const saved = localStorage.getItem('guest_profile');
    if (saved) return JSON.parse(saved);
    return {
      displayName: 'Operator',
      totalMastery: 0.15,
      learningVelocity: 1.2,
      uid: 'guest-123'
    };
  });
  const [userConcepts, setUserConcepts] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('guest_concepts');
    if (saved) return JSON.parse(saved);
    // Initial mock progress for better empty state
    return {
      'intro-virtualization': { mastery: 0.8, lastStudied: new Date().toISOString() },
      'containers-vs-vms': { mastery: 0.4, lastStudied: new Date().toISOString() }
    };
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('guest_profile', JSON.stringify(profile));
      localStorage.setItem('guest_concepts', JSON.stringify(userConcepts));
    }
  }, [profile, userConcepts, user]);

  useEffect(() => {
    // Only use auth if available, otherwise stay in guest mode
    if (!auth || !db) return;

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        const userRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(userRef);
        
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }

        const conceptsRef = collection(db, 'users', u.uid, 'concepts');
        const unsubConcepts = onSnapshot(conceptsRef, (snapshot) => {
          const concepts: Record<string, any> = {};
          snapshot.forEach((doc) => {
            concepts[doc.id] = doc.data();
          });
          setUserConcepts(concepts);
        });

        return () => unsubConcepts();
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    if (!auth) {
      alert("Authentication is not configured. Please set up Firebase in AI Studio settings.");
      return;
    }
    await signInWithGoogle();
  };

  const logout = async () => {
    if (!auth) return;
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
