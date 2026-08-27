import { betterAuth } from "better-auth";
import { dash } from "@better-auth/infra";
import { Pool } from "pg";

const databaseUrl = import.meta.env.DATABASE_URL ?? process.env.DATABASE_URL;
const authUrl = import.meta.env.BETTER_AUTH_URL ?? process.env.BETTER_AUTH_URL;
const authSecret = import.meta.env.BETTER_AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET;
const dashKey = import.meta.env.BETTER_AUTH_API_KEY ?? process.env.BETTER_AUTH_API_KEY;

if (!databaseUrl) throw new Error("DATABASE_URL must be set before starting the server.");

export const db = new Pool({ connectionString: databaseUrl });
export const auth = betterAuth({
  appName: "IGS",
  baseURL: authUrl,
  secret: authSecret,
  database: db,
  user: { additionalFields: {
    addressLine1: { type: "string", required: false },
    addressLine2: { type: "string", required: false },
    city: { type: "string", required: false },
    state: { type: "string", required: false },
    postalCode: { type: "string", required: false },
    phone: { type: "string", required: false }
  }},
  emailAndPassword: { enabled: true },
  plugins: dashKey ? [dash({ apiKey: dashKey })] : []
});