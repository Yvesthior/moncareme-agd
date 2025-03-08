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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, ListChecks } from "lucide-react";
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

const shortDaysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const exercises = [
  { id: "morningPrayer", label: "Prière Matinale", availableAll: true },
  { id: "mass", label: "Messe", availableAll: true },
  { id: "rosary", label: "Chapelet", availableAll: true },
  { id: "lectio", label: "Lectio", availableAll: true },
  { id: "fasting", label: "Jeûne", availableAll: true },
  { id: "eveningPrayer", label: "Prière du Soir", availableAll: true },
  { id: "tuesdayPrayer", label: "Prière Mardi 21h45", availableDay: 1 }, // Mardi
  { id: "fridayPrayer", label: "Prière Vendredi 21h45", availableDay: 4 }, // Vendredi
  { id: "wakeupSpace", label: "Espace du Réveil", availableDay: 6 }, // Dimanche
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

  // Déterminer le jour actuel (0-6, lundi-dimanche)
  const today = new Date().getDay();
  const adjustedToday = today === 0 ? 6 : today - 1; // Convertir dimanche (0) en 6, et autres jours -1
  const [selectedDay, setSelectedDay] = useState(adjustedToday);

  const handleCheckboxChange = (
    day: number,
    exercise: string,
    checked: boolean
  ) => {
    const updatedDays = [...localEntry.days];

    if (!updatedDays[day]) {
      updatedDays[day] = { date: new Date(), exercises: {} };
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

  const isExerciseAvailable = (exerciseId: string, dayIndex: number) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return false;

    if (exercise.availableAll) return true; // Disponible tous les jours
    return exercise.availableDay === dayIndex; // Disponible uniquement le jour spécifié
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
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="daily" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Vue journalière</span>
                <span className="sm:hidden">Jour</span>
              </TabsTrigger>
              <TabsTrigger value="weekly" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                <span className="hidden sm:inline">Vue hebdomadaire</span>
                <span className="sm:hidden">Semaine</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="mt-0">
              <div className="space-y-4">
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {daysOfWeek.map((day, index) => (
                    <Button
                      key={index}
                      variant={selectedDay === index ? "default" : "outline"}
                      onClick={() => setSelectedDay(index)}
                      className={`py-1 h-auto ${
                        selectedDay === index
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }`}
                      size="sm"
                    >
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">
                        {shortDaysOfWeek[index]}
                      </span>
                    </Button>
                  ))}
                </div>

                <div className="bg-muted/30 p-3 rounded-md mb-4">
                  <h3 className="text-lg font-medium text-center mb-2">
                    {daysOfWeek[selectedDay]}
                  </h3>
                </div>

                <div className="space-y-3">
                  {exercises
                    .filter((exercise) =>
                      isExerciseAvailable(exercise.id, selectedDay)
                    )
                    .map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/20 transition-colors"
                      >
                        <div className="font-medium">{exercise.label}</div>
                        <Checkbox
                          checked={
                            localEntry.days[selectedDay]?.exercises?.[
                              exercise.id
                            ] || false
                          }
                          onCheckedChange={(checked) =>
                            handleCheckboxChange(
                              selectedDay,
                              exercise.id,
                              checked as boolean
                            )
                          }
                        />
                      </div>
                    ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="weekly" className="mt-0">
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full border-collapse min-w-[640px]">
                  <thead>
                    <tr>
                      <th className="text-left p-2 border-b w-1/3"></th>
                      {shortDaysOfWeek.map((day, index) => (
                        <th key={index} className="text-center p-2 border-b">
                          <span className="hidden sm:inline">
                            {daysOfWeek[index]}
                          </span>
                          <span className="sm:hidden">{day}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {exercises.map((exercise) => (
                      <tr
                        key={exercise.id}
                        className="border-b last:border-b-0"
                      >
                        <td className="p-2 font-medium">
                          {exercise.label}
                          {!exercise.availableAll && (
                            <span className="text-xs text-muted-foreground block">
                              ({daysOfWeek[exercise.availableDay || 0]}{" "}
                              uniquement)
                            </span>
                          )}
                        </td>
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
                              disabled={
                                !isExerciseAvailable(exercise.id, dayIndex)
                              }
                              className={
                                !isExerciseAvailable(exercise.id, dayIndex)
                                  ? "opacity-30"
                                  : ""
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
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
            <h3 className="text-sm font-medium">Points d&apos;amélioration</h3>
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
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full sm:w-auto sm:ml-auto"
          >
            {isLoading ? "Sauvegarde en cours..." : "Sauvegarder"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
