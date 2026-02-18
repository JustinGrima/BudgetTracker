-- CreateTable
CREATE TABLE "FiscalYear" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "startMonth" INTEGER NOT NULL DEFAULT 7,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "FiscalMonth" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fiscalYearId" TEXT NOT NULL,
    "monthKey" TEXT NOT NULL,
    "monthIndex" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FiscalMonth_fiscalYearId_fkey" FOREIGN KEY ("fiscalYearId") REFERENCES "FiscalYear" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "defaultExpectedCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LineItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ExpectedOverride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fiscalMonthId" TEXT NOT NULL,
    "lineItemId" TEXT NOT NULL,
    "expectedCents" INTEGER NOT NULL,
    CONSTRAINT "ExpectedOverride_fiscalMonthId_fkey" FOREIGN KEY ("fiscalMonthId") REFERENCES "FiscalMonth" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ExpectedOverride_lineItemId_fkey" FOREIGN KEY ("lineItemId") REFERENCES "LineItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fiscalMonthId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "lineItemName" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_fiscalMonthId_fkey" FOREIGN KEY ("fiscalMonthId") REFERENCES "FiscalMonth" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activeFiscalYearId" TEXT,
    "activeFiscalMonthId" TEXT,
    CONSTRAINT "Settings_activeFiscalYearId_fkey" FOREIGN KEY ("activeFiscalYearId") REFERENCES "FiscalYear" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Settings_activeFiscalMonthId_fkey" FOREIGN KEY ("activeFiscalMonthId") REFERENCES "FiscalMonth" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "payload" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "FiscalYear_label_key" ON "FiscalYear"("label");
CREATE UNIQUE INDEX "FiscalMonth_fiscalYearId_monthIndex_key" ON "FiscalMonth"("fiscalYearId", "monthIndex");
CREATE UNIQUE INDEX "FiscalMonth_monthKey_fiscalYearId_key" ON "FiscalMonth"("monthKey", "fiscalYearId");
CREATE UNIQUE INDEX "Group_kind_name_key" ON "Group"("kind", "name");
CREATE UNIQUE INDEX "LineItem_groupId_name_key" ON "LineItem"("groupId", "name");
CREATE UNIQUE INDEX "ExpectedOverride_fiscalMonthId_lineItemId_key" ON "ExpectedOverride"("fiscalMonthId", "lineItemId");
