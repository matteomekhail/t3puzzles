import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import { hashAnswer } from './hash'
import type { Doc } from './_generated/dataModel'
import type { MutationCtx, QueryCtx } from './_generated/server'

async function getCurrentUser(ctx: QueryCtx): Promise<Doc<'users'> | null> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return null
  return await ctx.db
    .query('users')
    .withIndex('by_shoo_sub', (q) => q.eq('shooSub', identity.subject))
    .unique()
}

async function getOrCreateCurrentUser(ctx: MutationCtx): Promise<Doc<'users'>> {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error('Not authenticated')

  const existing = await ctx.db
    .query('users')
    .withIndex('by_shoo_sub', (q) => q.eq('shooSub', identity.subject))
    .unique()
  if (existing) return existing

  const id = await ctx.db.insert('users', {
    shooSub: identity.subject,
    name: identity.name,
    email: identity.email,
    picture: identity.pictureUrl,
  })
  const created = await ctx.db.get(id)
  if (!created) throw new Error('Failed to create user')
  return created
}

export const myForPuzzle = query({
  args: { puzzleId: v.id('puzzles') },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx)
    if (!user) return []
    return await ctx.db
      .query('attempts')
      .withIndex('by_user_puzzle', (q) =>
        q.eq('userId', user._id).eq('puzzleId', args.puzzleId),
      )
      .order('desc')
      .collect()
  },
})

export const submit = mutation({
  args: { puzzleId: v.id('puzzles'), guess: v.string() },
  handler: async (ctx, args) => {
    const user = await getOrCreateCurrentUser(ctx)

    const puzzle = await ctx.db.get(args.puzzleId)
    if (!puzzle) throw new Error('Puzzle not found')
    if (puzzle.publishedAt === undefined || puzzle.publishedAt > Date.now()) {
      throw new Error('Puzzle not yet published')
    }

    if (puzzle.solvedBy) {
      return {
        result: 'locked' as const,
        correct: false,
        attemptsUsed: 0,
        maxTries: puzzle.maxTries,
      }
    }

    const priorAttempts = await ctx.db
      .query('attempts')
      .withIndex('by_user_puzzle', (q) =>
        q.eq('userId', user._id).eq('puzzleId', puzzle._id),
      )
      .collect()

    if (priorAttempts.length >= puzzle.maxTries) {
      return {
        result: 'out_of_tries' as const,
        correct: false,
        attemptsUsed: priorAttempts.length,
        maxTries: puzzle.maxTries,
      }
    }

    const guessHash = await hashAnswer(args.guess)
    const correct = guessHash === puzzle.answerHash

    await ctx.db.insert('attempts', {
      userId: user._id,
      puzzleId: puzzle._id,
      guess: args.guess,
      correct,
    })

    if (correct) {
      await ctx.db.patch(puzzle._id, {
        solvedBy: user._id,
        solvedAt: Date.now(),
      })
    }

    return {
      result: correct ? ('correct' as const) : ('incorrect' as const),
      correct,
      attemptsUsed: priorAttempts.length + 1,
      maxTries: puzzle.maxTries,
    }
  },
})
