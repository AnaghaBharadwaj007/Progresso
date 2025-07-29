// src/components/ProtectedRoute.js
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext"; // Adjust path

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not loading and no user is authenticated, redirect to sign-in
    if (!loading && !user) {
      navigate("/signin");
    }
  }, [user, loading, navigate]);

  // While loading or if user is not authenticated (before redirect)
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-800 flex items-center justify-center text-xl">
        Checking authentication...
      </div>
    );
  }

  // If user is authenticated, render the children
  return children;
};

export default ProtectedRoute;
