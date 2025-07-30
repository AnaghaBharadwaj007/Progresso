// src/App.jsx (Your Current File)
import {
  Link,
  Route,
  BrowserRouter as Router,
  Routes,
  useNavigate,
} from "react-router-dom";

// Import your page components
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import Profile from "./pages/Profile";
import SignIn from "./pages/Signin";
import SignUp from "./pages/Signup";

// Import AuthProvider and ProtectedRoute
import { AuthProvider, useAuth } from "./AuthContext"; // Make sure path is correct
import ProtectedRoute from "./components/ProtectedRoute"; // Make sure path is correct

// AppContent is now a component that uses context, and will be wrapped by AuthProvider
function AppContent() {
  const { user } = useAuth(); // Access user and loading from AuthContext
  const navigate = useNavigate();

  // Handlers for Home/SignIn/SignUp to update internal App state/navigate
  // These are now simplified as AuthContext manages the core login state
  const handleTryNowFromHome = () => {
    if (user) {
      // Check if user exists from context
      navigate("/dashboard");
    } else {
      navigate("/signin");
    }
  };

  // onSignUpClick and onSignInClick just perform navigation
  const handleSignUpClick = () => navigate("/signup");
  const handleSignInClick = () => navigate("/signin");

  // onSignInSuccess will be handled by SignIn.jsx's own logic (it navigates itself)
  // onSignUpSuccess will be handled by SignUp.jsx's own logic (it navigates itself)

  // onLogout will be handled by Navbar/Profile directly calling supabase.auth.signOut()

  return (
    <div className="App">
      {/* Navbar always visible, receives user state from context */}
      <Navbar /> {/* Navbar will use useAuth hook internally */}
      {/* Define your routes */}
      <Routes>
        <Route
          path="/"
          element={<Home handleTryNowClick={handleTryNowFromHome} />}
        />
        {/* SignIn and SignUp pages don't need auth props anymore, they handle their own Supabase calls */}
        <Route
          path="/signin"
          element={<SignIn onSignUpClick={handleSignUpClick} />}
        />
        <Route
          path="/signup"
          element={<SignUp onSignInClick={handleSignInClick} />}
        />

        {/* Protected Routes: Wrap content pages that require login */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/problems"
          element={
            <ProtectedRoute>
              <Problems />
            </ProtectedRoute>
          }
        />
        <Route
          path="/goals"
          element={
            <ProtectedRoute>
              <Goals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col items-center justify-center text-3xl">
              <h2>404 | Page Not Found</h2>
              <p className="text-xl mt-4">
                The page you are looking for does not exist.
              </p>
              <Link
                to="/"
                className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
              >
                Go to Homepage
              </Link>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

// AppWrapper now just ensures BrowserRouter and AuthProvider wrap the main AppContent
function AppWrapper() {
  return (
    <Router>
      <AuthProvider>
        <AppContent /> {/* AppContent now renders within AuthProvider */}
      </AuthProvider>
    </Router>
  );
}

export default AppWrapper;
