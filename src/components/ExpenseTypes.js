import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit, Trash2, Package, Hammer, Wrench, Users, UserCheck, Truck, Settings, Home, Fuel, Percent, AlertTriangle } from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const ExpenseTypes = () => {
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'DollarSign',
    isActive: true
  });

  const categoryIcons = {
    'Package': Package,
    'Hammer': Hammer,
    'Wrench': Wrench,
    'Users': Users,
    'UserCheck': UserCheck,
    'Truck': Truck,
    'Settings': Settings,
    'Home': Home,
    'Fuel': Fuel,
    'Percent': Percent,
    'AlertTriangle': AlertTriangle,
    'DollarSign': DollarSign
  };

  const predefinedTypes = [
    { name: 'Material Purchase', description: 'Purchase of construction materials', icon: 'Package' },
    { name: 'Tools Purchase', description: 'Purchase of tools and equipment', icon: 'Hammer' },
    { name: 'Wear & Tear Purchase', description: 'Items that degrade over time', icon: 'Wrench' },
    { name: 'Labour Account', description: 'Labor costs and wages', icon: 'Users' },
    { name: 'Staff Account', description: 'Staff-related expenses', icon: 'UserCheck' },
    { name: 'Machines Rental', description: 'Equipment and machinery rental', icon: 'Truck' },
    { name: 'Repairs', description: 'Repair and maintenance costs', icon: 'Settings' },
    { name: 'Accommodation & Food', description: 'Lodging and meal expenses', icon: 'Home' },
    { name: 'Petrol & Diesel', description: 'Fuel costs for vehicles and equipment', icon: 'Fuel' },
    { name: 'Percentages', description: 'Commissions and calculated overheads', icon: 'Percent' },
    { name: 'Losses & Discarded Tools', description: 'Financial losses and unusable tools', icon: 'AlertTriangle' },
    { name: 'Miscellaneous Expenses', description: 'Miscellaneous expenses', icon: 'DollarSign' }
  ];

  useEffect(() => {
    fetchExpenseTypes();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showIconDropdown && !event.target.closest('.custom-dropdown')) {
        setShowIconDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showIconDropdown]);

  const fetchExpenseTypes = async () => {
    try {
      const typesSnapshot = await getDocs(collection(db, 'expenseTypes'));
      const typesData = typesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // If no expense types exist, add predefined ones
      if (typesData.length === 0) {
        await addPredefinedTypes();
        // Fetch again after adding predefined types
        const newSnapshot = await getDocs(collection(db, 'expenseTypes'));
        const newTypesData = newSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setExpenseTypes(newTypesData);
      } else {
        setExpenseTypes(typesData);
      }
    } catch (error) {
      console.error('Error fetching expense types:', error);
      toast.error('Failed to fetch expense types');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Expense type name is required');
      return;
    }

    try {
      if (editingTypeId) {
        // Update existing expense type
        await updateDoc(doc(db, 'expenseTypes', editingTypeId), {
          ...formData,
          updatedAt: new Date()
        });
        toast.success('Expense type updated successfully!');
      } else {
        // Add new expense type
        await addDoc(collection(db, 'expenseTypes'), {
          ...formData,
          createdAt: new Date()
        });
        toast.success('Expense type added successfully!');
      }
      
      setFormData({
        name: '',
        description: '',
        icon: 'DollarSign',
        isActive: true
      });
      setEditingTypeId(null);
      setShowForm(false);
      fetchExpenseTypes();
    } catch (error) {
      console.error('Error saving expense type:', error);
      toast.error(`Failed to ${editingTypeId ? 'update' : 'add'} expense type`);
    }
  };

  const handleDeleteType = async (typeId) => {
    if (window.confirm('Are you sure you want to delete this expense type?')) {
      try {
        await deleteDoc(doc(db, 'expenseTypes', typeId));
        toast.success('Expense type deleted successfully');
        fetchExpenseTypes();
      } catch (error) {
        console.error('Error deleting expense type:', error);
        toast.error('Failed to delete expense type');
      }
    }
  };

  const handleEditType = (type) => {
    setEditingTypeId(type.id);
    setFormData({
      name: type.name || '',
      description: type.description || '',
      icon: type.icon || 'DollarSign',
      isActive: type.isActive !== undefined ? type.isActive : true
    });
    setShowForm(true);
  };

  const addPredefinedTypes = async () => {
    try {
      for (const type of predefinedTypes) {
        await addDoc(collection(db, 'expenseTypes'), {
          ...type,
          createdAt: new Date(),
          isActive: true
        });
      }
      // No toast message - silent addition
    } catch (error) {
      console.error('Error adding predefined types:', error);
      toast.error('Failed to add predefined types');
    }
  };

  if (loading) {
    return (
      <div className="header">
        <div className="header-title">
          <DollarSign />
          Expense Types
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading" style={{ fontSize: '2rem' }}>⏳</div>
          <p>Loading expense types...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <div className="header-title">
          <DollarSign />
          Expense Types Management
        </div>
        <button 
          className="btn"
          onClick={() => setShowForm(true)}
        >
          <Plus />
          Add New Type
        </button>
      </div>

      {showForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Plus />
              {editingTypeId ? 'Edit Expense Type' : 'Add New Expense Type'}
            </h3>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setShowForm(false);
                setEditingTypeId(null);
                setFormData({
                  name: '',
                  description: '',
                  icon: 'DollarSign',
                  isActive: true
                });
              }}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Type Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter expense type name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Icon</label>
              <div className="custom-dropdown">
                <div 
                  className={`dropdown-trigger ${showIconDropdown ? 'open' : ''}`}
                  onClick={() => setShowIconDropdown(!showIconDropdown)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {React.createElement(categoryIcons[formData.icon] || DollarSign, { size: 16 })}
                    {formData.icon}
                  </div>
                  <span className="dropdown-arrow">▼</span>
                </div>
                {showIconDropdown && (
                  <div className="dropdown-menu">
                    {Object.keys(categoryIcons).map(iconName => {
                      const Icon = categoryIcons[iconName];
                      return (
                        <div
                          key={iconName}
                          className="dropdown-item"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, icon: iconName }));
                            setShowIconDropdown(false);
                          }}
                        >
                          <Icon size={16} />
                          {iconName}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter expense type description"
                rows="3"
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-success">
                <Plus />
                {editingTypeId ? 'Update Type' : 'Add Type'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <DollarSign />
            All Expense Types
          </h3>
        </div>

        {expenseTypes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <DollarSign size={60} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h3>No expense types found</h3>
            <p>Add predefined types or create your own</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenseTypes.map((type) => {
                  const IconComponent = categoryIcons[type.icon] || DollarSign;
                  return (
                    <tr key={type.id}>
                      <td>
                        <IconComponent size={20} />
                      </td>
                      <td><strong>{type.name}</strong></td>
                      <td>{type.description || 'No description'}</td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          background: type.isActive ? '#d4edda' : '#f8d7da',
                          color: type.isActive ? '#155724' : '#721c24'
                        }}>
                          {type.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-warning" 
                            style={{ padding: '6px 12px' }}
                            onClick={() => handleEditType(type)}
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '6px 12px' }}
                            onClick={() => handleDeleteType(type.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseTypes;
