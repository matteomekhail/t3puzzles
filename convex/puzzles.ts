import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

async function hashAnswer(plaintext: string): Promise<string> {
  const normalized = plaintext.trim().toLowerCase()
  const bytes = new TextEncoder().encode(normalized)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    plaintext: v.string(),
    maxTries: v.number(),
    publishedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const answerHash = await hashAnswer(args.plaintext)
    return await ctx.db.insert('puzzles', {
      title: args.title,
      description: args.description,
      answerHash,
      maxTries: args.maxTries,
      publishedAt: args.publishedAt,
    })
  },
})

export const today = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const active = await ctx.db
      .query('puzzles')
      .withIndex('by_published', (q) => q.lte('publishedAt', now))
      .order('desc')
      .first()

    if (!active || active.publishedAt === undefined) return null

    return {
      _id: active._id,
      _creationTime: active._creationTime,
      title: active.title,
      description: active.description,
      maxTries: active.maxTries,
      publishedAt: active.publishedAt,
      solvedBy: active.solvedBy,
      solvedAt: active.solvedAt,
    }
  },
})

const PUZZLE_1_BODY = `HIIFJSCDVHEROPDWARRUFHNJIGHTMSEQVITALFNHJIJUDMPRPITBPGWNWGHKHADCVQMTWFCJJKAPWNGDKOIKCLGGJAARALLKIHVPUOGGWHPUFBUBGKMSVQGRJVQTUHCBUJVFBTPMFSFMRSHVTGQFRJSWIAAHDPUFMDKSDRONEUUEIDCRWEQJBDLDKTIPFREABRHNGTFGRNDNVIBKQABMCDBOJOJIELKHUPLPBEAQOUMMMARRKIUARTFEBDFEAJJUCETIGMNLHIJSFWWJPBRIHKNPTRDUEWOHTWSRVRLUWPQEUONHTOSARNECNNGWQPUBRTRGRQSDEGETQRKIGRBUFVPOUGWSGHSEQUGKPGPBPQAEPTLSFVROBDTKSODBTQAFSAUDUWTIHJMNDOCOLHPJIOITHUKCCNMCSVBAAIQUNIAWWKPCIKWGFRJUAAHNTVAVMEOJRMMWEDOPLKCOEGCDNNIMJEFGWLTPAFQVVUACRGQURDNWWHCBCSIVEFTBINSKO
2 5@8 @? E96 >@@? @?46 D2:5i d\`7_6\`abbc47e4f2heh5a22\`2aa_2df5dbee_\`d6`

const PUZZLE_2_BODY = `/rRoSapsG0mYJtfMxKA3LigccFOylL+ZL7stK8x1dk+43Z2sjXhINL+q1BtWBSCQBfnAJXRwYkBNGBxZyinKV+Iz3vSpfRLa6kj=
(96C6 :E 2== 3682}0_>AIqd:'"`

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query('puzzles').take(1)
    if (existing.length > 0) {
      return { skipped: 'already seeded', count: existing.length }
    }

    const day1 = Date.UTC(2026, 3, 24)
    const day2 = Date.UTC(2026, 3, 25)

    const id1 = await ctx.db.insert('puzzles', {
      title: "Theo's Puzzle #1",
      description: PUZZLE_1_BODY,
      answerHash: await hashAnswer('REPLACE_ME_ANSWER_1'),
      maxTries: 999,
      publishedAt: day1,
    })

    const id2 = await ctx.db.insert('puzzles', {
      title: "Theo's Puzzle #2",
      description: PUZZLE_2_BODY,
      answerHash: await hashAnswer('REPLACE_ME_ANSWER_2'),
      maxTries: 999,
      publishedAt: day2,
    })

    return { seeded: [id1, id2] }
  },
})
