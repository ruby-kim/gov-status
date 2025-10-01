import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options: any = { // eslint-disable-line @typescript-eslint/no-explicit-any
  // MongoDB Atlas 최적화 설정
  maxPoolSize: 10, // 연결 풀 크기
  serverSelectionTimeoutMS: 5000, // 서버 선택 타임아웃
  socketTimeoutMS: 45000, // 소켓 타임아웃
};

// 인증 정보가 있는 경우에만 추가
if (process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD) {
  options.auth = {
    username: process.env.MONGODB_USERNAME,
    password: process.env.MONGODB_PASSWORD,
  };
  options.authSource = process.env.MONGODB_AUTH_SOURCE || 'admin';
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

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