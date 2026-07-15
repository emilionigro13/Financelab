import { z } from 'zod';

/**
 * Environment Configuration Schema
 * 
 * Uses Zod to validate and type all environment variables.
 * This ensures the server fails immediately with a clear error
 * if any required configuration is missing or invalid.
 * 
 * Benefits:
 * - Type safety: Config values have proper TypeScript types
 * - Validation: All env vars checked at startup
 * - Documentation: Schema serves as living documentation
 * - Defaults: Sensible fallbacks for development
 */

const envSchema = z.object({
  // ============================================
  // Server Configuration
  // ============================================
  PORT: z.coerce.number()
    .min(1)
    .max(65535)
    .default(4000)
    .describe('HTTP server port number'),

  NODE_ENV: z.enum(['development', 'production', 'test'])
    .default('development')
    .describe('Application environment mode'),

  // ============================================
  // Database Configuration
  // ============================================
  DATABASE_URL: z.string()
    .min(1)
    .describe('PostgreSQL connection string (required)'),

  // ============================================
  // Security Configuration
  // ============================================
  JWT_SECRET: z.string()
    .min(32)
    .default('dev-secret-do-not-use-in-production-min-32-chars')
    .describe('Secret key for JWT signing (min 32 chars)'),

  JWT_EXPIRES_IN: z.string()
    .default('15m')
    .describe('JWT token expiration time (e.g., 15m, 1h, 7d)'),

  // ============================================
  // External API Keys (Optional - for future use)
  // ============================================
  ALPHA_VANTAGE_API_KEY: z.string()
    .optional()
    .describe('Alpha Vantage API key for financial data'),

  FINNHUB_API_KEY: z.string()
    .optional()
    .describe('Finnhub API key for financial data'),

  POLYGON_API_KEY: z.string()
    .optional()
    .describe('Polygon.io API key for financial data'),
});

/**
 * Parse and validate environment variables
 * 
 * This will throw a ZodError if validation fails,
 * causing the server to exit immediately with a clear message.
 */
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Environment validation failed:');
  console.error('');

  // Format errors in a readable way
  const errors = parsedEnv.error.issues;
  errors.forEach((error) => {
    console.error(`  • ${error.path.join('.')}: ${error.message}`);
  });

  console.error('');
  console.error('Please check your .env file and ensure all required variables are set.');
  console.error('See .env.example for reference.');
  console.error('');

  process.exit(1);
}

/**
 * Typed configuration object
 * 
 * All values are properly typed:
 * - PORT is a number (not string)
 * - NODE_ENV is a specific union type
 * - Optional keys may be undefined
 */
export const config = {
  server: {
    port: parsedEnv.data.PORT,
    env: parsedEnv.data.NODE_ENV,
    isDevelopment: parsedEnv.data.NODE_ENV === 'development',
    isProduction: parsedEnv.data.NODE_ENV === 'production',
    isTest: parsedEnv.data.NODE_ENV === 'test',
  },

  database: {
    url: parsedEnv.data.DATABASE_URL,
  },

  security: {
    jwtSecret: parsedEnv.data.JWT_SECRET,
    jwtExpiresIn: parsedEnv.data.JWT_EXPIRES_IN,
  },

  api: {
    alphaVantage: parsedEnv.data.ALPHA_VANTAGE_API_KEY,
    finnhub: parsedEnv.data.FINNHUB_API_KEY,
    polygon: parsedEnv.data.POLYGON_API_KEY,
  },
} as const;

/**
 * Type for the configuration object
 * Useful for typing functions that accept config
 */
export type Config = typeof config;

// Log configuration in development (hide secrets)
if (config.server.isDevelopment) {
  console.log('⚙️  Configuration loaded:');
  console.log(`  Port:    ${config.server.port}`);
  console.log(`  Env:     ${config.server.env}`);
  console.log(`  DB:      ${config.database.url.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // Hide credentials
  console.log(`  JWT:     ${config.security.jwtSecret.substring(0, 10)}...`); // Show only prefix
  console.log('');
}
