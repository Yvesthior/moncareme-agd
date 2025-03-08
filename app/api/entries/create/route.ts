import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Dates manquantes" }, { status: 400 });
    }

    // Vérifier si une entrée existe déjà pour cette période
    const existingEntry = await db.weeklyEntry.findFirst({
      where: {
        userId: userId,
        startDate: {
          gte: new Date(startDate),
        },
        endDate: {
          lte: new Date(endDate),
        },
      },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: "Une entrée existe déjà pour cette période" },
        { status: 400 }
      );
    }

    const entry = await db.weeklyEntry.create({
      data: {
        userId: userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days: {
          create: Array.from({ length: 7 }, (_, i) => ({
            date: new Date(
              new Date(startDate).getTime() + i * 24 * 60 * 60 * 1000
            ),
            exercises: {},
          })),
        },
      },
      include: {
        days: true,
      },
    });

    const formattedEntry = {
      id: entry.id,
      userId: entry.userId,
      startDate: entry.startDate.toISOString(),
      endDate: entry.endDate.toISOString(),
      charityActs: entry.charityActs || "",
      comments: entry.comments || "",
      difficulties: entry.difficulties || "",
      improvements: entry.improvements || "",
      successes: entry.successes || "",
      days: entry.days.map((day) => ({
        id: day.id,
        date: day.date.toISOString(),
        exercises: day.exercises as Record<string, boolean>,
      })),
    };

    return NextResponse.json(formattedEntry);
  } catch (error) {
    console.error("Erreur lors de la création de l'entrée:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
