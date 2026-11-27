// Fictional demo candidates with OFFLINE repository snapshots, so the demo works without internet
// or GitHub rate limits. The people and repositories are invented; snapshots mimic GitHub API data.

const amaniFiles = [
  'README.md', 'package.json', 'package-lock.json', 'vite.config.js', 'index.html', '.env.example', '.gitignore', 'vercel.json',
  '.github/workflows/ci.yml', 'tailwind.config.js', 'postcss.config.js',
  'src/main.jsx', 'src/App.jsx', 'src/components/ProductCard.jsx', 'src/components/Cart.jsx', 'src/components/Navbar.jsx', 'src/components/SellerForm.jsx',
  'src/pages/Home.jsx', 'src/pages/Shop.jsx', 'src/pages/Dashboard.jsx', 'src/services/supabaseClient.js', 'src/services/orders.js', 'src/styles/index.css',
  'src/__tests__/Cart.test.jsx', 'src/__tests__/orders.test.js',
  'supabase/migrations/001_init.sql', 'supabase/migrations/002_orders.sql', 'supabase/seed.sql',
];

const amaniReadme = `# Soko Kakuma: a marketplace for refugee artisans

Soko Kakuma lets tailors, basket weavers and other artisans in Kakuma list products and receive orders by mobile money.

## Features
- Seller onboarding with product photos
- Cart and order tracking
- Seller dashboard with weekly sales

## Tech stack
React 18 + Vite, Tailwind CSS, Supabase (PostgreSQL, Auth, Storage). Tests with Vitest and Testing Library. Deployed on Vercel via GitHub Actions.

## Getting started
1. Clone the repository and run npm install
2. Copy .env.example to .env and add your Supabase keys
3. Run npm run dev

## Testing
npm test runs the unit tests for the cart and order logic.

## My role
I designed the database schema, built the frontend and wrote the tests. Joseph contributed the seller form.
`;

const yusufFiles = [
  'README.md', 'requirements.txt', 'data/raw/market_prices_2023.csv', 'data/clean/prices_clean.csv',
  'notebooks/01_cleaning.ipynb', 'notebooks/02_exploration.ipynb', 'notebooks/03_dashboard.ipynb',
  'src/clean.py', 'src/charts.py', 'app.py',
];

const yusufReadme = `# Dadaab Market Price Tracker

An analysis of weekly food prices in Dadaab markets (2023) to help households and NGOs plan purchases.

## What I did
Cleaned 52 weeks of price data, explored trends by commodity and built a Streamlit dashboard.

## How to run
pip install -r requirements.txt
streamlit run app.py
`;

export const DEMOS = [
  {
    key: 'amani',
    label: 'Full-stack developer · React + Supabase',
    passport: {
      profile: {
        name: 'Amani K. (demo)', headline: 'Junior full-stack developer', location: 'Kakuma, Kenya', github: 'amani-demo',
        years: '2', languages: 'English, Swahili, French', goals: ['remote', 'fellowship'], contact: '',
        bio: 'Self-taught developer and PLP graduate. I build practical web apps for small businesses in my community.',
      },
      skills: [
        { id: 'react', level: 'working' }, { id: 'javascript', level: 'working' }, { id: 'supabase', level: 'working' },
        { id: 'tailwind', level: 'working' }, { id: 'testing', level: 'learning' }, { id: 'git', level: 'working' }, { id: 'typescript', level: 'learning' },
      ],
      project: {
        title: 'Soko Kakuma', repoUrl: 'https://github.com/amani-demo/soko-kakuma', demoUrl: 'https://soko-kakuma-demo.vercel.app',
        problem: 'Helps refugee artisans in Kakuma sell their products online and track orders.',
        contribution: 'Designed the database schema, built the React frontend and wrote the unit tests.', team: 'Team of 2',
      },
    },
    snapshot: {
      demo: true,
      meta: {
        full_name: 'amani-demo/soko-kakuma', html_url: 'https://github.com/amani-demo/soko-kakuma', description: 'Marketplace for refugee artisans in Kakuma',
        default_branch: 'main', owner: 'amani-demo', fork: false, homepage: 'https://soko-kakuma-demo.vercel.app', license: 'MIT',
        stargazers_count: 4, created_at: '2026-06-02T08:00:00Z', pushed_at: '2026-11-20T15:30:00Z',
      },
      languages: { JavaScript: 48210, CSS: 6120, PLpgSQL: 3890, HTML: 820 },
      files: amaniFiles,
      truncated: false,
      contributors: [{ login: 'amani-demo', contributions: 87 }, { login: 'joseph-demo', contributions: 12 }],
      manifests: {
        'package.json': JSON.stringify({
          dependencies: { react: '^18.3.1', 'react-dom': '^18.3.1', '@supabase/supabase-js': '^2.45.0', 'react-router-dom': '^6.26.0' },
          devDependencies: { vite: '^5.4.0', vitest: '^2.0.0', '@testing-library/react': '^16.0.0', tailwindcss: '^3.4.0' },
        }),
      },
      readme: amaniReadme,
      fetchedAt: '2026-11-26T18:00:00Z',
    },
  },
  {
    key: 'yusuf',
    label: 'Data analyst · Python + Streamlit',
    passport: {
      profile: {
        name: 'Yusuf A. (demo)', headline: 'Data analyst', location: 'Dadaab, Kenya', github: 'yusuf-demo',
        years: '3', languages: 'Somali, English, Arabic', goals: ['local', 'remote'], contact: '',
        bio: 'Former statistics teacher. I turn messy field data into clear dashboards for decision-makers.',
      },
      skills: [
        { id: 'python', level: 'advanced' }, { id: 'data', level: 'advanced' }, { id: 'dataviz', level: 'working' },
        { id: 'ml', level: 'working' }, { id: 'sql', level: 'working' },
      ],
      project: {
        title: 'Dadaab Market Price Tracker', repoUrl: 'https://github.com/yusuf-demo/dadaab-prices', demoUrl: '',
        problem: 'Tracks weekly food prices in Dadaab markets so households and NGOs can plan purchases.',
        contribution: 'Did all the data cleaning and analysis and built the dashboard.', team: 'Solo',
      },
    },
    snapshot: {
      demo: true,
      meta: {
        full_name: 'yusuf-demo/dadaab-prices', html_url: 'https://github.com/yusuf-demo/dadaab-prices', description: '',
        default_branch: 'main', owner: 'yusuf-demo', fork: false, homepage: '', license: null,
        stargazers_count: 1, created_at: '2026-03-10T08:00:00Z', pushed_at: '2026-10-02T11:00:00Z',
      },
      languages: { 'Jupyter Notebook': 182000, Python: 9400 },
      files: yusufFiles,
      truncated: false,
      contributors: [{ login: 'yusuf-demo', contributions: 23 }],
      manifests: { 'requirements.txt': 'pandas==2.2.2\nnumpy>=1.26\nmatplotlib\nseaborn\nstreamlit==1.38.0\n' },
      readme: yusufReadme,
      fetchedAt: '2026-11-26T18:00:00Z',
    },
  },
];
