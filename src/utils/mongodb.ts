// src/utils/mongodb.ts
import { MongoClient, Db, ServerApiVersion } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME ?? "whoru_db";

if (!MONGODB_URI) {
	throw new Error(
		"Please define the MONGODB_URI environment variable inside .env.local"
	);
}

if (!MONGODB_DB_NAME) {
	throw new Error(
		"Please define the MONGODB_DB_NAME environment variable inside .env.local, or ensure it is part of MONGODB_URI if not specified separately."
	);
}

// Define global types for TypeScript to recognize these variables
declare global {
	// eslint-disable-next-line no-var
	var _mongoClient: MongoClient | null;
	// eslint-disable-next-line no-var
	var _mongoDb: Db | null;
}

interface MongoConnection {
	client: MongoClient;
	db: Db;
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

if (process.env.NODE_ENV === "development") {
	// In development mode, use a global variable so that the value
	// is preserved across module reloads caused by HMR (Hot Module Replacement).
	global._mongoClient ??= null;
	global._mongoDb ??= null;
	cachedClient = global._mongoClient;
	cachedDb = global._mongoDb;
}

export async function connectToDatabase(): Promise<MongoConnection> {
	if (cachedClient && cachedDb) {
		// Verify connection by pinging
		try {
			await cachedClient.db(MONGODB_DB_NAME).command({ ping: 1 });
			return { client: cachedClient, db: cachedDb };
		} catch (e) {
			console.warn(
				"Cached MongoDB connection lost, attempting to reconnect...",
				e
			);
			// Connection might have been closed by the server or a network issue.
			// Nullify cached instances to force a new connection.
			cachedClient = null;
			cachedDb = null;
			if (process.env.NODE_ENV === "development") {
				global._mongoClient = null;
				global._mongoDb = null;
			}
		}
	}

	const client = new MongoClient(MONGODB_URI!, {
		serverApi: {
			version: ServerApiVersion.v1,
			strict: true,
			deprecationErrors: true,
		},
	});

	try {
		await client.connect();
		const db = client.db(MONGODB_DB_NAME);

		cachedClient = client;
		cachedDb = db;

		if (process.env.NODE_ENV === "development") {
			global._mongoClient = client;
			global._mongoDb = db;
		}

		return { client, db };
	} catch (error) {
		console.error("Failed to connect to MongoDB", error);
		// Ensure client is closed if connection fails partway
		await client
			.close()
			.catch((closeError) =>
				console.error(
					"Failed to close MongoDB client after connection error",
					closeError
				)
			);
		throw new Error("Failed to connect to MongoDB");
	}
}
