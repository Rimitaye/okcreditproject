import React, { useState, useMemo, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Ledger from "./pages/Ledger.jsx";
import AddCustomer from "./pages/AddCustomer.jsx";
import AddTransaction from "./pages/AddTransaction.jsx";
import AddSupplier from "./pages/AddSupplier.jsx";
import CustomerDetail from "./pages/CustomerDetail";
import TransactionDetail from "./pages/TransactionDetail";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import EditTransaction from "./pages/EditTransaction";
import CustomerProfile from "./pages/CustomerProfile";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile.jsx";
import Reports from "./pages/Reports";
import axios from "axios";

export default function App() {
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // App.jsx
useEffect(() => {
  const fetchData = async () => {
    try {
      // 1. Get the Token instead of a raw ID
      const token = localStorage.getItem("token"); 
      
      if (!token) {
        console.warn("⚠️ No Token found. Please log in.");
        return;
      }

      console.log("🔄 Syncing with JWT...");
      
      // 2. Send the token in the Headers
      const res = await axios.get(`http://localhost:5000/api/customers`, {
        headers: {
          Authorization: `Bearer ${token}` 
        }
      });
      
      const allData = Array.isArray(res.data) ? res.data : (res.data.customers || []);
      console.log("✅ Sync Successful. Count:", allData.length);

      setCustomers(allData.filter(item => (item.type || "customer") === "customer"));
      setSuppliers(allData.filter(item => item.type === "supplier"));

    } catch (err) {
      console.error("❌ JWT Sync Error:", err);
      if (err.response?.status === 401) {
        // Optional: Redirect to login if token is expired
        window.location.href = "/login";
      }
    }
  };

  fetchData();
  window.addEventListener("focus", fetchData);
  return () => window.removeEventListener("focus", fetchData);
}, []);

  const allTransactions = useMemo(() => {
    const taggedCustomers = customers.map(c => ({ ...c, type: "customer", balance: Number(c.balance || 0) }));
    const taggedSuppliers = suppliers.map(s => ({ ...s, type: "supplier", balance: Number(s.balance || 0) }));
    return [...taggedCustomers, ...taggedSuppliers];
  }, [customers, suppliers]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/reports" element={<Reports transactions={allTransactions} />} />
      <Route path="/ledger/:id" element={<CustomerDetail />} />
      <Route path="/transaction/:id" element={<TransactionDetail />} />
      <Route path="/transaction/edit/:id" element={<EditTransaction />} />
      <Route path="/customer/:id/profile" element={<CustomerProfile />} />
      <Route path="/edit-profile" element={<EditProfile />} />

      <Route path="/dashboard" element={
    <ProtectedRoute>
      <Dashboard customers={customers} suppliers={suppliers} />
    </ProtectedRoute>
  } />

      {/* ✅ FIX: Single "/" route — protected, with props passed */}
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard customers={customers} suppliers={suppliers} />
        </ProtectedRoute>
      } />

      {/* Protected Routes */}
      <Route path="/add-customer" element={
        <ProtectedRoute>
          <AddCustomer />
        </ProtectedRoute>
      } />
      <Route path="/ledger/:id" element={
        <ProtectedRoute>
          <Ledger />
        </ProtectedRoute>
      } />
      <Route path="/ledger/:id/add" element={
        <ProtectedRoute>
          <AddTransaction />
        </ProtectedRoute>
      } />
      <Route path="/add-supplier" element={
        <ProtectedRoute>
          <AddSupplier />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
