import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const getAuthToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("authToken");
};

const ProtectedRoute = () => {
  const token = getAuthToken();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;