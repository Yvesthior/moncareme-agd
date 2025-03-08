import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const entryId = params.id;
    const entryData = await request.json();

    // Vérifier que l'entrée appartient à l'utilisateur
    const existingEntry = await db.weeklyEntry.findUnique({
      where: {
        id: entryId,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Entrée non trouvée" },
        { status: 404 }
      );
    }

    if (existingEntry.userId !== userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Mettre à jour l'entrée
    const updatedEntry = await db.weeklyEntry.update({
      where: {
        id: entryId,
      },
      data: {
        charityActs: entryData.charityActs,
        comments: entryData.comments,
        difficulties: entryData.difficulties,
        improvements: entryData.improvements,
        successes: entryData.successes,
        days: {
          upsert: entryData.days.map((day: any, index: number) => ({
            where: {
              id: day.id || `temp-id-${index}`,
            },
            create: {
              date: new Date(day.date),
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

    const formattedEntry = {
      id: updatedEntry.id,
      userId: updatedEntry.userId,
      startDate: updatedEntry.startDate.toISOString(),
      endDate: updatedEntry.endDate.toISOString(),
      charityActs: updatedEntry.charityActs || "",
      comments: updatedEntry.comments || "",
      difficulties: updatedEntry.difficulties || "",
      improvements: updatedEntry.improvements || "",
      successes: updatedEntry.successes || "",
      days: updatedEntry.days.map((day) => ({
        id: day.id,
        date: day.date.toISOString(),
        exercises: day.exercises as Record<string, boolean>,
      })),
    };

    return NextResponse.json(formattedEntry);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entrée:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
