import axios from "axios";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  // Removed LineElement as Line charts are removed
  PointElement,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2"; // Removed Line import
import { FaExclamationTriangle, FaSpinner, FaTrophy } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import supabase from "../supabaseClient";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement
  // Removed LineElement registration
);

// --- Helper: Consistent Colors for Charts ---
const CHART_COLORS_PLATFORM = {
  LeetCode: "#FF9900", // Orange
  GeeksforGeeks: "#33691E", // Dark Green
  Codeforces: "#205081", // Dark Blue
  HackerRank: "#4CAF50", // Medium Green (if added back)
  Other: "#9E9E9E", // Gray
};

const CHART_COLORS_DIFFICULTY = {
  Easy: "#4CAF50", // Green
  Medium: "#FFC107", // Amber/Yellow
  Hard: "#F44336", // Red
  Unknown: "#9E9E9E", // Gray
};

// Helper to get color for chart segment (uses consistent colors first, then random if new)
const getConsistentColor = (name, type) => {
  if (type === "platform") {
    return CHART_COLORS_PLATFORM[name] || getRandomColor();
  }
  if (type === "difficulty") {
    return CHART_COLORS_DIFFICULTY[name] || getRandomColor();
  }
  return getRandomColor(); // Fallback
};

// Helper to get random color
const getRandomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

// Chart options for light theme
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#6b7280", // gray-500
      },
    },
    tooltip: {
      titleColor: "#1f2937", // gray-900
      bodyColor: "#4b5563", // gray-600
      backgroundColor: "rgba(255, 255, 255, 0.9)", // white with opacity
      borderColor: "#d1d5db", // gray-300
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      grid: {
        color: "#e5e7eb", // gray-200
        drawBorder: false,
      },
      ticks: {
        color: "#4b5563", // gray-600
      },
    },
    y: {
      grid: {
        color: "#e5e7eb", // gray-200
        drawBorder: false,
      },
      ticks: {
        color: "#4b5563", // gray-600
        beginAtZero: true,
      },
    },
  },
};

