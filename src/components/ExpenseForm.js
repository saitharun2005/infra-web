import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Plus,
  Package, 
  Home, 
  Wrench, 
  Users, 
  Fuel, 
  DollarSign,
  Building2,
  Calendar,
  CreditCard,
  Percent,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { collection, addDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const ExpenseForm = () => {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [sites, setSites] = useState([]);
  const [machinesTools, setMachinesTools] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [labourStaff, setLabourStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Common attributes
    date: new Date().toISOString().split('T')[0],
    siteId: siteId || '',
    expenseType: '',
    
    // Accommodation & Food
    category: '',
    amount: '',
    paymentMethod: '',
    quantityAccommodation: '',
    description: '',
    notes: '',
    
    // Machines & Tools Rental
    rentalCategory: '',
    machineToolName: '',
    rentalQuantity: '',
    vendorName: '',
    vendorContact: '',
    duration: '',
    durationType: '',
    rentPer: '',
    rentPerType: '',
    totalRent: '',
    transportChargesRental: '',
    maintenanceCharges: '',
    
    // Tool Purchase
    toolName: '',
    quantityPurchased: '',
    pricePerUnit: '',
    totalAmountTool: '',
    brandModel: '',
    vendorSupplier: '',
    vendorContactTool: '',
    warranty: '',
    
    // Wear & Tear
    itemName: '',
    wearQuantity: '',
    wearUnitOfMeasure: '',
    wearUnitPrice: '',
    wearTotalAmount: '',
    wearVendorName: '',
    wearContactNumber: '',
    
    // Labour Account
    labourName: '',
    role: '',
    employeeType: '',
    contactNumber: '',
    attendance: '',
    pricePer: '',
    pricePerType: '',
    totalAmountLabour: '',
    
    // Machine Purchase (Material Purchase)
    materialName: '',
    quantityMaterial: '',
    unitOfMeasure: '',
    ratePerUnit: '',
    supplierName: '',
    supplierContact: '',
    transportChargesMaterial: '',
    
    // Repairs
    itemMachineToolName: '',
    assetType: '',
    problemDescription: '',
    workshopName: '',
    partsReplaced: '',
    sparePartsCost: '',
    labourCharges: '',
    transportChargesRepair: '',
    totalCostRepair: '',
    warrantyRepair: '',
    warrantyStartDate: '',
    warrantyEndDate: '',
    
    // Petrol & Diesel
    fuelCategory: '',
    fuelQuantity: '',
    costPerUnit: '',
    totalCostFuel: '',
    
    // All remaining expenses
    totalAmountRemaining: '',
    supplierVendorName: '',
    supplierVendorContact: ''
  });

  const expenseTypes = [
    { value: 'accommodation-food', label: 'Accommodation & Food', icon: Home },
    { value: 'machines-tools-rental', label: 'Machines and Tools Rental', icon: Wrench },
    { value: 'material-purchase', label: 'Material Purchase', icon: Package },
    { value: 'repairs', label: 'Repairs', icon: Wrench },
    { value: 'percentages', label: 'Percentages', icon: Percent },
    { value: 'tool-purchase', label: 'Tools Purchase', icon: Wrench },
    { value: 'wear-tear', label: 'Wear & Tear Purchase', icon: Wrench },
    { value: 'losses-discarded', label: 'Losses & Discarded Tools', icon: AlertTriangle },
    { value: 'petrol-diesel', label: 'Petrol & Diesel', icon: Fuel },
    { value: 'misc-expenses', label: 'Miscellaneous Expenses', icon: DollarSign },
    { value: 'labour-account', label: 'Labour Account', icon: Users },
    { value: 'staff-account', label: 'Staff Account', icon: UserCheck }
  ];

  const paymentMethods = [
    'Cash',
    'Bank Transfer',
    'Cheque',
    'UPI',
    'Credit Card',
    'Debit Card'
  ];

  const unitOfMeasures = [
    'bags', 'kg', 'tonne', 'litre', 'pieces', 'meter', 'sqft', 'cubic meter'
  ];

  const durationTypes = ['days', 'hours', 'weekly', 'monthly'];
  const rentPerTypes = ['day', 'hour', 'week', 'month'];
  const employeeTypes = ['daily', 'hourly', 'weekly', 'monthly'];

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

      // Fetch machines and tools
      const machinesToolsSnapshot = await getDocs(collection(db, 'machinesTools'));
      const machinesToolsData = machinesToolsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMachinesTools(machinesToolsData);

      // Fetch materials
      const materialsSnapshot = await getDocs(collection(db, 'materials'));
      const materialsData = materialsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMaterials(materialsData);

      // Fetch labour and staff
      const labourStaffSnapshot = await getDocs(collection(db, 'labourStaff'));
      const labourStaffData = labourStaffSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLabourStaff(labourStaffData);

      // Fetch specific site if siteId provided
      if (siteId) {
        const siteDoc = await getDoc(doc(db, 'sites', siteId));
        if (siteDoc.exists()) {
          setSite({ id: siteDoc.id, ...siteDoc.data() });
        }
      }
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

  const calculateTotal = () => {
    const { expenseType } = formData;
    
    switch (expenseType) {
      case 'accommodation-food':
        return parseFloat(formData.amount) || 0;
      
      case 'machines-tools-rental':
        const rentalTotal = (parseFloat(formData.totalRent) || 0) + 
                           (parseFloat(formData.transportChargesRental) || 0) + 
                           (parseFloat(formData.maintenanceCharges) || 0);
        return rentalTotal;
      
      case 'tool-purchase':
        return parseFloat(formData.totalAmount) || 0;
      
      case 'wear-tear':
        return parseFloat(formData.wearTotalAmount) || 0;
      
      case 'labour-account':
        return parseFloat(formData.totalAmountLabour) || 0;
      
      case 'material-purchase':
        const materialTotal = (parseFloat(formData.totalAmountTool) || 0) + 
                             (parseFloat(formData.transportChargesMaterial) || 0);
        return materialTotal;
      
      case 'repairs':
        return parseFloat(formData.totalCostRepair) || 0;
      
      case 'petrol-diesel':
        return parseFloat(formData.totalCostFuel) || 0;
      
      default:
        return parseFloat(formData.totalAmountRemaining) || 0;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.siteId || !formData.expenseType || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    const calculatedTotal = calculateTotal();
    if (calculatedTotal <= 0) {
      toast.error('Total amount must be greater than 0');
      return;
    }

    setSaving(true);
    try {
      const expenseData = {
        ...formData,
        totalAmount: calculatedTotal,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'expenses'), expenseData);
      toast.success('Expense added successfully!');
      
      if (siteId) {
        navigate(`/dashboard/${siteId}`);
      } else {
        navigate('/expenses');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    } finally {
      setSaving(false);
    }
  };

  const renderFormFields = () => {
    const { expenseType } = formData;

    return (
      <div>
        {/* Basic Fields - Always shown */}
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
            <label className="form-label">Site Name *</label>
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
        </div>

        <div className="form-group">
          <label className="form-label">Expense Type *</label>
          <select
            name="expenseType"
            value={formData.expenseType}
            onChange={handleInputChange}
            className="form-select"
            required
          >
            <option value="">Select expense type</option>
            {expenseTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Fields Container - Only shown when expense type is selected */}
        {expenseType && (
          <div style={{ 
            marginTop: '30px', 
            marginBottom: '30px',
            padding: '25px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
            borderRadius: '16px',
            border: '2px solid rgba(99, 102, 241, 0.2)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <h3 style={{ 
              marginBottom: '25px', 
              color: '#1f2937', 
              fontSize: '1.5rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'center',
              justifyContent: 'center'
            }}>
              {expenseTypes.find(t => t.value === expenseType)?.label} Details
            </h3>
            {renderCustomFields()}
          </div>
        )}
      </div>
    );
  };

  const renderCustomFields = () => {
    const { expenseType } = formData;

    switch (expenseType) {
      case 'accommodation-food':
        return (
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
                <option value="food">Food</option>
                <option value="accommodation">Accommodation</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter amount"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select payment method</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                name="quantityAccommodation"
                value={formData.quantityAccommodation}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter quantity"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter description"
                required
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
                rows="3"
              />
            </div>
          </div>
        );

      case 'machines-tools-rental':
        return (
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="rentalCategory"
                value={formData.rentalCategory}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select category</option>
                <option value="machine">Machine</option>
                <option value="tool">Tool</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Machine or Tool Name *</label>
              <select
                name="machineToolName"
                value={formData.machineToolName}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select machine/tool</option>
                {machinesTools.map(item => (
                  <option key={item.id} value={item.name}>
                    {item.name} - {item.type || 'Machine/Tool'}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                name="rentalQuantity"
                value={formData.rentalQuantity}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter quantity"
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vendor/Supplier Name *</label>
              <input
                type="text"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter vendor name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vendor Contact Number</label>
              <input
                type="tel"
                name="vendorContact"
                value={formData.vendorContact}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter contact number"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Duration *</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter duration"
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Duration Type *</label>
              <select
                name="durationType"
                value={formData.durationType}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select duration type</option>
                <option value="days">Days</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="hrly">Hourly</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rent Per *</label>
              <input
                type="number"
                name="rentPer"
                value={formData.rentPer}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter rent per unit"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Rent Per Type *</label>
              <select
                name="rentPerType"
                value={formData.rentPerType}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select rent per type</option>
                <option value="hrly">Hourly</option>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Total Rent (₹) *</label>
              <input
                type="number"
                name="totalRent"
                value={formData.totalRent}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter total rent"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Transport Charges (₹)</label>
              <input
                type="number"
                name="transportCharges"
                value={formData.transportCharges}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter transport charges"
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Maintenance/Damage Charges (₹)</label>
              <input
                type="number"
                name="maintenanceCharges"
                value={formData.maintenanceCharges}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter maintenance charges"
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select payment method</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Any additional notes"
                rows="3"
              />
            </div>
          </div>
        );

      case 'tool-purchase':
        return (
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Tool Name *</label>
              <select
                name="toolName"
                value={formData.toolName}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select tool</option>
                {machinesTools.filter(item => item.type === 'tool' || item.category === 'tool').map(item => (
                  <option key={item.id} value={item.name}>
                    {item.name} - {item.brand || 'Tool'}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity Purchased *</label>
              <input
                type="number"
                name="quantityPurchased"
                value={formData.quantityPurchased}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter quantity"
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price Per Unit (₹) *</label>
              <input
                type="number"
                name="pricePerUnit"
                value={formData.pricePerUnit}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter unit price"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Amount (₹) *</label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter total amount"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Brand Model</label>
              <input
                type="text"
                name="brandModel"
                value={formData.brandModel}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter brand/model"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vendor/Supplier Name *</label>
              <input
                type="text"
                name="vendorSupplier"
                value={formData.vendorSupplier}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter vendor name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vendor Contact Number</label>
              <input
                type="tel"
                name="vendorContactTool"
                value={formData.vendorContactTool}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter contact number"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select payment method</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Warranty *</label>
              <select
                name="warranty"
                value={formData.warranty}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select warranty</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
        );

      case 'wear-tear':
        return (
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter item name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                name="wearQuantity"
                value={formData.wearQuantity}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter quantity"
                min="1"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measure *</label>
              <select
                name="wearUnitOfMeasure"
                value={formData.wearUnitOfMeasure}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select unit</option>
                {unitOfMeasures.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unit Price (₹) *</label>
              <input
                type="number"
                name="wearUnitPrice"
                value={formData.wearUnitPrice}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter unit price"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Amount (₹) *</label>
              <input
                type="number"
                name="wearTotalAmount"
                value={formData.wearTotalAmount}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter total amount"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vendor Name *</label>
              <input
                type="text"
                name="wearVendorName"
                value={formData.wearVendorName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter vendor name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vendor Contact Number</label>
              <input
                type="tel"
                name="wearContactNumber"
                value={formData.wearContactNumber}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter contact number"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select payment method</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'labour-account':
        return (
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Labour Name *</label>
              <select
                name="labourName"
                value={formData.labourName}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select labour/staff</option>
                {labourStaff.map(person => (
                  <option key={person.id} value={person.name}>
                    {person.name} - {person.role || person.designation || 'Staff'}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Role *</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter role"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Employee Type *</label>
              <select
                name="employeeType"
                value={formData.employeeType}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select employee type</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
                <option value="hrly">Hourly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter contact number"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Attendance *</label>
              <input
                type="number"
                name="attendance"
                value={formData.attendance}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter attendance"
                min="0"
                step="0.1"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price Per *</label>
              <input
                type="number"
                name="pricePer"
                value={formData.pricePer}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter price per unit"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price Per Type *</label>
              <select
                name="pricePerType"
                value={formData.pricePerType}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select price per type</option>
                <option value="weekly">Weekly</option>
                <option value="hrly">Hourly</option>
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Total Amount (₹) *</label>
              <input
                type="number"
                name="totalAmountLabour"
                value={formData.totalAmountLabour}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter total amount"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
        );

      case 'staff-account':
        return (
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Staff Name *</label>
              <select
                name="labourName"
                value={formData.labourName}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select staff member</option>
                {labourStaff.filter(person => person.type === 'staff' || person.category === 'staff').map(person => (
                  <option key={person.id} value={person.name}>
                    {person.name} - {person.role || person.designation || 'Staff'}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Role *</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter role"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Employee Type *</label>
              <select
                name="employeeType"
                value={formData.employeeType}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select employee type</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
                <option value="hrly">Hourly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number</label>
              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter contact number"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Attendance *</label>
              <input
                type="number"
                name="attendance"
                value={formData.attendance}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter attendance"
                min="0"
                step="0.1"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price Per *</label>
              <input
                type="number"
                name="pricePer"
                value={formData.pricePer}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter price per unit"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price Per Type *</label>
              <select
                name="pricePerType"
                value={formData.pricePerType}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select price per type</option>
                <option value="weekly">Weekly</option>
                <option value="hrly">Hourly</option>
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Total Amount (₹) *</label>
              <input
                type="number"
                name="totalAmountLabour"
                value={formData.totalAmountLabour}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter total amount"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>
        );

      case 'material-purchase':
        return (
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Material Name *</label>
              <select
                name="materialName"
                value={formData.materialName}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select material</option>
                {materials.map(material => (
                  <option key={material.id} value={material.name}>
                    {material.name} - {material.category || 'Material'}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                name="quantityMaterial"
                value={formData.quantityMaterial}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter quantity"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit of Measure *</label>
              <select
                name="unitOfMeasure"
                value={formData.unitOfMeasure}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select unit</option>
                <option value="bags">Bags</option>
                <option value="pieces">Pieces</option>
                <option value="kg">Kg</option>
                <option value="metre">Metre</option>
                <option value="tonne">Tonne</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Rate Per Unit (₹) *</label>
              <input
                type="number"
                name="ratePerUnit"
                value={formData.ratePerUnit}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter rate per unit"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Amount (₹) *</label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter total amount"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Supplier Name *</label>
              <input
                type="text"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter supplier name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Supplier Contact Number</label>
              <input
                type="tel"
                name="supplierContact"
                value={formData.supplierContact}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter contact number"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select payment method</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Transport Charges (₹)</label>
              <input
                type="number"
                name="transportCharges"
                value={formData.transportCharges}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter transport charges"
                step="0.01"
                min="0"
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
                rows="3"
              />
            </div>
          </div>
        );

      case 'repairs':
        return (
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Item/Machine/Tool Name *</label>
              <input
                type="text"
                name="itemMachineToolName"
                value={formData.itemMachineToolName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter item/machine/tool name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Asset Type *</label>
              <select
                name="assetType"
                value={formData.assetType}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select asset type</option>
                <option value="machine">Machine</option>
                <option value="tool">Tool</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Problem Description *</label>
              <textarea
                name="problemDescription"
                value={formData.problemDescription}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter problem description"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Workshop Name *</label>
              <input
                type="text"
                name="workshopName"
                value={formData.workshopName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter workshop name"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Parts Replaced</label>
              <textarea
                name="partsReplaced"
                value={formData.partsReplaced}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter parts replaced"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Spare Parts Cost (₹)</label>
              <input
                type="number"
                name="sparePartsCost"
                value={formData.sparePartsCost}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter spare parts cost"
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Labour Charges (₹)</label>
              <input
                type="number"
                name="labourCharges"
                value={formData.labourCharges}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter labour charges"
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Transport Charges (₹)</label>
              <input
                type="number"
                name="transportChargesRepair"
                value={formData.transportChargesRepair}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter transport charges"
                step="0.01"
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Cost (₹) *</label>
              <input
                type="number"
                name="totalCost"
                value={formData.totalCost}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter total cost"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select payment method</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Warranty *</label>
              <select
                name="warrantyRepair"
                value={formData.warrantyRepair}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select warranty</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>
            {formData.warrantyRepair === 'yes' && (
              <>
                <div className="form-group">
                  <label className="form-label">Warranty Start Date *</label>
              <input
                    type="date"
                    name="warrantyStartDate"
                    value={formData.warrantyStartDate}
                    onChange={handleInputChange}
                className="form-input"
                    required
              />
            </div>
                <div className="form-group">
                  <label className="form-label">Warranty End Date *</label>
                  <input
                    type="date"
                    name="warrantyEndDate"
                    value={formData.warrantyEndDate}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </>
            )}
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Any additional notes"
                rows="3"
              />
            </div>
          </div>
        );

      case 'petrol-diesel':
        return (
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="fuelCategory"
                value={formData.fuelCategory}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select category</option>
                <option value="diesel">Diesel</option>
                <option value="petrol">Petrol</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="number"
                name="fuelQuantity"
                value={formData.fuelQuantity}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter quantity"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cost Per Unit (₹) *</label>
              <input
                type="number"
                name="costPerUnit"
                value={formData.costPerUnit}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter cost per unit"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Total Cost (₹) *</label>
              <input
                type="number"
                name="totalCost"
                value={formData.totalCost}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter total cost"
                step="0.01"
                min="0"
                required
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
                rows="3"
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Total Amount (₹) *</label>
              <input
                type="number"
                name="totalAmountRemaining"
                value={formData.totalAmountRemaining}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter total amount"
                step="0.01"
                min="0"
                required
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
                rows="3"
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
            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="form-select"
                required
              >
                <option value="">Select payment method</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Supplier/Vendor Name</label>
              <input
                type="text"
                name="supplierVendorName"
                value={formData.supplierVendorName}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter supplier/vendor name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Supplier/Vendor Contact Number</label>
              <input
                type="tel"
                name="supplierVendorContact"
                value={formData.supplierVendorContact}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter contact number"
              />
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="loading" style={{ fontSize: '2rem' }}>⏳</div>
            <p>Loading...</p>
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
            onClick={() => navigate(siteId ? `/dashboard/${siteId}` : '/expenses')}
          >
            <ArrowLeft className="icon-animation" />
            Back
          </button>
          <h1 className="card-title">
            <Plus className="icon-animation" />
            Add New Expense
          </h1>
        </div>

        {site && (
          <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
            <h3>Site: {site.name}</h3>
            {site.location && <p>Location: {site.location}</p>}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {renderFormFields()}

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={saving}
            >
              <Save className="icon-animation" />
              {saving ? 'Saving...' : 'Save Expense'}
            </button>
            
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate(siteId ? `/dashboard/${siteId}` : '/expenses')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;