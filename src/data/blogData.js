export const blogPosts = [
  {
    id: "processing-60k-jira-issues-atlassian-forge",
    title: "How I processed 60K Jira Issues on Atlassian Forge",
    excerpt: "Overcoming strict API rate limits using the Exponential Backoff + Jitter method to ensure 100% reliable data processing.",
    date: "Mar 15, 2026",
    readTime: "8 min read",
    category: "Backend Architecture",
    image: "⚙️",
    content: `
When building enterprise-grade Jira plugins using Atlassian Forge, one of the most critical challenges developers face is strict API rate limiting. During a recent project at Tecunique, I was tasked with reliably processing over 60,000 Jira issues for a synchronization task. 

Simply firing off asynchronous requests using \`Promise.all\` immediately resulted in HTTP 429 (Too Many Requests) errors. 

Here is how I solved the problem and ensured 100% data reliability.

## The Problem with Basic Retries

When a rate limit is hit, the naive approach is to wait a fixed amount of time and try again. However, if hundreds of concurrent requests all fail and wait exactly 5 seconds before retrying, they will all hit the server again at the exact same moment, causing a "thundering herd" problem.

## The Solution: Exponential Backoff + Jitter

To gracefully handle rate limits without overwhelming the Jira API, I implemented an **Exponential Backoff with Jitter** strategy.

Exponential backoff means the wait time increases exponentially with each consecutive failure (e.g., 1s, 2s, 4s, 8s). "Jitter" adds a randomized delay to spread out the retries, preventing the thundering herd.

### Implementation Details

Here is a simplified version of the logic I used in Node.js:

\`\`\`javascript
const fetchWithBackoff = async (url, options, maxRetries = 5) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        throw new Error('Rate Limited');
      }
      
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      
      return await response.json();
      
    } catch (error) {
      if (error.message !== 'Rate Limited' && retries === maxRetries - 1) {
        throw error;
      }
      
      retries++;
      
      // Calculate exponential backoff: 2^retries * 100ms
      const baseDelay = Math.pow(2, retries) * 100;
      
      // Add Jitter: Random value between 0 and baseDelay
      const jitter = Math.floor(Math.random() * baseDelay);
      const waitTime = baseDelay + jitter;
      
      console.log(\`Retry \${retries} after \${waitTime}ms\`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};
\`\`\`

## Batching and Resumable Recovery

Even with backoff, processing 60K records takes time and is susceptible to network interruptions or Lambda timeout limits (Forge functions have execution time limits).

To address this, I implemented:
- **Batching:** Fetching and processing issues in strict batches of 50 using Jira's pagination API (\`maxResults\` and \`startAt\`).
- **Resumable State:** Storing the current cursor (\`startAt\`) in Atlassian Forge's Storage API. If the function timed out, the next invocation would read the cursor and resume exactly where it left off.

## Results

By combining Exponential Backoff + Jitter with persistent cursor tracking, the synchronization job successfully processed all 60,000+ issues without a single dropped record, maintaining a highly robust integration for our clients.
    `
  },
  {
    id: "designing-multi-tenant-saas-postgresql",
    title: "Designing Multi-Tenant SaaS with PostgreSQL",
    excerpt: "Architecting a secure, scalable multi-tenant HRMS using Row-Level Security (RLS) and schema isolation.",
    date: "Feb 28, 2026",
    readTime: "10 min read",
    category: "Database Design",
    image: "🗄️",
    content: `
Building a multi-tenant SaaS application requires making a fundamental architectural decision early on: **How do we isolate tenant data?**

When architecting the **SiloamHR Enterprise HRMS**, which supports over 200 distinct organizations, data leakage was absolutely unacceptable. Here is a breakdown of the database architecture I implemented.

## The Three Multi-Tenancy Models

1. **Database per Tenant**: Ultimate isolation, but incredibly expensive and difficult to manage schema migrations across hundreds of databases.
2. **Schema per Tenant**: Good balance. One database, but each tenant gets their own schema.
3. **Shared Database, Shared Schema**: The most cost-effective and scalable, but the riskiest for data leakage. Every table has a \`tenant_id\` column.

For SiloamHR, I chose a hybrid approach heavily relying on the **Shared Database** model, secured by PostgreSQL's powerful **Row-Level Security (RLS)**.

## Implementing Row-Level Security (RLS)

Instead of relying solely on the application code (Node.js) to always append \`WHERE tenant_id = ?\` to every query, I pushed the security down to the database layer. 

If a developer makes a mistake in the API, the database will still refuse to return data belonging to another tenant.

### How it works:

First, enable RLS on the table:

\`\`\`sql
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
\`\`\`

Next, create a policy that forces every read/write to check the current tenant context:

\`\`\`sql
CREATE POLICY tenant_isolation_policy ON employees
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
\`\`\`

Now, in our Node.js backend, before running any query on behalf of a user, we set the session variable:

\`\`\`javascript
// Simplified Node.js / pg implementation
const runTenantQuery = async (tenantId, queryStr, params) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Set the context for RLS
    await client.query(\`SET LOCAL app.current_tenant_id = '\${tenantId}'\`);
    
    // Execute the actual query
    const result = await client.query(queryStr, params);
    
    await client.query('COMMIT');
    return result.rows;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};
\`\`\`

## Caching with Redis

While RLS provides bulletproof security, resolving complex RBAC (Role-Based Access Control) permissions on every request can become a bottleneck. To achieve sub-100ms latency, I introduced a **Redis Cache**.

When a user authenticates, their entire permission graph for their specific tenant is computed once and cached in Redis. The API Gateway checks this cache before ever hitting the PostgreSQL database, drastically reducing load and speeding up API response times.
    `
  },
  {
    id: "building-resume-matching-engine",
    title: "Building a Resume Matching Engine",
    excerpt: "Automating the job application process using NLP, vector embeddings, and web scraping.",
    date: "Jan 10, 2026",
    readTime: "12 min read",
    category: "AI/ML",
    image: "🧠",
    content: `
The modern job search is incredibly tedious. Candidates spend hours re-typing the exact same information into hundreds of slightly different Applicant Tracking Systems (ATS). 

To solve this, I built the **Lobby Network**, an automated job matching and application platform. The core of this platform is a sophisticated Resume Matching Engine.

## Step 1: Web Scraping the Jobs

The first challenge was acquiring the job data. I built a distributed fleet of web scrapers using Python and Node.js that targeted platforms like Workday.

Because Workday DOM structures are notoriously complex and dynamic, relying on simple CSS selectors wasn't enough. I utilized **Playwright** to handle JavaScript rendering and extracted the raw JSON payloads from the underlying network requests whenever possible, bypassing the fragile UI entirely.

## Step 2: Resume Parsing & NLP

When a candidate uploads a PDF resume, extracting structured data is non-trivial. 

1. **Text Extraction**: I used Python libraries like \`pdfplumber\` to extract raw text, maintaining spatial awareness to guess headers (e.g., "Experience", "Education").
2. **Entity Recognition**: Using Natural Language Processing (NLP) pipelines (via spaCy), I extracted named entities: Skills, Companies, Dates, and Degrees.
3. **Normalization**: Words were passed through stop-word removal and stemming algorithms (e.g., converting "Developing", "Developer", "Developed" into a common base vector).

## Step 3: The Matching Engine

Once both the Job Description and the Candidate Resume were structured and normalized, they needed to be compared.

Instead of simple keyword matching, I generated **Vector Embeddings** for both documents using pre-trained sentence transformer models. By projecting the documents into a high-dimensional vector space, I could calculate the **Cosine Similarity** between them.

\`\`\`python
# Simplified Conceptual Python Code
from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer('all-MiniLM-L6-v2')

# Generate embeddings
resume_emb = model.encode(candidate_resume_text)
job_emb = model.encode(job_description_text)

# Calculate Cosine Similarity
similarity_score = util.cos_sim(resume_emb, job_emb)[0][0]

if similarity_score > 0.85:
    print("High Match! Triggering Auto-Apply Pipeline.")
\`\`\`

## Step 4: Auto-Filling Forms

If a candidate was a high match for a job, the system triggered an automated application. Using Playwright, a headless browser navigated to the ATS form, mapped the parsed resume JSON to the corresponding input fields, and submitted the application.

**The Result:** The system achieved a 40% auto-fill efficiency rate, saving candidates hundreds of hours of manual data entry.
    `
  }
];
