import React, { useState, useEffect } from 'react';
import { Wrench, Plus, Edit, Trash2, Truck, Settings } from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const MachinesTools = () => {
  const [machinesTools, setMachinesTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    status: 'available',
    quantity: 1,
    description: ''
  });

  const predefinedItems = [
    { name: 'Excavator', type: 'machine', quantity: 2 },
    { name: 'Crane', type: 'machine', quantity: 1 },
    { name: 'Concrete Mixer', type: 'machine', quantity: 3 },
    { name: 'Drill Machine', type: 'tool', quantity: 5 },
    { name: 'Welding Machine', type: 'tool', quantity: 2 },
    { name: 'Generator', type: 'machine', quantity: 4 },
    { name: 'Compressor', type: 'machine', quantity: 2 },
    { name: 'Hammer Drill', type: 'tool', quantity: 8 },
    { name: 'Angle Grinder', type: 'tool', quantity: 6 },
    { name: 'Circular Saw', type: 'tool', quantity: 4 }
  ];

  useEffect(() => {
    fetchMachinesTools();
  }, []);

  const fetchMachinesTools = async () => {
    try {
      const itemsSnapshot = await getDocs(collection(db, 'machinesTools'));
      const itemsData = itemsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMachinesTools(itemsData);
    } catch (error) {
      console.error('Error fetching machines and tools:', error);
      toast.error('Failed to fetch machines and tools');
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
      toast.error('Name is required');
      return;
    }

    try {
      if (editingItemId) {
        // Update existing item
        await updateDoc(doc(db, 'machinesTools', editingItemId), {
          ...formData,
          updatedAt: new Date()
        });
        toast.success('Item updated successfully!');
      } else {
        // Add new item
        await addDoc(collection(db, 'machinesTools'), {
          ...formData,
          inUseCount: 0,
          repairCount: 0,
          createdAt: new Date()
        });
        toast.success('Item added successfully!');
      }
      
      setFormData({
        name: '',
        type: '',
        status: 'available',
        quantity: 1,
        description: ''
      });
      setEditingItemId(null);
      setShowForm(false);
      fetchMachinesTools();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(`Failed to ${editingItemId ? 'update' : 'add'} item`);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, 'machinesTools', itemId));
        toast.success('Item deleted successfully');
        fetchMachinesTools();
      } catch (error) {
        console.error('Error deleting item:', error);
        toast.error('Failed to delete item');
      }
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      await updateDoc(doc(db, 'machinesTools', itemId), {
        quantity: newQuantity,
        updatedAt: new Date()
      });
      
      // Update local state immediately for better UX
      setMachinesTools(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      
      toast.success('Quantity updated successfully');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const incrementQuantity = (item) => {
    const newQuantity = (item.quantity || 1) + 1;
    updateQuantity(item.id, newQuantity);
  };

  const decrementQuantity = (item) => {
    const currentQuantity = item.quantity || 1;
    if (currentQuantity > 1) {
      const newQuantity = currentQuantity - 1;
      updateQuantity(item.id, newQuantity);
    } else {
      toast.error('Quantity cannot be less than 1');
    }
  };

  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setFormData({
      name: item.name || '',
      type: item.type || '',
      status: item.status || 'available',
      quantity: item.quantity || 1,
      description: item.description || ''
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setFormData({
      name: '',
      type: '',
      status: 'available',
      quantity: 1,
      description: ''
    });
    setShowForm(false);
  };

  const updateStatusBasedOnUsage = (item) => {
    const totalQuantity = item.quantity || 1;
    const inUseCount = item.inUseCount || 0;
    const repairCount = item.repairCount || 0;
    const availableCount = totalQuantity - inUseCount - repairCount;
    
    let newStatus = 'available';
    if (availableCount <= 0) {
      if (repairCount > 0) {
        newStatus = 'repair';
      } else {
        newStatus = 'in-use';
      }
    } else if (inUseCount > 0) {
      newStatus = 'in-use';
    }
    
    return newStatus;
  };

  const addPredefinedItems = async () => {
    try {
      for (const item of predefinedItems) {
        await addDoc(collection(db, 'machinesTools'), {
          ...item,
          status: 'available',
          createdAt: new Date()
        });
      }
      // No toast message - silent addition
    } catch (error) {
      console.error('Error adding predefined items:', error);
      toast.error('Failed to add predefined items');
    }
  };

  if (loading) {
    return (
      <div className="header">
        <div className="header-title">
          <Wrench />
          Machines & Tools
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading" style={{ fontSize: '2rem' }}>⏳</div>
          <p>Loading machines and tools...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <div className="header-title">
          <Wrench />
          Machines & Tools Management
        </div>
        <button 
          className="btn"
          onClick={() => setShowForm(true)}
        >
          <Plus />
          Add New Item
        </button>
      </div>

      {showForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Plus />
              {editingItemId ? 'Edit Machine/Tool' : 'Add New Machine/Tool'}
            </h3>
            <button 
              className="btn btn-secondary"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Select type</option>
                  <option value="machine">Machine</option>
                  <option value="tool">Tool</option>
                  <option value="equipment">Equipment</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="repair">Under Repair</option>
                <option value="out-of-service">Out of Service</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Quantity</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', minWidth: '40px' }}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    quantity: Math.max(1, prev.quantity - 1) 
                  }))}
                >
                  -
                </button>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="form-input"
                  style={{ textAlign: 'center', width: '80px' }}
                  min="1"
                  required
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', minWidth: '40px' }}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    quantity: prev.quantity + 1 
                  }))}
                >
                  +
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter description"
                rows="3"
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-success">
                <Plus />
                {editingItemId ? 'Update Item' : 'Add Item'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={handleCancelEdit}
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
            <Wrench />
            All Machines & Tools
          </h3>
        </div>

        {machinesTools.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Wrench size={60} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h3>No machines or tools found</h3>
            <p>Add predefined items or create your own</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Total Qty</th>
                  <th>In Use</th>
                  <th>Repair</th>
                  <th>Available</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {machinesTools.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div>
                        <strong>{item.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        background: item.type === 'machine' ? '#d1ecf1' : '#d4edda',
                        color: item.type === 'machine' ? '#0c5460' : '#155724'
                      }}>
                        {item.type}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', minWidth: '30px', fontSize: '12px' }}
                          onClick={() => decrementQuantity(item)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.9rem',
                          fontWeight: 'bold',
                          background: '#e3f2fd',
                          color: '#1976d2',
                          minWidth: '30px',
                          textAlign: 'center',
                          display: 'inline-block'
                        }}>
                          {item.quantity || 1}
                        </span>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', minWidth: '30px', fontSize: '12px' }}
                          onClick={() => incrementQuantity(item)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        background: '#fff3cd',
                        color: '#856404'
                      }}>
                        {item.inUseCount || 0}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        background: '#f8d7da',
                        color: '#721c24'
                      }}>
                        {item.repairCount || 0}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        background: '#d4edda',
                        color: '#155724'
                      }}>
                        {(item.quantity || 1) - (item.inUseCount || 0) - (item.repairCount || 0)}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        background: item.status === 'available' ? '#d4edda' : 
                                   item.status === 'in-use' ? '#fff3cd' : '#f8d7da',
                        color: item.status === 'available' ? '#155724' : 
                               item.status === 'in-use' ? '#856404' : '#721c24'
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-warning" 
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleEditItem(item)}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MachinesTools;