// --- Component: MetricCard ---
function MetricCard({ title, value, unit, trend, icon }) {
  const trendColor =
    trend &&
    (trend.includes("↑") ||
      trend.includes("above") ||
      trend.includes("Exceeded"))
      ? "text-green-500"
      : trend && (trend.includes("↓") || trend.includes("behind"))
      ? "text-red-500"
      : "text-gray-500";
  const trendText = trend ? trend : "";

  return (
    <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-start">
      <div className="flex items-center justify-between w-full mb-3">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="text-4xl font-bold text-gray-900">
        {value}{" "}
        <span className="text-lg font-normal text-gray-500">{unit}</span>
      </p>
      {trend && <p className={`text-sm mt-1 ${trendColor}`}>{trendText}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);

  const [dashboardData, setDashboardData] = useState({
    currentStreak: "N/A",
    streakTrend: "Not tracked",
    totalSolved: 0,
    acceptanceRate: "N/A",
    totalSolvedTrend: "",
    thisMonthSolved: 0,
    thisMonthGoal: 0,
    averageDaily: 0,
    averageDailyTrend: "",
    platformBreakdown: [],
    difficultyBreakdown: [],
    problems: [],
    goals: { weekly_goal: 0, monthly_goal: 0 },
    leetCodeProfile: null,
    leetCodeUserRanking: "N/A",
    leetCodeBadges: [],
    // Removed solvedOverTime and avgDailyPerMonth from state
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading || !user) {
        setLoadingDashboard(false);
        return;
      }

      setLoadingDashboard(true);
      setDashboardError(null);

      try {
        const userMetadata = user.user_metadata || {};

        // 1. Fetch Problems from your backend (user_problems table)
        const problemsResponse = await fetch(
          `http://localhost:5000/api/user_problems?user_id=${user.id}`
        );
        if (!problemsResponse.ok) {
          const errorData = await problemsResponse.json();
          throw new Error(
            errorData.message || "Failed to fetch problems for dashboard."
          );
        }
        const problems = await problemsResponse.json();

        // 2. Fetch Goals
        const { data: goalsData, error: goalsError } = await supabase
          .from("user_goals")
          .select("weekly_goal, monthly_goal")
          .eq("user_id", user.id)
          .maybeSingle();

        if (goalsError && goalsError.code !== "PGRST116") {
          throw new Error(goalsError.message);
        }
        const goals = goalsData || { weekly_goal: 0, monthly_goal: 0 };

        // 3. Fetch LeetCode Public Profile Data
        let leetCodeProfileData = null;
        let leetCodeUserRanking = "N/A";
        let leetCodeBadges = [];
        let totalSolvedFromLeetCode = 0;
        let acceptanceRate = "N/A";
        let difficultyBreakdown = [];

        const leetcodeUsername = userMetadata.leetcode_url
          ? userMetadata.leetcode_url.split("/").filter(Boolean).pop()
          : null;

        if (leetcodeUsername) {
          try {
            const profileResponse = await axios.get(
              `http://localhost:5000/api/leetcode-public-profile?username=${leetcodeUsername}`
            );
            if (profileResponse.data) {
              leetCodeProfileData = profileResponse.data;
              totalSolvedFromLeetCode =
                leetCodeProfileData.matchedUser?.submitStats
                  ?.acSubmissionNum?.[0]?.count || 0;
              const totalSubmissionsLeetCode =
                leetCodeProfileData.matchedUser?.submitStats
                  ?.totalSubmissionNum?.[0]?.submissions || 0;

              if (totalSubmissionsLeetCode > 0) {
                acceptanceRate = (
                  (totalSolvedFromLeetCode / totalSubmissionsLeetCode) *
                  100
                ).toFixed(1);
              }
              leetCodeUserRanking =
                leetCodeProfileData.matchedUser?.profile?.ranking || "N/A";
              leetCodeBadges = leetCodeProfileData.badges || [];
            } else {
              console.warn(
                `No LeetCode public profile data found for ${leetcodeUsername}.`
              );
            }
            const leetCodeDifficultyStats =
              leetCodeProfileData?.matchedUser?.submitStats?.acSubmissionNum ||
              [];
            difficultyBreakdown = leetCodeDifficultyStats
              .filter((s) => s.difficulty !== "All")
              .map((s) => ({
                name: s.difficulty,
                count: s.count,
                color: getConsistentColor(s.difficulty, "difficulty"),
              }));
          } catch (profileError) {
            console.error(
              `Error fetching LeetCode public profile for ${leetcodeUsername} via proxy:`,
              profileError.message,
              profileError.response?.data || profileError
            );
            leetCodeBadges = [];
          }
        } else {
          console.log(
            "No LeetCode username found in user metadata. Skipping LeetCode API call."
          );
        }

        // --- Calculate Dashboard Metrics ---
        const totalSolved =
          totalSolvedFromLeetCode > 0
            ? totalSolvedFromLeetCode
            : problems.length;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const daysInCurrentMonth = new Date(
          currentYear,
          currentMonth + 1,
          0
        ).getDate();
        const currentDayOfMonth = today.getDate();

        // thisMonthSolved: based on ALL problems from DB
        const thisMonthSolved = problems.filter((p) => {
          const solvedDate = new Date(p.date_solved);
          return (
            solvedDate.getMonth() === currentMonth &&
            solvedDate.getFullYear() === currentYear
          );
        }).length;

        // Calculate averageDaily for the current month based on problems solved THIS MONTH / days passed THIS MONTH
        const averageDailyCurrentMonth =
          currentDayOfMonth > 0
            ? (thisMonthSolved / currentDayOfMonth).toFixed(1)
            : 0;

        // Simpler totalSolvedTrend
        const totalSolvedTrend = `From all platforms`;

        // platformBreakdown: Calculate based on DB problems first.
        const platformMap = {};
        problems.forEach((p) => {
          platformMap[p.platform] = (platformMap[p.platform] || 0) + 1;
        });

        // Override LeetCode count with totalSolvedFromLeetCode
        if (totalSolvedFromLeetCode > 0) {
          platformMap["LeetCode"] = totalSolvedFromLeetCode;
        }

        const platformBreakdown = Object.keys(platformMap).map((platform) => ({
          name: platform,
          count: platformMap[platform],
          color: getConsistentColor(platform, "platform"),
        }));

        // Removed calculation logic for solvedOverTime and avgDailyPerMonth

        const thisMonthGoal = goals.monthly_goal;
        const thisMonthGoalProgress =
          thisMonthGoal > 0
            ? ((thisMonthSolved / thisMonthGoal) * 100).toFixed(0)
            : 0;
        let thisMonthGoalTrend = "";
        if (thisMonthGoalProgress > 100)
          thisMonthGoalTrend = "↑ Exceeded goal!";
        else if (
          thisMonthGoalProgress < 50 &&
          currentDayOfMonth > daysInCurrentMonth / 2 && // Check if past mid-month
          thisMonthGoal > 0
        )
          thisMonthGoalTrend = "↓ Lagging behind";
        else if (thisMonthGoal > 0)
          thisMonthGoalTrend = `${thisMonthGoalProgress}% of goal`;
        else thisMonthGoalTrend = "Set a goal!";

        // averageDailyTrend should be based on current month's average vs. monthly goal's expected daily average
        let averageDailyTrend = "";
        const expectedDailyForMonth = thisMonthGoal / daysInCurrentMonth;
        if (thisMonthGoal > 0) {
          // Only show trend if a goal is set
          if (parseFloat(averageDailyCurrentMonth) > expectedDailyForMonth)
            averageDailyTrend = "↑ above target";
          else if (
            parseFloat(averageDailyCurrentMonth) <
            expectedDailyForMonth * 0.7
          )
            // More strict check for "below"
            averageDailyTrend = "↓ below target";
          else averageDailyTrend = "on track";
        } else {
          averageDailyTrend = "Set a goal!";
        }

        const currentStreak = "N/A"; // Always set to N/A as tracking removed
        const maxStreak = "N/A"; // Always set to N/A as tracking removed

        setDashboardData({
          currentStreak: currentStreak,
          streakTrend: `Max: ${maxStreak} days`,
          totalSolved: totalSolved,
          acceptanceRate: acceptanceRate,
          totalSolvedTrend: totalSolvedTrend,
          thisMonthSolved: thisMonthSolved,
          thisMonthGoal: thisMonthGoal,
          averageDaily: parseFloat(averageDailyCurrentMonth),
          averageDailyTrend: averageDailyTrend,
          platformBreakdown: platformBreakdown,
          difficultyBreakdown: difficultyBreakdown,
          problems: problems,
          goals: goals,
          thisMonthGoalTrend: thisMonthGoalTrend,
          leetCodeProfile: leetCodeProfileData,
          leetCodeUserRanking: leetCodeUserRanking,
          leetCodeBadges: leetCodeBadges,
          // Removed solvedOverTime and avgDailyPerMonth from state update
        });
      } catch (err) {
        console.error("Error setting up dashboard data:", err);
        setDashboardError(`Failed to load dashboard: ${err.message}.`);
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading]);

  // Chart data setup using dashboardData state
  const platformChartData = {
    labels: dashboardData.platformBreakdown.map((p) => p.name),
    datasets: [
      {
        label: "Problems Solved",
        data: dashboardData.platformBreakdown.map((p) => p.count),
        backgroundColor: dashboardData.platformBreakdown.map((p) =>
          getConsistentColor(p.name, "platform")
        ),
        borderColor: dashboardData.platformBreakdown.map((p) =>
          getConsistentColor(p.name, "platform")
        ),
        borderWidth: 1,
      },
    ],
  };

  const difficultyChartLabels = dashboardData.difficultyBreakdown.map(
    (d) => d.name
  );
  const difficultyChartCounts = dashboardData.difficultyBreakdown.map(
    (d) => d.count
  );
  const difficultyChartColors = dashboardData.difficultyBreakdown.map((d) =>
    getConsistentColor(d.name, "difficulty")
  );

  const difficultyChartData = {
    labels: difficultyChartLabels,
    datasets: [
      {
        label: "Problems Solved (LeetCode)",
        data: difficultyChartCounts,
        backgroundColor: difficultyChartColors,
        borderColor: difficultyChartColors,
        borderWidth: 1,
      },
    ],
  };

  // Removed solvedOverTimeChartData and avgDailyPerMonthChartData definitions

  return (
    <div className="flex-grow p-8 bg-gray-100 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          {/* Removed "Add Problem" Button */}
        </div>

        {loadingDashboard || authLoading ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-md flex items-center justify-center gap-3">
            <FaSpinner className="animate-spin text-blue-600 text-2xl" />
            <p className="text-blue-600 text-xl">Loading dashboard data...</p>
          </div>
        ) : dashboardError ? (
          <div className="text-center py-10 bg-red-50 rounded-lg shadow-md border border-red-200 text-red-700">
            <FaExclamationTriangle className="mr-2 inline-block" />
            <p className="text-xl">{dashboardError}</p>
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                title="Acceptance Rate"
                value={dashboardData.acceptanceRate}
                unit="%"
                // Trend text updated as per request
                trend={dashboardData.acceptanceRate !== "N/A" ? `LeetCode` : ""}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-percent"
                  >
                    <path d="M19 5L5 19" />
                    <circle cx="6.5" cy="6.5" r="2.5" />
                    <circle cx="17.5" cy="17.5" r="2.5" />
                  </svg>
                }
              />
              <MetricCard
                title="Total Solved"
                value={dashboardData.totalSolved}
                unit="problems"
                // Trend text updated as per request
                trend={dashboardData.totalSolvedTrend}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-check-circle"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-8.8" />
                    <path d="M22 4L12 14.01l-3-3" />
                  </svg>
                }
              />
              <MetricCard
                title="This Month"
                value={dashboardData.thisMonthSolved}
                unit={`/ ${dashboardData.thisMonthGoal} problems`}
                trend={dashboardData.thisMonthGoalTrend}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-calendar"
                  >
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                }
              />
              <MetricCard
                title="Average/Day"
                value={dashboardData.averageDaily}
                unit="problems"
                trend={dashboardData.averageDailyTrend}
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucude-gauge"
                  >
                    <path d="m12 14 4-4" />
                    <path d="M3.34 19.1A8 8 0 1 1 20.7 19.1" />
                    <path d="M17.76 16.24A7 7 0 1 0 6.24 16.24" />
                  </svg>
                }
              />
            </div>

            {/* LeetCode User Ranking Card (Simplified) */}
            <div className="grid grid-cols-1 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaTrophy className="text-orange-500" /> LeetCode User Ranking
                </h3>
                {dashboardData.leetCodeProfile ? (
                  <div className="flex flex-col items-center justify-center min-h-[160px] text-gray-700">
                    {dashboardData.leetCodeUserRanking !== "N/A" ? (
                      <>
                        <p className="text-4xl font-bold text-blue-600 mb-2">
                          Rank:{" "}
                          {dashboardData.leetCodeUserRanking.toLocaleString()}
                        </p>
                        <p className="text-lg">
                          Username:{" "}
                          {dashboardData.leetCodeProfile.matchedUser
                            ?.username || "N/A"}
                        </p>
                        <p className="text-sm text-gray-600">
                          Global Rank (lower is better)
                        </p>
                      </>
                    ) : (
                      <p className="text-lg">Ranking data not available.</p>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400">
                    <p>
                      No LeetCode ranking data available. Link your profile!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Charts Section - Reverted to 2 charts side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Problems by Difficulty Chart (LeetCode) */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Problems by Difficulty (LeetCode)
                </h3>
                <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400">
                  {difficultyChartData.labels.length > 0 ? (
                    <Pie data={difficultyChartData} options={chartOptions} />
                  ) : (
                    <p>No LeetCode difficulty data available.</p>
                  )}
                </div>
                <div className="mt-4 flex justify-center space-x-4 text-sm">
                  {difficultyChartData.labels.map((name, index) => (
                    <div key={name} className="flex items-center space-x-1">
                      <span
                        className={`w-3 h-3 rounded-full`}
                        style={{
                          backgroundColor:
                            difficultyChartData.datasets[0].backgroundColor[
                              index
                            ],
                        }}
                      ></span>
                      <span>
                        {name}: {difficultyChartData.datasets[0].data[index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Problems by Platform Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Problems by Platform
                </h3>
                <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400">
                  {platformChartData.labels.length > 0 ? (
                    <Bar data={platformChartData} options={chartOptions} />
                  ) : (
                    <p>No platform data available.</p>
                  )}
                </div>
                <div className="mt-4 flex justify-center space-x-4 text-sm">
                  {platformChartData.labels.map((name, index) => (
                    <div key={name} className="flex items-center space-x-1">
                      <span
                        className={`w-3 h-3 rounded-full`}
                        style={{
                          backgroundColor:
                            platformChartData.datasets[0].backgroundColor[
                              index
                            ],
                        }}
                      ></span>
                      <span>
                        {name}: {platformChartData.datasets[0].data[index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Removed Solved Over Time Chart and Average Daily Problems Per Month Chart */}
            </div>

            {/* Current Month's Goal Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Current Monthly Goal
                  </h3>
                  <p className="text-lg text-gray-700 mb-2">
                    Solve {dashboardData.thisMonthGoal} problems this month
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(
                            (dashboardData.thisMonthSolved /
                              dashboardData.thisMonthGoal) *
                              100
                          )
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {Math.round(
                      (dashboardData.thisMonthSolved /
                        dashboardData.thisMonthGoal) *
                        100
                    )}
                    % Completed
                  </p>
                  {dashboardData.thisMonthGoalTrend &&
                    dashboardData.thisMonthGoalTrend.includes("Lagging") && (
                      <p className="text-red-500 text-sm mt-2">
                        You're lagging behind your goal!
                      </p>
                    )}
                  {dashboardData.thisMonthGoalTrend &&
                    dashboardData.thisMonthGoalTrend.includes("Exceeded") && (
                      <p className="text-green-500 text-sm mt-2">
                        Goal exceeded! Fantastic work!
                      </p>
                    )}
                </div>
                <Link
                  to="/goals"
                  className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 ease-in-out text-center"
                >
                  Manage Goals
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
