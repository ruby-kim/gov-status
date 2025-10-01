import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to environment variables');
}

const uri = process.env.MONGODB_URI;
const options: any = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

if (process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD) {
  options.auth = {
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
  };
  options.authSource = process.env.MONGODB_AUTH_SOURCE || 'admin';
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const globalWithMongo = global as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

if (!globalWithMongo._mongoClientPromise) {
  client = new MongoClient(uri, options);
  globalWithMongo._mongoClientPromise = client.connect();
}
clientPromise = globalWithMongo._mongoClientPromise;

export default clientPromise;

export async function getDatabase(): Promise<Db> {
  try {
    const client = await clientPromise;
    return client.db(process.env.MONGODB_DATABASE || 'gov-status');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}
