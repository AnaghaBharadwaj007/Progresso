// server/index.js
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { LeetCode } from 'leetcode-query'; // Assuming this library works for recent submissions

const app = express();
const PORT = process.env.PORT || 5000;

// --- Supabase Client ---
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase URL or Service Role Key in environment variables. Server cannot start.");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// --- External API Base URLs (Defined Globally) ---
const GEEKSFORGEEKS_API_BASE_URL = process.env.GEEKSFORGEEKS_API_BASE_URL || 'https://geeks-for-geeks-api.vercel.app';
const CODEFORCES_API_BASE_URL = 'https://codeforces.com/api';
// ALFA_LEETCODE_API_BASE_URL is not used by leetcode-query, so it can be removed or kept for other purposes.

// --- Middleware ---
// Keep only one CORS middleware, using environment variable and enabling credentials
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// --- Helper Functions (No changes needed in these, they are well-defined) ---

async function getLeetCodePublicProfileData(username) {
  try {
    const leetcode = new LeetCode();
    const userProfile = await leetcode.user(username);
    // console.log(`[LeetCode] Raw User Profile for ${username}:`, JSON.stringify(userProfile, null, 2)); // Keep for debug if needed

    const difficulties = ['Easy', 'Medium', 'Hard'];

    // Filter for accepted submissions and map to your problem schema
    const problems = (userProfile?.recentSubmissionList || [])
      .filter(sub => sub.statusDisplay === 'Accepted')
      .map(sub => ({
        problem_name: sub.title,
        problem_url: `https://leetcode.com/problems/${sub.titleSlug}/`,
        // Assign random difficulty if not available directly for recent submissions,
        // or try to infer from problem name/titleSlug if possible (more complex)
        difficulty: sub.difficulty || difficulties[Math.floor(Math.random() * difficulties.length)],
        platform: 'LeetCode',
        date_solved: new Date(parseInt(sub.timestamp) * 1000).toISOString().split('T')[0],
      }));

    console.log(`[LeetCode] Fetched ${problems.length} recent accepted problems for ${username}.`);
    // Return full userProfile for dashboard details, and problems for sync
    return { totalSolved: userProfile?.matchedUser?.submitStats?.acSubmissionNum?.[0]?.count || 0, problems, userProfile };

  } catch (error) {
    console.error(`[LeetCode] Error fetching public data for ${username}:`, error.message);
    // ... (rest of error logging)
    throw new Error(`LeetCode API call failed for ${username}: ${error.message}`);
  }
}

async function getGeeksforGeeksSolvedProblems(profileName) {
  try {
    console.log(`[GFG] Attempting to fetch from: ${GEEKSFORGEEKS_API_BASE_URL}/${profileName}`);
    const response = await axios.get(`${GEEKSFORGEEKS_API_BASE_URL}/${profileName}`);
    const data = response.data;
    // console.log(`[GFG] Raw API Response for ${profileName}:`, JSON.stringify(data, null, 2)); // Keep for debug if needed

    let allSolvedProblems = [];

    if (data && data.solvedStats) {
      for (const difficultyKey in data.solvedStats) {
        const difficultyData = data.solvedStats[difficultyKey];

        if (difficultyData && Array.isArray(difficultyData.questions)) {
          const currentDifficulty = difficultyKey.charAt(0).toUpperCase() + difficultyKey.slice(1);

          difficultyData.questions.forEach(q => {
            allSolvedProblems.push({
              problem_name: q.question,
              problem_url: q.questionUrl,
              difficulty: currentDifficulty,
              platform: 'GeeksforGeeks',
              date_solved: q.dateSolved || new Date().toISOString().split('T')[0],
            });
          });
        }
      }
    }

    if (allSolvedProblems.length === 0 && data && data.info && data.info.totalProblemsSolved > 0) {
      console.warn(`[GFG] Profile ${profileName} reports ${data.info.totalProblemsSolved} total problems solved, but no detailed problems found in expected structure.`);
    } else if (allSolvedProblems.length === 0 && data.info && data.info.totalProblemsSolved === 0) {
      console.log(`[GFG] User ${profileName} has 0 problems solved on GFG.`);
    } else if (allSolvedProblems.length === 0) {
      // Don't throw a full error if no problems found, just return empty array and let caller handle
      console.warn(`No solved problems found in GFG API response for ${profileName}. Returning empty list.`);
    }

    console.log(`[GFG] Fetched ${allSolvedProblems.length} problems for ${profileName}.`);
    return allSolvedProblems;
  } catch (error) {
    console.error(`[GFG] Error fetching problems for ${profileName}:`, error.message);
    // ... (rest of error logging)
    return []; // Return empty array on error to allow other platform syncs to continue
  }
}

