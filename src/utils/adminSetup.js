import { db } from '../firebase/config';
import { doc, setDoc, collection, query, where, updateDoc, getDocs } from 'firebase/firestore';
import { ROLES } from '../contexts/AuthContext';

export const setupAdmin = async (email) => {
  try {
    // Get user document by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      // Update both isAdmin and role fields
      await updateDoc(doc(db, 'users', userDoc.id), {
        isAdmin: true,
        role: ROLES.ADMIN
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error setting up admin:', error);
    return false;
  }
}; 