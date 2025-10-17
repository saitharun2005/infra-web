import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Zap, Wrench } from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const predefinedMaterials = [
    { name: 'Concrete Pole' },
    { name: 'Steel Pole' },
    { name: 'Copper Wire' },
    { name: 'Aluminum Wire' },
    { name: 'Insulator' },
    { name: 'Transformer Oil' },
    { name: 'Concrete Mix' },
    { name: 'Steel Reinforcement' },
    { name: 'Cable Tray' },
    { name: 'Earthing Rod' },
    { name: 'Cable Gland' },
    { name: 'Junction Box' }
  ];

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const materialsSnapshot = await getDocs(collection(db, 'materials'));
      const materialsData = materialsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMaterials(materialsData);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast.error('Failed to fetch materials');
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
      toast.error('Material name is required');
      return;
    }

    try {
      if (editingMaterialId) {
        // Update existing material
        await updateDoc(doc(db, 'materials', editingMaterialId), {
          ...formData,
          updatedAt: new Date()
        });
        toast.success('Material updated successfully!');
      } else {
        // Add new material
        await addDoc(collection(db, 'materials'), {
          ...formData,
          isActive: true,
          createdAt: new Date()
        });
        toast.success('Material added successfully!');
      }
      
      setFormData({
        name: '',
        description: ''
      });
      setEditingMaterialId(null);
      setShowForm(false);
      fetchMaterials();
    } catch (error) {
      console.error('Error saving material:', error);
      toast.error(`Failed to ${editingMaterialId ? 'update' : 'add'} material`);
    }
  };

  const handleEditMaterial = (material) => {
    setEditingMaterialId(material.id);
    setFormData({
      name: material.name || '',
      description: material.description || ''
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingMaterialId(null);
    setFormData({
      name: '',
      description: ''
    });
    setShowForm(false);
  };

  const handleDeleteMaterial = async (materialId) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        await deleteDoc(doc(db, 'materials', materialId));
        toast.success('Material deleted successfully');
        fetchMaterials();
      } catch (error) {
        console.error('Error deleting material:', error);
        toast.error('Failed to delete material');
      }
    }
  };

  const addPredefinedMaterials = async () => {
    try {
      for (const material of predefinedMaterials) {
        await addDoc(collection(db, 'materials'), {
          ...material,
          isActive: true,
          createdAt: new Date()
        });
      }
      // No toast message - silent addition
    } catch (error) {
      console.error('Error adding predefined materials:', error);
      toast.error('Failed to add predefined materials');
    }
  };

  if (loading) {
    return (
      <div className="header">
        <div className="header-title">
          <Package />
          Materials
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading" style={{ fontSize: '2rem' }}>⏳</div>
          <p>Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <div className="header-title">
          <Package />
          Materials Management
        </div>
        <button 
          className="btn"
          onClick={() => setShowForm(true)}
        >
          <Plus />
          Add New Material
        </button>
      </div>

      {showForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Plus />
              {editingMaterialId ? 'Edit Material' : 'Add New Material'}
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
              <label className="form-label">Material Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter material name"
                required
              />
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
                {editingMaterialId ? 'Update Material' : 'Add Material'}
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
            <Package />
            All Materials
          </h3>
        </div>

        {materials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Package size={60} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h3>No materials found</h3>
            <p>Add predefined materials or create your own</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr key={material.id}>
                    <td>
                      <div>
                        <strong>{material.name}</strong>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-warning" 
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleEditMaterial(material)}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleDeleteMaterial(material.id)}
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

export default Materials;
