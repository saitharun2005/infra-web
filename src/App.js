import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Sites from './components/Sites';
import ExpenseTypes from './components/ExpenseTypes';
import Expenses from './components/Expenses';
import ExpenseForm from './components/ExpenseForm';
import MachinesTools from './components/MachinesTools';
import Materials from './components/Materials';
import LabourStaff from './components/LabourStaff';
import Attendance from './components/Attendance';
import ToolsMachines from './components/ToolsMachines';
import Settings from './components/Settings';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sites" element={<Sites />} />
            <Route path="/expense-types" element={<ExpenseTypes />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/add-expense/:siteId" element={<ExpenseForm />} />
            <Route path="/add-expense" element={<ExpenseForm />} />
            <Route path="/machines-tools" element={<MachinesTools />} />
            <Route path="/materials" element={<Materials />} />
            <Route path="/labour-staff" element={<LabourStaff />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/tools-machines" element={<ToolsMachines />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;
