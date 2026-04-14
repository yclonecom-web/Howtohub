/* ============================================
   HOWTOHUB — Core Application Logic
   ============================================ */

// --- Sample Data ---
const SAMPLE_CONTENT = [
  {
    id: 1,
    title: "Build a REST API with Node.js and Express",
    preview: "Learn how to create a production-ready REST API from scratch using Node.js, Express, and MongoDB with authentication and error handling.",
    author: { name: "Alex Chen", username: "alexchen", initials: "AC" },
    tags: ["Tech", "Education"],
    likes: 342,
    comments: [
      { author: "Sarah M.", initials: "SM", text: "This was incredibly helpful! Got my API running in under an hour.", time: "2 hours ago" },
      { author: "Dev K.", initials: "DK", text: "Great tutorial. Would love to see a part 2 on deployment.", time: "5 hours ago" }
    ],
    views: 2840,
    date: "2025-12-15",
    pinned: true,
    coverGradient: "linear-gradient(135deg, #1E3A8A 0%, #22D3EE 100%)",
    coverIcon: "&#128187;",
    body: `
      <div class="step-block"><div class="step-number">Step 1 — Project Setup</div><p>Initialize your project with <code>npm init -y</code> and install dependencies: <code>npm install express mongoose dotenv cors helmet</code>. Create a clean folder structure with <code>/routes</code>, <code>/controllers</code>, <code>/models</code>, and <code>/middleware</code> directories.</p></div>
      <div class="step-block"><div class="step-number">Step 2 — Server Configuration</div><p>Create your <code>server.js</code> file. Set up Express with middleware for JSON parsing, CORS, and security headers using Helmet. Configure your MongoDB connection using Mongoose with proper error handling.</p></div>
      <div class="tip-block"><strong>Pro Tip:</strong> Always use environment variables for sensitive data like database URIs and JWT secrets. Never hardcode credentials in your source code.</div>
      <div class="step-block"><div class="step-number">Step 3 — Define Models</div><p>Create Mongoose schemas for your data. Define validation rules, default values, and virtual properties. Use pre-save hooks for password hashing and timestamps.</p></div>
      <div class="step-block"><div class="step-number">Step 4 — Build Routes & Controllers</div><p>Implement RESTful endpoints: GET for listing/reading, POST for creating, PUT/PATCH for updating, and DELETE for removing resources. Keep controllers thin by extracting business logic into service layers.</p></div>
      <div class="step-block"><div class="step-number">Step 5 — Add Authentication</div><p>Implement JWT-based authentication with login and registration endpoints. Create middleware to protect routes and verify tokens. Add role-based access control for admin operations.</p></div>
      <div class="warning-block"><strong>Security Note:</strong> Always hash passwords with bcrypt (cost factor 12+), validate input data, and implement rate limiting to prevent abuse.</div>
      <div class="step-block"><div class="step-number">Step 6 — Error Handling</div><p>Create a centralized error handler middleware. Define custom error classes for different HTTP status codes. Log errors in development and return clean messages in production.</p></div>
    `
  },
  {
    id: 2,
    title: "Design a Modern UI with Figma — Complete Guide",
    preview: "Master Figma from zero to hero. Learn components, auto-layout, prototyping, and design systems that scale across teams.",
    author: { name: "Maya Patel", username: "mayaui", initials: "MP" },
    tags: ["Design", "Education"],
    likes: 518,
    comments: [
      { author: "Jordan R.", initials: "JR", text: "Best Figma tutorial I've found! The auto-layout section saved me hours.", time: "1 day ago" },
      { author: "Lisa T.", initials: "LT", text: "The design system section is gold. Thank you!", time: "3 days ago" }
    ],
    views: 4120,
    date: "2025-12-10",
    pinned: false,
    coverGradient: "linear-gradient(135deg, #9D174D 0%, #F9A8D4 100%)",
    coverIcon: "&#127912;",
    body: `
      <div class="step-block"><div class="step-number">Step 1 — Figma Basics</div><p>Get familiar with the Figma interface: the toolbar, layers panel, properties panel, and canvas. Learn keyboard shortcuts that will speed up your workflow by 10x.</p></div>
      <div class="step-block"><div class="step-number">Step 2 — Frames & Auto Layout</div><p>Understand frames vs groups. Master auto-layout for responsive components that resize automatically. Learn padding, spacing, and alignment controls.</p></div>
      <div class="step-block"><div class="step-number">Step 3 — Components & Variants</div><p>Create reusable components with variants for different states (default, hover, active, disabled). Use component properties to make them flexible and maintainable.</p></div>
      <div class="tip-block"><strong>Pro Tip:</strong> Name your components with a slash convention like <code>Button/Primary/Large</code> to auto-organize them in the assets panel.</div>
      <div class="step-block"><div class="step-number">Step 4 — Design Systems</div><p>Build a complete design system with color tokens, typography scales, spacing systems, and component libraries. Document usage guidelines for team consistency.</p></div>
      <div class="step-block"><div class="step-number">Step 5 — Prototyping</div><p>Add interactions and animations. Create click-through prototypes with smart animate transitions. Test user flows and gather feedback before development.</p></div>
    `
  },
  {
    id: 3,
    title: "Home Workshop Essentials — DIY Woodworking Setup",
    preview: "Set up your perfect woodworking workshop at home. From essential tools to safety equipment, everything you need to start building.",
    author: { name: "Tom Builder", username: "tombuilds", initials: "TB" },
    tags: ["DIY"],
    likes: 276,
    comments: [
      { author: "Mike H.", initials: "MH", text: "Just set up my workshop following this guide. The tool recommendations were spot-on!", time: "4 hours ago" }
    ],
    views: 1950,
    date: "2025-12-08",
    pinned: false,
    coverGradient: "linear-gradient(135deg, #92400E 0%, #FCD34D 100%)",
    coverIcon: "&#128296;",
    body: `
      <div class="step-block"><div class="step-number">Step 1 — Choose Your Space</div><p>Find a well-ventilated area with at least 200 sq ft. Ensure adequate electrical outlets (20A circuits), good lighting, and a concrete or sealed floor for easy cleanup.</p></div>
      <div class="step-block"><div class="step-number">Step 2 — Essential Power Tools</div><p>Start with the big five: table saw, miter saw, drill press, random orbital sander, and a router. Invest in quality — these tools will last decades with proper maintenance.</p></div>
      <div class="warning-block"><strong>Safety First:</strong> Always wear safety glasses, hearing protection, and a dust mask. Install a dust collection system to keep your lungs and workspace clean.</div>
      <div class="step-block"><div class="step-number">Step 3 — Workbench Build</div><p>Build a sturdy workbench as your first project. Use 2x4 construction lumber for the base and a laminated hardwood or MDF top. Add bench dogs and a front vise for holding work pieces.</p></div>
      <div class="step-block"><div class="step-number">Step 4 — Hand Tools</div><p>Stock up on measuring tools (tape measure, combination square, marking gauge), hand saws, chisels, planes, and clamps. You can never have too many clamps.</p></div>
      <div class="step-block"><div class="step-number">Step 5 — Organization</div><p>Install French cleats on walls for modular tool storage. Build dedicated cabinets for small items. Label everything and create a system for returning tools to their place.</p></div>
    `
  },
  {
    id: 4,
    title: "Master Python Data Analysis with Pandas",
    preview: "From DataFrames to visualizations — learn how to analyze, clean, and visualize data using Python's most powerful library.",
    author: { name: "Dr. Kim Lee", username: "datakimlee", initials: "KL" },
    tags: ["Tech", "Education"],
    likes: 891,
    comments: [
      { author: "Raj P.", initials: "RP", text: "Finally understand pivot tables and groupby operations. Thank you!", time: "6 hours ago" },
      { author: "Anna S.", initials: "AS", text: "The visualization examples are beautiful. What library do you use?", time: "1 day ago" },
      { author: "Dr. Kim Lee", initials: "KL", text: "@Anna I use matplotlib + seaborn for most charts, plotly for interactive ones.", time: "1 day ago" }
    ],
    views: 7230,
    date: "2025-12-12",
    pinned: true,
    coverGradient: "linear-gradient(135deg, #065F46 0%, #6EE7B7 100%)",
    coverIcon: "&#128202;",
    body: `
      <div class="step-block"><div class="step-number">Step 1 — Environment Setup</div><p>Install Python 3.10+ and create a virtual environment. Install pandas, numpy, matplotlib, and seaborn. Use Jupyter notebooks for interactive exploration.</p></div>
      <div class="step-block"><div class="step-number">Step 2 — DataFrames 101</div><p>Learn to create DataFrames from CSV, JSON, and SQL. Understand indexing with .loc and .iloc. Master selecting, filtering, and sorting data efficiently.</p></div>
      <div class="step-block"><div class="step-number">Step 3 — Data Cleaning</div><p>Handle missing values with fillna() and dropna(). Fix data types, remove duplicates, and standardize string columns. Learn to use .apply() for custom transformations.</p></div>
      <div class="tip-block"><strong>Pro Tip:</strong> Use <code>df.info()</code> and <code>df.describe()</code> as your first commands when exploring any new dataset. They reveal data types, null counts, and statistical summaries instantly.</div>
      <div class="step-block"><div class="step-number">Step 4 — Aggregation & GroupBy</div><p>Master groupby operations, pivot tables, and cross-tabulations. Learn to chain multiple operations for complex analysis pipelines.</p></div>
      <div class="step-block"><div class="step-number">Step 5 — Visualization</div><p>Create bar charts, line plots, scatter plots, histograms, and heatmaps. Style your charts for publication quality with custom color palettes and annotations.</p></div>
    `
  },
  {
    id: 5,
    title: "Italian Pasta from Scratch — Nonna's Recipes",
    preview: "Learn authentic Italian pasta making from dough to sauce. Includes recipes for fettuccine, ravioli, and the perfect marinara.",
    author: { name: "Chef Rosa", username: "chefrosacooks", initials: "CR" },
    tags: ["Cooking"],
    likes: 1204,
    comments: [
      { author: "Paolo V.", initials: "PV", text: "This is exactly how my grandmother used to make it. Bellissimo!", time: "3 hours ago" },
      { author: "Emily K.", initials: "EK", text: "Made the fettuccine last night — my family was blown away!", time: "1 day ago" }
    ],
    views: 9150,
    date: "2025-12-14",
    pinned: false,
    coverGradient: "linear-gradient(135deg, #991B1B 0%, #FCA5A5 100%)",
    coverIcon: "&#127837;",
    body: `
      <div class="step-block"><div class="step-number">Step 1 — The Dough</div><p>Use 00 flour (or all-purpose), eggs, a pinch of salt, and a drizzle of olive oil. The ratio is 100g flour per egg. Knead for 10 minutes until smooth and elastic, then rest for 30 minutes.</p></div>
      <div class="step-block"><div class="step-number">Step 2 — Rolling & Cutting</div><p>Divide dough into portions. Roll each through a pasta machine, starting at the widest setting and gradually narrowing. For fettuccine, roll to setting 5 and cut into 6mm strips.</p></div>
      <div class="tip-block"><strong>Nonna's Secret:</strong> Dust your pasta generously with semolina flour (not regular flour) to prevent sticking. It adds a lovely texture too.</div>
      <div class="step-block"><div class="step-number">Step 3 — The Marinara</div><p>Start with quality San Marzano tomatoes. Sauté garlic in olive oil until fragrant (never brown), add crushed tomatoes, fresh basil, salt, and a pinch of sugar. Simmer 30-45 minutes.</p></div>
      <div class="step-block"><div class="step-number">Step 4 — Cooking Fresh Pasta</div><p>Boil in heavily salted water (it should taste like the sea). Fresh pasta cooks in just 2-3 minutes. Reserve a cup of pasta water before draining — it's liquid gold for sauces.</p></div>
      <div class="warning-block"><strong>Important:</strong> Never rinse your pasta after draining. The starch on the surface helps sauce cling to the noodles. Toss pasta directly into your sauce with a splash of pasta water.</div>
    `
  },
  {
    id: 6,
    title: "30-Day Home Fitness Plan — No Equipment Needed",
    preview: "Transform your body at home with this progressive 30-day bodyweight training plan. Includes warm-ups, workouts, and recovery tips.",
    author: { name: "Coach Jay", username: "coachjfit", initials: "CJ" },
    tags: ["Fitness"],
    likes: 654,
    comments: [
      { author: "Sam L.", initials: "SL", text: "Day 15 and already seeing results! The progressive overload approach is perfect.", time: "8 hours ago" }
    ],
    views: 5340,
    date: "2025-12-11",
    pinned: false,
    coverGradient: "linear-gradient(135deg, #3730A3 0%, #A5B4FC 100%)",
    coverIcon: "&#128170;",
    body: `
      <div class="step-block"><div class="step-number">Week 1 — Foundation</div><p>Build the basics with push-ups (3x10), squats (3x15), lunges (3x10 each leg), planks (3x30s), and glute bridges (3x15). Focus on perfect form over speed.</p></div>
      <div class="step-block"><div class="step-number">Week 2 — Progression</div><p>Increase volume: push-ups (4x12), squats (4x20), add pike push-ups (3x8), jump squats (3x10), and extend plank holds to 45 seconds.</p></div>
      <div class="tip-block"><strong>Recovery Tip:</strong> Sleep 7-9 hours. Drink at least 2L of water daily. On rest days, do light stretching or a 20-minute walk to promote recovery.</div>
      <div class="step-block"><div class="step-number">Week 3 — Intensity</div><p>Introduce supersets and circuit training. Combine upper and lower body exercises with minimal rest. Add burpees, mountain climbers, and single-leg exercises.</p></div>
      <div class="step-block"><div class="step-number">Week 4 — Peak Performance</div><p>Maximum intensity with HIIT sessions. Tabata-style workouts (20s work / 10s rest x 8 rounds). Test your progress by repeating the Week 1 exercises and noting improvements.</p></div>
    `
  },
  {
    id: 7,
    title: "Personal Finance 101 — Budgeting & Investing",
    preview: "Take control of your finances with proven budgeting strategies, emergency fund planning, and beginner-friendly investment approaches.",
    author: { name: "Finance Fiona", username: "fionafinance", initials: "FF" },
    tags: ["Finance", "Education"],
    likes: 432,
    comments: [
      { author: "Chris W.", initials: "CW", text: "The 50/30/20 rule breakdown was eye-opening. Already started my emergency fund!", time: "12 hours ago" },
      { author: "Nina G.", initials: "NG", text: "Finally an investing guide that doesn't try to sell me something. Bookmarked!", time: "2 days ago" }
    ],
    views: 3670,
    date: "2025-12-09",
    pinned: false,
    coverGradient: "linear-gradient(135deg, #047857 0%, #6EE7B7 100%)",
    coverIcon: "&#128176;",
    body: `
      <div class="step-block"><div class="step-number">Step 1 — Track Your Spending</div><p>For one month, record every expense. Categorize spending into needs, wants, and savings. Use a simple spreadsheet or budgeting app. Awareness is the first step to control.</p></div>
      <div class="step-block"><div class="step-number">Step 2 — The 50/30/20 Budget</div><p>Allocate 50% of after-tax income to needs (housing, food, transport), 30% to wants (dining, entertainment, hobbies), and 20% to savings and debt repayment.</p></div>
      <div class="step-block"><div class="step-number">Step 3 — Emergency Fund</div><p>Save 3-6 months of expenses in a high-yield savings account. Start with a $1,000 starter fund, then build gradually. This is your financial safety net — never invest it.</p></div>
      <div class="warning-block"><strong>Golden Rule:</strong> Pay yourself first. Set up automatic transfers to savings on payday before you have a chance to spend it.</div>
      <div class="step-block"><div class="step-number">Step 4 — Start Investing</div><p>Open a brokerage account. Start with broad index funds (S&P 500 or total market). Invest consistently regardless of market conditions — time in the market beats timing the market.</p></div>
      <div class="step-block"><div class="step-number">Step 5 — Eliminate High-Interest Debt</div><p>List all debts by interest rate. Pay minimums on everything, then throw extra money at the highest-rate debt first (avalanche method). Once paid off, redirect that payment to the next debt.</p></div>
    `
  },
  {
    id: 8,
    title: "CSS Grid & Flexbox — The Ultimate Layout Guide",
    preview: "Master modern CSS layouts with practical examples. Build responsive grids, flexible containers, and complex page layouts with ease.",
    author: { name: "Alex Chen", username: "alexchen", initials: "AC" },
    tags: ["Tech", "Design"],
    likes: 723,
    comments: [
      { author: "Dev K.", initials: "DK", text: "The grid-template-areas example blew my mind. So much cleaner than Bootstrap!", time: "3 hours ago" },
      { author: "Maya P.", initials: "MP", text: "Perfect reference guide. I keep coming back to this.", time: "5 days ago" }
    ],
    views: 5890,
    date: "2025-12-13",
    pinned: false,
    coverGradient: "linear-gradient(135deg, #1E3A8A 0%, #60A5FA 100%)",
    coverIcon: "&#128444;",
    body: `
      <div class="step-block"><div class="step-number">Part 1 — Flexbox Fundamentals</div><p>Understand the flex container and flex items. Master justify-content, align-items, and flex-wrap. Learn when to use flex-grow, flex-shrink, and flex-basis for responsive sizing.</p></div>
      <div class="step-block"><div class="step-number">Part 2 — CSS Grid Basics</div><p>Define grid containers with grid-template-columns and grid-template-rows. Use fr units for flexible sizing. Place items with grid-column and grid-row properties.</p></div>
      <div class="tip-block"><strong>Quick Rule:</strong> Use Flexbox for one-dimensional layouts (row OR column). Use Grid for two-dimensional layouts (rows AND columns simultaneously).</div>
      <div class="step-block"><div class="step-number">Part 3 — Grid Template Areas</div><p>Name areas of your grid for semantic, readable layouts. Use grid-template-areas to visually map your page structure. Perfect for complex page layouts and responsive redesigns.</p></div>
      <div class="step-block"><div class="step-number">Part 4 — Responsive Patterns</div><p>Combine Grid and Flexbox with media queries. Use minmax(), auto-fill, and auto-fit for intrinsically responsive grids. Build mobile-first layouts that adapt beautifully.</p></div>
    `
  },
  {
    id: 9,
    title: "Smart Home Automation on a Budget",
    preview: "Turn your home smart without breaking the bank. Learn to set up affordable automation with Raspberry Pi, smart plugs, and open-source software.",
    author: { name: "Tom Builder", username: "tombuilds", initials: "TB" },
    tags: ["Tech", "DIY"],
    likes: 389,
    comments: [
      { author: "Jake F.", initials: "JF", text: "Set up Home Assistant on my Pi following this guide. My wife thinks I'm a genius now!", time: "1 day ago" }
    ],
    views: 2980,
    date: "2025-12-06",
    pinned: false,
    coverGradient: "linear-gradient(135deg, #4338CA 0%, #22D3EE 100%)",
    coverIcon: "&#127968;",
    body: `
      <div class="step-block"><div class="step-number">Step 1 — Planning Your Setup</div><p>Start small. Pick one room or one automation goal. Map out what you want to control (lights, temperature, security) and what triggers you want (time, motion, voice).</p></div>
      <div class="step-block"><div class="step-number">Step 2 — Raspberry Pi Hub</div><p>Install Home Assistant on a Raspberry Pi 4. This open-source platform supports thousands of devices and integrations. It runs locally, so your data stays private.</p></div>
      <div class="step-block"><div class="step-number">Step 3 — Smart Plugs & Lights</div><p>Start with WiFi smart plugs ($8-15 each) and smart bulbs. Use Zigbee devices for reliability and lower latency. Set up schedules and automations through Home Assistant.</p></div>
      <div class="tip-block"><strong>Budget Tip:</strong> Zigbee devices are cheaper long-term and more reliable than WiFi devices. A Zigbee USB stick ($15) lets your Pi communicate with dozens of affordable sensors and switches.</div>
      <div class="step-block"><div class="step-number">Step 4 — Voice Control</div><p>Integrate with Google Home or Alexa for voice commands. Set up custom voice routines that trigger multiple automations at once ("Hey Google, good morning" → lights on, coffee maker starts, news plays).</p></div>
    `
  },
  {
    id: 10,
    title: "Photography Composition — Beyond the Rule of Thirds",
    preview: "Elevate your photography with advanced composition techniques. Learn leading lines, framing, symmetry, and how to break the rules effectively.",
    author: { name: "Maya Patel", username: "mayaui", initials: "MP" },
    tags: ["Design", "Education"],
    likes: 567,
    comments: [
      { author: "Photo Phil", initials: "PP", text: "The section on negative space changed how I see my shots. Incredible guide.", time: "2 days ago" },
      { author: "Lara M.", initials: "LM", text: "Would love to see a follow-up on lighting techniques!", time: "4 days ago" }
    ],
    views: 4560,
    date: "2025-12-04",
    pinned: false,
    coverGradient: "linear-gradient(135deg, #7C3AED 0%, #DDD6FE 100%)",
    coverIcon: "&#128247;",
    body: `
      <div class="step-block"><div class="step-number">Technique 1 — Leading Lines</div><p>Use roads, fences, rivers, or architectural elements to guide the viewer's eye through your image. Leading lines create depth and draw attention to your subject.</p></div>
      <div class="step-block"><div class="step-number">Technique 2 — Frame Within a Frame</div><p>Use doorways, windows, arches, or natural elements like tree branches to frame your subject. This adds depth and context while focusing attention.</p></div>
      <div class="step-block"><div class="step-number">Technique 3 — Negative Space</div><p>Give your subject room to breathe. Large areas of empty space can create powerful, minimalist compositions that evoke emotion and emphasize isolation or freedom.</p></div>
      <div class="tip-block"><strong>Creative Tip:</strong> Study paintings by masters like Vermeer, Caravaggio, and Hopper. Their composition techniques translate directly to photography.</div>
      <div class="step-block"><div class="step-number">Technique 4 — Breaking the Rules</div><p>Once you understand the rules, break them intentionally. Center your subject. Tilt the horizon. Cut off parts of your subject. Intentional rule-breaking creates dynamic, memorable images.</p></div>
    `
  }
];

