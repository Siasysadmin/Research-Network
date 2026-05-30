import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const getAuthToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("authToken");
};

const PublicRoute = () => {
  const token = getAuthToken();

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;