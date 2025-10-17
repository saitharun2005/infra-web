import React, { useState, useEffect } from 'react';
import { Building2, Plus, MapPin, Edit, Trash2 } from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const Sites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'active'
  });

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const sitesSnapshot = await getDocs(collection(db, 'sites'));
      const sitesData = sitesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSites(sitesData);
    } catch (error) {
      console.error('Error fetching sites:', error);
      toast.error('Failed to fetch sites');
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
      toast.error('Site name is required');
      return;
    }

    try {
      if (editingSite) {
        // Update existing site
        await updateDoc(doc(db, 'sites', editingSite.id), {
          ...formData,
          updatedAt: new Date()
        });
        toast.success('Site updated successfully!');
      } else {
        // Add new site
        await addDoc(collection(db, 'sites'), {
          ...formData,
          createdAt: new Date(),
          totalExpenses: 0
        });
        toast.success('Site added successfully!');
      }
      
      setFormData({
        name: '',
        location: '',
        description: '',
        startDate: '',
        endDate: '',
        status: 'active'
      });
      setEditingSite(null);
      setShowForm(false);
      fetchSites();
    } catch (error) {
      console.error('Error saving site:', error);
      toast.error(`Failed to ${editingSite ? 'update' : 'add'} site`);
    }
  };

  const handleEditSite = (site) => {
    setEditingSite(site);
    setFormData({
      name: site.name || '',
      location: site.location || '',
      description: site.description || '',
      startDate: site.startDate || '',
      endDate: site.endDate || '',
      status: site.status || 'active'
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingSite(null);
    setFormData({
      name: '',
      location: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'active'
    });
    setShowForm(false);
  };

  const handleDeleteSite = async (siteId) => {
    if (window.confirm('Are you sure you want to delete this site?')) {
      try {
        await deleteDoc(doc(db, 'sites', siteId));
        toast.success('Site deleted successfully');
        fetchSites();
      } catch (error) {
        console.error('Error deleting site:', error);
        toast.error('Failed to delete site');
      }
    }
  };

  if (loading) {
    return (
      <div className="header">
        <div className="header-title">
          <Building2 />
          Sites
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading" style={{ fontSize: '2rem' }}>⏳</div>
          <p>Loading sites...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <div className="header-title">
          <Building2 />
          Sites Management
        </div>
        <button 
          className="btn"
          onClick={() => setShowForm(true)}
        >
          <Plus />
          Add New Site
        </button>
      </div>

      {showForm && (
        <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Plus />
            {editingSite ? 'Edit Site' : 'Add New Site'}
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
                <label className="form-label">Site Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter site name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter site location"
                />
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
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Start Date (Optional)</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date (Optional)</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter site description"
                rows="3"
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-success">
                <Plus />
                {editingSite ? 'Update Site' : 'Add Site'}
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
            <Building2 />
            All Sites
          </h3>
        </div>

        {sites.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Building2 size={60} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h3>No sites found</h3>
            <p>Add your first site to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                  <tr>
                    <th>Site Name</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Actions</th>
                  </tr>
              </thead>
              <tbody>
                {sites.map((site) => (
                  <tr key={site.id}>
                    <td>
                      <div>
                        <strong>{site.name}</strong>
                        {site.description && (
                          <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                            {site.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <MapPin size={14} />
                        {site.location || 'Not specified'}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '500',
                        background: site.status === 'active' ? '#d4edda' : '#f8d7da',
                        color: site.status === 'active' ? '#155724' : '#721c24'
                      }}>
                        {site.status}
                      </span>
                    </td>
                    <td>{site.startDate || 'Not set'}</td>
                    <td>{site.endDate || 'Not set'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-warning" 
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleEditSite(site)}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleDeleteSite(site.id)}
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

export default Sites;
