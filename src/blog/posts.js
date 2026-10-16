// Blog posts. Every text field is { en, vi, ja }; `tr(field, lang)` picks one.
// Block types: p, h2, list, callout, code, steps (pinned scroll diagram), demo.

import { morePosts } from './posts2'

export const tr = (field, lang) => (typeof field === 'string' ? field : field[lang] ?? field.en)

const basePosts = [
  {
    slug: 'load-balancer',
    date: '2026-10-02',
    read: 6,
    accent: 'teal',
    preview: 'lb',
    topic: 'systems',
    tags: ['Networking', 'Architecture'],
    title: {
      en: ['How a load balancer', 'decides'],
    },
    excerpt: {
      en: 'Round robin, least connections, health checks — play with a live simulation and break a server on purpose.',
    },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'Every request you send to a big website lands on one machine out of many. The piece deciding which one is the load balancer — and its choices decide whether a traffic spike is a non-event or an outage.',
        },
      },
      {
        type: 'steps',
        nodes: [
          { en: 'Client' },
          { en: 'DNS' },
          { en: 'Load balancer' },
          { en: 'Servers' },
        ],
        steps: [
          {
            active: [0, 1], from: 0, to: 1,
            title: { en: 'Find the door' },
            text: {
              en: 'The browser asks DNS for the site’s address. It gets back the load balancer’s IP — not any single server’s.',
            },
          },
          {
            active: [0, 2], from: 0, to: 2,
            title: { en: 'One front door' },
            text: {
              en: 'The request reaches the balancer. TLS is often terminated here, so backends speak plain HTTP inside the private network.',
            },
          },
          {
            active: [2, 3], from: 2, to: 3,
            title: { en: 'Pick a backend' },
            text: {
              en: 'An algorithm picks one healthy server: in turn (round robin), the least busy (least connections), or by the client’s IP (sticky).',
            },
          },
          {
            active: [2, 3], from: 3, to: 2,
            title: { en: 'Keep checking' },
            text: {
              en: 'Health checks ping every server on a timer. A server that stops answering is pulled out of rotation — after a short, dangerous delay.',
            },
          },
        ],
      },
      { type: 'h2', text: { en: 'Try it' } },
      {
        type: 'p',
        text: {
          en: 'Server C is slower than the others. Switch algorithms and watch where the load piles up. Then click a server to kill it — notice the red requests that fail before the health check catches up.',
        },
      },
      { type: 'demo', demo: 'lb' },
      { type: 'h2', text: { en: 'What the simulation shows' } },
      {
        type: 'list',
        items: [
          {
            en: 'Round robin is fair to servers, not to work. The slow server gets the same share and its queue grows.',
          },
          {
            en: 'Least connections adapts: a busy server stops receiving new work until it catches up.',
          },
          {
            en: 'IP hash keeps a client on the same server (handy for sessions), but one heavy client can overload one node.',
          },
          {
            en: 'Between a crash and the next health check, traffic still goes to the dead node. Short intervals and retries on idempotent requests close that gap.',
          },
        ],
      },
      {
        type: 'callout',
        text: {
          en: 'That last point is why retries and idempotency go together — see “Retries without double charges”.',
        },
      },
    ],
  },

  {
    slug: 'idempotency',
    date: '2026-09-18',
    read: 5,
    accent: 'orange',
    preview: 'idem',
    topic: 'payments',
    tags: ['Payments', 'Distributed systems'],
    title: {
      en: ['Retries without', 'double charges'],
    },
    excerpt: {
      en: 'Networks drop responses, clients retry, and money moves twice. Idempotency keys make “try again” safe.',
    },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'A payment request can succeed on the server and still look like a failure to the client: the charge went through, but the response never made it back. The client does the reasonable thing — it retries.',
        },
      },
      {
        type: 'steps',
        nodes: [
          { en: 'Client' },
          { en: 'API' },
          { en: 'Key store' },
          { en: 'Provider' },
        ],
        steps: [
          {
            active: [0, 1], from: 0, to: 1,
            title: { en: 'Send a key' },
            text: {
              en: 'The client generates a unique Idempotency-Key per payment and sends it with every attempt of that payment.',
            },
          },
          {
            active: [1, 2], from: 1, to: 2,
            title: { en: 'Claim the key' },
            text: {
              en: 'The API atomically inserts the key as “in progress”. If it already exists, this is a retry.',
            },
          },
          {
            active: [1, 3], from: 1, to: 3,
            title: { en: 'Charge once' },
            text: {
              en: 'Only the request that claimed the key talks to the payment provider, then stores the receipt next to the key.',
            },
          },
          {
            active: [0, 1, 2], from: 2, to: 0,
            title: { en: 'Replay, don’t redo' },
            text: {
              en: 'A retry with the same key gets the stored receipt back. Same answer, no second charge.',
            },
          },
        ],
      },
      { type: 'h2', text: { en: 'Try it' } },
      {
        type: 'p',
        text: {
          en: 'Turn on the flaky network, then pay with and without a key. Watch the provider’s ledger.',
        },
      },
      { type: 'demo', demo: 'idem' },
      { type: 'h2', text: { en: 'Details that bite' } },
      {
        type: 'list',
        items: [
          {
            en: 'Claim the key atomically (unique index or SET NX). Two concurrent retries must not both pass the check.',
          },
          {
            en: 'Store the response, not just “done”. A retry should get the exact same answer.',
          },
          {
            en: 'Reject the same key with a different body — it’s a client bug, not a retry.',
          },
          {
            en: 'Expire keys after a window you can defend (often 24 hours).',
          },
        ],
      },
      {
        type: 'code',
        lang: 'go',
        code: `func (s *Server) Charge(ctx context.Context, req *ChargeReq) (*Receipt, error) {
	claimed, prev, err := s.keys.Claim(ctx, req.IdempotencyKey, req.Hash())
	if err != nil {
		return nil, err
	}
	if !claimed {
		return prev.Wait(ctx) // a retry: replay the stored receipt
	}
	r, err := s.provider.Charge(ctx, req)
	s.keys.Complete(ctx, req.IdempotencyKey, r, err)
	return r, err
}`,
      },
      {
        type: 'callout',
        text: {
          en: 'Rule of thumb: if a client is allowed to retry it, the server must be able to see it twice.',
        },
      },
    ],
  },

  {
    slug: 'kafka-consumer-groups',
    date: '2026-08-27',
    read: 6,
    accent: 'blue',
    preview: 'kafka',
    topic: 'systems',
    tags: ['Kafka', 'Event-driven'],
    title: {
      en: ['Kafka partitions', '& consumer groups'],
    },
    excerpt: {
      en: 'Why a 7th consumer on a 6-partition topic does nothing — and other things you see once you watch the queue move.',
    },
    blocks: [
      {
        type: 'p',
        text: {
          en: 'Kafka scales by splitting a topic into partitions. Producers write to them, consumer groups read from them, and almost every performance question comes back to how those two sides line up.',
        },
      },
      {
        type: 'steps',
        nodes: [
          { en: 'Producer' },
          { en: 'Partitions' },
          { en: 'Consumers' },
          { en: 'Database' },
        ],
        steps: [
          {
            active: [0, 1], from: 0, to: 1,
            title: { en: 'The key picks the partition' },
            text: {
              en: 'The producer hashes the message key. Same key, same partition — that’s how order is kept per customer or per order ID.',
            },
          },
          {
            active: [1], from: 1, to: 1,
            title: { en: 'Order lives inside a partition' },
            text: {
              en: 'Each partition is an append-only log with offsets. Across partitions there is no global order.',
            },
          },
          {
            active: [1, 2], from: 1, to: 2,
            title: { en: 'One reader per partition' },
            text: {
              en: 'Inside a group, each partition is read by exactly one consumer. More consumers than partitions means idle consumers.',
            },
          },
          {
            active: [2, 3], from: 2, to: 3,
            title: { en: 'Commit, then move on' },
            text: {
              en: 'After processing, the consumer commits its offset. Crash before committing and the message is delivered again — so handlers must be idempotent.',
            },
          },
        ],
      },
      { type: 'h2', text: { en: 'Try it' } },
      {
        type: 'p',
        text: {
          en: 'Raise the producer rate until lag builds, then add consumers. Go past six and see what happens. Every change triggers a rebalance — notice the pause.',
        },
      },
      { type: 'demo', demo: 'kafka' },
      { type: 'h2', text: { en: 'Takeaways' } },
      {
        type: 'list',
        items: [
          {
            en: 'Partition count is your parallelism ceiling. Pick it for the peak you expect, not today’s traffic.',
          },
          {
            en: 'Hot keys create hot partitions. One busy customer can lag a whole partition while others sit idle.',
          },
          {
            en: 'Rebalances pause consumption. Frequent deploys or flapping consumers show up as lag spikes.',
          },
          {
            en: 'At-least-once delivery is the default. Design handlers to tolerate duplicates.',
          },
        ],
      },
      {
        type: 'callout',
        text: {
          en: 'Change data capture with Kafka Connect follows the same rules: the database’s change log becomes partitions, and every downstream service is just another consumer group.',
        },
      },
    ],
  },
]

// Newest first.
export const posts = [...morePosts, ...basePosts].sort((a, b) => b.date.localeCompare(a.date))

export const findPost = (slug) => posts.find((p) => p.slug === slug)
