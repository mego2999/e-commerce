import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import './ProductCard.css';

const ProductCard = ({ product, onProductUpdate }) => {
  const { addToCart, cart } = useCart();
  console.log('Cart in ProductCard:', cart); // Debug cart
  const { currentUser } = useAuth();
  const [error, setError] = useState('');
  const [userDiscount, setUserDiscount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProduct, setEditedProduct] = useState({ ...product });
  
  // Check if user is admin
  const isAdmin = currentUser?.isAdmin === true || currentUser?.role === 'admin';

  useEffect(() => {
    const fetchUserDiscount = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserDiscount(userDoc.data().discount || 0);
        }
      }
    };
    fetchUserDiscount();
  }, [currentUser]);

  const getCurrentStock = () => {
    const cartItem = cart.find(item => item.id === product.id);
    const inCartQuantity = cartItem ? cartItem.quantity : 0;
    return product.stock - inCartQuantity;
  };

  const getDiscountedPrice = () => {
    if (!userDiscount) return product.price;
    const discountAmount = (product.price * userDiscount) / 100;
    return product.price - discountAmount;
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProduct({ ...product });
  };

  const handleSave = async () => {
    try {
      if (!editedProduct.name || !editedProduct.price) {
        setError('Name and price are required');
        return;
      }

      // Only update the simplified fields
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, {
        name: editedProduct.name,
        price: Number(editedProduct.price),
        stock: Number(editedProduct.stock)
      });
      
      setIsEditing(false);
      setError('');
      if (onProductUpdate) onProductUpdate();
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Failed to update product');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', product.id));
        if (onProductUpdate) onProductUpdate();
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Failed to delete product');
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'select-one' && name === 'stockStatus') {
      // Set stock to 10 if in stock, 0 if out of stock
      setEditedProduct(prev => ({
        ...prev,
        stock: value === 'in_stock' ? 10 : 0
      }));
    } else {
      setEditedProduct(prev => ({
        ...prev,
        [name]: name === 'price' ? Number(value) : value
      }));
    }
  };

  const handleAddToCart = () => {
    setError('');
    const availableStock = getCurrentStock();

    if (availableStock <= 0) {
      setError('Out of stock');
      return;
    }

    console.log('Adding to cart:', product);
    addToCart(product);
    console.log('Product added to cart');
    alert(`${product.name} added to cart!`);
  };

  const availableStock = getCurrentStock();
  const discountedPrice = getDiscountedPrice();

  if (isEditing && isAdmin) {
    return (
      <div className="product-card editing">
        <div className="edit-form">
          <input
            type="text"
            name="name"
            value={editedProduct.name || ''}
            onChange={handleChange}
            placeholder="Product Name"
            className="edit-input"
          />
          <input
            type="number"
            name="price"
            value={editedProduct.price || ''}
            onChange={handleChange}
            placeholder="Price"
            className="edit-input"
            min="0"
            step="0.01"
          />
          <select
            name="stockStatus"
            value={editedProduct.stock > 0 ? 'in_stock' : 'out_of_stock'}
            onChange={handleChange}
            className="edit-input"
          >
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          
          {error && <p className="error-message">{error}</p>}
          <div className="edit-buttons">
            <button onClick={handleSave} className="save-btn">Save</button>
            <button onClick={() => {
              setIsEditing(false);
              setError('');
            }} className="cancel-btn">Cancel</button>
            <button onClick={handleDelete} className="delete-btn">Delete Product</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-card">
      <img 
        src={product.image} 
        alt={product.name}
        className="product-image"
      />
      
      <div className="product-details">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        
        <div className="price-container">
          {userDiscount > 0 && (
            <p className="original-price">${product.price.toFixed(2)}</p>
          )}
          <p className="product-price">
            ${discountedPrice.toFixed(2)}
            {userDiscount > 0 && (
              <span className="discount-badge">-{userDiscount}%</span>
            )}
          </p>
        </div>

        <div className="stock-info">
          <span className={`stock-status ${availableStock > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {availableStock > 0 ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {isAdmin && (
          <div className="admin-controls">
            <button className="edit-btn" onClick={handleEdit}>
              Edit
            </button>
            <button className="delete-btn" onClick={handleDelete}>
              Delete
            </button>
          </div>
        )}

        {error && <p className="error-message">{error}</p>}
        
        <button 
          className="add-to-cart-btn"
          disabled={availableStock === 0}
          onClick={handleAddToCart}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 