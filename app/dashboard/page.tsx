"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyTracker } from "@/components/weekly-tracker";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, LogOut, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { WeeklyEntry } from "@/types/entries";
import { fetchEntries, createEntry } from "@/lib/client/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();
  const router = useRouter();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState<WeeklyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const dates = useMemo(
    () => ({
      startDate: startOfWeek(currentDate, { weekStartsOn: 1 }),
      endDate: endOfWeek(currentDate, { weekStartsOn: 1 }),
    }),
    [currentDate]
  );

  const formattedDateRange = `${format(dates.startDate, "d MMMM", {
    locale: fr,
  })} au ${format(dates.endDate, "d MMMM yyyy", { locale: fr })}`;

  const loadEntries = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const data = await fetchEntries(dates.startDate, dates.endDate);
      setEntries(data);
    } catch (error) {
      console.error("Erreur lors du chargement des entrées:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger vos données",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, dates, toast]);

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in");
    }

    if (isLoaded && user) {
      loadEntries();
    }
  }, [isLoaded, user, router, loadEntries]);

  const handlePreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleCreateNewWeek = async () => {
    try {
      await createEntry(dates.startDate, dates.endDate);
      toast({
        title: "Semaine créée",
        description: "Une nouvelle semaine a été créée",
      });
      loadEntries();
    } catch (error) {
      console.error("Erreur lors de la création de la semaine:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de créer une nouvelle semaine",
      });
    }
  };

  const handleSignOut = () => {
    clerk.signOut();
  };

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-8">
      {/* Header avec logo */}
      <header className="py-4 mb-6 border-b">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 sm:h-16 sm:w-16">
              <Image
                src="/logoAGD.png"
                alt="Logo AGD"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Mon Carnet de Carême
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Apostolat Génération David
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="font-medium">{user!.fullName}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(), "d MMMM yyyy", { locale: fr })}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="sm:hidden">
                  <span>{user!.fullName}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg sm:text-xl font-semibold">
            Semaine du {formattedDateRange}
          </h2>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {entries.length === 0 && !isLoading && (
          <Button onClick={handleCreateNewWeek} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle semaine
          </Button>
        )}
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 flex justify-center">
            <p>Chargement des données...</p>
          </CardContent>
        </Card>
      ) : entries.length > 0 ? (
        <Tabs defaultValue="tracker" className="space-y-4">
          <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
            <TabsTrigger value="tracker">Suivi hebdomadaire</TabsTrigger>
            <TabsTrigger value="reflections">Réflexions</TabsTrigger>
          </TabsList>
          <TabsContent value="tracker" className="space-y-4">
            <WeeklyTracker entry={entries[0]} onUpdate={loadEntries} />
          </TabsContent>
          <TabsContent value="reflections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Réflexions et commentaires</CardTitle>
                <CardDescription>
                  Vos notes et réflexions pour la semaine
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Commentaires</h3>
                  <p className="text-sm text-muted-foreground">
                    {entries[0].comments ||
                      "Aucun commentaire pour cette semaine"}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Difficultés</h3>
                  <p className="text-sm text-muted-foreground">
                    {entries[0].difficulties ||
                      "Aucune difficulté notée pour cette semaine"}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Points d&apos;amélioration</h3>
                  <p className="text-sm text-muted-foreground">
                    {entries[0].improvements ||
                      "Aucun point d&apos;amélioration noté pour cette semaine"}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Succès</h3>
                  <p className="text-sm text-muted-foreground">
                    {entries[0].successes ||
                      "Aucun succès noté pour cette semaine"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="mb-4">Aucune donnée pour cette semaine</p>
            <Button onClick={handleCreateNewWeek}>
              <Plus className="mr-2 h-4 w-4" />
              Créer une nouvelle semaine
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
