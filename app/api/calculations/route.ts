
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Calculation as CalcInput } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Get all calculations for the authenticated user
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json([], { status: 200 })

    const calculations = await prisma.calculation.findMany({
      where: { userId: user.id },
      include: { weftFeeders: true, warpYarns: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(calculations)
  } catch (error) {
    console.error('Error fetching calculations:', error)
    return NextResponse.json({ error: 'Failed to fetch calculations' }, { status: 500 })
  }
}

// Create new calculation
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const calculationData: CalcInput = await request.json()

    const created = await prisma.calculation.create({
      data: {
        userId: user.id,
        qualityName: calculationData.qualityName,
        totalCard: calculationData.mainInfo.totalCard,
        pickOnLooms: calculationData.mainInfo.pickOnLooms,
        pano: calculationData.mainInfo.pano,
        wastagePercent: calculationData.extraInfo.wastagePercent,
        jobCharge: calculationData.extraInfo.jobCharge,
        rebatePercent: calculationData.extraInfo.rebatePercent,
        salesRate: calculationData.extraInfo.salesRate,
        brokeragePercent: calculationData.extraInfo.brokeragePercent,
        weftFeeders: {
          create: calculationData.weftFeeders.map((feeder, index) => ({
            feederName: feeder.feederName,
            yarnName: feeder.yarnName,
            card: feeder.card,
            denier: feeder.denier,
            rate: feeder.rate,
            wastagePercent: feeder.wastagePercent,
            sortOrder: feeder.sortOrder ?? index,
          })),
        },
        warpYarns: {
          create: calculationData.warpYarns.map((yarn, index) => ({
            yarnName: yarn.yarnName,
            tar: yarn.tar,
            denier: yarn.denier,
            rate: yarn.rate,
            sortOrder: yarn.sortOrder ?? index,
          })),
        },
      },
      select: { id: true },
    })

    return NextResponse.json({ message: 'Calculation saved successfully!', id: created.id })
  } catch (error) {
    console.error('Error creating calculation:', error)
    return NextResponse.json({ error: 'Failed to create calculation' }, { status: 500 })
  }
}
