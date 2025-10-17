import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, UserCheck, Phone, Mail } from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const LabourStaff = () => {
  const [labourStaff, setLabourStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    designation: '',
    address: '',
    notes: ''
  });

  const predefinedStaff = [
    { name: 'Rajesh Kumar', type: 'staff', designation: 'Site Engineer' },
    { name: 'Suresh Singh', type: 'labour', designation: 'Electrician' },
    { name: 'Amit Sharma', type: 'staff', designation: 'Safety Officer' },
    { name: 'Vikram Patel', type: 'labour', designation: 'Crane Operator' },
    { name: 'Deepak Yadav', type: 'labour', designation: 'Welder' },
    { name: 'Manoj Gupta', type: 'staff', designation: 'Foreman' },
    { name: 'Ravi Kumar', type: 'labour', designation: 'Helper' },
    { name: 'Sunil Verma', type: 'labour', designation: 'Driver' },
    { name: 'Anil Singh', type: 'staff', designation: 'Quality Inspector' },
    { name: 'Pradeep Kumar', type: 'labour', designation: 'Excavator Operator' }
  ];

  useEffect(() => {
    fetchLabourStaff();
  }, []);

  const fetchLabourStaff = async () => {
    try {
      const staffSnapshot = await getDocs(collection(db, 'labourStaff'));
      const staffData = staffSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLabourStaff(staffData);
    } catch (error) {
      console.error('Error fetching labour and staff:', error);
      toast.error('Failed to fetch labour and staff');
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
      if (editingStaffId) {
        // Update existing staff
        await updateDoc(doc(db, 'labourStaff', editingStaffId), {
          ...formData,
          updatedAt: new Date()
        });
        toast.success('Staff member updated successfully!');
      } else {
        // Add new staff
        await addDoc(collection(db, 'labourStaff'), {
          ...formData,
          createdAt: new Date()
        });
        toast.success('Labour/Staff added successfully!');
      }
      
      setFormData({
        name: '',
        type: '',
        designation: '',
        address: '',
        notes: ''
      });
      setEditingStaffId(null);
      setShowForm(false);
      fetchLabourStaff();
    } catch (error) {
      console.error('Error saving staff:', error);
      toast.error(`Failed to ${editingStaffId ? 'update' : 'add'} staff member`);
    }
  };

  const handleEditStaff = (staff) => {
    setEditingStaffId(staff.id);
    setFormData({
      name: staff.name || '',
      type: staff.type || '',
      designation: staff.designation || '',
      address: staff.address || '',
      notes: staff.notes || ''
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingStaffId(null);
    setFormData({
      name: '',
      type: '',
      designation: '',
      address: '',
      notes: ''
    });
    setShowForm(false);
  };

  const handleDeleteStaff = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteDoc(doc(db, 'labourStaff', staffId));
        toast.success('Staff member deleted successfully');
        fetchLabourStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
        toast.error('Failed to delete staff member');
      }
    }
  };

  const addPredefinedStaff = async () => {
    try {
      for (const staff of predefinedStaff) {
        await addDoc(collection(db, 'labourStaff'), {
          ...staff,
          status: 'active',
          createdAt: new Date()
        });
      }
      // No toast message - silent addition
    } catch (error) {
      console.error('Error adding predefined staff:', error);
      toast.error('Failed to add predefined staff');
    }
  };

  if (loading) {
    return (
      <div className="header">
        <div className="header-title">
          <Users />
          Labour & Staff
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading" style={{ fontSize: '2rem' }}>⏳</div>
          <p>Loading labour and staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <div className="header-title">
          <Users />
          Labour & Staff Management
        </div>
        <button 
          className="btn"
          onClick={() => setShowForm(true)}
        >
          <Plus />
          Add New Staff
        </button>
      </div>

      {showForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Plus />
              {editingStaffId ? 'Edit Staff/Labour' : 'Add New Labour/Staff'}
            </h3>
            <button 
              className="btn btn-secondary"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter full name"
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
                <option value="staff">Staff</option>
                <option value="labour">Labour</option>
                <option value="contractor">Contractor</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter designation"
              />
            </div>







            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter address"
                rows="2"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter any additional notes"
                rows="3"
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-success">
                <Plus />
                {editingStaffId ? 'Update Staff/Labour' : 'Add Staff'}
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
            <Users />
            All Labour & Staff
          </h3>
        </div>

        {labourStaff.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Users size={60} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h3>No staff members found</h3>
            <p>Add predefined staff or create your own</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Designation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {labourStaff.map((staff) => (
                  <tr key={staff.id}>
                    <td>
                      <div>
                        <strong>{staff.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        background: staff.type === 'staff' ? '#d1ecf1' : 
                                   staff.type === 'labour' ? '#d4edda' : '#fff3cd',
                        color: staff.type === 'staff' ? '#0c5460' : 
                               staff.type === 'labour' ? '#155724' : '#856404'
                      }}>
                        {staff.type}
                      </span>
                    </td>
                    <td>{staff.designation || 'Not specified'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-warning" 
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleEditStaff(staff)}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleDeleteStaff(staff.id)}
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

export default LabourStaff;