async function getCodeforcesSolvedProblems(handle) {
  let allSubmissions = [];
  let offset = 1;
  const count = 200;
  const delay = 2500; // Delay to prevent hitting rate limits

  try {
    while (true) {
      console.log(`[Codeforces] Fetching submissions for ${handle}, offset: ${offset}`);
      const response = await axios.get(`${CODEFORCES_API_BASE_URL}/user.status?handle=${handle}&from=${offset}&count=${count}`);
      // console.log(`[Codeforces] Raw API Response for ${handle}, offset ${offset}:`, JSON.stringify(response.data, null, 2)); // Keep for debug

      if (response.data.status === 'FAILED') {
        throw new Error(response.data.comment);
      }

      const submissions = response.data.result;
      if (!submissions || submissions.length === 0) {
        console.log(`[Codeforces] No more submissions found for ${handle} starting from offset ${offset}.`);
        break;
      }

      allSubmissions.push(...submissions);

      if (submissions.length < count) {
        break; // Fetched less than count, so must be end
      }

      offset += count;
      await new Promise(resolve => setTimeout(resolve, delay)); // Wait before next page
    }

    const solvedProblemsMap = new Map();
    allSubmissions.forEach(sub => {
      // Only consider 'OK' (Accepted) verdict and unique problems
      if (sub.verdict === 'OK' && sub.problem && !solvedProblemsMap.has(sub.problem.name)) {
        solvedProblemsMap.set(sub.problem.name, {
          problem_name: sub.problem.name,
          platform: 'Codeforces',
          difficulty: sub.problem.rating ? `${sub.problem.rating}` : sub.problem.tags?.join(', ') || 'Unknown',
          problem_url: `https://codeforces.com/problemset/problem/${sub.problem.contestId}/${sub.problem.index}`,
          date_solved: new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0],
        });
      }
    });

    const problems = Array.from(solvedProblemsMap.values());

    if (allSubmissions.length > 0 && problems.length === 0) {
      console.log(`[Codeforces] User ${handle} has ${allSubmissions.length} total submissions, but 0 accepted problems found.`);
    } else if (allSubmissions.length === 0) {
      console.log(`[Codeforces] User ${handle} has no submissions found.`);
    }

    console.log(`[Codeforces] Fetched ${problems.length} unique solved problems for ${handle}.`);
    return problems;

  } catch (error) {
    console.error(`[Codeforces] Error fetching problems for ${handle}:`, error.message);
    // ... (rest of error logging)
    return []; // Return empty array on error
  }
}

// --- API Endpoints ---

