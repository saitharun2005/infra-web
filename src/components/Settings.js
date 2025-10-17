import React from 'react';
import { Settings as SettingsIcon, Database, User, Shield, Bell, Palette } from 'lucide-react';

const Settings = () => {
  return (
    <div>
      <div className="header">
        <div className="header-title">
          <SettingsIcon />
          Settings
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <User />
              User Settings
            </h3>
          </div>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              className="form-input"
              defaultValue="B&G Infrastructures"
              placeholder="Enter company name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Person</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter contact person name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="Enter email address"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              className="form-input"
              placeholder="Enter phone number"
            />
          </div>
          <button className="btn btn-success">Save Changes</button>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Database />
              Data Management
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button className="btn btn-secondary">Export Data</button>
            <button className="btn btn-secondary">Import Data</button>
            <button className="btn btn-warning">Backup Database</button>
            <button className="btn btn-danger">Clear All Data</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Shield />
              Security
            </h3>
          </div>
          <div className="form-group">
            <label className="form-label">Change Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter new password"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Confirm new password"
            />
          </div>
          <button className="btn btn-success">Update Password</button>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Bell />
              Notifications
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" defaultChecked />
              Email notifications
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" defaultChecked />
              SMS notifications
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" />
              Push notifications
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="checkbox" defaultChecked />
              Maintenance reminders
            </label>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Palette />
              Theme Settings
            </h3>
          </div>
          <div className="form-group">
            <label className="form-label">Theme</label>
            <select className="form-select">
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Primary Color</label>
            <input
              type="color"
              className="form-input"
              defaultValue="#3498db"
              style={{ height: '40px' }}
            />
          </div>
          <button className="btn btn-success">Apply Theme</button>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <SettingsIcon />
              System Information
            </h3>
          </div>
          <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Database:</strong> Firebase Firestore</p>
            <p><strong>Framework:</strong> React 18</p>
            <p><strong>Build:</strong> Production</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
