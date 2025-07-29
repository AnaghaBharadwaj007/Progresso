import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Goals from "./pages/Goals";
import Home from "./pages/Home";
import Problems from "./pages/Problems";
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/problems" element={<Problems />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/profile" element={<Profile />} />

        {/* Fallback route for any unknown paths */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col items-center justify-center text-3xl">
              <h2>404 | Page Not Found</h2>
              <p className="text-xl mt-4">
                The page you are looking for does not exist.
              </p>
              <Link
                to="/" // Link back to home
                className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
              >
                Go to Homepage
              </Link>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
