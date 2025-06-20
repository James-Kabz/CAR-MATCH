// app/api/analytics/engagement/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Get all users with their engagement metrics
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        lastMessageReadAt: true,
        createdAt: true,
        // Count matches
        matches: {
          select: {
            id: true,
            createdAt: true
          }
        },
        // Count messages sent (both direct and chat)
        sentMessages: {
          select: {
            id: true,
            createdAt: true
          }
        },
        sentChatMessages: {
          select: {
            id: true,
            createdAt: true
          }
        },
        // Count favorites
        favorites: {
          select: {
            id: true,
            createdAt: true
          }
        },
        // Count inquiries (calls/contact attempts)
        sentInquiries: {
          select: {
            id: true,
            createdAt: true
          }
        },
        // Count test drives scheduled (could be inquiries with specific status)
        _count: {
          select: {
            sentInquiries: {
              where: {
                status: 'RESPONDED' // Assuming responded inquiries are scheduled test drives
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform data to match the frontend schema
    const engagementData = users.map(user => ({
      id: user.id,
      userId: user.id,
      userName: user.name || user.email.split('@')[0],
      matches: user.matches.length,
      messagesSent: user.sentMessages.length + user.sentChatMessages.length,
      favoritesAdded: user.favorites.length,
      callsMade: user.sentInquiries.length,
      testDrivesScheduled: user._count.sentInquiries,
      lastActive: user.lastMessageReadAt?.toISOString() || user.createdAt.toISOString()
    }))

    return NextResponse.json(engagementData)
  } catch (error) {
    console.error('Error fetching engagement data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch engagement data' },
      { status: 500 }
    )
  }
}