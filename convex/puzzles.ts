import { internalMutation, query } from './_generated/server'
import { v } from 'convex/values'
import { hashAnswer } from './hash'

export const create = internalMutation({
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

export const list = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const puzzles = await ctx.db
      .query('puzzles')
      .withIndex('by_published', (q) => q.lte('publishedAt', now))
      .order('desc')
      .collect()

    return puzzles
      .filter((p) => p.publishedAt !== undefined)
      .map((p) => ({
        _id: p._id,
        _creationTime: p._creationTime,
        title: p.title,
        publishedAt: p.publishedAt!,
        maxTries: p.maxTries,
        solvedBy: p.solvedBy,
        solvedAt: p.solvedAt,
      }))
  },
})

export const byId = query({
  args: { puzzleId: v.id('puzzles') },
  handler: async (ctx, args) => {
    const p = await ctx.db.get(args.puzzleId)
    if (
      !p ||
      p.publishedAt === undefined ||
      p.publishedAt > Date.now()
    ) {
      return null
    }
    return {
      _id: p._id,
      _creationTime: p._creationTime,
      title: p.title,
      description: p.description,
      maxTries: p.maxTries,
      publishedAt: p.publishedAt,
      solvedBy: p.solvedBy,
      solvedAt: p.solvedAt,
    }
  },
})

const PUZZLE_1_BODY = `HIIFJSCDVHEROPDWARRUFHNJIGHTMSEQVITALFNHJIJUDMPRPITBPGWNWGHKHADCVQMTWFCJJKAPWNGDKOIKCLGGJAARALLKIHVPUOGGWHPUFBUBGKMSVQGRJVQTUHCBUJVFBTPMFSFMRSHVTGQFRJSWIAAHDPUFMDKSDRONEUUEIDCRWEQJBDLDKTIPFREABRHNGTFGRNDNVIBKQABMCDBOJOJIELKHUPLPBEAQOUMMMARRKIUARTFEBDFEAJJUCETIGMNLHIJSFWWJPBRIHKNPTRDUEWOHTWSRVRLUWPQEUONHTOSARNECNNGWQPUBRTRGRQSDEGETQRKIGRBUFVPOUGWSGHSEQUGKPGPBPQAEPTLSFVROBDTKSODBTQAFSAUDUWTIHJMNDOCOLHPJIOITHUKCCNMCSVBAAIQUNIAWWKPCIKWGFRJUAAHNTVAVMEOJRMMWEDOPLKCOEGCDNNIMJEFGWLTPAFQVVUACRGQURDNWWHCBCSIVEFTBINSKO
2 5@8 @? E96 >@@? @?46 D2:5i d\`7_6\`abbc47e4f2heh5a22\`2aa_2df5dbee_\`d6`

const PUZZLE_2_BODY = `/rRoSapsG0mYJtfMxKA3LigccFOylL+ZL7stK8x1dk+43Z2sjXhINL+q1BtWBSCQBfnAJXRwYkBNGBxZyinKV+Iz3vSpfRLa6kj=
(96C6 :E 2== 3682}0_>AIqd:'"`

const PUZZLES_TO_SEED = [
  {
    title: "Theo's Puzzle #1",
    description: PUZZLE_1_BODY,
    maxTries: 999,
    publishedAt: Date.UTC(2026, 3, 24),
  },
  {
    title: "Theo's Puzzle #2",
    description: PUZZLE_2_BODY,
    maxTries: 999,
    publishedAt: Date.UTC(2026, 3, 25),
  },
]

export const seed = internalMutation({
  args: {
    answers: v.array(v.string()),
    force: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.answers.length !== PUZZLES_TO_SEED.length) {
      throw new Error(
        `Expected ${PUZZLES_TO_SEED.length} answers, got ${args.answers.length}.`,
      )
    }

    const existing = await ctx.db.query('puzzles').collect()
    if (existing.length > 0) {
      if (!args.force) {
        return { skipped: 'already seeded', count: existing.length }
      }
      for (const p of existing) {
        await ctx.db.delete(p._id)
      }
    }

    const ids = []
    for (const [i, puzzle] of PUZZLES_TO_SEED.entries()) {
      const id = await ctx.db.insert('puzzles', {
        title: puzzle.title,
        description: puzzle.description,
        answerHash: await hashAnswer(args.answers[i]),
        maxTries: puzzle.maxTries,
        publishedAt: puzzle.publishedAt,
      })
      ids.push(id)
    }

    return { seeded: ids, force: Boolean(args.force) }
  },
})
