import { MongoClient, ServerApiVersion } from "mongodb";

const uri = "mongodb+srv://sanjaygouda2109:Sanjay21@timetracker.p5d4d.mongodb.net/?retryWrites=true&w=majority&tls=true";

if (!uri) {
  throw new Error("❌ MongoDB URI is missing!");
}

// MongoDB Client Singleton (for reuse)
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tls: true, // Ensure TLS is enabled
});

// Export a promise to ensure a single connection instance
export const clientPromise = client.connect().then(() => {
  console.log("✅ MongoDB Connected!");
  return client;
}).catch((error) => {
  console.error("❌ MongoDB Connection Error:", error);
  throw error;
});
