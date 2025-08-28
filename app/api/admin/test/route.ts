import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  console.log('Test endpoint called');
  
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log('No userId found');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    console.log('User authenticated:', userId);

    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const role = user?.publicMetadata?.role;
      console.log('User role:', role);
      
      return NextResponse.json({ 
        message: 'Test successful',
        userId,
        role,
        timestamp: new Date().toISOString()
      });
    } catch (clerkError) {
      console.error('Clerk error:', clerkError);
      return NextResponse.json({ error: 'Admin check failed' }, { status: 403 });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
