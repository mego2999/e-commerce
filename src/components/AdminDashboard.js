import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, ROLES } from '../contexts/AuthContext';
import { db, storage } from '../firebase/config';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDoc,
  addDoc 
} from 'firebase/firestore';
import { importProductsToFirestore } from '../utils/importProducts';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    description: '',
    image: '',
    category: '',
    stock: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const { currentUser, userRole, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    checkAccess();
  }, [currentUser, navigate]);

  const checkAccess = async () => {
    try {
      if (!hasPermission(ROLES.ADMIN)) {
        navigate('/');
        return;
      }
      loadData();
    } catch (error) {
      console.error('Error checking access:', error);
      navigate('/');
    }
  };

  const loadData = async () => {
    try {
      // Load products
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);

      // Load orders
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);

      // Load users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
      loadData(); // Reload users to reflect changes
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.uid) {
      alert("You cannot delete your own account!");
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        loadData(); // Reload users to reflect changes
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleImportProducts = async () => {
    if (window.confirm('Are you sure you want to import products from the dummy API? This may create duplicate products if run multiple times.')) {
      setImporting(true);
      try {
        await importProductsToFirestore();
        loadData(); // Reload products after import
      } catch (error) {
        console.error('Error importing products:', error);
      } finally {
        setImporting(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : name === 'stock' ? parseInt(value) || 0 : value
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        createdAt: new Date()
      });
      
      setNewProduct({
        title: '',
        price: '',
        description: '',
        image: '',
        category: '',
        stock: 0
      });
      setShowAddForm(false);
      loadData(); // Reload products
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        loadData(); // Reload products
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date()
      });
      loadData(); // Reload orders to reflect changes
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const renderUsersTab = () => (
    <div className="admin-tab-content">
      <h2>User Management</h2>
      <div className="users-grid">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <div className="user-card-header">
              <h3>{user.email}</h3>
              <span className={`role-badge ${user.role || 'user'}`}>
                {user.role || 'user'}
              </span>
            </div>
            <div className="user-card-content">
              <div className="role-control">
                <label>Role:</label>
                <select
                  value={user.role || 'user'}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={user.id === currentUser.uid}
                >
                  {Object.values(ROLES).map(role => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="user-permissions">
                <h4>Permissions:</h4>
                <ul>
                  {user.role === ROLES.ADMIN && (
                    <li>✓ Full system access</li>
                  )}
                  {user.role === ROLES.EDITOR && (
                    <>
                      <li>✓ Edit products and orders</li>
                      <li>✓ View all data</li>
                      <li>✗ Cannot delete</li>
                    </>
                  )}
                  {user.role === ROLES.VIEWER && (
                    <>
                      <li>✓ View all data</li>
                      <li>✗ Cannot edit</li>
                      <li>✗ Cannot delete</li>
                    </>
                  )}
                  {(!user.role || user.role === ROLES.USER) && (
                    <li>✓ Regular user access</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="user-card-actions">
              <button
                className="delete-btn"
                onClick={() => handleDeleteUser(user.id)}
                disabled={user.id === currentUser.uid}
              >
                Delete User
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOrdersTab = () => (
    <div className="admin-tab-content">
      <h2>Orders Management</h2>
      <div className="orders-grid">
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-card-header">
              <h3>Order #{order.id.slice(-6)}</h3>
              <div className="status-controls">
                <span className={`status-badge ${order.status?.toLowerCase()}`}>
                  {order.status}
                </span>
                <select 
                  value={order.status || 'pending'}
                  onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="order-card-content">
              <div className="order-info">
                <p className="order-date">
                  Ordered: {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                </p>
                {order.updatedAt && (
                  <p className="order-updated">
                    Last Updated: {new Date(order.updatedAt.toDate()).toLocaleDateString()}
                  </p>
                )}
                <p className="order-customer">
                  Customer: {order.customerName || 'N/A'} ({order.customerEmail || 'N/A'})
                </p>
                <p className="order-address">
                  Shipping Address: {order.shippingAddress || 'N/A'}
                </p>
                <p className="order-total">Total: ${order.total?.toFixed(2)}</p>
              </div>
              <div className="order-items">
                <h4>Order Items:</h4>
                {order.items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>{item.title}</span>
                    <div className="item-details">
                      <span>${item.price}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-timeline">
                <h4>Order Timeline</h4>
                <div className="timeline-steps">
                  <div className={`timeline-step ${order.status === 'pending' ? 'current' : ''} ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                    <div className="step-indicator"></div>
                    <span>Order Placed</span>
                  </div>
                  <div className={`timeline-step ${order.status === 'processing' ? 'current' : ''} ${['shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                    <div className="step-indicator"></div>
                    <span>Processing</span>
                  </div>
                  <div className={`timeline-step ${order.status === 'shipped' ? 'current' : ''} ${['delivered'].includes(order.status) ? 'completed' : ''}`}>
                    <div className="step-indicator"></div>
                    <span>Shipped</span>
                  </div>
                  <div className={`timeline-step ${order.status === 'delivered' ? 'current' : ''}`}>
                    <div className="step-indicator"></div>
                    <span>Delivered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <div className="admin-loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="admin-welcome">Welcome back, {currentUser.email}</p>
      </div>
      
      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p>{products.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Orders</h3>
          <p>{orders.length}</p>
        </div>
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{users.length}</p>
        </div>
      </div>

      <div className="admin-tabs">
        <button 
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'products' && (
          <div className="admin-tab-content">
            <h2>Products Management</h2>
            <div className="admin-actions">
              <button 
                className="add-product-btn"
                onClick={() => setShowAddForm(true)}
              >
                Add New Product
              </button>
              <button 
                className="import-products-btn"
                onClick={handleImportProducts}
                disabled={importing}
              >
                {importing ? 'Importing...' : 'Import Products from API'}
              </button>
            </div>

            {showAddForm && (
              <div className="add-product-form">
                <h3>Add New Product</h3>
                <form onSubmit={handleAddProduct}>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      name="title"
                      value={newProduct.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="number"
                      name="price"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input
                      type="number"
                      name="stock"
                      value={newProduct.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={newProduct.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Image URL</label>
                    <input
                      type="url"
                      name="image"
                      value={newProduct.image}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      name="category"
                      value={newProduct.category}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-buttons">
                    <button type="submit">Add Product</button>
                    <button 
                      type="button" 
                      onClick={() => setShowAddForm(false)}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="products-grid">
              {products.map(product => (
                <div key={product.id} className="product-card">
                  <img src={product.image} alt={product.title} />
                  <div className="product-card-content">
                    <h3>{product.title}</h3>
                    <p className="product-price">${product.price}</p>
                    <p className="product-category">{product.category}</p>
                    <p className="product-stock">Stock: {product.stock}</p>
                    <button 
                      onClick={() => handleDeleteProduct(product.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'orders' && renderOrdersTab()}
        {activeTab === 'users' && renderUsersTab()}
      </div>
    </div>
  );
}

export default AdminDashboard; 