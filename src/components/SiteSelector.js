import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, MapPin } from 'lucide-react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const SiteSelector = () => {
  const [sites, setSites] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSite, setNewSite] = useState({ name: '', location: '', description: '' });
  const [loading, setLoading] = useState(true);

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

  const handleAddSite = async (e) => {
    e.preventDefault();
    if (!newSite.name.trim()) {
      toast.error('Site name is required');
      return;
    }

    try {
      await addDoc(collection(db, 'sites'), {
        ...newSite,
        createdAt: new Date(),
        totalExpenses: 0
      });
      
      toast.success('Site added successfully!');
      setNewSite({ name: '', location: '', description: '' });
      setShowAddForm(false);
      fetchSites();
    } catch (error) {
      console.error('Error adding site:', error);
      toast.error('Failed to add site');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading" style={{ fontSize: '2rem' }}>⏳</div>
            <p>Loading sites...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">
            <MapPin className="icon-animation" />
            Select Site
          </h1>
          <button 
            className="btn"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="icon-animation" />
            Add New Site
          </button>
        </div>

        {showAddForm && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>Add New Site</h3>
            <form onSubmit={handleAddSite}>
              <div className="form-group">
                <label className="form-label">Site Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={newSite.name}
                  onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                  placeholder="Enter site name"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  className="form-input"
                  value={newSite.location}
                  onChange={(e) => setNewSite({ ...newSite, location: e.target.value })}
                  placeholder="Enter site location"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={newSite.description}
                  onChange={(e) => setNewSite({ ...newSite, description: e.target.value })}
                  placeholder="Enter site description"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-success">
                  <Plus className="icon-animation" />
                  Add Site
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="site-grid">
          {sites.map((site) => (
            <Link key={site.id} to={`/dashboard/${site.id}`} className="site-card">
              <div className="site-icon icon-animation">
                <Building2 size={30} />
              </div>
              <h3 className="site-name">{site.name}</h3>
              <p className="site-description">
                {site.location && `${site.location} • `}
                {site.description || 'Infrastructure project site'}
              </p>
            </Link>
          ))}
          
          {sites.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <Building2 size={60} className="icon-animation" style={{ marginBottom: '20px', opacity: 0.5 }} />
              <h3>No sites found</h3>
              <p>Add your first site to start tracking expenses</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteSelector;

