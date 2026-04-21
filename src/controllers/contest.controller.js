// src/controllers/contest.controller.js
const axios = require('axios');

// In-memory cache variables
let cachedContests = null;
let lastFetchTime = null;
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour

//Hepler Function Codeforces
async function fetchCodeforcesContests() {
    try {
        const response = await axios.get('https://codeforces.com/api/contest.list');

        if (response.data.status !== 'OK') {
            throw new Error('Failed to fetch Codeforces contests');
        }

        // Filter only active contests (phase === "BEFORE")
        const activeContests = response.data.result
            .filter(contest => contest.phase === 'BEFORE')
            .map(contest => ({
                platform: 'Codeforces',
                name: contest.name,
                startTimeUnix: contest.startTimeSeconds,
                startTime: new Date(contest.startTimeSeconds * 1000).toISOString(),
                durationSeconds: contest.durationSeconds,
                duration: `${Math.floor(contest.durationSeconds / 3600)} hours ${(contest.durationSeconds % 3600) / 60} minutes`,
                url: `https://codeforces.com/contests/${contest.id}`
            }));

        return activeContests;
    } catch (error) {
        console.error('Error fetching Codeforces contests:', error.message);
        return [];
    }
}


// Helper function to fetch LeetCode contests
async function fetchLeetcodeContests() {
    try {
        const graphqlQuery = {
            query: `
        query getContestList {
          allContests {
            title
            startTime
            duration
            titleSlug
          }
        }
      `
        };

        const response = await axios.post('https://leetcode.com/graphql', graphqlQuery, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const allContests = response.data.data.allContests;
        const now = Date.now();

        // Filter only active contests (start time is in the future)
        const activeContests = allContests
            .filter(contest => contest.startTime * 1000 > now)
            .map(contest => ({
                platform: 'LeetCode',
                name: contest.title,
                startTimeUnix: contest.startTime,
                startTime: new Date(contest.startTime * 1000).toISOString(),
                durationSeconds: contest.duration,
                duration: `${Math.floor(contest.duration / 3600)} hours ${(contest.duration % 3600) / 60} minutes`,
                url: `https://leetcode.com/contest/${contest.titleSlug}`
            }));

        return activeContests;
    } catch (error) {
        console.error('Error fetching LeetCode contests:', error.message);
        return [];
    }
}

async function fetchCodechefContests() {
    try {
        const response = await axios.get('https://www.codechef.com/api/list/contests/all');

        if (!response.data.future_contests) {
            throw new Error('Failed to fetch CodeChef contests');
        }

        const activeContests = response.data.future_contests.map(contest => ({
            platform: 'CodeChef',
            name: contest.contest_name,
            code: contest.contest_code,
            startTimeUnix: Math.floor(new Date(contest.contest_start_date).getTime() / 1000),
            startTime: new Date(contest.contest_start_date).toISOString(),
            endTime: new Date(contest.contest_end_date).toISOString(),
            duration: calculateDuration(contest.contest_start_date, contest.contest_end_date),
            url: `https://www.codechef.com/${contest.contest_code}`
        }));

        return activeContests;
    } catch (error) {
        console.error('Error fetching CodeChef contests:', error.message);
        return [];
    }
}

function calculateDuration(start, end) {
    const diff = new Date(end) - new Date(start);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} hours ${mins} minutes`;
}

exports.getUpcomingContests = async (req, res) => {
    try {
        // Check Cache first!
        const now = Date.now();
        if (cachedContests && lastFetchTime && (now - lastFetchTime < CACHE_DURATION_MS)) {
            return res.status(200).json({ source: 'cache', data: cachedContests });
        }

        // If cache is empty or expired, run the repo's functions
        const [codeforces, leetcode, codechef] = await Promise.all([
            fetchCodeforcesContests(),
            fetchLeetcodeContests(),
            fetchCodechefContests()
        ]);

        // Combine them into one giant array
        const combinedContests = [...codeforces, ...leetcode, ...codechef];

        // Sort them by start time
        combinedContests.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

        // Update the Cache
        cachedContests = combinedContests;
        lastFetchTime = now;

        res.status(200).json({ source: 'api', data: cachedContests });

    } catch (error) {
        console.error('Contest fetch error:', error);
        if (cachedContests) {
            return res.status(200).json({ source: 'stale_cache', data: cachedContests });
        }
        res.status(503).json({ message: 'Contests temporarily unavailable' });
    }
};