
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Calculation as CalcInput } from '@/lib/types';

export const dynamic = 'force-dynamic';

// Get single calculation
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const calculation = await prisma.calculation.findFirst({
      where: { id: params.id, userId: user.id },
      include: { weftFeeders: true, warpYarns: true },
    })

    if (!calculation) return NextResponse.json({ error: 'Calculation not found' }, { status: 404 })

    return NextResponse.json(calculation)
  } catch (error) {
    console.error('Error fetching calculation:', error)
    return NextResponse.json({ error: 'Failed to fetch calculation' }, { status: 500 })
  }
}

// Update calculation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const calculationData: CalcInput = await request.json()

    // Verify ownership
    const existing = await prisma.calculation.findFirst({ where: { id: params.id, userId: user.id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.$transaction([
      prisma.weftFeeder.deleteMany({ where: { calculationId: params.id } }),
      prisma.warpYarn.deleteMany({ where: { calculationId: params.id } }),
      prisma.calculation.update({
        where: { id: params.id },
        data: {
          qualityName: calculationData.qualityName,
          totalCard: calculationData.mainInfo.totalCard,
          pickOnLooms: calculationData.mainInfo.pickOnLooms,
          pano: calculationData.mainInfo.pano,
          wastagePercent: calculationData.extraInfo.wastagePercent,
          jobCharge: calculationData.extraInfo.jobCharge,
          rebatePercent: calculationData.extraInfo.rebatePercent,
          salesRate: calculationData.extraInfo.salesRate,
          brokeragePercent: calculationData.extraInfo.brokeragePercent,
        },
      }),
      prisma.weftFeeder.createMany({
        data: calculationData.weftFeeders.map((feeder, index) => ({
          calculationId: params.id,
          feederName: feeder.feederName,
          yarnName: feeder.yarnName,
          card: feeder.card,
          denier: feeder.denier,
          rate: feeder.rate,
          wastagePercent: feeder.wastagePercent,
          sortOrder: feeder.sortOrder ?? index,
        })),
      }),
      prisma.warpYarn.createMany({
        data: calculationData.warpYarns.map((yarn, index) => ({
          calculationId: params.id,
          yarnName: yarn.yarnName,
          tar: yarn.tar,
          denier: yarn.denier,
          rate: yarn.rate,
          sortOrder: yarn.sortOrder ?? index,
        })),
      }),
    ])

    return NextResponse.json({ message: 'Calculation updated successfully!' })
  } catch (error) {
    console.error('Error updating calculation:', error)
    return NextResponse.json({ error: 'Failed to update calculation' }, { status: 500 })
  }
}

// Delete calculation
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Ensure ownership
    const existing = await prisma.calculation.findFirst({ where: { id: params.id, userId: user.id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.calculation.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true, message: 'Calculation deleted successfully!' })
  } catch (error) {
    console.error('Error deleting calculation:', error)
    return NextResponse.json({ error: 'Failed to delete calculation' }, { status: 500 })
  }
}
