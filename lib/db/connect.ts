import mongoose from "mongoose";

/**
 * Cached connection to avoid multiple connections during Next.js hot-reloading
 * in development and to reuse existing connections across serverless invocations.
 */
declare global {
  var _mongooseConnection: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  } | undefined;
}

const cached = global._mongooseConnection || { conn: null, promise: null };

if (!global._mongooseConnection) {
  global._mongooseConnection = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  let cfUri: string | undefined;
  try {
    // Dynamic import to retrieve Cloudflare Workers runtime env if running under OpenNext
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cf = await (Function('return import("@opennextjs/cloudflare")')() as Promise<any>);
    cfUri = cf?.getCloudflareContext?.()?.env?.MONGODB_URI;
  } catch {
    // Not running under OpenNext or context unavailable
  }

  const MONGODB_URI =
    process.env.MONGODB_URI ||
    cfUri ||
    (globalThis as unknown as { MONGODB_URI?: string }).MONGODB_URI ||
    (globalThis as unknown as { process?: { env?: { MONGODB_URI?: string } } }).process?.env?.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable in .env.local or Cloudflare Variables"
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

export default connectDB;