const SAMPLE_USERS = [
  { name: "Alex Chen", username: "alexchen", initials: "AC", bio: "Full-stack developer & educator. Building the web, one tutorial at a time.", followers: 12400, following: 342, posts: 28 },
  { name: "Maya Patel", username: "mayaui", initials: "MP", bio: "UI/UX Designer. Making the world more beautiful, one pixel at a time.", followers: 8900, following: 567, posts: 15 },
  { name: "Tom Builder", username: "tombuilds", initials: "TB", bio: "DIY enthusiast & maker. If it can be built, I'll show you how.", followers: 5600, following: 234, posts: 22 },
  { name: "Dr. Kim Lee", username: "datakimlee", initials: "KL", bio: "Data scientist & professor. Turning numbers into stories.", followers: 15200, following: 189, posts: 31 },
  { name: "Chef Rosa", username: "chefrosacooks", initials: "CR", bio: "Italian chef. Sharing Nonna's recipes with the world.", followers: 23400, following: 412, posts: 45 },
  { name: "Coach Jay", username: "coachjfit", initials: "CJ", bio: "Certified personal trainer. Your fitness journey starts here.", followers: 9800, following: 278, posts: 19 },
  { name: "Finance Fiona", username: "fionafinance", initials: "FF", bio: "Financial advisor. Making money management simple and accessible.", followers: 7300, following: 156, posts: 24 }
];

