import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  USER: 'user'
};

export const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    // Check localStorage first
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [userRole, setUserRole] = useState(() => {
    // Check localStorage first
    const savedRole = localStorage.getItem('userRole');
    return savedRole || null;
  });
  const [loading, setLoading] = useState(true);

  // Save to localStorage whenever user or role changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      localStorage.setItem('userRole', userRole);
    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userRole');
    }
  }, [currentUser, userRole]);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Update user data immediately
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role || (userData.isAdmin ? ROLES.ADMIN : ROLES.USER);
          setUserRole(role);
          setCurrentUser({ ...userCredential.user, role, isAdmin: userData.isAdmin });
        }
        return userCredential;
      });
  }

  function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider)
      .then(async (userCredential) => {
        // Update user data immediately
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role || (userData.isAdmin ? ROLES.ADMIN : ROLES.USER);
          setUserRole(role);
          setCurrentUser({ ...userCredential.user, role, isAdmin: userData.isAdmin });
        }
        return userCredential;
      });
  }

  function logout() {
    return signOut(auth);
  }

  // Check if user has required role
  function hasPermission(requiredRole) {
    const roleHierarchy = {
      [ROLES.ADMIN]: 4,
      [ROLES.EDITOR]: 3,
      [ROLES.VIEWER]: 2,
      [ROLES.USER]: 1
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }

  // Check if user can perform specific action
  function canPerformAction(action) {
    const actionPermissions = {
      edit: [ROLES.ADMIN, ROLES.EDITOR],
      delete: [ROLES.ADMIN],
      view: [ROLES.ADMIN, ROLES.EDITOR, ROLES.VIEWER],
    };

    return actionPermissions[action]?.includes(userRole) || false;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Only fetch from Firestore if we don't have the data locally
        if (!currentUser || currentUser.uid !== user.uid) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role || (userData.isAdmin ? ROLES.ADMIN : ROLES.USER);
            setUserRole(role);
            setCurrentUser({ ...user, role, isAdmin: userData.isAdmin });
          }
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    hasPermission,
    canPerformAction,
    signup,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 