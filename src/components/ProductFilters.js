import React from 'react';
import './ProductFilters.css';

const ProductFilters = ({ 
  categories,
  filters,
  setFilters,
  priceRange,
  setPriceRange,
  searchQuery,
  setSearchQuery
}) => {
  const handleCategoryChange = (category) => {
    setFilters(prev => ({
      ...prev,
      category: category === 'all' ? '' : category
    }));
  };

  const handleAvailabilityChange = (availability) => {
    setFilters(prev => ({
      ...prev,
      inStock: availability === 'all' ? null : availability === 'in-stock'
    }));
  };

  const handlePriceChange = (min, max) => {
    setPriceRange({ min, max });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="product-filters">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>

      <div className="filter-section">
        <h3>Categories</h3>
        <div className="filter-options">
          <label className="filter-option">
            <input
              type="radio"
              name="category"
              value="all"
              checked={!filters.category}
              onChange={() => handleCategoryChange('all')}
            />
            <span>All Categories</span>
          </label>
          {categories.map(category => (
            <label key={category} className="filter-option">
              <input
                type="radio"
                name="category"
                value={category}
                checked={filters.category === category}
                onChange={() => handleCategoryChange(category)}
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Price Range</h3>
        <div className="price-range">
          <input
            type="number"
            placeholder="Min"
            value={priceRange.min}
            onChange={(e) => handlePriceChange(e.target.value, priceRange.max)}
            min="0"
            className="price-input"
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => handlePriceChange(priceRange.min, e.target.value)}
            min="0"
            className="price-input"
          />
        </div>
      </div>

      <div className="filter-section">
        <h3>Availability</h3>
        <div className="filter-options">
          <label className="filter-option">
            <input
              type="radio"
              name="availability"
              value="all"
              checked={filters.inStock === null}
              onChange={() => handleAvailabilityChange('all')}
            />
            <span>All Items</span>
          </label>
          <label className="filter-option">
            <input
              type="radio"
              name="availability"
              value="in-stock"
              checked={filters.inStock === true}
              onChange={() => handleAvailabilityChange('in-stock')}
            />
            <span>In Stock</span>
          </label>
          <label className="filter-option">
            <input
              type="radio"
              name="availability"
              value="out-of-stock"
              checked={filters.inStock === false}
              onChange={() => handleAvailabilityChange('out-of-stock')}
            />
            <span>Out of Stock</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters; 