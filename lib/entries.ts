import { db } from "@/lib/db";
import type { WeeklyEntry } from "@/types/entries";
import { auth } from "@clerk/nextjs/server";

export async function getUserEntries(
  startDate: Date,
  endDate: Date
): Promise<WeeklyEntry[]> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const entries = await db.weeklyEntry.findMany({
    where: {
      userId: userId,
      startDate: {
        gte: startDate,
      },
      endDate: {
        lte: endDate,
      },
    },
    include: {
      days: true,
    },
  });

  return entries.map((entry) => ({
    id: entry.id,
    userId: entry.userId,
    startDate: entry.startDate,
    endDate: entry.endDate,
    charityActs: entry.charityActs || "",
    comments: entry.comments || "",
    difficulties: entry.difficulties || "",
    improvements: entry.improvements || "",
    successes: entry.successes || "",
    days: entry.days.map((day) => ({
      id: day.id,
      date: day.date,
      exercises: day.exercises as Record<string, boolean>,
    })),
  }));
}

export async function createNewWeek(
  startDate: Date,
  endDate: Date
): Promise<WeeklyEntry> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const entry = await db.weeklyEntry.create({
    data: {
      userId: userId,
      startDate,
      endDate,
      days: {
        create: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000),
          exercises: {},
        })),
      },
    },
    include: {
      days: true,
    },
  });

  return {
    id: entry.id,
    userId: entry.userId,
    startDate: entry.startDate,
    endDate: entry.endDate,
    charityActs: entry.charityActs || "",
    comments: entry.comments || "",
    difficulties: entry.difficulties || "",
    improvements: entry.improvements || "",
    successes: entry.successes || "",
    days: entry.days.map((day) => ({
      id: day.id,
      date: day.date,
      exercises: day.exercises as Record<string, boolean>,
    })),
  };
}

export async function updateWeeklyEntry(
  entry: WeeklyEntry
): Promise<WeeklyEntry> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  if (entry.userId !== userId) {
    throw new Error("Unauthorized");
  }

  const updatedEntry = await db.weeklyEntry.update({
    where: {
      id: entry.id,
    },
    data: {
      charityActs: entry.charityActs,
      comments: entry.comments,
      difficulties: entry.difficulties,
      improvements: entry.improvements,
      successes: entry.successes,
      days: {
        upsert: entry.days.map((day, index) => ({
          where: {
            id: day.id || `temp-id-${index}`,
          },
          create: {
            date: day.date,
            exercises: day.exercises,
          },
          update: {
            exercises: day.exercises,
          },
        })),
      },
    },
    include: {
      days: true,
    },
  });

  return {
    id: updatedEntry.id,
    userId: updatedEntry.userId,
    startDate: updatedEntry.startDate,
    endDate: updatedEntry.endDate,
    charityActs: updatedEntry.charityActs || "",
    comments: updatedEntry.comments || "",
    difficulties: updatedEntry.difficulties || "",
    improvements: updatedEntry.improvements || "",
    successes: updatedEntry.successes || "",
    days: updatedEntry.days.map((day) => ({
      id: day.id,
      date: day.date,
      exercises: day.exercises as Record<string, boolean>,
    })),
  };
}
