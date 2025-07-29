import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaCode,
  FaEdit,
  FaRegStar,
  FaSearch,
  FaStar,
  FaTimes,
} from "react-icons/fa";

export default function Problems() {
  // Placeholder data for problems. In a real app, this would come from an API/DB.
  const [allProblems, setAllProblems] = useState([
    {
      id: 1,
      name: "Two Sum",
      platform: "LeetCode",
      difficulty: "Easy",
      dateSolved: "2024-07-25",
      url: "https://leetcode.com/problems/two-sum/",
      notes:
        "Basic array traversal, good for warm-up. Remember edge cases like empty array.",
      isImportant: true,
    },
    {
      id: 2,
      name: "Reverse Linked List",
      platform: "GeeksforGeeks",
      difficulty: "Medium",
      dateSolved: "2024-07-24",
      url: "https://www.geeksforgeeks.org/reverse-a-linked-list/",
      notes:
        "Learned iterative and recursive approaches. Iterative is often preferred for performance.",
      isImportant: false,
    },
    {
      id: 3,
      name: "Merge Sort",
      platform: "HackerRank",
      difficulty: "Hard",
      dateSolved: "2024-07-23",
      url: "https://www.hackerrank.com/challenges/merge-sort/problem",
      notes:
        "Classic divide and conquer algorithm. Pay attention to the merge step.",
      isImportant: true,
    },
    {
      id: 4,
      name: "Binary Search",
      platform: "LeetCode",
      difficulty: "Easy",
      dateSolved: "2024-07-22",
      url: "https://leetcode.com/problems/binary-search/",
      notes:
        "Standard template for searching sorted arrays. Practice variations.",
      isImportant: false,
    },
    {
      id: 5,
      name: "Quick Sort",
      platform: "Codeforces",
      difficulty: "Medium",
      dateSolved: "2024-07-21",
      url: "https://codeforces.com/problemset/problem/1/A",
      notes:
        "Efficient sorting, average case O(N log N). Watch out for pivot selection.",
      isImportant: false,
    },
    {
      id: 6,
      name: "Longest Common Subsequence",
      platform: "GeeksforGeeks",
      difficulty: "Hard",
      dateSolved: "2024-07-20",
      url: "https://www.geeksforgeeks.org/longest-common-subsequence-dp-4/",
      notes:
        "Dynamic Programming problem. Understand the state transitions and base cases.",
      isImportant: true,
    },
    {
      id: 7,
      name: "FizzBuzz",
      platform: "HackerRank",
      difficulty: "Easy",
      dateSolved: "2024-07-19",
      url: "https://www.hackerrank.com/challenges/fizzbuzz/problem",
      notes:
        "Good for basic loops and conditionals. Often used in initial coding screens.",
      isImportant: false,
    },
    {
      id: 8,
      name: "Container With Most Water",
      platform: "LeetCode",
      difficulty: "Medium",
      dateSolved: "2024-07-18",
      url: "https://leetcode.com/problems/container-with-most-water/",
      notes:
        "Two-pointer approach is key to optimizing this problem. Visualize the pointers.",
      isImportant: false,
    },
    {
      id: 9,
      name: "Dijkstra's Shortest Path",
      platform: "Codeforces",
      difficulty: "Hard",
      dateSolved: "2024-07-17",
      url: "https://codeforces.org/problemset/problem/20/C",
      notes:
        "Graph algorithm, requires understanding of priority queues and relaxation.",
      isImportant: true,
    },
    {
      id: 10,
      name: "Array Reverse",
      platform: "GeeksforGeeks",
      difficulty: "Easy",
      dateSolved: "2024-07-16",
      url: "https://www.geeksforgeeks.org/write-a-program-to-reverse-an-array-or-string/",
      notes:
        "Basic array manipulation, recursive solution is elegant. Consider in-place solutions.",
      isImportant: false,
    },
  ]);

  const [filteredProblems, setFilteredProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("platform"); // 'platform', 'difficulty', 'dateSolved'
  const [showImportantOnly, setShowImportantOnly] = useState(false);

  const [showNotesModal, setShowNotesModal] = useState(false);
  const [currentProblemNotes, setCurrentProblemNotes] = useState({
    id: null,
    name: "",
    notes: "",
  });

  // Apply filters and sorting whenever dependencies change
  useEffect(() => {
    let tempProblems = [...allProblems];

    // Search filter
    if (searchTerm) {
      tempProblems = tempProblems.filter(
        (problem) =>
          problem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          problem.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Important filter
    if (showImportantOnly) {
      tempProblems = tempProblems.filter((problem) => problem.isImportant);
    }

    // Sorting
    tempProblems.sort((a, b) => {
      if (sortBy === "platform") {
        return a.platform.localeCompare(b.platform);
      } else if (sortBy === "difficulty") {
        const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      } else if (sortBy === "dateSolved") {
        return new Date(b.dateSolved) - new Date(a.dateSolved); // Newest first
      }
      return 0; // Should not happen
    });

    setFilteredProblems(tempProblems);
  }, [allProblems, searchTerm, sortBy, showImportantOnly]);

  const toggleImportant = (id) => {
    setAllProblems((prevProblems) =>
      prevProblems.map((problem) =>
        problem.id === id
          ? { ...problem, isImportant: !problem.isImportant }
          : problem
      )
    );
  };

  const openNotesModal = (problem) => {
    setCurrentProblemNotes({
      id: problem.id,
      name: problem.name,
      notes: problem.notes,
    });
    setShowNotesModal(true);
  };

  const saveNotes = () => {
    setAllProblems((prevProblems) =>
      prevProblems.map((problem) =>
        problem.id === currentProblemNotes.id
          ? { ...problem, notes: currentProblemNotes.notes }
          : problem
      )
    );
    setShowNotesModal(false);
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
    // Using simple favicons for now. In a real app, ensure these URLs are stable or host them locally.
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
            src="hr.png"
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

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {" "}
          {/* Added xl column */}
          {filteredProblems.length === 0 ? (
            <div className="lg:col-span-3 xl:col-span-4 text-center py-10 bg-white rounded-lg shadow-md">
              {" "}
              {/* Span full width */}
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
                    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                      {getPlatformIcon(problem.platform)}
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 transition-colors duration-200 truncate max-w-[calc(100%-40px)]"
                      >
                        {" "}
                        {/* Added truncate */}
                        {problem.name}
                      </a>
                    </h3>
                    <button
                      onClick={() => toggleImportant(problem.id)}
                      className="text-gray-400 hover:text-yellow-500 transition-colors duration-200"
                    >
                      {problem.isImportant ? (
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
                      {problem.dateSolved}
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
