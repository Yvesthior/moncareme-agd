"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { WeeklyEntry } from "@/types/entries";
import { updateEntry } from "@/lib/client/api";

const daysOfWeek = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];
const exercises = [
  { id: "morningPrayer", label: "Prière Matinale" },
  { id: "mass", label: "Messe" },
  { id: "rosary", label: "Chapelet" },
  { id: "lectio", label: "Lectio" },
  { id: "fasting", label: "Jeûne" },
  { id: "eveningPrayer", label: "Prière du Soir" },
  { id: "tuesdayPrayer", label: "Prière Mardi" },
  { id: "fridayPrayer", label: "Prière Vendredi" },
  { id: "wakeupSpace", label: "Espace du Réveil" },
];

interface WeeklyTrackerProps {
  entry: WeeklyEntry;
  onUpdate: () => void;
}

export function WeeklyTracker({ entry, onUpdate }: WeeklyTrackerProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [localEntry, setLocalEntry] = useState<WeeklyEntry>({
    ...entry,
    days: Array.isArray(entry.days) ? entry.days : [],
  });

  const handleCheckboxChange = (
    day: number,
    exercise: string,
    checked: boolean
  ) => {
    const updatedDays = [...localEntry.days];

    if (!updatedDays[day]) {
      updatedDays[day] = {
        date: new Date(),
        exercises: {},
      };
    }

    updatedDays[day].exercises = {
      ...updatedDays[day].exercises,
      [exercise]: checked,
    };

    setLocalEntry({
      ...localEntry,
      days: updatedDays,
    });
  };

  const handleTextChange = (field: keyof WeeklyEntry, value: string) => {
    setLocalEntry({
      ...localEntry,
      [field]: value,
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateEntry(localEntry.id, localEntry);
      toast({
        title: "Sauvegardé",
        description: "Vos données ont été sauvegardées avec succès",
      });
      onUpdate();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de sauvegarder vos données",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exercices Spirituels</CardTitle>
          <CardDescription>
            Cochez les exercices spirituels que vous avez accomplis chaque jour
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b"></th>
                  {daysOfWeek.map((day, index) => (
                    <th key={index} className="text-center p-2 border-b">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exercises.map((exercise) => (
                  <tr key={exercise.id} className="border-b last:border-b-0">
                    <td className="p-2 font-medium">{exercise.label}</td>
                    {daysOfWeek.map((_, dayIndex) => (
                      <td key={dayIndex} className="text-center p-2">
                        <Checkbox
                          checked={
                            localEntry.days[dayIndex]?.exercises?.[
                              exercise.id
                            ] || false
                          }
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(
                              dayIndex,
                              exercise.id,
                              checked as boolean
                            )
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actes de Charité</CardTitle>
          <CardDescription>
            Notez vos actes de charité pour la semaine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Décrivez vos actes de charité..."
            className="min-h-[100px]"
            value={localEntry.charityActs || ""}
            onChange={(e) => handleTextChange("charityActs", e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Réflexions</CardTitle>
          <CardDescription>
            Notez vos réflexions, difficultés et succès
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Commentaires</h3>
            <Textarea
              placeholder="Vos commentaires sur la semaine..."
              value={localEntry.comments || ""}
              onChange={(e) => handleTextChange("comments", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Difficultés</h3>
            <Textarea
              placeholder="Les difficultés rencontrées..."
              value={localEntry.difficulties || ""}
              onChange={(e) => handleTextChange("difficulties", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Points d'amélioration</h3>
            <Textarea
              placeholder="Vos points d'amélioration..."
              value={localEntry.improvements || ""}
              onChange={(e) => handleTextChange("improvements", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Succès</h3>
            <Textarea
              placeholder="Vos succès de la semaine..."
              value={localEntry.successes || ""}
              onChange={(e) => handleTextChange("successes", e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isLoading} className="ml-auto">
            {isLoading ? "Sauvegarde en cours..." : "Sauvegarder"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