// --- Current User ---
const CURRENT_USER = {
  name: "You",
  username: "currentuser",
  initials: "YU",
  bio: "Exploring, learning, and creating on HowToHub.",
  followers: 128,
  following: 45,
  posts: 3
};

// --- State Management ---
class AppState {
  constructor() {
    this.likes = this._load('howtohub_likes') || {};
    this.bookmarks = this._load('howtohub_bookmarks') || {};
    this.comments = this._load('howtohub_comments') || {};
    this.pins = this._load('howtohub_pins') || {};
    this.theme = localStorage.getItem('howtohub_theme') || 'light';
    this.userContent = this._load('howtohub_user_content') || [];
    this.viewHistory = this._load('howtohub_views') || {};
    this.following = this._load('howtohub_following') || {};
    this.notifications = this._load('howtohub_notifications') || { email: true, push: true, updates: false };
    this.privacy = this._load('howtohub_privacy') || { profilePublic: true, showActivity: true };
    this.applyTheme();
  }

  _load(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }

  _save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  toggleLike(contentId) {
    this.likes[contentId] = !this.likes[contentId];
    this._save('howtohub_likes', this.likes);
    return this.likes[contentId];
  }

  isLiked(contentId) {
    return !!this.likes[contentId];
  }

  toggleBookmark(contentId) {
    this.bookmarks[contentId] = !this.bookmarks[contentId];
    this._save('howtohub_bookmarks', this.bookmarks);
    return this.bookmarks[contentId];
  }

