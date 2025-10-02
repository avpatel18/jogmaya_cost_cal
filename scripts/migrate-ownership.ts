// scripts/migrate-ownership.ts
// Purpose: If you have a CSV with calc_id,email, map each calculation to a NextAuth user by email
// Usage:
//   1) Place a CSV at scripts/calc_email_map.csv with headers: calc_id,email
//   2) Set DATABASE_URL in your environment (Railway Postgres)
//   3) Run: `yarn tsx scripts/migrate-ownership.ts`

import { createInterface } from 'readline'
import { createReadStream } from 'fs'
import { prisma } from '../lib/db'

async function main() {
  const file = 'scripts/calc_email_map.csv'
  const rl = createInterface({ input: createReadStream(file), crlfDelay: Infinity })

  let lineNo = 0
  let updated = 0
  for await (const line of rl) {
    lineNo++
    if (lineNo === 1 && line.toLowerCase().includes('calc_id')) continue // skip header
    const [calcId, email] = line.split(',').map(s => s.trim())
    if (!calcId || !email) continue

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      console.warn(`No NextAuth user for email=${email} (line ${lineNo})`)
      continue
    }

    await prisma.calculation.update({ where: { id: calcId }, data: { userId: user.id } })
    updated++
  }

  console.log(`Updated ownership for ${updated} calculations.`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})
