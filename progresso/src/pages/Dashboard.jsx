// Card Component for Dashboard metrics
function MetricCard({ title, value, unit, trend, icon }) {
  const trendColor =
    trend && trend.includes("↑") ? "text-green-500" : "text-red-500";
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

// Heatmap component (kept within this file for ease of use in this context)
function ContributionHeatmap({ data }) {
  // Generate a year's worth of data (365 days)
  const generateDummyHeatmapData = () => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const data = {};
    let currentDate = new Date(oneYearAgo);

    while (currentDate <= today) {
      const dateString = currentDate.toISOString().split("T")[0];
      // Simulate problem counts: mostly 0-2, sometimes 3-5, rarely more
      const random = Math.random();
      let count = 0;
      if (random < 0.7) {
        // 70% chance of 0-2 problems
        count = Math.floor(Math.random() * 3);
      } else if (random < 0.9) {
        // 20% chance of 3-5 problems
        count = Math.floor(Math.random() * 3) + 3;
      } else {
        // 10% chance of 6-10 problems
        count = Math.floor(Math.random() * 5) + 6;
      }
      data[dateString] = count;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
  };

  const heatmapData = data || generateDummyHeatmapData();

  const getDayColor = (count) => {
    if (count === 0) return "bg-gray-200"; // No problems
    if (count >= 1 && count <= 2) return "bg-green-200"; // Light green
    if (count >= 3 && count <= 5) return "bg-green-400"; // Medium green
    if (count >= 6 && count <= 9) return "bg-green-600"; // Darker green
    if (count >= 10) return "bg-green-800"; // Darkest green
    return "bg-gray-200"; // Fallback
  };

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Create an array of all days in the last year, grouped by week
  const getWeeks = () => {
    const weeks = [];
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    let currentDate = new Date(oneYearAgo);
    // Adjust to the start of the week (Sunday)
    currentDate.setDate(currentDate.getDate() - currentDate.getDay());

    let week = [];
    // Ensure we process enough weeks to cover a full year,
    // starting from a Sunday before or on one year ago, up to the current date.
    let safetyCounter = 0; // Prevent infinite loops in edge cases
    const maxIterations = 55 * 7; // Max 55 weeks * 7 days
    while (
      currentDate <= today ||
      (week.length > 0 && safetyCounter < maxIterations)
    ) {
      if (currentDate <= today) {
        week.push(new Date(currentDate));
      } else {
        week.push(null); // Fill trailing days with nulls
      }
      currentDate.setDate(currentDate.getDate() + 1);

      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
      safetyCounter++;
    }
    // Add any remaining days in the last partial week, filled with nulls
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      weeks.push(week);
    }
    return weeks;
  };

  const weeks = getWeeks();

  // Calculate total submissions and active days for the header
  const totalSubmissions = Object.values(heatmapData).reduce(
    (sum, count) => sum + count,
    0
  );
  const totalActiveDays = Object.values(heatmapData).filter(
    (count) => count > 0
  ).length;
  const maxStreak = (() => {
    let currentStreak = 0;
    let maxFoundStreak = 0;
    const sortedDates = Object.keys(heatmapData).sort();
    for (let i = 0; i < sortedDates.length; i++) {
      const date = sortedDates[i];
      const count = heatmapData[date];
      if (count > 0) {
        currentStreak++;
      } else {
        currentStreak = 0;
      }
      maxFoundStreak = Math.max(maxFoundStreak, currentStreak);
    }
    return maxFoundStreak;
  })();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Submission Heatmap
        </h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span className="font-medium">
            {totalSubmissions} submissions in the past one year
          </span>
          <span>Total active days: {totalActiveDays}</span>
          <span>Max streak: {maxStreak}</span>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4">
        {/* Day labels (Sun, Mon, etc.) */}
        <div className="flex flex-col justify-between mr-2 text-xs text-gray-500 pt-6">
          {days.map((day) => (
            <div key={day} className="h-4 flex items-center">
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap Grid */}
        <div className="flex flex-grow">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col mr-1">
              {/* Month label for the first day of the month in this column */}
              {week[0] && week[0].getDate() === 1 && (
                <div className="text-xs text-gray-500 mb-1 -ml-2">
                  {months[week[0].getMonth()]}
                </div>
              )}
              {week.map((day, dayIndex) => {
                const dateString = day ? day.toISOString().split("T")[0] : null;
                const count = dateString ? heatmapData[dateString] || 0 : 0;
                return (
                  <div
                    key={dayIndex}
                    className={`w-4 h-4 rounded-sm m-0.5 cursor-pointer ${getDayColor(
                      count
                    )}`}
                    title={day ? `${dateString}: ${count} problems` : "No data"}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end items-center text-xs text-gray-500 mt-2">
        <span>Less</span>
        <div className="flex ml-1">
          <span className="w-3 h-3 rounded-sm bg-gray-200 mx-0.5"></span>
          <span className="w-3 h-3 rounded-sm bg-green-200 mx-0.5"></span>
          <span className="w-3 h-3 rounded-sm bg-green-400 mx-0.5"></span>
          <span className="w-3 h-3 rounded-sm bg-green-600 mx-0.5"></span>
          <span className="w-3 h-3 rounded-sm bg-green-800 mx-0.5"></span>
        </div>
        <span className="ml-1">More</span>
      </div>
    </div>
  );
}

// Main DashboardPage Component (exported as default)
export default function Dashboard() {
  // Placeholder for data fetching or state
  const dashboardData = {
    currentStreak: 15,
    streakTrend: "↑ 2 from yesterday",
    totalSolved: 247,
    totalSolvedTrend: "↑ 5 this week",
    thisMonthSolved: 32,
    thisMonthGoal: 40,
    averageDaily: 2.3,
    averageDailyTrend: "↑ above target",
    platformBreakdown: [
      { name: "LeetCode", count: 150, color: "bg-blue-600" },
      { name: "Codeforces", count: 70, color: "bg-red-500" },
      { name: "GeeksforGeeks", count: 27, color: "bg-green-600" },
    ],
    difficultyBreakdown: [
      { name: "Easy", count: 120, color: "bg-green-500" },
      { name: "Medium", count: 90, color: "bg-orange-400" },
      { name: "Hard", count: 37, color: "bg-red-600" },
    ],
    currentGoalStatus: {
      description: "Solve 50 problems this month",
      progress: 64, // percentage
      isLagging: false,
    },
  };

  return (
    <div className="flex-grow p-8 bg-gray-100 overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Current Streak"
          value={dashboardData.currentStreak}
          unit="days"
          trend={dashboardData.streakTrend}
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
              className="lucide lucide-trending-up"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          }
        />
        <MetricCard
          title="Total Solved"
          value={dashboardData.totalSolved}
          unit="problems"
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
          trend={`${Math.round(
            (dashboardData.thisMonthSolved / dashboardData.thisMonthGoal) * 100
          )}% of goal`}
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

      {/* Heatmap Section */}
      <ContributionHeatmap />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Problems by Difficulty Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Problems by Difficulty
          </h3>
          {/* Placeholder for Donut Chart */}
          <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400">
            {/* You'd integrate a chart library here, e.g., Chart.js or Recharts */}
            <p>Donut Chart Placeholder</p>
          </div>
          <div className="mt-4 flex justify-center space-x-4 text-sm">
            {dashboardData.difficultyBreakdown.map((item) => (
              <div key={item.name} className="flex items-center space-x-1">
                <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                <span>
                  {item.name}: {item.count}
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
          {/* Placeholder for Bar Chart */}
          <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400">
            {/* You'd integrate a chart library here, e.g., Chart.js or Recharts */}
            <p>Bar Chart Placeholder</p>
          </div>
          <div className="mt-4 flex justify-center space-x-4 text-sm">
            {dashboardData.platformBreakdown.map((item) => (
              <div key={item.name} className="flex items-center space-x-1">
                <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                <span>
                  {item.name}: {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contest Rating Chart (if available) / Current Week's Goal Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Contest Rating Trend
          </h3>
          <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-400">
            <p>Contest Rating Chart Placeholder</p>
          </div>
        </div>

        {/* Current Week's Goal Status */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Current Week's Goal
            </h3>
            <p className="text-lg text-gray-700 mb-2">
              {dashboardData.currentGoalStatus.description}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full"
                style={{
                  width: `${dashboardData.currentGoalStatus.progress}%`,
                }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {dashboardData.currentGoalStatus.progress}% Completed
            </p>
            {dashboardData.currentGoalStatus.isLagging && (
              <p className="text-red-500 text-sm mt-2">
                You're lagging behind your goal!
              </p>
            )}
          </div>
          <button className="mt-4 w-full px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition duration-300 ease-in-out">
            Manage Goals
          </button>
        </div>
      </div>
    </div>
  );
}
