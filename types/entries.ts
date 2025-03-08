export interface DayEntry {
  id?: string
  date: string | Date
  exercises: Record<string, boolean>
}

export interface WeeklyEntry {
  id: string
  userId: string
  startDate: string | Date
  endDate: string | Date
  charityActs?: string
  comments?: string
  difficulties?: string
  improvements?: string
  successes?: string
  days: DayEntry[]
}