// NEW: Helper function to perform the actual sync of problems to Supabase
async function performProblemSync(user_id, user_metadata_profiles) {
  let syncedCount = 0;
  let errors = [];
  let warnings = [];
  let allProblemsToUpsert = [];

  const { leetcode_url, geeksforgeeks_username, codeforces_handle } = user_metadata_profiles;

  // --- LeetCode Sync ---
  if (leetcode_url) {
    const leetcodeUsername = leetcode_url.split('/').filter(Boolean).pop();
    if (leetcodeUsername) {
      try {
        const leetCodeData = await getLeetCodePublicProfileData(leetcodeUsername);
        if (leetCodeData && leetCodeData.problems && leetCodeData.problems.length > 0) {
          allProblemsToUpsert.push(...leetCodeData.problems);
          console.log(`[Sync] Prepared ${leetCodeData.problems.length} LeetCode problems.`);
        } else {
          warnings.push(`LeetCode: No solved problems found or profile inaccessible for ${leetcodeUsername}.`);
        }
      } catch (e) {
        errors.push(`LeetCode: ${e.message}`);
      }
    } else {
      warnings.push("Invalid LeetCode URL provided. Could not extract username.");
    }
  }

  // --- GeeksforGeeks Sync ---
  if (geeksforgeeks_username) {
    try {
      const gfgProblems = await getGeeksforGeeksSolvedProblems(geeksforgeeks_username);
      if (gfgProblems && gfgProblems.length > 0) {
        allProblemsToUpsert.push(...gfgProblems);
        console.log(`[Sync] Prepared ${gfgProblems.length} GFG problems.`);
      } else {
        warnings.push(`GeeksforGeeks: No solved problems found for ${geeksforgeeks_username}.`);
      }
    } catch (e) {
      errors.push(`GeeksforGeeks: ${e.message}`);
    }
  }

  // --- Codeforces Sync ---
  if (codeforces_handle) {
    try {
      const cfProblems = await getCodeforcesSolvedProblems(codeforces_handle);
      if (cfProblems && cfProblems.length > 0) {
        allProblemsToUpsert.push(...cfProblems);
        console.log(`[Sync] Prepared ${cfProblems.length} Codeforces problems.`);
      } else {
        warnings.push(`Codeforces: No solved problems found for ${codeforces_handle}.`);
      }
    } catch (e) {
      errors.push(`Codeforces: ${e.message}`);
    }
  }

  // --- Upsert all prepared problems to Supabase ---
  if (allProblemsToUpsert.length > 0) {
    for (const p of allProblemsToUpsert) {
      try {
        const dateSolved = p.date_solved && p.date_solved !== 'Unknown' ? p.date_solved : new Date().toISOString().split('T')[0];

        const { data, error } = await supabase.from('user_problems').upsert({
          user_id: user_id,
          problem_name: p.problem_name,
          platform: p.platform,
          difficulty: p.difficulty,
          problem_url: p.problem_url,
          date_solved: dateSolved,
          synced_at: new Date().toISOString()
        }, { onConflict: 'user_id, platform, problem_url' }); // Unique constraint based on problem details

        if (error) {
          errors.push(`Failed to save problem ${p.problem_name} (${p.platform}) to Supabase: ${error.message}`);
        } else {
          syncedCount++;
        }
      } catch (e) {
        errors.push(`Unexpected error saving problem ${p.problem_name} (${p.platform}): ${e.message}`);
      }
    }
  } else {
    if (errors.length === 0) {
      warnings.push("No new problems found to sync from the provided profiles.");
    }
  }

  return { syncedCount, errors, warnings };
}

// Existing GET endpoint for LeetCode public profile data
app.get('/api/leetcode-public-profile', async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }

  try {
    const leetCodeProfile = await getLeetCodePublicProfileData(username);
    return res.status(200).json(leetCodeProfile.userProfile);
  } catch (error) {
    console.error(`[Backend Proxy] Error fetching LeetCode public profile for ${username}:`, error.message);
    return res.status(500).json({
      message: `Failed to fetch LeetCode public profile: ${error.message}`,
      detail: error.message
    });
  }
});

// REMOVED: The old /api/sync_problems POST endpoint is no longer needed
// as sync is integrated into /api/user_problems GET.

// MODIFIED: GET endpoint to fetch user's problems from Supabase,
// now also triggers sync based on user's linked profiles
app.get('/api/user_problems', async (req, res) => {
  const user_id = req.query.user_id;

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    // 1. Get user's linked profiles from user_metadata
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);

    if (userError) {
      console.error("Error fetching user metadata for sync:", userError.message);
      // Continue without sync if user metadata can't be fetched, just return existing problems
    }

    let user_metadata_profiles = {};
    if (userData && userData.user && userData.user.user_metadata) {
      user_metadata_profiles = userData.user.user_metadata;
    }

    // 2. Perform the sync for all linked platforms
    // Note: This runs every time problems are fetched. Consider adding rate limiting
    // or a 'last_synced_at' check if this becomes too frequent/heavy.
    console.log(`[Sync Trigger] Attempting sync for user ${user_id}...`);
    const syncResult = await performProblemSync(user_id, user_metadata_profiles);
    console.log(`[Sync Trigger] Sync result for user ${user_id}:`, syncResult);

    // 3. Fetch all problems (including newly synced ones) from Supabase
    const { data, error } = await supabase.from('user_problems')
      .select('*')
      .eq('user_id', user_id)
      .order('date_solved', { ascending: false }); // Order by date solved (most recent first)

    if (error) {
      throw new Error(error.message);
    }

    return res.status(200).json(data); // Send all problems back to the frontend
  } catch (err) {
    console.error("Error in /api/user_problems (sync or fetch):", err);
    return res.status(500).json({ message: `Error processing problems: ${err.message}` });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});