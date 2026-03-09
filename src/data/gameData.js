// XP and Leveling System
// coinReward: coins granted when a student reaches this level
export const LEVELS = [
  { level: 1, title: 'Rookie', xpRequired: 0, color: 'text-slate-400', coinReward: 0 },
  { level: 2, title: 'Apprentice', xpRequired: 200, color: 'text-green-400', coinReward: 25 },
  { level: 3, title: 'Challenger', xpRequired: 500, color: 'text-blue-400', coinReward: 50 },
  { level: 4, title: 'Warrior', xpRequired: 900, color: 'text-purple-400', coinReward: 75 },
  { level: 5, title: 'Champion', xpRequired: 1400, color: 'text-yellow-400', coinReward: 100 },
  { level: 6, title: 'Master', xpRequired: 2000, color: 'text-orange-400', coinReward: 125 },
  { level: 7, title: 'Legend', xpRequired: 2800, color: 'text-red-400', coinReward: 150 },
  { level: 8, title: 'Mythic', xpRequired: 3800, color: 'text-pink-400', coinReward: 200 },
];

export const XP_REWARDS = {
  'Low Tech': 100,
  'High Tech': 150,
  'Self-Reflection': 120,
  'Collaboration': 130,
  dailyBonus: 50,
  streakBonus: 25,
  bossChallenge: 300,
  mysteryBox: 75,
};

// Achievement Badges
export const ACHIEVEMENTS = [
  { id: 'first_mission', title: 'First Mission', desc: 'Complete your first activity', icon: '🚀', xpReward: 50 },
  { id: 'variety_pack', title: 'Variety Pack', desc: 'Try one activity from each path', icon: '🎨', xpReward: 100 },
  { id: 'streak_3', title: 'On Fire', desc: 'Complete activities 3 days in a row', icon: '🔥', xpReward: 75 },
  { id: 'streak_5', title: 'Streak Master', desc: 'Complete activities 5 days in a row', icon: '⚡', xpReward: 150 },
  { id: 'streak_10', title: 'Unstoppable', desc: '10 day streak!', icon: '💎', xpReward: 300 },
  { id: 'collab_3', title: 'Team Player', desc: 'Complete 3 Collaboration activities', icon: '🤝', xpReward: 100 },
  { id: 'creator_5', title: 'Creator Elite', desc: 'Complete 5 Creator path activities', icon: '🎬', xpReward: 150 },
  { id: 'wordsmith_5', title: 'Word Wizard', desc: 'Complete 5 Wordsmith activities', icon: '📚', xpReward: 150 },
  { id: 'data_5', title: 'Data Champion', desc: 'Complete 5 Data Scientist activities', icon: '📊', xpReward: 150 },
  { id: 'level_5', title: 'Rising Star', desc: 'Reach Level 5', icon: '⭐', xpReward: 200 },
  { id: 'boss_slayer', title: 'Boss Slayer', desc: 'Complete your first Boss Challenge', icon: '👑', xpReward: 200 },
  { id: 'lucky_draw', title: 'Lucky Draw', desc: 'Open 5 Mystery Boxes', icon: '🎁', xpReward: 100 },
  { id: 'guild_hero', title: 'Guild Hero', desc: 'Contribute 500 XP to your guild', icon: '🛡️', xpReward: 150 },
  { id: 'completionist', title: 'Completionist', desc: 'Complete all 6 regular activities', icon: '🏆', xpReward: 250 },
];

// Team Guilds
export const GUILDS = [
  { id: 'dragons', name: 'Fire Dragons', color: 'bg-red-600', emoji: '🐉', motto: 'Burn bright, learn fast!' },
  { id: 'wolves', name: 'Shadow Wolves', color: 'bg-purple-600', emoji: '🐺', motto: 'Together we hunt knowledge!' },
  { id: 'phoenix', name: 'Golden Phoenix', color: 'bg-yellow-600', emoji: '🦅', motto: 'Rise from every challenge!' },
  { id: 'sharks', name: 'Ocean Sharks', color: 'bg-blue-600', emoji: '🦈', motto: 'Dive deep into learning!' },
];

