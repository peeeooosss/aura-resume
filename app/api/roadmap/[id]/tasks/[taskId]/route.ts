import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireSessionUserId } from '@/lib/auth/getSessionUser';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const userId = await requireSessionUserId();
    const { id, taskId } = params;
    const body = await req.json();
    const { completed } = body;

    const roadmap = await prisma.roadmap.findFirst({
      where: { id, userId },
    });

    if (!roadmap) {
      return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 });
    }

    const phases = roadmap.phases as any[];
    let taskFound = false;
    let newCompletedTasks = roadmap.completedTasks;

    for (const phase of phases) {
      for (const week of phase.weeksData || []) {
        for (const day of week.days || []) {
          if (`day-${day.day}` === taskId || day.day.toString() === taskId) {
            if (completed && !day.isCompleted) {
              day.isCompleted = true;
              day.completedAt = new Date().toISOString();
              newCompletedTasks++;
            } else if (!completed && day.isCompleted) {
              day.isCompleted = false;
              day.completedAt = undefined;
              newCompletedTasks--;
            }
            taskFound = true;
            break;
          }
        }
        if (taskFound) break;
      }
      if (taskFound) break;
    }

    if (!taskFound) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const totalTasks = phases.reduce((acc: number, phase: any) =>
      acc + (phase.weeksData?.reduce((wAcc: number, week: any) =>
        wAcc + (week.days?.length || 0), 0) || 0), 0);

    const progress = totalTasks > 0 ? Math.round((newCompletedTasks / totalTasks) * 100) : 0;

    const updatedRoadmap = await prisma.roadmap.update({
      where: { id },
      data: {
        phases: phases,
        completedTasks: newCompletedTasks,
        totalTasks,
        progress,
      },
    });

    return NextResponse.json({ roadmap: updatedRoadmap });
  } catch (error) {
    console.error('Complete task error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete task' },
      { status: 500 }
    );
  }
}
