-- CreateTable
CREATE TABLE "WeeklyEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "charityActs" TEXT,
    "comments" TEXT,
    "difficulties" TEXT,
    "improvements" TEXT,
    "successes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DayEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "weeklyEntryId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "exercises" JSONB NOT NULL,
    CONSTRAINT "DayEntry_weeklyEntryId_fkey" FOREIGN KEY ("weeklyEntryId") REFERENCES "WeeklyEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
