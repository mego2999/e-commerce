import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const defaultCategories = [
  { name: 'Electronics', description: 'Electronic devices and accessories' },
  { name: 'Clothing', description: 'Fashion and apparel' },
  { name: 'Beauty', description: 'Beauty and personal care products' },
  { name: 'Home', description: 'Home and furniture items' },
  { name: 'Books', description: 'Books and publications' },
  { name: 'Sports', description: 'Sports and fitness equipment' },
  { name: 'Toys', description: 'Toys and games' },
  { name: 'Food', description: 'Food and beverages' },
  { name: 'Pets', description: 'Pet supplies and accessories' },
  { name: 'Other', description: 'Miscellaneous items' }
];

export const initializeCategories = async () => {
  try {
    // Check if categories already exist
    const categoriesRef = collection(db, 'categories');
    const categoriesSnapshot = await getDocs(categoriesRef);
    
    if (categoriesSnapshot.empty) {
      // Add default categories
      for (const category of defaultCategories) {
        await addDoc(categoriesRef, {
          name: category.name,
          description: category.description,
          createdAt: new Date()
        });
      }
      console.log('Categories initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing categories:', error);
  }
};

export const getCategoryByName = async (categoryName) => {
  try {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef, where('name', '==', categoryName));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting category:', error);
    return null;
  }
}; 