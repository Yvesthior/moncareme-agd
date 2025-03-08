import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Dates manquantes" }, { status: 400 });
    }

    const entries = await db.weeklyEntry.findMany({
      where: {
        userId: userId,
        startDate: {
          gte: new Date(startDate),
        },
        endDate: {
          lte: new Date(endDate),
        },
      },
      include: {
        days: true,
      },
    });

    const formattedEntries = entries.map((entry) => ({
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
    console.log("entries found", formattedEntries);

    return NextResponse.json(formattedEntries);
  } catch (error) {
    console.error("Erreur lors de la récupération des entrées:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

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

    // Créer la nouvelle entrée
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

    // Formater l'entrée pour la réponse
    const formattedEntry = {
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

    return NextResponse.json([formattedEntry]);
  } catch (error) {
    console.error("Erreur lors de la création de l'entrée:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
