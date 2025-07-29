// src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from "react";
import supabase from "./supabaseClient"; // Adjust path if needed

// Create the context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores the Supabase user object
  const [loading, setLoading] = useState(true); // True while checking auth state

  useEffect(() => {
    // Function to get initial session and listen for auth changes
    const getSessionAndListen = async () => {
      // Get initial session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting initial session:", sessionError.message);
        setUser(null);
      } else {
        setUser(session?.user || null); // Set user if session exists
      }
      setLoading(false); // Finished initial check

      // Listen for auth state changes
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth event:", event, "Session:", session); // For debugging
          setUser(session?.user || null); // Update user based on event
          setLoading(false); // Reset loading after any auth state change
        }
      );

      // Cleanup function
      return () => {
        authListener.unsubscribe();
      };
    };

    getSessionAndListen();
  }, []); // Run once on mount

  // Provide the user and loading status to children
  const value = {
    user,
    loading,
    // You can add login/logout functions here too, or keep them in pages
    // For now, we'll implement login/logout directly in SignIn/Navbar/Profile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext easily
export const useAuth = () => {
  return useContext(AuthContext);
};
