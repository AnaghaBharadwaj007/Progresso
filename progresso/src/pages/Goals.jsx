import { useEffect, useState } from "react";
import {
  FaBullseye,
  FaCalendarAlt,
  FaCalendarWeek,
  FaSave,
  FaSpinner,
} from "react-icons/fa";

import { useAuth } from "../AuthContext.jsx"; // Make sure this path is correct
import supabase from "../supabaseClient"; // Make sure this path is correct

export default function Goals() {
  const { user, loading: authLoading } = useAuth(); // Get user and auth loading state

  const [weeklyGoal, setWeeklyGoal] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState("");

  const [currentGoals, setCurrentGoals] = useState({
    weekly: 0, // Default to 0 problems if no goals set yet
    monthly: 0,
    lastUpdated: "N/A",
  });

  const [message, setMessage] = useState(null); // { type: 'success'|'error'|'info', text: 'message' }
  const [loading, setLoading] = useState(true); // For component-specific loading (fetching/saving)

  // Effect to fetch current goals from Supabase
  useEffect(() => {
    const fetchCurrentGoals = async () => {
      // Don't fetch if authentication state is still loading, or if no user is found
      if (authLoading || !user) {
        setLoading(false); // Stop loading if no user or still authenticating
        // Set default 0 goals if not logged in or no user
        setCurrentGoals({ weekly: 0, monthly: 0, lastUpdated: "N/A" });
        return;
      }

      setLoading(true); // Start loading for goal fetch
      setMessage(null); // Clear any previous messages

      try {
        const { data, error } = await supabase
          .from("user_goals")
          .select("weekly_goal, monthly_goal, updated_at")
          .eq("user_id", user.id)
          .single(); // Use .single() as there should be only one goal entry per user

        if (error && error.code !== "PGRST116") {
          // PGRST116 is 'no rows found', which is expected for new users
          throw new Error(error.message);
        }

        if (data) {
          setCurrentGoals({
            weekly: data.weekly_goal,
            monthly: data.monthly_goal,
            lastUpdated: new Date(data.updated_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
          });
        } else {
          // No existing goals found, initialize with 0
          setCurrentGoals({ weekly: 0, monthly: 0, lastUpdated: "N/A" });
        }
      } catch (err) {
        console.error("Error fetching current goals:", err);
        setMessage({
          type: "error",
          text: `Failed to load current goals: ${err.message}`,
        });
        setCurrentGoals({ weekly: 0, monthly: 0, lastUpdated: "N/A" }); // Fallback
      } finally {
        setLoading(false); // Stop loading after fetch
      }
    };

    fetchCurrentGoals();
  }, [user, authLoading]); // Re-fetch when user or authLoading state changes

  const handleSaveGoals = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading for save operation
    setMessage(null); // Clear previous messages

    if (!user) {
      setMessage({
        type: "error",
        text: "You must be logged in to save goals.",
      });
      setLoading(false);
      return;
    }

    // Basic validation
    const newWeekly = parseInt(weeklyGoal, 10);
    const newMonthly = parseInt(monthlyGoal, 10);

    if (
      isNaN(newWeekly) ||
      isNaN(newMonthly) ||
      newWeekly <= 0 ||
      newMonthly <= 0
    ) {
      setMessage({
        type: "error",
        text: "Please enter valid positive numbers for both goals.",
      });
      setLoading(false);
      return;
    }

    try {
      // Use upsert to either insert new goals or update existing ones for the user
      const { data, error } = await supabase
        .from("user_goals")
        .upsert(
          {
            user_id: user.id, // Link to current user
            weekly_goal: newWeekly,
            monthly_goal: newMonthly,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" } // Use user_id as conflict target to update existing row
        )
        .select() // Select the data back to update local state
        .single(); // Expecting a single row back

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        setCurrentGoals({
          weekly: data.weekly_goal,
          monthly: data.monthly_goal,
          lastUpdated: new Date(data.updated_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        });
        setWeeklyGoal(""); // Clear input fields after saving
        setMonthlyGoal("");
        setMessage({ type: "success", text: "Goals saved successfully!" });
      }
    } catch (err) {
      console.error("Error saving goals:", err);
      setMessage({
        type: "error",
        text: `Failed to save goals: ${err.message}`,
      });
    } finally {
      setLoading(false); // Stop loading after save
      setTimeout(() => setMessage(null), 3000); // Clear message after some time
    }
  };

  return (
    <div className="flex-grow p-8 bg-gray-100 overflow-auto">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-8 flex items-center justify-center gap-3">
          <FaBullseye className="text-blue-600" /> Set Your Coding Goals
        </h1>

        {/* Current Goals Display */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Your Current Goals
          </h2>
          {loading &&
          currentGoals.weekly === 0 &&
          currentGoals.monthly === 0 ? (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <FaSpinner className="animate-spin" /> Loading current goals...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-white rounded-md shadow-sm border border-gray-100">
                <p className="text-gray-600 text-sm">Weekly Goal</p>
                <p className="text-2xl font-bold text-blue-600">
                  {currentGoals.weekly} Problems
                </p>
              </div>
              <div className="p-4 bg-white rounded-md shadow-sm border border-gray-100">
                <p className="text-gray-600 text-sm">Monthly Goal</p>
                <p className="text-2xl font-bold text-blue-600">
                  {currentGoals.monthly} Problems
                </p>
              </div>
            </div>
          )}
          <p className="text-gray-500 text-xs mt-4 text-right">
            Last Updated: {currentGoals.lastUpdated}
          </p>
        </div>

        <form onSubmit={handleSaveGoals}>
          <div className="mb-6">
            <label
              htmlFor="weeklyGoal"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              <FaCalendarWeek className="inline-block mr-2 text-blue-500" />{" "}
              Weekly Problem Goal
            </label>
            <input
              type="number"
              id="weeklyGoal"
              name="weeklyGoal"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="e.g., 10"
              value={weeklyGoal}
              onChange={(e) => setWeeklyGoal(e.target.value)}
              min="1"
              required
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="monthlyGoal"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              <FaCalendarAlt className="inline-block mr-2 text-blue-500" />{" "}
              Monthly Problem Goal
            </label>
            <input
              type="number"
              id="monthlyGoal"
              name="monthlyGoal"
              className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="e.g., 40"
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(e.target.value)}
              min="1"
              required
            />
          </div>

          {message && (
            <p
              className={`text-sm italic text-center mb-4 ${
                message.type === "error" ? "text-red-500" : "text-green-600"
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || authLoading} // Disable during save or if auth is loading
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out w-full flex items-center justify-center gap-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaSave />} Save
            Goals
          </button>
        </form>
      </div>
    </div>
  );
}
