import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Package,
  Truck,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Building2,
  Calendar
} from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const ToolsMachines = () => {
  const [toolsMachines, setToolsMachines] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSite, setFilterSite] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    category: '',
    brand: '',
    model: '',
    serialNumber: '',
    quantity: '',
    unit: '',
    status: 'available',
    siteId: '',
    purchaseDate: '',
    purchasePrice: '',
    supplier: '',
    warrantyPeriod: '',
    warrantyExpiry: '',
    maintenanceDate: '',
    nextMaintenanceDate: '',
    condition: 'good',
    location: '',
    assignedTo: '',
    notes: '',
    specifications: '',
    operatingInstructions: ''
  });

  const itemTypes = [
    'machine',
    'tool',
    'equipment',
    'vehicle',
    'generator',
    'compressor',
    'welding-machine',
    'drill',
    'saw',
    'other'
  ];

  const itemCategories = [
    'construction',
    'electrical',
    'mechanical',
    'safety',
    'transport',
    'generator',
    'welding',
    'cutting',
    'measuring',
    'other'
  ];

  const statusOptions = [
    'available',
    'in-use',
    'maintenance',
    'repair',
    'damaged',
    'retired',
    'lost',
    'stolen'
  ];

  const conditionOptions = [
    'excellent',
    'good',
    'fair',
    'poor',
    'damaged',
    'broken'
  ];

  const units = [
    'pieces',
    'units',
    'sets',
    'pairs',
    'kg',
    'tons',
    'liters',
    'meters',
    'sqft',
    'cubic meters'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch sites
      const sitesSnapshot = await getDocs(collection(db, 'sites'));
      const sitesData = sitesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSites(sitesData);

      // Fetch tools and machines
      const q = query(collection(db, 'toolsMachines'), orderBy('createdAt', 'desc'));
      const toolsSnapshot = await getDocs(q);
      const toolsData = toolsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setToolsMachines(toolsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
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
    
    if (!formData.name || !formData.type || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const itemData = {
        ...formData,
        quantity: parseFloat(formData.quantity) || 1,
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingItem) {
        await updateDoc(doc(db, 'toolsMachines', editingItem.id), itemData);
        toast.success('Tool/Machine updated successfully!');
      } else {
        await addDoc(collection(db, 'toolsMachines'), itemData);
        toast.success('Tool/Machine added successfully!');
      }
      
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving tool/machine:', error);
      toast.error('Failed to save tool/machine');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      category: '',
      brand: '',
      model: '',
      serialNumber: '',
      quantity: '',
      unit: '',
      status: 'available',
      siteId: '',
      purchaseDate: '',
      purchasePrice: '',
      supplier: '',
      warrantyPeriod: '',
      warrantyExpiry: '',
      maintenanceDate: '',
      nextMaintenanceDate: '',
      condition: 'good',
      location: '',
      assignedTo: '',
      notes: '',
      specifications: '',
      operatingInstructions: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      type: item.type || '',
      category: item.category || '',
      brand: item.brand || '',
      model: item.model || '',
      serialNumber: item.serialNumber || '',
      quantity: item.quantity || '',
      unit: item.unit || '',
      status: item.status || 'available',
      siteId: item.siteId || '',
      purchaseDate: item.purchaseDate || '',
      purchasePrice: item.purchasePrice || '',
      supplier: item.supplier || '',
      warrantyPeriod: item.warrantyPeriod || '',
      warrantyExpiry: item.warrantyExpiry || '',
      maintenanceDate: item.maintenanceDate || '',
      nextMaintenanceDate: item.nextMaintenanceDate || '',
      condition: item.condition || 'good',
      location: item.location || '',
      assignedTo: item.assignedTo || '',
      notes: item.notes || '',
      specifications: item.specifications || '',
      operatingInstructions: item.operatingInstructions || ''
    });
    setShowForm(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this tool/machine?')) {
      try {
        await deleteDoc(doc(db, 'toolsMachines', itemId));
        toast.success('Tool/Machine deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting tool/machine:', error);
        toast.error('Failed to delete tool/machine');
      }
    }
  };

  const getFilteredItems = () => {
    let filtered = toolsMachines;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType) {
      filtered = filtered.filter(item => item.type === filterType);
    }

    if (filterStatus) {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    if (filterSite) {
      filtered = filtered.filter(item => item.siteId === filterSite);
    }

    return filtered;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'in-use':
        return <Settings className="text-blue-500" size={16} />;
      case 'maintenance':
        return <Wrench className="text-yellow-500" size={16} />;
      case 'repair':
        return <AlertTriangle className="text-orange-500" size={16} />;
      case 'damaged':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <Package className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-100';
      case 'in-use':
        return 'text-blue-600 bg-blue-100';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100';
      case 'repair':
        return 'text-orange-600 bg-orange-100';
      case 'damaged':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="header">
        <div className="header-title">
          <Wrench />
          Tools & Machines Management
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading" style={{ fontSize: '2rem' }}>⏳</div>
          <p>Loading tools and machines...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <div className="header-title">
          <Wrench />
          Tools & Machines Management
        </div>
        <button 
          className="btn"
          onClick={() => setShowForm(true)}
        >
          <Plus />
          Add Tool/Machine
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Filter />
            Filter Items
          </h3>
        </div>
        
        <div className="grid grid-4">
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
                  color: '#6b7280'
                }} 
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder="Search by name, brand, model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="form-select"
            >
              <option value="">All Types</option>
              {itemTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
            >
              <option value="">All Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Site</label>
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
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Plus />
              {editingItem ? 'Edit Tool/Machine' : 'Add New Tool/Machine'}
            </h3>
            <button 
              className="btn btn-secondary"
              onClick={resetForm}
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
                  placeholder="Enter tool/machine name"
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
                  {itemTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Select category</option>
                  {itemCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter brand name"
                />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter model number"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Serial Number</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter serial number"
                />
              </div>
            </div>

            <div className="grid grid-3">
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter quantity"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select unit</option>
                  {units.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Site</label>
                <select
                  name="siteId"
                  value={formData.siteId}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Select site</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Purchase Price (₹)</label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter purchase price"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Supplier</label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter supplier name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warranty Period</label>
                <input
                  type="text"
                  name="warrantyPeriod"
                  value={formData.warrantyPeriod}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="e.g., 1 year, 6 months"
                />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Warranty Expiry</label>
                <input
                  type="date"
                  name="warrantyExpiry"
                  value={formData.warrantyExpiry}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  {conditionOptions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Last Maintenance Date</label>
                <input
                  type="date"
                  name="maintenanceDate"
                  value={formData.maintenanceDate}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Next Maintenance Date</label>
                <input
                  type="date"
                  name="nextMaintenanceDate"
                  value={formData.nextMaintenanceDate}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned To</label>
              <input
                type="text"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter assigned person name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Specifications</label>
              <textarea
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter technical specifications"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Operating Instructions</label>
              <textarea
                name="operatingInstructions"
                value={formData.operatingInstructions}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter operating instructions"
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Any additional notes"
                rows="2"
              />
            </div>

            <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
              <button type="submit" className="btn btn-success">
                <Plus />
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Items List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Wrench />
            Tools & Machines ({getFilteredItems().length})
          </h3>
        </div>

        {getFilteredItems().length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Wrench size={60} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h3>No tools/machines found</h3>
            <p>Add your first tool or machine to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Brand/Model</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Site</th>
                  <th>Condition</th>
                  <th>Purchase Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredItems().map((item) => {
                  const site = sites.find(s => s.id === item.siteId);
                  
                  return (
                    <tr key={item.id}>
                      <td>
                        <div>
                          <strong>{item.name}</strong>
                          {item.serialNumber && (
                            <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                              SN: {item.serialNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{item.type}</td>
                      <td>
                        {item.brand && item.model ? `${item.brand} ${item.model}` : 
                         item.brand || item.model || 'N/A'}
                      </td>
                      <td>{item.quantity} {item.unit || 'units'}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span style={{ marginLeft: '4px' }}>{item.status}</span>
                        </span>
                      </td>
                      <td>{site?.name || 'Not assigned'}</td>
                      <td>{item.condition}</td>
                      <td>{formatAmount(item.purchasePrice)}</td>
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

export default ToolsMachines;

