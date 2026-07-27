import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const schema = readFileSync('apps/api/prisma/schema.prisma', 'utf8');
const migrationsRoot = 'apps/api/prisma/migrations';
const migrationSql = readdirSync(migrationsRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .flatMap((entry) => {
    const path = join(migrationsRoot, entry.name, 'migration.sql');
    try {
      return [readFileSync(path, 'utf8')];
    } catch {
      return [];
    }
  })
  .join('\n');

const enumNames = [...schema.matchAll(/^enum\s+(\w+)/gm)].map((match) => match[1]);
const requiredFragments = [
  ...enumNames.map((name) => `CREATE TYPE "${name}"`),
  '"resolved_by_id"',
  'squad_members_squad_id_user_id_key',
  'monthly_deliverables_monthly_cycle_id_deliverable_type_id_key',
  'weekly_followups_monthly_cycle_id_week_start_key',
];
const missing = requiredFragments.filter((fragment) => !migrationSql.includes(fragment));

if (missing.length > 0) {
  console.error('Migration coverage is incomplete:');
  missing.forEach((fragment) => console.error(`- ${fragment}`));
  process.exit(1);
}

console.log(`Migration coverage OK (${requiredFragments.length} critical fragments).`);