  isBookmarked(contentId) {
    return !!this.bookmarks[contentId];
  }

  addComment(contentId, text) {
    if (!this.comments[contentId]) this.comments[contentId] = [];
    const comment = {
      author: CURRENT_USER.name,
      initials: CURRENT_USER.initials,
      text: text,
      time: "Just now"
    };
    this.comments[contentId].push(comment);
    this._save('howtohub_comments', this.comments);
    return comment;
  }

  getComments(contentId) {
    const content = SAMPLE_CONTENT.find(c => c.id === contentId);
    const baseComments = content ? [...content.comments] : [];
    const userComments = this.comments[contentId] || [];
    return [...baseComments, ...userComments];
  }

  togglePin(contentId) {
    this.pins[contentId] = !this.pins[contentId];
    this._save('howtohub_pins', this.pins);
    return this.pins[contentId];
  }

  isPinned(contentId) {
    return !!this.pins[contentId];
  }

  recordView(contentId) {
    this.viewHistory[contentId] = (this.viewHistory[contentId] || 0) + 1;
    this._save('howtohub_views', this.viewHistory);
  }

  getViewCount(contentId) {
    const content = SAMPLE_CONTENT.find(c => c.id === contentId);
    const base = content ? content.views : 0;
    return base + (this.viewHistory[contentId] || 0);
  }

