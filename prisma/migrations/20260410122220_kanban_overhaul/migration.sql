-- AlterTable
ALTER TABLE "KanbanItem" ADD COLUMN "dueDate" DATETIME;

-- CreateTable
CREATE TABLE "KanbanColumn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "wipLimit" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KanbanColumn_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KanbanLabel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#3b82f6',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KanbanLabel_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KanbanItemLabel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "labelId" TEXT NOT NULL,
    CONSTRAINT "KanbanItemLabel_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "KanbanItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "KanbanItemLabel_labelId_fkey" FOREIGN KEY ("labelId") REFERENCES "KanbanLabel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KanbanSubtask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KanbanSubtask_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "KanbanItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KanbanActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actorId" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL DEFAULT '',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KanbanActivity_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "KanbanItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "KanbanColumn_projectId_idx" ON "KanbanColumn"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "KanbanColumn_projectId_name_key" ON "KanbanColumn"("projectId", "name");

-- CreateIndex
CREATE INDEX "KanbanLabel_projectId_idx" ON "KanbanLabel"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "KanbanLabel_projectId_name_key" ON "KanbanLabel"("projectId", "name");

-- CreateIndex
CREATE INDEX "KanbanItemLabel_itemId_idx" ON "KanbanItemLabel"("itemId");

-- CreateIndex
CREATE INDEX "KanbanItemLabel_labelId_idx" ON "KanbanItemLabel"("labelId");

-- CreateIndex
CREATE UNIQUE INDEX "KanbanItemLabel_itemId_labelId_key" ON "KanbanItemLabel"("itemId", "labelId");

-- CreateIndex
CREATE INDEX "KanbanSubtask_itemId_idx" ON "KanbanSubtask"("itemId");

-- CreateIndex
CREATE INDEX "KanbanActivity_itemId_idx" ON "KanbanActivity"("itemId");
