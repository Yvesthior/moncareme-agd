import type { WeeklyEntry } from "@/types/entries"

// Fonction pour récupérer les entrées
export async function fetchEntries(startDate: Date, endDate: Date): Promise<WeeklyEntry[]> {
  const response = await fetch("/api/entries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Erreur lors de la récupération des entrées: ${error}`)
  }

  const data = await response.json()
  return data
}

// Fonction pour créer une nouvelle entrée
export async function createEntry(startDate: Date, endDate: Date): Promise<WeeklyEntry> {
  const response = await fetch("/api/entries/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Erreur lors de la création de l'entrée: ${error}`)
  }

  const data = await response.json()
  return data
}

// Fonction pour mettre à jour une entrée
export async function updateEntry(id: string, entry: WeeklyEntry): Promise<WeeklyEntry> {
  // Préparation des données pour éviter les problèmes de sérialisation
  const preparedEntry = {
    ...entry,
    days: entry.days.map((day) => ({
      ...day,
      date: day.date instanceof Date ? day.date.toISOString() : day.date,
    })),
  }

  const response = await fetch(`/api/entries/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preparedEntry),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Erreur lors de la mise à jour de l'entrée: ${error}`)
  }

  const data = await response.json()
  return data
}

