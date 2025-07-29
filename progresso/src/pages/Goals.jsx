import { useState } from "react";
import {
  FaBullseye,
  FaCalendarAlt,
  FaCalendarWeek,
  FaSave,
} from "react-icons/fa"; // Icons for goals

export default function Goals() {
  // State to store the user's weekly and monthly goals
  const [weeklyGoal, setWeeklyGoal] = useState("");
  const [monthlyGoal, setMonthlyGoal] = useState("");
  const [message, setMessage] = useState(""); // For success or error messages

  // Placeholder for current/saved goals (in a real app, fetched from DB)
  const [currentGoals, setCurrentGoals] = useState({
    weekly: 10,
    monthly: 40,
    lastUpdated: "2025-07-20",
  });

  const handleSaveGoals = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !weeklyGoal ||
      !monthlyGoal ||
      isNaN(weeklyGoal) ||
      isNaN(monthlyGoal)
    ) {
      setMessage({
        type: "error",
        text: "Please enter valid numbers for both goals.",
      });
      return;
    }

    const newWeekly = parseInt(weeklyGoal, 10);
    const newMonthly = parseInt(monthlyGoal, 10);

    console.log(
      `Saving Weekly Goal: ${newWeekly}, Monthly Goal: ${newMonthly}`
    );
    // --- Placeholder for actual API call to save goals ---
    // In a real application, you would send this data to your backend/database (e.g., Supabase)
    // const { data, error } = await supabase.from('user_goals').upsert({
    //   user_id: currentUserId, // You'd get this from your auth context
    //   weekly_goal: newWeekly,
    //   monthly_goal: newMonthly,
    //   updated_at: new Date().toISOString()
    // });
    // if (error) { ... setError message ... } else { ... set success message ... }

    // Simulate successful save for now
    setCurrentGoals({
      weekly: newWeekly,
      monthly: newMonthly,
      lastUpdated: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    });
    setWeeklyGoal(""); // Clear input fields after saving
    setMonthlyGoal("");
    setMessage({ type: "success", text: "Goals saved successfully!" });

    // Clear message after some time
    setTimeout(() => setMessage(""), 3000);
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

          {message.text && (
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 ease-in-out w-full"
          >
            <FaSave className="inline-block mr-2" /> Save Goals
          </button>
        </form>
      </div>
    </div>
  );
}
