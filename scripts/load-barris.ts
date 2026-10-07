// scripts/load-barris.ts
//
// One-off data-loading script. Reads Barcelona's official district/barri
// dataset (Open Data BCN, JSON export) and inserts each polygon into
// `barcelona_barris` using PostGIS ST_GeomFromText.
//
// The geometry field is WKT text (geometria_wgs84: "POLYGON ((lng lat, ...))"),
// NOT GeoJSON, so ST_GeomFromText is the right function.
//
// Each barri is split into several rows (one per "aeb", a basic statistical
// area). That is fine: every row carries the correct district and barri name,
// and ST_Contains only needs to find ANY matching polygon at query time.
//
// Usage:
//   npx tsx --env-file=.env.local scripts/load-barris.ts <path-to-json> [--replace]
//
//   --replace   delete the existing rows first (inside the same transaction).
//               Without it, the script refuses to run on a non-empty table.
//
// Requires: npm i pg   and   npm i -D @types/pg tsx
// Requires env var DATABASE_URL (Supabase -> Project Settings -> Database ->
// Connection string -> URI). Use the pooler URI if your network has no IPv6.

import { readFileSync } from 'node:fs'
import { Client } from 'pg'

interface BarriRecord {
  codi_districte: string
  nom_districte: string
  codi_barri: string
  nom_barri: string
  aeb: string
  geometria_etrs89: string // projected UTM coordinates, not used
  geometria_wgs84: string // WKT "POLYGON ((lng lat, ...))", used
}

function fail(message: string, details?: unknown): never {
  console.error(message)
  if (details !== undefined) console.error(details)
  process.exit(1)
}

async function main() {
  const args = process.argv.slice(2)
  const replace = args.includes('--replace')
  const filePath = args.find((a) => !a.startsWith('--'))

  if (!filePath) {
    fail('Usage: npx tsx --env-file=.env.local scripts/load-barris.ts <path-to-json> [--replace]')
  }

  // FIX 1: clear message instead of the cryptic
  // "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string"
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    fail(
      'DATABASE_URL is not set.\n' +
        'Run with: npx tsx --env-file=.env.local scripts/load-barris.ts <file>'
    )
  }

  const records: BarriRecord[] = JSON.parse(readFileSync(filePath, 'utf-8'))
  if (!Array.isArray(records) || records.length === 0) {
    fail('No records found. Is this a JSON array?')
  }

  // Check the shape of EVERY record before writing anything.
  const required = ['nom_districte', 'nom_barri', 'geometria_wgs84'] as const
  const bad = records.findIndex((r) => required.some((key) => !r?.[key]))
  if (bad !== -1) {
    fail(`Record #${bad} is missing one of: ${required.join(', ')}`, records[bad])
  }

  const client = new Client({ connectionString })
  await client.connect()

  try {
    await client.query('BEGIN')

    // FIX 2: the script is safe to re-run. It never silently duplicates polygons.
    const { rows } = await client.query('select count(*)::int as n from barcelona_barris')
    const existing: number = rows[0].n

    if (existing > 0 && !replace) {
      throw new Error(
        `barcelona_barris already has ${existing} rows. ` +
          'Run again with --replace to delete them first.'
      )
    }
    if (existing > 0 && replace) {
      await client.query('delete from barcelona_barris')
      console.log(`Deleted ${existing} existing rows.`)
    }

    for (const record of records) {
      await client.query(
        `insert into barcelona_barris (district_name, barri_name, geom)
         values ($1, $2, ST_Multi(ST_GeomFromText($3, 4326)))`,
        [record.nom_districte, record.nom_barri, record.geometria_wgs84]
      )
    }

    // Sanity check inside the transaction: the loaded polygons must be valid geometries.
    const invalid = await client.query(
      'select count(*)::int as n from barcelona_barris where not ST_IsValid(geom)'
    )
    if (invalid.rows[0].n > 0) {
      console.warn(`Warning: ${invalid.rows[0].n} polygons are not valid (ST_IsValid = false).`)
    }

    await client.query('COMMIT')
    console.log(`Inserted ${records.length} polygon pieces across all barris.`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Failed, rolled back:', err instanceof Error ? err.message : err)
    // FIX 3: no process.exit() here, so `finally` still closes the connection.
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})