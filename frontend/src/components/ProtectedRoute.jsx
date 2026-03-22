import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  // 🔍 THE FIX: Check for 'userId' (matching your Login.jsx)
  const userId = localStorage.getItem("userId");

  // If userId is missing, null, or undefined, redirect to login
  if (!userId || userId === "null" || userId === "undefined") {
    console.warn("ProtectedRoute: No valid userId. Redirecting...");
    return <Navigate to="/login" replace />;
  }

  // If everything is okay, show the page (AddCustomer, AddSupplier, etc.)
  return children;
};

export default ProtectedRoute;