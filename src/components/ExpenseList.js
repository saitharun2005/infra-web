import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Package,
  Hammer,
  Wrench,
  Users,
  UserCheck,
  Truck,
  Settings,
  Home,
  Fuel,
  Percent,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const ExpenseList = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filteredExpenses, setFilteredExpenses] = useState([]);

  const categoryIcons = {
    'material-purchase': Package,
    'tools-purchase': Hammer,
    'wear-tear-purchase': Wrench,
    'labour-account': Users,
    'staff-account': UserCheck,
    'machines-rental': Truck,
    'repairs': Settings,
    'accommodation-food': Home,
    'petrol-diesel': Fuel,
    'percentages': Percent,
    'losses-discarded': AlertTriangle,
    'misc-expenses': DollarSign
  };

  const categoryLabels = {
    'material-purchase': 'Material Purchase',
    'tools-purchase': 'Tools Purchase',
    'wear-tear-purchase': 'Wear & Tear Purchase',
    'labour-account': 'Labour Account',
    'staff-account': 'Staff Account',
    'machines-rental': 'Machines Rental',
    'repairs': 'Repairs',
    'accommodation-food': 'Accommodation & Food',
    'petrol-diesel': 'Petrol & Diesel',
    'percentages': 'Percentages',
    'losses-discarded': 'Losses & Discarded',
    'misc-expenses': 'Misc. Expenses'
  };

  useEffect(() => {
    fetchExpenses();
  }, [siteId]);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, filterCategory]);

  const fetchExpenses = async () => {
    try {
      const q = query(
        collection(db, 'expenses'),
        where('siteId', '==', siteId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const expensesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const filterExpenses = () => {
    let filtered = expenses;

    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoryLabels[expense.category]?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(expense => expense.category === filterCategory);
    }

    setFilteredExpenses(filtered);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteDoc(doc(db, 'expenses', expenseId));
        toast.success('Expense deleted successfully');
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast.error('Failed to delete expense');
      }
    }
  };

  const formatDate = (date) => {
    return new Date(date.seconds * 1000).toLocaleDateString('en-IN');
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading" style={{ fontSize: '2rem' }}>⏳</div>
            <p>Loading expenses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(`/dashboard/${siteId}`)}
          >
            <ArrowLeft className="icon-animation" />
            Back to Dashboard
          </button>
          <h1 className="card-title">
            <DollarSign className="icon-animation" />
            Expenses List
          </h1>
          <Link to={`/add-expense/${siteId}`} className="btn">
            <Plus className="icon-animation" />
            Add Expense
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-2" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Search</label>
            <div style={{ position: 'relative' }}>
              <Search 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#666'
                }} 
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder="Search by description, vendor, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Filter by Category</label>
            <div style={{ position: 'relative' }}>
              <Filter 
                size={20} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#666'
                }} 
              />
              <select
                className="form-select"
                style={{ paddingLeft: '40px' }}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Expenses List */}
        <div>
          {filteredExpenses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <DollarSign size={60} className="icon-animation" style={{ marginBottom: '20px', opacity: 0.5 }} />
              <h3>No expenses found</h3>
              <p>Add your first expense to get started</p>
            </div>
          ) : (
            filteredExpenses.map((expense) => {
              const Icon = categoryIcons[expense.category] || DollarSign;
              const categoryLabel = categoryLabels[expense.category] || expense.category;
              
              return (
                <div key={expense.id} className="expense-item">
                  <div className="expense-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={20} className="icon-animation" />
                      <span className="expense-category">{categoryLabel}</span>
                    </div>
                    <div className="expense-amount">{formatAmount(expense.amount)}</div>
                  </div>
                  
                  <div className="expense-details">
                    <p><strong>Description:</strong> {expense.description}</p>
                    {expense.vendor && <p><strong>Vendor:</strong> {expense.vendor}</p>}
                    {expense.quantity && expense.unit && (
                      <p><strong>Quantity:</strong> {expense.quantity} {expense.unit}</p>
                    )}
                    <p><strong>Date:</strong> {formatDate(expense.createdAt)}</p>
                    {expense.notes && <p><strong>Notes:</strong> {expense.notes}</p>}
                  </div>
                  
                  <div className="expense-actions">
                    <button 
                      className="btn btn-warning"
                      onClick={() => navigate(`/edit-expense/${siteId}/${expense.id}`)}
                    >
                      <Edit className="icon-animation" />
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDeleteExpense(expense.id)}
                    >
                      <Trash2 className="icon-animation" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary */}
        {filteredExpenses.length > 0 && (
          <div className="card" style={{ marginTop: '20px' }}>
            <h3>Summary</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{filteredExpenses.length}</div>
                <div className="stat-label">Total Expenses</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {formatAmount(filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0))}
                </div>
                <div className="stat-label">Total Amount</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {formatAmount(filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0) / filteredExpenses.length)}
                </div>
                <div className="stat-label">Average Amount</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;

