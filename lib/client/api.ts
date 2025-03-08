import type { WeeklyEntry } from "@/types/entries";

export async function fetchEntries(
  startDate: Date,
  endDate: Date
): Promise<WeeklyEntry[]> {
  const response = await fetch(
    `/api/entries?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
  );
  if (!response.ok) throw new Error("Failed to fetch entries");
  return response.json();
}

export async function createEntry(
  startDate: Date,
  endDate: Date
): Promise<WeeklyEntry> {
  const response = await fetch("/api/entries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ startDate, endDate }),
  });
  if (!response.ok) throw new Error("Failed to create entry");
  return response.json();
}

export async function updateEntry(
  id: string,
  entry: WeeklyEntry
): Promise<WeeklyEntry> {
  const response = await fetch(`/api/entries/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!response.ok) throw new Error("Failed to update entry");
  return response.json();
}