  toggleFollow(username) {
    this.following[username] = !this.following[username];
    this._save('howtohub_following', this.following);
    return this.following[username];
  }

  isFollowing(username) {
    return !!this.following[username];
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('howtohub_theme', this.theme);
    this.applyTheme();
    return this.theme;
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
  }

  setNotification(key, value) {
    this.notifications[key] = value;
    this._save('howtohub_notifications', this.notifications);
  }

  setPrivacy(key, value) {
    this.privacy[key] = value;
    this._save('howtohub_privacy', this.privacy);
  }

  addUserContent(content) {
    content.id = Date.now();
    content.author = { name: CURRENT_USER.name, username: CURRENT_USER.username, initials: CURRENT_USER.initials };
    content.likes = 0;
    content.comments = [];
    content.views = 0;
    content.date = new Date().toISOString().split('T')[0];
    content.coverGradient = `linear-gradient(135deg, hsl(${Math.random()*360}, 70%, 40%) 0%, hsl(${Math.random()*360}, 70%, 70%) 100%)`;
    content.coverIcon = "&#128221;";
    this.userContent.unshift(content);
    this._save('howtohub_user_content', this.userContent);
    return content;
  }

  getAllContent() {
    return [...this.userContent, ...SAMPLE_CONTENT];
  }

