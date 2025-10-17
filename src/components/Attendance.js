import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2,
  Building2,
  UserCheck,
  User
} from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [sites, setSites] = useState([]);
  const [labourStaff, setLabourStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filterSite, setFilterSite] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    siteId: '',
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    checkInTime: '',
    checkOutTime: '',
    status: 'present',
    hoursWorked: '',
    overtimeHours: '',
    notes: '',
    workDescription: ''
  });

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

      // Fetch labour and staff
      const labourSnapshot = await getDocs(collection(db, 'labourStaff'));
      const labourData = labourSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLabourStaff(labourData);

      // Fetch attendance records
      const q = query(collection(db, 'attendance'), orderBy('date', 'desc'));
      const attendanceSnapshot = await getDocs(q);
      const attendanceData = attendanceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAttendanceRecords(attendanceData);
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

  const calculateHoursWorked = () => {
    if (formData.checkInTime && formData.checkOutTime) {
      const checkIn = new Date(`2000-01-01T${formData.checkInTime}`);
      const checkOut = new Date(`2000-01-01T${formData.checkOutTime}`);
      const diffMs = checkOut - checkIn;
      const diffHours = diffMs / (1000 * 60 * 60);
      return Math.max(0, diffHours);
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.siteId || !formData.staffId || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const hoursWorked = calculateHoursWorked();
      const attendanceData = {
        ...formData,
        hoursWorked: hoursWorked,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingRecord) {
        await updateDoc(doc(db, 'attendance', editingRecord.id), attendanceData);
        toast.success('Attendance record updated successfully!');
      } else {
        await addDoc(collection(db, 'attendance'), attendanceData);
        toast.success('Attendance record added successfully!');
      }
      
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance record');
    }
  };

  const resetForm = () => {
    setFormData({
      siteId: '',
      staffId: '',
      date: new Date().toISOString().split('T')[0],
      checkInTime: '',
      checkOutTime: '',
      status: 'present',
      hoursWorked: '',
      overtimeHours: '',
      notes: '',
      workDescription: ''
    });
    setEditingRecord(null);
    setShowForm(false);
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setFormData({
      siteId: record.siteId || '',
      staffId: record.staffId || '',
      date: record.date || new Date().toISOString().split('T')[0],
      checkInTime: record.checkInTime || '',
      checkOutTime: record.checkOutTime || '',
      status: record.status || 'present',
      hoursWorked: record.hoursWorked || '',
      overtimeHours: record.overtimeHours || '',
      notes: record.notes || '',
      workDescription: record.workDescription || ''
    });
    setShowForm(true);
  };

  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      try {
        await deleteDoc(doc(db, 'attendance', recordId));
        toast.success('Attendance record deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Error deleting attendance:', error);
        toast.error('Failed to delete attendance record');
      }
    }
  };

  const getFilteredRecords = () => {
    let filtered = attendanceRecords;

    if (filterSite) {
      filtered = filtered.filter(record => record.siteId === filterSite);
    }

    if (filterDate) {
      filtered = filtered.filter(record => record.date === filterDate);
    }

    if (filterStatus) {
      filtered = filtered.filter(record => record.status === filterStatus);
    }

    return filtered;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return timeString;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'absent':
        return <XCircle className="text-red-500" size={20} />;
      case 'late':
        return <Clock className="text-yellow-500" size={20} />;
      default:
        return <Clock className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-100';
      case 'absent':
        return 'text-red-600 bg-red-100';
      case 'late':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="header">
        <div className="header-title">
          <Users />
          Staff & Labour Attendance
        </div>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div className="loading" style={{ fontSize: '2rem' }}>⏳</div>
          <p>Loading attendance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="header">
        <div className="header-title">
          <Users />
          Staff & Labour Attendance Management
        </div>
        <button 
          className="btn"
          onClick={() => setShowForm(true)}
        >
          <Plus />
          Add Attendance Record
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Calendar />
            Filter Records
          </h3>
        </div>
        
        <div className="grid grid-3">
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
            <label className="form-label">Filter by Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-select"
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Form */}
      {showForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Plus />
              {editingRecord ? 'Edit Attendance Record' : 'Add Attendance Record'}
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
                <label className="form-label">Site *</label>
                <select
                  name="siteId"
                  value={formData.siteId}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Select a site</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Staff/Labour *</label>
                <select
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                >
                  <option value="">Select staff/labour</option>
                  {labourStaff.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.type}) - {staff.designation}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
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
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Check-in Time</label>
                <input
                  type="time"
                  name="checkInTime"
                  value={formData.checkInTime}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Check-out Time</label>
                <input
                  type="time"
                  name="checkOutTime"
                  value={formData.checkOutTime}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Hours Worked</label>
                <input
                  type="number"
                  name="hoursWorked"
                  value={calculateHoursWorked()}
                  className="form-input"
                  placeholder="Auto-calculated"
                  step="0.1"
                  min="0"
                  readOnly
                  style={{ backgroundColor: '#f8f9fa' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Overtime Hours</label>
                <input
                  type="number"
                  name="overtimeHours"
                  value={formData.overtimeHours}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter overtime hours"
                  step="0.1"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Work Description</label>
              <textarea
                name="workDescription"
                value={formData.workDescription}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Describe the work performed"
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
                {editingRecord ? 'Update Record' : 'Add Record'}
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

      {/* Attendance Records */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Calendar />
            Attendance Records ({getFilteredRecords().length})
          </h3>
        </div>

        {getFilteredRecords().length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Users size={60} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h3>No attendance records found</h3>
            <p>Add your first attendance record to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Site</th>
                  <th>Staff/Labour</th>
                  <th>Status</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Hours</th>
                  <th>Overtime</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredRecords().map((record) => {
                  const site = sites.find(s => s.id === record.siteId);
                  const staff = labourStaff.find(s => s.id === record.staffId);
                  
                  return (
                    <tr key={record.id}>
                      <td>{formatDate(record.date)}</td>
                      <td>{site?.name || 'Unknown Site'}</td>
                      <td>
                        <div>
                          <strong>{staff?.name || 'Unknown Staff'}</strong>
                          <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                            {staff?.designation} ({staff?.type})
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {getStatusIcon(record.status)}
                          <span style={{ marginLeft: '4px' }}>{record.status}</span>
                        </span>
                      </td>
                      <td>{formatTime(record.checkInTime)}</td>
                      <td>{formatTime(record.checkOutTime)}</td>
                      <td>{record.hoursWorked || 'N/A'} hrs</td>
                      <td>{record.overtimeHours || '0'} hrs</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-warning" 
                            style={{ padding: '6px 12px' }}
                            onClick={() => handleEditRecord(record)}
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '6px 12px' }}
                            onClick={() => handleDeleteRecord(record.id)}
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

export default Attendance;

