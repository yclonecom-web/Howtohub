/* Sample data ported from legacy js/app.js */

export const SAMPLE_CONTENT = [
  {
    id: 1,
    type: 'blog',
    title: 'Build a REST API with Node.js and Express',
    preview:
      'Learn how to create a production-ready REST API from scratch using Node.js, Express, and MongoDB with authentication and error handling.',
    author: { name: 'Alex Chen', username: 'alexchen', initials: 'AC' },
    tags: ['Tech', 'Education'],
    likes: 342,
    comments: [
      {
        author: 'Sarah M.',
        initials: 'SM',
        text: "This was incredibly helpful! Got my API running in under an hour.",
        time: '2 hours ago',
      },
      {
        author: 'Dev K.',
        initials: 'DK',
        text: 'Great tutorial. Would love to see a part 2 on deployment.',
        time: '5 hours ago',
      },
    ],
    views: 2840,
    date: '2025-12-15',
    pinned: true,
    coverGradient: 'linear-gradient(135deg, #1E3A8A 0%, #22D3EE 100%)',
    coverIcon: 'monitor',
    coverImage:
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1400',
    media: [],
    body: `
      <div class="step-block"><div class="step-number">Step 1 — Project Setup</div><p>Initialize your project with <code>npm init -y</code> and install dependencies: <code>npm install express mongoose dotenv cors helmet</code>. Create a clean folder structure with <code>/routes</code>, <code>/controllers</code>, <code>/models</code>, and <code>/middleware</code> directories.</p></div>
      <div class="step-block"><div class="step-number">Step 2 — Server Configuration</div><p>Create your <code>server.js</code> file. Set up Express with middleware for JSON parsing, CORS, and security headers using Helmet. Configure your MongoDB connection using Mongoose with proper error handling.</p></div>
      <div class="tip-block"><strong>Pro Tip:</strong> Always use environment variables for sensitive data like database URIs and JWT secrets. Never hardcode credentials in your source code.</div>
      <div class="step-block"><div class="step-number">Step 3 — Define Models</div><p>Create Mongoose schemas for your data. Define validation rules, default values, and virtual properties. Use pre-save hooks for password hashing and timestamps.</p></div>
      <div class="step-block"><div class="step-number">Step 4 — Build Routes & Controllers</div><p>Implement RESTful endpoints: GET for listing/reading, POST for creating, PUT/PATCH for updating, and DELETE for removing resources. Keep controllers thin by extracting business logic into service layers.</p></div>
      <div class="step-block"><div class="step-number">Step 5 — Add Authentication</div><p>Implement JWT-based authentication with login and registration endpoints. Create middleware to protect routes and verify tokens. Add role-based access control for admin operations.</p></div>
    `,
  },
  {
    id: 2,
    type: 'carousel',
    title: 'Design a Modern UI with Figma — Screens Walkthrough',
    preview:
      'A hands-on carousel walking through modern UI patterns: sidebar, cards, onboarding, and dashboard layouts.',
    author: { name: 'Maya Patel', username: 'mayaui', initials: 'MP' },
    tags: ['Design', 'Education'],
    likes: 518,
    comments: [],
    views: 4120,
    date: '2025-12-10',
    pinned: false,
    coverGradient: 'linear-gradient(135deg, #9D174D 0%, #F9A8D4 100%)',
    coverIcon: 'palette',
    coverImage:
      'https://images.unsplash.com/photo-1561070791-2526d30994b8?w=1400',
    direction: 'left',
    media: [
      'https://images.unsplash.com/photo-1561070791-2526d30994b8?w=1200',
      'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200',
      'https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200',
      'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=1200',
    ],
    body: '<p>Swipe through each screen for practical UI lessons — hierarchy, spacing, and motion.</p>',
  },
  {
    id: 3,
    type: 'video',
    title: 'Home Workshop Essentials — DIY Woodworking Setup',
    preview:
      'Watch a full walkthrough of the ultimate home workshop setup with tool recommendations, safety gear, and layout tips.',
    author: { name: 'Tom Builder', username: 'tombuilds', initials: 'TB' },
    tags: ['DIY'],
    likes: 276,
    comments: [],
    views: 1950,
    date: '2025-12-08',
    pinned: false,
    coverGradient: 'linear-gradient(135deg, #92400E 0%, #FCD34D 100%)',
    coverIcon: 'hammer',
    coverImage:
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=1400',
    media: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    body: '<p>Full video walkthrough. Follow along and build your workshop piece by piece.</p>',
  },
  {
    id: 4,
    type: 'blog',
    title: 'Master Python Data Analysis with Pandas',
    preview:
      "From DataFrames to visualizations — learn how to analyze, clean, and visualize data using Python's most powerful library.",
    author: { name: 'Dr. Kim Lee', username: 'datakimlee', initials: 'KL' },
    tags: ['Tech', 'Education'],
    likes: 891,
    comments: [],
    views: 7230,
    date: '2025-12-12',
    pinned: true,
    coverGradient: 'linear-gradient(135deg, #065F46 0%, #6EE7B7 100%)',
    coverIcon: 'bar-chart-3',
    coverImage:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400',
    media: [],
    body: `
      <div class="step-block"><div class="step-number">Step 1 — Environment Setup</div><p>Install Python 3.10+ and create a virtual environment. Install pandas, numpy, matplotlib, and seaborn. Use Jupyter notebooks for interactive exploration.</p></div>
      <div class="step-block"><div class="step-number">Step 2 — DataFrames 101</div><p>Learn to create DataFrames from CSV, JSON, and SQL. Understand indexing with .loc and .iloc. Master selecting, filtering, and sorting data efficiently.</p></div>
      <div class="tip-block"><strong>Pro Tip:</strong> Use <code>df.info()</code> and <code>df.describe()</code> as your first commands when exploring any new dataset.</div>
    `,
  },
  {
    id: 5,
    type: 'image',
    title: 'Italian Pasta from Scratch — A Single Perfect Shot',
    preview: 'One-shot reference photo of fresh handmade pasta ready for the pot.',
    author: { name: 'Chef Rosa', username: 'chefrosacooks', initials: 'CR' },
    tags: ['Cooking'],
    likes: 1204,
    comments: [],
    views: 9150,
    date: '2025-12-14',
    pinned: false,
    coverGradient: 'linear-gradient(135deg, #991B1B 0%, #FCA5A5 100%)',
    coverIcon: 'utensils',
    coverImage:
      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1400',
    media: [
      'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=1400',
    ],
    body: '<p>Fresh fettuccine hand-rolled with 00 flour and eggs, dusted with semolina and ready for the boil.</p>',
  },
  {
    id: 6,
    type: 'audio',
    title: '30-Day Home Fitness Plan — Audio Briefing',
    preview:
      'Listen to a 5-minute audio briefing on the progressive 30-day bodyweight plan before you begin.',
    author: { name: 'Coach Jay', username: 'coachjfit', initials: 'CJ' },
    tags: ['Fitness'],
    likes: 654,
    comments: [],
    views: 5340,
    date: '2025-12-11',
    pinned: false,
    coverGradient: 'linear-gradient(135deg, #3730A3 0%, #A5B4FC 100%)',
    coverIcon: 'dumbbell',
    coverImage:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1400',
    media: [
      'https://www.w3schools.com/html/horse.mp3',
    ],
    body: '<p>Press play, set your intention, and begin Week 1.</p>',
  },
  {
    id: 7,
    type: 'document',
    title: 'Personal Finance 101 — Printable Workbook',
    preview:
      'A printable workbook covering budgeting, emergency fund planning, and beginner investing.',
    author: { name: 'Finance Fiona', username: 'fionafinance', initials: 'FF' },
    tags: ['Finance', 'Education'],
    likes: 432,
    comments: [],
    views: 3670,
    date: '2025-12-09',
    pinned: false,
    coverGradient: 'linear-gradient(135deg, #047857 0%, #6EE7B7 100%)',
    coverIcon: 'wallet',
    coverImage:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1400',
    direction: 'left',
    media: [
      'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    ],
    body: '<p>Print the workbook and complete each section at your own pace.</p>',
  },
];

export const SAMPLE_USERS = [
  { name: 'Alex Chen', username: 'alexchen', initials: 'AC', bio: 'Full-stack developer & educator. Building the web, one tutorial at a time.', followers: 12400, following: 342, posts: 28 },
  { name: 'Maya Patel', username: 'mayaui', initials: 'MP', bio: 'UI/UX Designer. Making the world more beautiful, one pixel at a time.', followers: 8900, following: 567, posts: 15 },
  { name: 'Tom Builder', username: 'tombuilds', initials: 'TB', bio: "DIY enthusiast & maker. If it can be built, I'll show you how.", followers: 5600, following: 234, posts: 22 },
  { name: 'Dr. Kim Lee', username: 'datakimlee', initials: 'KL', bio: 'Data scientist & professor. Turning numbers into stories.', followers: 15200, following: 189, posts: 31 },
  { name: 'Chef Rosa', username: 'chefrosacooks', initials: 'CR', bio: "Italian chef. Sharing Nonna's recipes with the world.", followers: 23400, following: 412, posts: 45 },
  { name: 'Coach Jay', username: 'coachjfit', initials: 'CJ', bio: 'Certified personal trainer. Your fitness journey starts here.', followers: 9800, following: 278, posts: 19 },
  { name: 'Finance Fiona', username: 'fionafinance', initials: 'FF', bio: 'Financial advisor. Making money management simple and accessible.', followers: 7300, following: 156, posts: 24 },
];

export const CURRENT_USER_DEFAULT = {
  name: 'You',
  username: 'currentuser',
  initials: 'YU',
  bio: 'Exploring, learning, and creating on HowToHub.',
  followers: 128,
  following: 45,
  posts: 3,
};

export const TAG_OPTIONS = ['Tech', 'Design', 'DIY', 'Education', 'Cooking', 'Fitness', 'Finance'];
