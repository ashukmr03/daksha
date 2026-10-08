import React from "react";
import { Navigate } from "react-router-dom";
import { useBuyer } from "../context/BuyerContext";

export default function ProtectedRoute({ children }) {
  const { buyer } = useBuyer();
  if (!buyer) return <Navigate to="/login" replace />;
  return children;
}