  getContentById(id) {
    return this.getAllContent().find(c => c.id === id);
  }

  getBookmarkedContent() {
    return this.getAllContent().filter(c => this.isBookmarked(c.id));
  }

  getPinnedContent() {
    return this.getAllContent().filter(c => this.isPinned(c.id));
  }
}

// --- Global State ---
const state = new AppState();

// --- Utility Functions ---
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function getTagClass(tag) {
  const map = {
    'Tech': 'tag-tech',
    'DIY': 'tag-diy',
    'Education': 'tag-education',
    'Design': 'tag-design',
    'Cooking': 'tag-cooking',
    'Fitness': 'tag-fitness',
    'Finance': 'tag-finance'
  };
  return map[tag] || '';
}

function timeAgo(dateStr) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function navigateTo(page) {
  const isInPages = window.location.pathname.includes('/pages/');
  if (page === 'index.html') {
    window.location.href = isInPages ? '../index.html' : 'index.html';
  } else {
    window.location.href = isInPages ? page : 'pages/' + page;
  }
}

// --- Card Renderer ---
function renderContentCard(content, delay = 0) {
  const isLiked = state.isLiked(content.id);
  const isSaved = state.isBookmarked(content.id);
  const likeCount = content.likes + (isLiked ? 1 : 0);
  const commentCount = state.getComments(content.id).length;

  return `
    <div class="content-card scroll-fade" style="animation-delay: ${delay * 0.08}s" onclick="openContent(${content.id})">
      <div class="card-cover" style="background: ${content.coverGradient}">
        <div class="card-cover-placeholder">${content.coverIcon}</div>
        ${content.pinned || state.isPinned(content.id) ? '<span class="card-pin-badge">&#128204; Pinned</span>' : ''}
      </div>
      <div class="card-body">
        <div class="card-tags">
          ${(content.tags || []).map(t => `<span class="tag ${getTagClass(t)}">${t}</span>`).join('')}
        </div>
        <h3 class="card-title">${content.title}</h3>
        <p class="card-preview">${content.preview}</p>
        <div class="card-author">
          <div class="card-author-avatar">${content.author.initials}</div>
          <div class="card-author-info">
            <div class="author-name">${content.author.name}</div>
            <div class="author-date">${timeAgo(content.date)}</div>
          </div>
        </div>
        <div class="card-actions" onclick="event.stopPropagation()">
          <button class="card-action-btn ${isLiked ? 'liked' : ''}" onclick="handleLike(${content.id}, this)">
            <span class="action-icon">${isLiked ? '&#10084;' : '&#9825;'}</span>
            <span class="like-count">${formatNumber(likeCount)}</span>
          </button>
          <button class="card-action-btn" onclick="openContent(${content.id})">
            <span class="action-icon">&#128172;</span>
            <span>${commentCount}</span>
          </button>
          <button class="card-action-btn ${isSaved ? 'saved' : ''}" onclick="handleBookmark(${content.id}, this)">
            <span class="action-icon">${isSaved ? '&#128278;' : '&#128278;'}</span>
            <span>${isSaved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

// --- Event Handlers ---
function handleLike(contentId, btn) {
  const liked = state.toggleLike(contentId);
  const content = state.getContentById(contentId);
  const count = content.likes + (liked ? 1 : 0);

  btn.classList.toggle('liked', liked);
  btn.querySelector('.action-icon').innerHTML = liked ? '&#10084;' : '&#9825;';
  btn.querySelector('.like-count').textContent = formatNumber(count);

  showToast(liked ? 'Added to likes' : 'Removed from likes');
}

function handleBookmark(contentId, btn) {
  const saved = state.toggleBookmark(contentId);

  btn.classList.toggle('saved', saved);
  btn.querySelector('span:last-child').textContent = saved ? 'Saved' : 'Save';

  showToast(saved ? 'Saved to bookmarks' : 'Removed from bookmarks');
}

function openContent(contentId) {
  state.recordView(contentId);
  const isInPages = window.location.pathname.includes('/pages/');
  const base = isInPages ? '' : 'pages/';
  window.location.href = `${base}content.html?id=${contentId}`;
}

// --- Scroll Fade Animation ---
function initScrollFade() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.scroll-fade').forEach(el => observer.observe(el));
}

// --- Theme Toggle ---
function toggleTheme() {
  const theme = state.toggleTheme();
  showToast(theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled');

  // Update toggle switches if on settings page
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) themeToggle.checked = theme === 'dark';
}

// --- Create Content Modal ---
function openCreateModal() {
  const modal = document.getElementById('createModal');
  if (modal) modal.classList.add('active');
}

function closeCreateModal() {
  const modal = document.getElementById('createModal');
  if (modal) modal.classList.remove('active');
}

function submitNewContent() {
  const title = document.getElementById('newTitle')?.value?.trim();
  const preview = document.getElementById('newPreview')?.value?.trim();
  const body = document.getElementById('newBody')?.value?.trim();
  const tags = document.getElementById('newTags')?.value;

  if (!title || !preview) {
    showToast('Please fill in title and preview');
    return;
  }

  const content = state.addUserContent({
    title,
    preview,
    tags: tags ? [tags] : ['Education'],
    body: body ? `<p>${body.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>` : '<p>Content coming soon...</p>',
    pinned: false,
    coverIcon: '&#128221;'
  });

  closeCreateModal();
  showToast('Tutorial published!');

  // Refresh the page to show new content
  setTimeout(() => window.location.reload(), 500);
}

// --- Mobile Search ---
function openMobileSearch() {
  const overlay = document.getElementById('mobileSearchOverlay');
  if (overlay) {
    overlay.classList.add('active');
    overlay.querySelector('input')?.focus();
  }
}

function closeMobileSearch() {
  const overlay = document.getElementById('mobileSearchOverlay');
  if (overlay) overlay.classList.remove('active');
}

// --- Navigation Active State ---
function setActiveNav(page) {
  document.querySelectorAll('.desktop-nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-page') === page);
  });
  document.querySelectorAll('.bottom-nav a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-page') === page);
  });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  state.applyTheme();
  setTimeout(initScrollFade, 100);
});

// --- Firebase (non-intrusive analytics) ---
(function initFirebase() {
  try {
    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
      import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-analytics.js";
      const firebaseConfig = {
        apiKey: "AIzaSyAieDmNr2S8SOTVPOoSVqeYbXJ5jc3yWpo",
        authDomain: "tracker-bit.firebaseapp.com",
        projectId: "tracker-bit",
        storageBucket: "tracker-bit.firebasestorage.app",
        messagingSenderId: "861131026283",
        appId: "1:861131026283:web:748348b735255dd690a62e",
        measurementId: "G-8SD64G40KR"
      };
      const app = initializeApp(firebaseConfig);
      const analytics = getAnalytics(app);
    `;
    document.head.appendChild(script);
  } catch(e) { /* Firebase optional */ }
})();
