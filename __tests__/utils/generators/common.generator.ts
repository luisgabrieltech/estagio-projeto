import * as fc from 'fast-check'

export const emailArb = fc.emailAddress()

export const nameArb = fc
  .string({ minLength: 2, maxLength: 100 })
  .filter((s) => s.trim().length >= 2)

export const passwordArb = fc
  .tuple(
    fc.array(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), { minLength: 1, maxLength: 3 }),
    fc.array(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 3 }),
    fc.array(fc.constantFrom(...'0123456789'.split('')), { minLength: 1, maxLength: 3 }),
    fc.array(fc.constantFrom(...'!@#%^&*()_+-=[]{}|;:,.<>?'.split('')), { minLength: 1, maxLength: 2 }),
    fc.array(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('')), { minLength: 0, maxLength: 5 })
  )
  .map(([upper, lower, digit, special, extra]) => {
  const chars = [...upper, ...lower, ...digit, ...special, ...extra]
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
  })
  .filter((s) => {
    return s.length >= 8 && !/\$\d+\$/.test(s) && !/\$2[aby]\$/.test(s)
  })

export const cuidArb = fc.uuid()

export const dateArb = fc.date({
  min: new Date('2020-01-01'),
  max: new Date('2030-12-31'),
}).filter((d) => !isNaN(d.getTime()))

export const pastDateArb = fc.date({
  min: new Date('2020-01-01'),
  max: new Date(),
})

export const futureDateArb = fc.date({
  min: new Date(),
  max: new Date('2030-12-31'),
})

export const nonEmptyStringArb = fc
  .string({ minLength: 1, maxLength: 500 })
  .filter((s) => s.trim().length > 0)

export const optionalStringArb = fc.option(nonEmptyStringArb, { nil: undefined })

export const positiveIntArb = fc.integer({ min: 1, max: 10000 })

export const nonNegativeIntArb = fc.integer({ min: 0, max: 10000 })

export const percentageArb = fc.float({ min: 0, max: 100, noNaN: true })

export const paginationArb = fc.record({
  page: fc.integer({ min: 1, max: 100 }),
  pageSize: fc.integer({ min: 1, max: 100 }),
})

export const booleanArb = fc.boolean()

export const stringArrayArb = fc.array(nonEmptyStringArb, { minLength: 0, maxLength: 10 })

export const nonEmptyStringArrayArb = fc.array(nonEmptyStringArb, { minLength: 1, maxLength: 10 })
