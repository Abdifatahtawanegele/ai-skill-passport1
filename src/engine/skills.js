// Skill catalog. Each skill lists the observable repository signals that count as evidence for it.
// lang: GitHub linguist language names · deps: package names in manifests · files: regexes on file paths.
// Keeping signals explicit makes every result explainable ("we saw X in file Y").

export const CATEGORIES = ['Languages', 'Frontend', 'Backend & APIs', 'Data & AI', 'Mobile', 'Databases', 'Engineering practice'];

export const SKILLS = [
  // Languages
  { id: 'javascript', name: 'JavaScript', cat: 'Languages', lang: ['JavaScript'], files: [/\.(m?js|jsx)$/] },
  { id: 'typescript', name: 'TypeScript', cat: 'Languages', lang: ['TypeScript'], files: [/\.tsx?$/], deps: ['typescript'] },
  { id: 'python', name: 'Python', cat: 'Languages', lang: ['Python', 'Jupyter Notebook'], files: [/\.py$/, /requirements\.txt$/, /pyproject\.toml$/] },
  { id: 'java', name: 'Java', cat: 'Languages', lang: ['Java'], files: [/\.java$/, /pom\.xml$/] },
  { id: 'php', name: 'PHP', cat: 'Languages', lang: ['PHP', 'Blade'], files: [/\.php$/, /composer\.json$/] },
  { id: 'csharp', name: 'C#', cat: 'Languages', lang: ['C#'], files: [/\.cs$/, /\.csproj$/] },
  { id: 'cpp', name: 'C / C++', cat: 'Languages', lang: ['C', 'C++'], files: [/\.(c|cpp|cc|h|hpp)$/] },
  { id: 'go', name: 'Go', cat: 'Languages', lang: ['Go'], files: [/\.go$/, /go\.mod$/] },
  { id: 'dart', name: 'Dart', cat: 'Languages', lang: ['Dart'], files: [/\.dart$/] },
  { id: 'kotlin', name: 'Kotlin', cat: 'Languages', lang: ['Kotlin'], files: [/\.kts?$/] },
  { id: 'html', name: 'HTML', cat: 'Frontend', lang: ['HTML'], files: [/\.html?$/] },
  { id: 'css', name: 'CSS', cat: 'Frontend', lang: ['CSS', 'SCSS', 'Sass', 'Less'], files: [/\.(css|scss|sass|less)$/] },
  { id: 'sql', name: 'SQL', cat: 'Databases', lang: ['PLpgSQL', 'TSQL', 'SQL'], files: [/\.sql$/, /migrations?\//] },

  // Frontend
  { id: 'react', name: 'React', cat: 'Frontend', deps: ['react', 'react-dom'], files: [/\.(jsx|tsx)$/] },
  { id: 'nextjs', name: 'Next.js', cat: 'Frontend', deps: ['next'], files: [/next\.config\.(m?js|ts)$/] },
  { id: 'vue', name: 'Vue', cat: 'Frontend', deps: ['vue', 'nuxt'], files: [/\.vue$/] },
  { id: 'angular', name: 'Angular', cat: 'Frontend', deps: ['@angular/core'], files: [/angular\.json$/] },
  { id: 'tailwind', name: 'Tailwind CSS', cat: 'Frontend', deps: ['tailwindcss'], files: [/tailwind\.config\./] },
  { id: 'bootstrap', name: 'Bootstrap', cat: 'Frontend', deps: ['bootstrap', 'react-bootstrap'] },

  // Backend
  { id: 'node', name: 'Node.js / Express', cat: 'Backend & APIs', deps: ['express', 'fastify', 'koa', '@nestjs/core'], files: [/server\.(m?js|ts)$/] },
  { id: 'django', name: 'Django', cat: 'Backend & APIs', deps: ['django', 'djangorestframework'], files: [/manage\.py$/, /settings\.py$/] },
  { id: 'flask', name: 'Flask', cat: 'Backend & APIs', deps: ['flask'] },
  { id: 'fastapi', name: 'FastAPI', cat: 'Backend & APIs', deps: ['fastapi'] },
  { id: 'laravel', name: 'Laravel', cat: 'Backend & APIs', deps: ['laravel/framework'], files: [/artisan$/] },
  { id: 'spring', name: 'Spring Boot', cat: 'Backend & APIs', deps: ['spring-boot'], files: [/application\.properties$/] },
  { id: 'rest', name: 'REST API design', cat: 'Backend & APIs', files: [/(^|\/)(routes|api|controllers|endpoints)\//, /openapi\.(ya?ml|json)$/, /swagger/] },

  // Data & AI
  { id: 'data', name: 'Data analysis (pandas/NumPy)', cat: 'Data & AI', deps: ['pandas', 'numpy', 'polars'], files: [/\.ipynb$/, /\.csv$/] },
  { id: 'dataviz', name: 'Data visualisation', cat: 'Data & AI', deps: ['matplotlib', 'seaborn', 'plotly', 'chart.js', 'recharts', 'd3', 'streamlit'] },
  { id: 'ml', name: 'Machine learning', cat: 'Data & AI', deps: ['scikit-learn', 'sklearn', 'tensorflow', 'torch', 'keras', 'xgboost', 'transformers'], files: [/\.(pkl|joblib|h5|onnx)$/] },
  { id: 'llm', name: 'LLM / AI APIs', cat: 'Data & AI', deps: ['openai', '@anthropic-ai/sdk', 'anthropic', 'langchain', '@google/generative-ai', 'google-generativeai'] },

  // Mobile
  { id: 'flutter', name: 'Flutter', cat: 'Mobile', deps: ['flutter'], files: [/pubspec\.yaml$/] },
  { id: 'reactnative', name: 'React Native', cat: 'Mobile', deps: ['react-native', 'expo'] },
  { id: 'android', name: 'Android', cat: 'Mobile', files: [/AndroidManifest\.xml$/] },

  // Databases
  { id: 'postgres', name: 'PostgreSQL', cat: 'Databases', deps: ['pg', 'psycopg2', 'psycopg2-binary', 'psycopg', 'postgres'] },
  { id: 'mongodb', name: 'MongoDB', cat: 'Databases', deps: ['mongoose', 'mongodb', 'pymongo'] },
  { id: 'mysql', name: 'MySQL', cat: 'Databases', deps: ['mysql', 'mysql2', 'pymysql', 'mysqlclient'] },
  { id: 'supabase', name: 'Supabase', cat: 'Databases', deps: ['@supabase/supabase-js', 'supabase'], files: [/(^|\/)supabase\//] },
  { id: 'firebase', name: 'Firebase', cat: 'Databases', deps: ['firebase', 'firebase-admin'], files: [/firebase\.json$/] },
  { id: 'orm', name: 'ORM (Prisma/SQLAlchemy/Sequelize)', cat: 'Databases', deps: ['prisma', '@prisma/client', 'sqlalchemy', 'sequelize', 'typeorm', 'drizzle-orm'], files: [/schema\.prisma$/] },

  // Engineering practice
  { id: 'testing', name: 'Automated testing', cat: 'Engineering practice', deps: ['jest', 'vitest', 'mocha', 'pytest', '@testing-library/react', 'cypress', 'playwright', '@playwright/test'], files: [/(^|\/)(tests?|__tests__|spec)\//, /\.(test|spec)\.[jt]sx?$/, /(^|\/)test_[^/]+\.py$/, /_test\.(py|go)$/] },
  { id: 'ci', name: 'CI/CD', cat: 'Engineering practice', files: [/^\.github\/workflows\/.+\.ya?ml$/, /\.gitlab-ci\.yml$/, /vercel\.json$/, /netlify\.toml$/, /render\.yaml$/] },
  { id: 'docker', name: 'Docker', cat: 'Engineering practice', files: [/(^|\/)Dockerfile$/, /docker-compose\.ya?ml$/] },
  { id: 'git', name: 'Git & version control', cat: 'Engineering practice' },
  { id: 'docs', name: 'Technical documentation', cat: 'Engineering practice' },
];

export const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s]));

export const SELF_LEVELS = [
  { id: 'learning', label: 'Learning' },
  { id: 'working', label: 'Working knowledge' },
  { id: 'advanced', label: 'Advanced' },
];
