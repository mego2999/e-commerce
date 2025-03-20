import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

export const importProductsToFirestore = async () => {
  try {
    // Fetch products from dummy API
    const response = await fetch('https://dummyjson.com/products');
    const data = await response.json();
    const products = data.products;

    // Add each product to Firestore
    const productsCollection = collection(db, 'products');
    
    for (const product of products) {
      await addDoc(productsCollection, {
        title: product.title,
        description: product.description,
        price: product.price,
        image: product.images[0], // Using first high-quality image instead of thumbnail
        category: product.category,
        rating: product.rating,
        createdAt: new Date()
      });
    }

    console.log('Successfully imported all products to Firestore');
    return true;
  } catch (error) {
    console.error('Error importing products:', error);
    return false;
  }
}; 