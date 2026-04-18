import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_TOtIhaHc41Li@ep-holy-field-am8zn8p7-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  },
});