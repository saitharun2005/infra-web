import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Filter, Building2, DollarSign, Package, Hammer, Wrench, Users, UserCheck, Truck, Settings, Home, Fuel, Percent, AlertTriangle, Eye, Download, Calendar, MapPin, CreditCard, FileText } from 'lucide-react';
import { collection, getDocs, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [sites, setSites] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showExpenseDetails, setShowExpenseDetails] = useState(false);

  const categoryIcons = {
    Package, Hammer, Wrench, Users, UserCheck, Truck, Settings, Home, Fuel, Percent, AlertTriangle, DollarSign
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch expenses
      const q = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
      const expensesSnapshot = await getDocs(q);
      const expensesData = expensesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenses(expensesData);

      // Fetch sites
      const sitesSnapshot = await getDocs(collection(db, 'sites'));
      const sitesData = sitesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSites(sitesData);

      // Fetch expense types
      const typesSnapshot = await getDocs(collection(db, 'expenseTypes'));
      const typesData = typesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExpenseTypes(typesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewExpense = (expense) => {
    setSelectedExpense(expense);
    setShowExpenseDetails(true);
  };

  const handleCloseExpenseDetails = () => {
    setShowExpenseDetails(false);
    setSelectedExpense(null);
  };

  const handleDownloadInvoice = (expense) => {
    // Create invoice content
    const site = sites.find(s => s.id === expense.siteId);
    const type = expenseTypes.find(t => t.id === expense.expenseTypeId);
    
    const invoiceContent = `
INVOICE
====================

Invoice Date: ${formatDate(expense.date)}
Site: ${site?.name || 'Unknown Site'}
Expense Type: ${type?.name || 'Unknown Type'}

EXPENSE DETAILS:
====================
Description: ${expense.description || '-'}
Vendor: ${expense.vendor || '-'}
Payment Method: ${expense.paymentMethod || '-'}

AMOUNT BREAKDOWN:
====================
${expense.category ? `Category: ${expense.category}` : ''}
${expense.quantity ? `Quantity: ${expense.quantity}` : ''}
${expense.amount ? `Amount: ₹${expense.amount}` : ''}
${expense.totalAmount ? `Total Amount: ₹${expense.totalAmount}` : ''}
${expense.transportCharges ? `Transport Charges: ₹${expense.transportCharges}` : ''}
${expense.maintenanceCharges ? `Maintenance Charges: ₹${expense.maintenanceCharges}` : ''}

TOTAL: ₹${expense.totalAmount || expense.amount || 0}

Notes: ${expense.notes || '-'}

Generated on: ${new Date().toLocaleDateString('en-IN')}
    `;

    // Create and download file
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-invoice-${expense.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Invoice downloaded successfully!');
  };

  const handleEditExpense = (expense) => {
    navigate(`/edit-expense/${expense.id}`);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteDoc(doc(db, 'expenses', expenseId));
        toast.success('Expense deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting expense:', error);
        toast.error('Failed to delete expense');
      }
    }
  };

  const formatDate = (date) => {
    if (date && date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString('en-IN');
    }
    return new Date(date).toLocaleDateString('en-IN');
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getFilteredExpenses = () => {
    let filtered = expenses;

    if (searchTerm) {
      filtered = filtered.filter(expense => {
        const site = sites.find(s => s.id === expense.siteId);
        const type = expenseTypes.find(t => t.id === expense.expenseTypeId);
        return (
          expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          type?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (filterSite) {
      filtered = filtered.filter(expense => expense.siteId === filterSite);
    }

    if (filterType) {
      filtered = filtered.filter(expense => expense.expenseTypeId === filterType);
    }

    return filtered;
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
    <div>
      <div className="header">
        <div className="header-title">
          <Plus />
          Expenses Management
        </div>
        <button 
          className="btn"
          onClick={() => navigate('/add-expense')}
        >
          <Plus />
          Add New Expense
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="grid grid-3" style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <label className="form-label">Search</label>
            <div className="input-group">
              <Search className="input-icon" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Filter by Site</label>
            <select
              value={filterSite}
              onChange={(e) => setFilterSite(e.target.value)}
              className="form-select"
            >
              <option value="">All Sites</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Filter by Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-select"
            >
              <option value="">All Types</option>
              {expenseTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Cards Container */}
      <div className="expenses-container">
        {getFilteredExpenses().map(expense => {
          const site = sites.find(s => s.id === expense.siteId);
          const type = expenseTypes.find(t => t.id === expense.expenseTypeId);
          const IconComponent = categoryIcons[type?.icon] || DollarSign;

          // Map expense type names properly
          const getExpenseTypeName = (expenseType) => {
            const typeMap = {
              'accommodation-food': 'Accommodation & Food',
              'machines-tools-rental': 'Machines and Tools Rental',
              'material-purchase': 'Material Purchase',
              'repairs': 'Repairs',
              'percentages': 'Percentages',
              'tool-purchase': 'Tools Purchase',
              'wear-tear': 'Wear & Tear Purchase',
              'losses-discarded': 'Losses & Discarded Tools',
              'petrol-diesel': 'Petrol & Diesel',
              'misc-expenses': 'Miscellaneous Expenses',
              'labour-account': 'Labour Account',
              'staff-account': 'Staff Account'
            };
            return typeMap[expenseType] || expenseType || 'Unknown Type';
          };

          return (
            <div key={expense.id} className="expense-card">
              <div className="expense-card-header">
                <div className="expense-type">
                  <IconComponent size={20} />
                  <span>{getExpenseTypeName(expense.expenseType)}</span>
                </div>
                <div className="expense-amount">
                  {formatAmount(expense.totalAmount || expense.amount || 0)}
                </div>
              </div>
              
              <div className="expense-card-body">
                <div className="expense-info">
                  <div className="info-item">
                    <Calendar size={16} />
                    <span>{formatDate(expense.date)}</span>
                  </div>
                  <div className="info-item">
                    <MapPin size={16} />
                    <span>{site?.name || 'Unknown Site'}</span>
                  </div>
                  <div className="info-item">
                    <FileText size={16} />
                    <span>{expense.description || 'No description'}</span>
                  </div>
                  {expense.vendor && (
                    <div className="info-item">
                      <Building2 size={16} />
                      <span>{expense.vendor}</span>
                    </div>
                  )}
                  {expense.paymentMethod && (
                    <div className="info-item">
                      <CreditCard size={16} />
                      <span>{expense.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="expense-card-footer">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handleViewExpense(expense)}
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleEditExpense(expense)}
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleDownloadInvoice(expense)}
                  title="Download Invoice"
                >
                  <Download size={16} />
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteExpense(expense.id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}

        {getFilteredExpenses().length === 0 && (
          <div className="empty-state">
            <DollarSign size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <h3>No expenses found</h3>
            <p>Start by adding your first expense</p>
            <button 
              className="btn"
              onClick={() => navigate('/add-expense')}
              style={{ marginTop: '16px' }}
            >
              <Plus />
              Add First Expense
            </button>
          </div>
        )}
      </div>

      {/* Expense Details Modal */}
      {showExpenseDetails && selectedExpense && (
        <div className="modal-overlay" onClick={handleCloseExpenseDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Expense Details</h2>
              <button 
                className="btn btn-secondary"
                onClick={handleCloseExpenseDetails}
              >
                Close
              </button>
            </div>
            
            <div className="modal-body">
              <div className="invoice-container">
                <div className="invoice-header">
                  <h3>INVOICE</h3>
                  <div className="invoice-date">
                    Date: {formatDate(selectedExpense.date)}
                  </div>
                </div>

                <div className="invoice-details">
                  <div className="detail-section">
                    <h4>Site Information</h4>
                    <p><strong>Site:</strong> {sites.find(s => s.id === selectedExpense.siteId)?.name || 'Unknown Site'}</p>
                    <p><strong>Expense Type:</strong> {expenseTypes.find(t => t.id === selectedExpense.expenseTypeId)?.name || 'Unknown Type'}</p>
                  </div>

                  <div className="detail-section">
                    <h4>Expense Information</h4>
                    <p><strong>Description:</strong> {selectedExpense.description || '-'}</p>
                    <p><strong>Vendor:</strong> {selectedExpense.vendor || '-'}</p>
                    <p><strong>Payment Method:</strong> {selectedExpense.paymentMethod || '-'}</p>
                  </div>

                  <div className="detail-section">
                    <h4>Amount Breakdown</h4>
                    {selectedExpense.category && <p><strong>Category:</strong> {selectedExpense.category}</p>}
                    {selectedExpense.quantity && <p><strong>Quantity:</strong> {selectedExpense.quantity}</p>}
                    {selectedExpense.amount && <p><strong>Amount:</strong> ₹{selectedExpense.amount}</p>}
                    {selectedExpense.totalAmount && <p><strong>Total Amount:</strong> ₹{selectedExpense.totalAmount}</p>}
                    {selectedExpense.transportCharges && <p><strong>Transport Charges:</strong> ₹{selectedExpense.transportCharges}</p>}
                    {selectedExpense.maintenanceCharges && <p><strong>Maintenance Charges:</strong> ₹{selectedExpense.maintenanceCharges}</p>}
                    
                    <div className="total-section">
                      <h3>TOTAL: ₹{selectedExpense.totalAmount || selectedExpense.amount || 0}</h3>
                    </div>
                  </div>

                  {selectedExpense.notes && (
                    <div className="detail-section">
                      <h4>Notes</h4>
                      <p>{selectedExpense.notes}</p>
                    </div>
                  )}
                </div>

                <div className="invoice-footer">
                  <button 
                    className="btn btn-success"
                    onClick={() => handleDownloadInvoice(selectedExpense)}
                  >
                    <Download />
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;