import { NextResponse } from 'next/server';
import { initializeMongoDB, testMongoDBConnection } from '@/lib/initMongoDB';

export async function POST() {
  try {
    // MongoDB 연결 테스트
    const isConnected = await testMongoDBConnection();
    if (!isConnected) {
      return NextResponse.json({
        error: 'MongoDB connection failed. Please check your connection string.'
      }, { status: 500 });
    }

    // 데이터베이스 초기화
    await initializeMongoDB();

    return NextResponse.json({
      message: 'MongoDB initialized successfully',
      collections: ['agencies', 'hourly_stats', 'overall_stats']
    });
  } catch (error) {
    console.error('Error initializing MongoDB:', error);
    return NextResponse.json({
      error: 'Failed to initialize MongoDB',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // MongoDB 연결 테스트만 수행
    const isConnected = await testMongoDBConnection();

    if (isConnected) {
      return NextResponse.json({
        status: 'connected',
        message: 'MongoDB is ready',
        config: {
          uri: process.env.MONGODB_URI ? 'Set' : 'Not set',
          database: process.env.MONGODB_DATABASE || 'gov-status',
          username: process.env.MONGODB_USERNAME ? 'Set' : 'Not set',
          password: process.env.MONGODB_PASSWORD ? 'Set' : 'Not set',
          authSource: process.env.MONGODB_AUTH_SOURCE || 'admin'
        }
      });
    } else {
      return NextResponse.json({
        status: 'disconnected',
        message: 'MongoDB connection failed'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error testing MongoDB connection:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to test MongoDB connection',
      details: error instanceof Error ? error.message : 'Unknown error',
      config: {
        uri: process.env.MONGODB_URI ? 'Set' : 'Not set',
        database: process.env.MONGODB_DATABASE || 'gov-status',
        username: process.env.MONGODB_USERNAME ? 'Set' : 'Not set',
        password: process.env.MONGODB_PASSWORD ? 'Set' : 'Not set',
        authSource: process.env.MONGODB_AUTH_SOURCE || 'admin'
      }
    }, { status: 500 });
  }
}