// Guild Hall Trophy Types (awarded by teachers to guilds)
export const GUILD_TROPHIES = [
  { id: 'gt_teamwork', title: 'Teamwork Trophy', icon: '🤝', desc: 'Outstanding collaboration' },
  { id: 'gt_knowledge', title: 'Knowledge Cup', icon: '📚', desc: 'Exceptional learning' },
  { id: 'gt_creativity', title: 'Creativity Award', icon: '🎨', desc: 'Most creative guild' },
  { id: 'gt_streak', title: 'Streak Flame', icon: '🔥', desc: 'Best streak consistency' },
  { id: 'gt_champion', title: 'Champion Shield', icon: '🛡️', desc: 'Weekly challenge champion' },
  { id: 'gt_mvp', title: 'MVP Crown', icon: '👑', desc: 'Most valuable guild' },
  { id: 'gt_rising', title: 'Rising Star', icon: '🌟', desc: 'Most improved guild' },
  { id: 'gt_spirit', title: 'Spirit Award', icon: '💫', desc: 'Best guild spirit' },
];

// Guild Hall Banner Themes
export const GUILD_BANNERS = [
  { id: 'default', name: 'Classic', desc: 'The default guild banner' },
  { id: 'flames', name: 'Flames', desc: 'A fiery banner of determination' },
  { id: 'stars', name: 'Starfield', desc: 'A cosmic banner of knowledge' },
  { id: 'forest', name: 'Enchanted Forest', desc: 'A nature-themed banner' },
  { id: 'ocean', name: 'Deep Ocean', desc: 'An aquatic banner of mystery' },
  { id: 'crystal', name: 'Crystal Cave', desc: 'A sparkling crystalline banner' },
];

// Guild Challenges (weekly goals for entire guild)
export const GUILD_CHALLENGES = [
  { id: 'gc1', title: 'Knowledge Blitz', desc: 'Guild members complete 10 activities total', target: 10, type: 'activities', reward: 100, emoji: '⚔️' },
  { id: 'gc2', title: 'Streak Squad', desc: '3 guild members maintain a 3+ day streak', target: 3, type: 'streakers', reward: 150, emoji: '🔥' },
  { id: 'gc3', title: 'Path Masters', desc: 'Guild members complete activities from all 3 paths', target: 3, type: 'paths', reward: 125, emoji: '🗺️' },
  { id: 'gc4', title: 'Boss Rush', desc: '2 guild members defeat the weekly boss', target: 2, type: 'bosses', reward: 200, emoji: '👹' },
];

// Avatar Items
// Rendering is handled by the Avatar3D component based on item IDs.
// IDs are kept stable for backward compatibility with existing save data.
export const AVATAR_ITEMS = {
  colors: [
    { id: 'default', name: 'Ocean Blue', cost: 0 },
    { id: 'green', name: 'Forest Green', cost: 50 },
    { id: 'purple', name: 'Royal Purple', cost: 50 },
    { id: 'red', name: 'Fire Red', cost: 75 },
    { id: 'yellow', name: 'Golden', cost: 100 },
    { id: 'pink', name: 'Bubblegum', cost: 75 },
    { id: 'rainbow', name: 'Rainbow', cost: 200 },
  ],
  hats: [
    { id: 'none', name: 'No Hat', cost: 0 },
    { id: 'cap', name: 'Baseball Cap', cost: 50 },
    { id: 'crown', name: 'Royal Crown', cost: 150 },
    { id: 'wizard', name: 'Wizard Hat', cost: 100 },
    { id: 'party', name: 'Party Hat', cost: 75 },
    { id: 'headphones', name: 'Headphones', cost: 100 },
  ],
  accessories: [
    { id: 'none', name: 'None', cost: 0 },
    { id: 'glasses', name: 'Cool Shades', cost: 50 },
    { id: 'star', name: 'Star Badge', cost: 75 },
    { id: 'fire', name: 'Fire Aura', cost: 100 },
    { id: 'sparkle', name: 'Sparkles', cost: 125 },
    { id: 'lightning', name: 'Lightning Bolt', cost: 150 },
  ],
  faces: [
    { id: 'happy', name: 'Happy', cost: 0 },
    { id: 'cool', name: 'Cool', cost: 25 },
    { id: 'excited', name: 'Excited', cost: 50 },
    { id: 'determined', name: 'Determined', cost: 50 },
    { id: 'smart', name: 'Smart', cost: 75 },
    { id: 'ninja', name: 'Ninja', cost: 100 },
  ],
};

