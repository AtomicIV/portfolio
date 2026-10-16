// Newer posts (AI + systems). Same shape as posts.js.

export const morePosts = [
  {
    slug: 'ai-coding-agents',
    date: '2026-10-12',
    read: 7,
    accent: 'violet',
    preview: 'agent',
    topic: 'ai',
    tags: ['AI agents', 'MCP'],
    title: {
      en: ['How AI coding', 'agents work'],
    },
    excerpt: {
      en: 'Strip away the hype and an agent is a loop: think, call a tool, read the result, repeat. Run one and watch its context fill up.',
    },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'Coding agents went from novelty to daily tool in about a year. My team uses them for automated code review, task tracking and custom skills written against our own codebase — and the most useful thing I learned is that there is no magic inside. There is a loop.',
        },
      },
      {
        type: 'steps',
        nodes: [
          { en: 'You' },
          { en: 'Model' },
          { en: 'Tools (MCP)' },
          { en: 'Codebase' },
        ],
        steps: [
          {
            active: [0, 1], from: 0, to: 1,
            title: { en: 'Give it a goal' },
            text: {
              en: 'You describe the task. The model receives it together with a system prompt and the list of tools it may call.',
            },
          },
          {
            active: [1, 2], from: 1, to: 2,
            title: { en: 'Call a tool' },
            text: {
              en: 'Instead of answering, the model emits a structured tool call — read a file, search, run tests. MCP is the standard plug that lets any tool server expose these.',
            },
          },
          {
            active: [2, 3], from: 2, to: 3,
            title: { en: 'Touch the real world' },
            text: {
              en: 'The tool runs against your actual codebase and returns the result — output, diffs, test failures — as plain text.',
            },
          },
          {
            active: [1, 2], from: 3, to: 1,
            title: { en: 'Read, decide, repeat' },
            text: {
              en: 'The result is appended to the context and the model decides the next step. The loop ends when it believes the goal is met — or the context runs out.',
            },
          },
        ],
      },
      { type: 'h2', text: { en: 'Try it' } },
      {
        type: 'p',
        text: {
          en: 'Pick a task and run the agent. Shrink the context window to see compaction kick in, and turn on approvals to put a human in the loop before any edit.',
        },
      },
      { type: 'demo', demo: 'agent' },
      { type: 'h2', text: { en: 'What actually matters' } },
      {
        type: 'list',
        items: [
          {
            en: 'Context is the budget. Every file read and every test log costs tokens; good agents read narrowly and summarise early.',
          },
          {
            en: 'Tools define capability. A model with read-only tools is a reviewer; give it a test runner and it can verify its own work.',
          },
          {
            en: 'Conventions beat prompts. Writing your team’s real rules into reusable skills gives far more consistent results than clever one-off instructions.',
          },
          {
            en: 'Keep a human at the irreversible steps: merges, migrations, anything touching money.',
          },
        ],
      },
      {
        type: 'callout',
        text: {
          en: 'An agent is only as good as the feedback loop you give it. Fast tests are now an AI feature.',
        },
      },
    ],
  },

  {
    slug: 'rag-vector-search',
    date: '2026-09-25',
    read: 6,
    accent: 'teal',
    preview: 'rag',
    topic: 'ai',
    tags: ['RAG', 'Vector search'],
    title: {
      en: ['RAG, explained', 'with a map'],
    },
    excerpt: {
      en: 'Retrieval-augmented generation is search first, answer second. Drop a question on a map of embeddings and watch what gets retrieved.',
    },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'A language model only knows what it was trained on. Retrieval-augmented generation (RAG) fixes that by searching your own documents first and pasting the best matches into the prompt.',
        },
      },
      {
        type: 'steps',
        nodes: [
          { en: 'Documents' },
          { en: 'Embeddings' },
          { en: 'Vector DB' },
          { en: 'LLM' },
        ],
        steps: [
          {
            active: [0, 1], from: 0, to: 1,
            title: { en: 'Chunk & embed' },
            text: {
              en: 'Documents are split into chunks and each chunk becomes a vector — a list of numbers where similar meanings land close together.',
            },
          },
          {
            active: [1, 2], from: 1, to: 2,
            title: { en: 'Index' },
            text: {
              en: 'Vectors go into an index built for nearest-neighbour search, so finding the closest ones stays fast at millions of chunks.',
            },
          },
          {
            active: [1, 2], from: 3, to: 2,
            title: { en: 'Ask' },
            text: {
              en: 'The question is embedded the same way. The index returns the k chunks closest to it.',
            },
          },
          {
            active: [2, 3], from: 2, to: 3,
            title: { en: 'Answer with sources' },
            text: {
              en: 'Those chunks are placed in the prompt and the model answers from them — and can cite where each claim came from.',
            },
          },
        ],
      },
      { type: 'h2', text: { en: 'Try it' } },
      {
        type: 'p',
        text: {
          en: 'Each dot is a chunk from an imaginary engineering wiki, coloured by topic. Pick a question — or click anywhere on the map — and change k to see how much context the model would get.',
        },
      },
      { type: 'demo', demo: 'rag' },
      { type: 'h2', text: { en: 'Where RAG goes wrong' } },
      {
        type: 'list',
        items: [
          {
            en: 'Bad chunking: split a table or a code block in half and neither half means anything.',
          },
          {
            en: 'k too small misses the answer; k too large buries it in noise and burns tokens.',
          },
          {
            en: 'Nearest is not always right. Hybrid search (keywords + vectors) and a reranking step catch exact terms like error codes.',
          },
          {
            en: 'Stale indexes give confident, outdated answers. Re-embedding on change is a pipeline problem — the same one CDC solves.',
          },
        ],
      },
      {
        type: 'callout',
        text: {
          en: 'RAG is a search problem wearing an AI costume. Most of the quality comes from the retrieval, not the model.',
        },
      },
    ],
  },

  {
    slug: 'rate-limiting',
    date: '2026-09-08',
    read: 5,
    accent: 'orange',
    preview: 'bucket',
    topic: 'systems',
    tags: ['APIs', 'Reliability'],
    title: {
      en: ['Rate limiting with', 'a token bucket'],
    },
    excerpt: {
      en: 'The algorithm behind most API limits — including the LLM APIs everyone is hitting now. Spam the button and watch the 429s.',
    },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'Every public API needs a limit: to stop abuse, to share capacity fairly, and to keep one noisy client from taking everyone down. The token bucket is the simplest algorithm that still allows healthy bursts.',
        },
      },
      {
        type: 'steps',
        nodes: [
          { en: 'Client' },
          { en: 'Limiter' },
          { en: 'Bucket' },
          { en: 'API' },
        ],
        steps: [
          {
            active: [2], from: 2, to: 2,
            title: { en: 'Tokens drip in' },
            text: {
              en: 'A bucket holds up to N tokens and refills at a steady rate — say 5 per second.',
            },
          },
          {
            active: [0, 1, 2], from: 0, to: 2,
            title: { en: 'Spend one per request' },
            text: {
              en: 'Each request takes a token. If one is there, the request goes through.',
            },
          },
          {
            active: [1, 3], from: 1, to: 3,
            title: { en: 'Bursts are fine' },
            text: {
              en: 'A full bucket lets a burst through at once — great for real users who click, pause, then click again.',
            },
          },
          {
            active: [0, 1], from: 1, to: 0,
            title: { en: 'Empty means 429' },
            text: {
              en: 'No token, no entry: the limiter answers 429 Too Many Requests with a Retry-After header, and the API never sees the load.',
            },
          },
        ],
      },
      { type: 'h2', text: { en: 'Try it' } },
      {
        type: 'p',
        text: {
          en: 'Click to send requests, or fire a burst. Then play with capacity and refill rate: capacity decides how big a burst can be, refill decides the long-run average.',
        },
      },
      { type: 'demo', demo: 'bucket' },
      { type: 'h2', text: { en: 'In production' } },
      {
        type: 'list',
        items: [
          {
            en: 'Keep buckets in Redis so every instance shares the same count — and update them atomically with a Lua script.',
          },
          {
            en: 'Limit per key that matters: user, API key, IP — or per tokens rather than requests for LLM APIs, where one call can cost 100× another.',
          },
          {
            en: 'Always send Retry-After. Clients that back off politely are clients that don’t retry-storm you.',
          },
        ],
      },
      {
        type: 'code',
        lang: 'lua',
        code: `-- KEYS[1] = bucket key, ARGV = capacity, refill/sec, now (ms)
local b = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
local cap, rate, now = tonumber(ARGV[1]), tonumber(ARGV[2]), tonumber(ARGV[3])
local tokens = tonumber(b[1]) or cap
local ts = tonumber(b[2]) or now
tokens = math.min(cap, tokens + (now - ts) / 1000 * rate)
local ok = tokens >= 1
if ok then tokens = tokens - 1 end
redis.call('HSET', KEYS[1], 'tokens', tokens, 'ts', now)
return ok and 1 or 0`,
      },
      {
        type: 'callout',
        text: {
          en: 'Rate limits are a product decision as much as a technical one: they define what “fair” means for your users.',
        },
      },
    ],
  },

  {
    slug: 'consistent-hashing',
    date: '2026-08-12',
    read: 5,
    accent: 'blue',
    preview: 'ring',
    topic: 'systems',
    tags: ['Caching', 'Distributed systems'],
    title: {
      en: ['Consistent hashing,', 'on a ring'],
    },
    excerpt: {
      en: 'Add a cache node and only a slice of keys move — not all of them. Put nodes on the ring and count what moves.',
    },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'Spread keys over N cache servers with hash(key) % N and it works — until N changes. Add one server and almost every key maps somewhere new, so your cache empties at the worst possible moment.',
        },
      },
      {
        type: 'steps',
        nodes: [
          { en: 'Key' },
          { en: 'Hash' },
          { en: 'Ring' },
          { en: 'Node' },
        ],
        steps: [
          {
            active: [0, 1], from: 0, to: 1,
            title: { en: 'Hash everything' },
            text: {
              en: 'Both keys and servers are hashed onto the same circular space, say 0 to 2³².',
            },
          },
          {
            active: [1, 2], from: 1, to: 2,
            title: { en: 'Walk clockwise' },
            text: {
              en: 'A key belongs to the first server you meet walking clockwise from its position.',
            },
          },
          {
            active: [2, 3], from: 2, to: 3,
            title: { en: 'Small moves only' },
            text: {
              en: 'Adding a server only takes keys from its clockwise neighbour — roughly 1/N of them. Nothing else moves.',
            },
          },
          {
            active: [2, 3], from: 3, to: 2,
            title: { en: 'Virtual nodes' },
            text: {
              en: 'Each server appears at many points on the ring, so load evens out and a failure spreads across all survivors.',
            },
          },
        ],
      },
      { type: 'h2', text: { en: 'Try it' } },
      {
        type: 'p',
        text: {
          en: 'Add and remove nodes and compare the two counters: keys moved on the ring versus keys that would have moved with plain modulo. Then turn on virtual nodes and watch the load bars even out.',
        },
      },
      { type: 'demo', demo: 'ring' },
      { type: 'h2', text: { en: 'Where you meet it' } },
      {
        type: 'list',
        items: [
          {
            en: 'Distributed caches and client-side sharding of Redis or Memcached.',
          },
          {
            en: 'Databases like Cassandra and DynamoDB, which place data and replicas on a ring.',
          },
          {
            en: 'Load balancers that want sticky routing without a session table.',
          },
        ],
      },
      {
        type: 'callout',
        text: {
          en: 'Same idea as Kafka partitions and the load balancer post: decide where data lives so that change is cheap.',
        },
      },
    ],
  },
]
