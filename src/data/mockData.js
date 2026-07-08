// Mock data model for users and activities

export const ACTIVITIES = [
  { id: 1, name: 'Homework', points: 50, icon: '📚', frequency: 'daily' },
  { id: 2, name: 'Piano', points: 50, icon: '🎹', frequency: 'daily' },
  { id: 3, name: 'Reading', points: 50, icon: '📖', frequency: 'weekly' },
];

export const REWARDS = [
  { id: 1, name: '30 Minutes of Games', cost: 100, icon: '🎮' },
  { id: 2, name: 'A Sweet Treat', cost: 75, icon: '🍦' },
  { id: 3, name: 'Watch a Movie', cost: 150, icon: '🎬' },
];

export const MOCK_USERS = [
  {
    username: 'casey',
    password: 'password123',
    avatar: '👩‍💻',
    activities: [
      { ...ACTIVITIES[0], completed: false, score: 0, completedAt: null },
      { ...ACTIVITIES[1], completed: false, score: 0, completedAt: null },
      { ...ACTIVITIES[2], completed: false, score: 0, completedAt: null },
    ],
    redeemedRewards: [],
    history: [],
    balance: 0,
  },
  {
    username: 'adrian',
    password: 'password123',
    avatar: '🎨',
    activities: [
      { ...ACTIVITIES[0], completed: false, score: 0, completedAt: null },
      { ...ACTIVITIES[1], completed: false, score: 0, completedAt: null },
      { ...ACTIVITIES[2], completed: false, score: 0, completedAt: null },
    ],
    redeemedRewards: [],
    history: [],
    balance: 0
  },
];

// Helper to find a user by username
export function findUser(username) {
  return MOCK_USERS.find((u) => u.username === username);
}

// Helper to get total possible points
export function getTotalPossiblePoints(activities) {
  return activities.reduce((sum, activity) => sum + activity.points, 0);
}

// Helper to get earned points
export function getEarnedPoints(activities) {
  return activities
    .filter((a) => a.completed)
    .reduce((sum, activity) => sum + activity.score, 0);
}

/**
 * Check if two dates are on the same calendar day.
 */
export const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

/**
 * Get the Monday (start) of the week for a given date.
 */
export const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

/**
 * Check if two dates are in the same week (Mon-Sun).
 */
export const isSameWeek = (date1, date2) => {
  return getWeekStart(date1).getTime() === getWeekStart(date2).getTime();
};

/**
 * Check if an activity can be completed based on its frequency.
 * Returns { canComplete: boolean, reason?: string, reset?: boolean }
 */
export const canCompleteActivity = (activity) => {
  if (!activity.completed) return { canComplete: true };

  const now = new Date();
  const completedDate = new Date(activity.completedAt);

  if (activity.frequency === 'daily') {
    if (isSameDay(now, completedDate)) {
      return { canComplete: false, reason: 'Already completed today' };
    }
    return { canComplete: true, reset: true };
  }

  if (activity.frequency === 'weekly') {
    if (isSameWeek(now, completedDate)) {
      return { canComplete: false, reason: 'Already completed this week' };
    }
    return { canComplete: true, reset: true };
  }

  return { canComplete: true };
};