// Daily Quests (rotate based on day)
export const DAILY_QUESTS = [
  { id: 'dq1', title: 'Voice Master', desc: 'Complete a High Tech activity', targetType: 'High Tech', multiplier: 2 },
  { id: 'dq2', title: 'Artistic Soul', desc: 'Complete a Low Tech activity', targetType: 'Low Tech', multiplier: 2 },
  { id: 'dq3', title: 'Team Spirit', desc: 'Complete a Collaboration activity', targetType: 'Collaboration', multiplier: 2 },
  { id: 'dq4', title: 'Self Discovery', desc: 'Complete a Self-Reflection activity', targetType: 'Self-Reflection', multiplier: 2 },
  { id: 'dq5', title: 'Word Warrior', desc: 'Complete any Wordsmith activity', targetPath: 'path1', multiplier: 1.5 },
  { id: 'dq6', title: 'Data Explorer', desc: 'Complete any Data Scientist activity', targetPath: 'path2', multiplier: 1.5 },
  { id: 'dq7', title: 'Creative Genius', desc: 'Complete any Creator activity', targetPath: 'path3', multiplier: 1.5 },
];

// Weekly Boss Challenges
export const BOSS_CHALLENGES = [
  {
    id: 'boss1',
    name: 'The Vocabulary Dragon',
    desc: 'Create a vocabulary comic strip that tells a story using 5 unit words!',
    requirements: 'Combine drawing skills with vocabulary knowledge',
    totalHP: 1000,
    reward: 300,
    steps: [
      'Plan your comic with 4-6 panels',
      'Include at least 5 vocabulary words in speech bubbles',
      'Draw characters and scenes that show word meanings',
      'Add a title and your name as the author',
    ],
  },
  {
    id: 'boss2',
    name: 'The Data Kraken',
    desc: 'Interview 3 classmates about their learning strategies and create a data report!',
    requirements: 'Combine collaboration with data analysis',
    totalHP: 1000,
    reward: 300,
    steps: [
      'Create 3 interview questions about study habits',
      'Interview 3 different classmates',
      'Organize their answers into a chart or graph',
      'Write 2 conclusions based on your data',
    ],
  },
  {
    id: 'boss3',
    name: 'The Tutorial Titan',
    desc: 'Create a mini-series of 3 short tutorial videos teaching different concepts!',
    requirements: 'Combine teaching skills with video creation',
    totalHP: 1000,
    reward: 300,
    steps: [
      'Choose 3 related topics from recent lessons',
      'Write a script for each 30-second video',
      'Record all 3 tutorials with clear explanations',
      'Add an intro that connects all 3 videos',
    ],
  },
];

// Mystery Box Rewards
export const MYSTERY_REWARDS = [
  { id: 'xp_small', name: 'XP Boost', desc: '+50 XP', type: 'xp', value: 50, rarity: 'common', color: 'text-green-400' },
  { id: 'xp_medium', name: 'XP Surge', desc: '+100 XP', type: 'xp', value: 100, rarity: 'uncommon', color: 'text-blue-400' },
  { id: 'xp_large', name: 'XP Jackpot', desc: '+200 XP', type: 'xp', value: 200, rarity: 'rare', color: 'text-purple-400' },
  { id: 'coins_small', name: 'Coin Pouch', desc: '+25 Coins', type: 'coins', value: 25, rarity: 'common', color: 'text-yellow-400' },
  { id: 'coins_medium', name: 'Coin Chest', desc: '+50 Coins', type: 'coins', value: 50, rarity: 'uncommon', color: 'text-yellow-400' },
  { id: 'coins_large', name: 'Treasure Trove', desc: '+100 Coins', type: 'coins', value: 100, rarity: 'rare', color: 'text-yellow-400' },
  { id: 'streak_shield', name: 'Streak Shield', desc: 'Protects your streak for 1 day', type: 'item', value: 'streak_shield', rarity: 'rare', color: 'text-orange-400' },
  { id: 'double_xp', name: 'Double XP Token', desc: 'Next activity gives 2x XP', type: 'item', value: 'double_xp', rarity: 'epic', color: 'text-pink-400' },
];

