import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaCode,
  FaEdit,
  FaExclamationTriangle,
  FaRegStar,
  FaSearch,
  FaSpinner,
  FaStar,
  FaTimes,
} from "react-icons/fa";

import { useAuth } from "../AuthContext.jsx";
import supabase from "../supabaseClient";

export default function Problems() {
  const { user, loading: authLoading } = useAuth();

  const [allProblems, setAllProblems] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(true);
  const [problemsError, setProblemsError] = useState(null);

  const [filteredProblems, setFilteredProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("platform");
  const [showImportantOnly, setShowImportantOnly] = useState(false);

  const [showNotesModal, setShowNotesModal] = useState(false);
  const [currentProblemNotes, setCurrentProblemNotes] = useState({
    id: null,
    name: "",
    notes: "",
  });

  useEffect(() => {
    const fetchProblems = async () => {
      console.log(
        "Fetching problems for user ID:",
        user?.id,
        "Auth loading:",
        authLoading
      );

      if (authLoading || !user) {
        setLoadingProblems(false);
        setAllProblems([]); // Clear problems if user logs out or is not available
        return;
      }

      setLoadingProblems(true);
      setProblemsError(null);

      try {
        // This endpoint now triggers the sync and returns updated problems
        const response = await fetch(
          `http://localhost:5000/api/user_problems?user_id=${user.id}`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch problems from backend."
          );
        }

        const data = await response.json();
        console.log("Problems fetched:", data); // Log the fetched data
        setAllProblems(data);
      } catch (err) {
        console.error("Error fetching problems from backend:", err);
        setProblemsError(
          `Failed to load your problems: ${err.message}. Please try refreshing.`
        );
        setAllProblems([]);
      } finally {
        setLoadingProblems(false);
      }
    };

    fetchProblems();
  }, [user, authLoading]); // Dependencies correctly include user and authLoading

  useEffect(() => {
    let tempProblems = [...allProblems];

    if (searchTerm) {
      tempProblems = tempProblems.filter(
        (problem) =>
          problem.problem_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          problem.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (showImportantOnly) {
      tempProblems = tempProblems.filter((problem) => problem.is_important);
    }

    tempProblems.sort((a, b) => {
      if (sortBy === "platform") {
        return a.platform.localeCompare(b.platform);
      } else if (sortBy === "difficulty") {
        const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      } else if (sortBy === "dateSolved") {
        return new Date(b.date_solved) - new Date(a.date_solved);
      }
      return 0;
    });

    setFilteredProblems(tempProblems);
  }, [allProblems, searchTerm, sortBy, showImportantOnly]);

  const toggleImportant = async (id, currentStatus) => {
    setAllProblems((prevProblems) =>
      prevProblems.map((problem) =>
        problem.id === id
          ? { ...problem, is_important: !problem.is_important }
          : problem
      )
    );
    try {
      const { error } = await supabase
        .from("user_problems")
        .update({ is_important: !currentStatus })
        .eq("id", id)
        .select();

      if (error) {
        throw new Error(error.message);
      }
    } catch (err) {
      console.error("Error updating importance:", err);
      setAllProblems((prevProblems) =>
        prevProblems.map((problem) =>
          problem.id === id
            ? { ...problem, is_important: currentStatus }
            : problem
        )
      );
      setProblemsError({
        type: "error",
        text: `Failed to update importance: ${err.message}`,
      });
      setTimeout(() => setProblemsError(null), 3000);
    }
  };

  const openNotesModal = (problem) => {
    setCurrentProblemNotes({
      id: problem.id,
      name: problem.problem_name,
      notes: problem.notes,
    });
    setShowNotesModal(true);
  };

  const saveNotes = async () => {
    setLoadingProblems(true);
    try {
      const { data, error } = await supabase
        .from("user_problems")
        .update({ notes: currentProblemNotes.notes })
        .eq("id", currentProblemNotes.id)
        .select();

      if (error) {
        throw new Error(error.message);
      }
      setAllProblems((prevProblems) =>
        prevProblems.map((problem) =>
          problem.id === currentProblemNotes.id
            ? { ...problem, notes: currentProblemNotes.notes }
            : problem
        )
      );
      setShowNotesModal(false);
      setProblemsError({ type: "success", text: "Notes saved successfully!" });
      setTimeout(() => setProblemsError(null), 3000);
    } catch (err) {
      console.error("Error saving notes:", err);
      setProblemsError({
        type: "error",
        text: `Failed to save notes: ${err.message}`,
      });
      setTimeout(() => setProblemsError(null), 3000);
    } finally {
      setLoadingProblems(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return "text-green-600";
      case "Medium":
        return "text-orange-500";
      case "Hard":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "LeetCode":
        return (
          <img
            src="https://assets.leetcode.com/static_assets/public/icons/favicon-32x32.png"
            alt="LeetCode"
            className="w-5 h-5 mr-1 inline-block rounded-full"
          />
        );
      case "GeeksforGeeks":
        return (
          <img src="/gfg.png" alt="GFG" className="w-5 h-5 mr-1 inline-block" />
        );
      case "HackerRank":
        return (
          <img
            src="/hr.png"
            alt="HackerRank"
            className="w-5 h-5 mr-1 inline-block"
          />
        );
      case "Codeforces":
        return (
          <img
            src="https://codeforces.org/s/a/fa.png"
            alt="Codeforces"
            className="w-5 h-5 mr-1 inline-block"
          />
        );
      default:
        return <FaCode className="mr-1 inline-block text-gray-500" />;
    }
  };

  return (
    <div className="flex-grow p-8 bg-gray-100 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Your Solved Problems
        </h1>

        {/* Controls Section (Search, Sort, Important Filter) */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search by name or notes..."
              className="shadow appearance-none border rounded-lg w-full py-2 px-4 pl-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-gray-700 font-medium">Sort by:</span>
            <select
              className="p-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="platform">Platform</option>
              <option value="difficulty">Difficulty</option>
              <option value="dateSolved">Date Solved</option>
            </select>
          </div>

          {/* Show Important Only Toggle */}
          <button
            onClick={() => setShowImportantOnly(!showImportantOnly)}
            className={`px-4 py-2 rounded-lg font-semibold transition duration-200 flex items-center gap-2
              ${
                showImportantOnly
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
          >
            {showImportantOnly ? <FaStar /> : <FaRegStar />}
            Important Only
          </button>
        </div>

        {/* Loading / Error State for Problems Grid */}
        {loadingProblems || authLoading ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-md flex items-center justify-center gap-3">
            <FaSpinner className="animate-spin text-blue-600 text-2xl" />
            <p className="text-blue-600 text-xl">Loading problems...</p>
          </div>
        ) : problemsError ? (
          <div className="text-center py-10 bg-red-50 rounded-lg shadow-md border border-red-200 text-red-700">
            <FaExclamationTriangle className="mr-2 inline-block" />
            <p className="text-xl">{problemsError.text || problemsError}</p>
          </div>
        ) : (
          /* Problems Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProblems.length === 0 ? (
              <div className="lg:col-span-3 xl:col-span-4 text-center py-10 bg-white rounded-lg shadow-md">
                <p className="text-gray-500 text-xl">
                  No problems found matching your criteria.
                </p>
              </div>
            ) : (
              filteredProblems.map((problem) => (
                <div
                  key={problem.id}
                  className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between transform transition duration-300 hover:scale-[1.01] hover:shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center min-w-0">
                        {" "}
                        {/* Added min-w-0 */}
                        {getPlatformIcon(problem.platform)}
                        {/* problem_name from DB */}
                        <a
                          href={problem.problem_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-grow hover:text-blue-600 transition-colors duration-200 truncate" // Added truncate
                        >
                          {problem.problem_name}
                        </a>
                      </h3>
                      <button
                        onClick={() =>
                          toggleImportant(problem.id, problem.is_important)
                        }
                        className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 ml-2 flex-shrink-0"
                      >
                        {problem.is_important ? (
                          <FaStar className="text-yellow-500 text-2xl" />
                        ) : (
                          <FaRegStar className="text-2xl" />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center">
                        Platform: {problem.platform}
                      </span>
                      <span
                        className={`font-semibold ${getDifficultyColor(
                          problem.difficulty
                        )}`}
                      >
                        Difficulty: {problem.difficulty}
                      </span>
                      <span className="flex items-center">
                        <FaCalendarAlt className="mr-1" />
                        {new Date(problem.date_solved).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-gray-700 text-base mb-4 line-clamp-3">
                      {problem.notes || "No notes added yet."}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => openNotesModal(problem)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-300 transition duration-200 flex items-center gap-1"
                    >
                      <FaEdit /> Add/Edit Notes
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Notes for "{currentProblemNotes.name}"
              </h2>
              <button
                onClick={() => setShowNotesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              rows="6"
              value={currentProblemNotes.notes}
              onChange={(e) =>
                setCurrentProblemNotes({
                  ...currentProblemNotes,
                  notes: e.target.value,
                })
              }
            ></textarea>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={saveNotes}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
