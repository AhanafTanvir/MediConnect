import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  memoryServerUri?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
  // eslint-disable-next-line no-var
  var __mongoMemoryServer: any;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    let uri = process.env.MONGODB_URI;

    if (!uri) {
      if (!cached.memoryServerUri) {
        try {
          if (!global.__mongoMemoryServer) {
            const { MongoMemoryServer } = await import("mongodb-memory-server");
            global.__mongoMemoryServer = await MongoMemoryServer.create({
              instance: {
                dbName: "mediconnect",
              },
            });
          }
          cached.memoryServerUri = global.__mongoMemoryServer.getUri();
        } catch (err) {
          cached.memoryServerUri = "mongodb://127.0.0.1:27017/mediconnect";
        }
      }
      uri = cached.memoryServerUri;
    }

    cached.promise = mongoose
      .connect(uri as string, opts)
      .then((m) => {
        console.log(`[MediConnect] Database connected to: ${uri ? (uri.startsWith("mongodb://127") || uri.includes("memory") ? "In-Memory / Local DB" : "Remote Cluster") : "Unknown"}`);
        return m;
      })
      .catch((err) => {
        // If connection failed because another connection is active
        if (mongoose.connection.readyState >= 1) {
          return mongoose;
        }
        console.warn("[MediConnect DB Notice]:", err.message);
        return mongoose;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    return mongoose;
  }

  return cached.conn || mongoose;
}

export default connectDB;