// Learning Paths (activities)
export const LEARNING_PATHS = [
  {
    id: 'path1',
    title: 'The Wordsmith',
    subtitle: 'Vocabulary Quest',
    icon: 'Mic',
    color: 'bg-blue-600',
    options: [
      {
        id: '1a',
        title: 'Voice Battle',
        desc: 'Record yourself defining 5 unit words.',
        type: 'High Tech',
        xp: 150,
        steps: [
          "Open your voice recording tool (like Vocaroo or Mote).",
          "Read the word clearly, then explain it in your own words.",
          "Use the 'Pro Tip' below to earn extra XP!",
          "Submit the link to your teacher."
        ],
        proTip: "Try to use the word in a sentence about your favorite video game for a bonus!"
      },
      {
        id: '1b',
        title: 'Word Sketch',
        desc: 'Draw a visual representation of 3 complex terms.',
        type: 'Low Tech',
        xp: 100,
        steps: [
          "Grab a blank piece of paper and divide it into three sections.",
          "Write the vocabulary word at the top of each section.",
          "Draw a picture that shows the word's meaning without using letters.",
          "Write one sentence underneath explaining your drawing."
        ],
        proTip: "Use colors that match the 'mood' of the word (e.g., bright colors for 'energetic')."
      }
    ]
  },
  {
    id: 'path2',
    title: 'The Data Scientist',
    subtitle: 'Progress Mission',
    icon: 'BarChart3',
    color: 'bg-purple-600',
    options: [
      {
        id: '2a',
        title: 'Goal Tracker',
        desc: 'Update your Lexia/Math chart.',
        type: 'Self-Reflection',
        xp: 120,
        steps: [
          "Open your data folder and find your progress chart.",
          "Check your minutes/units for this week.",
          "Color in your progress bar to show where you are.",
          "Identify one 'Power Move' (a specific action) to reach your goal by Friday."
        ],
        proTip: "A Power Move is specific, like 'I will complete 2 units before lunch.'"
      },
      {
        id: '2b',
        title: 'Peer Interview',
        desc: 'Ask a friend how they beat a hard level today.',
        type: 'Collaboration',
        xp: 130,
        steps: [
          "Find a partner who has finished their 'Must-Do' work.",
          "Ask: 'What was the hardest part of your work today, and how did you push through?'",
          "Write down or record their strategy.",
          "Thank your partner for the 'Pro Tip'!"
        ],
        proTip: "Listen for 'Growth Mindset' words like 'practiced,' 'tried again,' or 'focused.'"
      }
    ]
  },
  {
    id: 'path3',
    title: 'The Creator',
    subtitle: 'Expression Boss',
    icon: 'Palette',
    color: 'bg-orange-600',
    options: [
      {
        id: '3a',
        title: 'Tutorial Video',
        desc: 'Film a 60-second "How-To" for a 4th grader.',
        type: 'High Tech',
        xp: 150,
        steps: [
          "Choose a topic from today's lesson that you understand well.",
          "Write a 3-sentence script: Hook, Explanation, and Summary.",
          "Record your video using a camera or screen-recording tool.",
          "Make sure your voice is clear and you show examples!"
        ],
        proTip: "Imagine you are a YouTuber! Start with an exciting intro."
      },
      {
        id: '3b',
        title: 'Boss Map',
        desc: 'Sketch the steps to solve a big problem.',
        type: 'Low Tech',
        xp: 100,
        steps: [
          "Identify the 'Final Boss' (the hardest problem in the unit).",
          "Draw a 'Map' that shows the path to solving it.",
          "Include 'Checkpoints' for each step of the work.",
          "Label any 'Traps' (common mistakes) to avoid!"
        ],
        proTip: "Make it look like a real game map with start and finish lines."
      }
    ]
  }
];
