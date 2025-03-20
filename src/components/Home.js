import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from './ProductCard';
import './Home.css';

const Home = ({ searchQuery = '' }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filters, setFilters] = useState({
    availability: 'all',
    priceMin: '',
    priceMax: ''
  });
  const [showSidebar, setShowSidebar] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  // Update when searchQuery prop changes
  useEffect(() => {
    // Apply all filters
    const filtered = filterProducts(products);
    setFilteredProducts(filtered);
  }, [searchQuery, filters, products]);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleProductUpdate = () => {
    fetchProducts();
  };

  const handleStockUpdate = async (productId, newStock) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        stock: parseInt(newStock)
      });
      fetchProducts(); // Refresh products after update
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filterProducts = (products) => {
    return products.filter(product => {
      // Search query filter
      const name = (product.name || product.title || '').toLowerCase();
      const description = (product.description || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      
      if (searchQuery && 
          !name.includes(searchQuery.toLowerCase()) && 
          !description.includes(searchQuery.toLowerCase()) && 
          !category.includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Availability filter
      if (filters.availability === 'in_stock' && (!product.stock || product.stock <= 0)) {
        return false;
      }
      if (filters.availability === 'out_of_stock' && product.stock > 0) {
        return false;
      }

      // Price range filter
      if (filters.priceMin && product.price < parseFloat(filters.priceMin)) {
        return false;
      }
      if (filters.priceMax && product.price > parseFloat(filters.priceMax)) {
        return false;
      }

      return true;
    });
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="home-content">
      {showSidebar && (
        <div className="filter-sidebar">
          <div className="filter-section">
            <h3>Availability:</h3>
            <select 
              className="filter-select"
              value={filters.availability}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
            >
              <option value="all">All Items</option>
              <option value="in_stock">In Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>

          <div className="filter-section">
            <h3>Price Range:</h3>
            <div className="price-range">
              <input
                type="number"
                className="price-input"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
              />
              <span>to</span>
              <input
                type="number"
                className="price-input"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
              />
            </div>
          </div>
          
          <button className="toggle-sidebar-btn" onClick={toggleSidebar}>
            Hide Filters
          </button>
        </div>
      )}

      {!showSidebar && (
        <button className="show-filters-btn" onClick={toggleSidebar}>
          Show Filters
        </button>
      )}

      <div className="products-grid">
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
              onProductUpdate={handleProductUpdate}
            />
          ))
        ) : (
          <div className="no-products">
            No products found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 