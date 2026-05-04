-- CreateTable
CREATE TABLE "Plan" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "preferences" JSONB,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimerSession" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER NOT NULL,
    "endType" TEXT,
    "sessionId" TEXT NOT NULL,
    "lastHeartbeat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "pauseNote" TEXT,
    "accumulatedElapsedMs" INTEGER NOT NULL DEFAULT 0,
    "pausedAt" TIMESTAMP(3),
    "hardStopTriggered" BOOLEAN NOT NULL DEFAULT false,
    "extensionCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TimerSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatHistory" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "ChatHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objective" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "quarter" TEXT,
    "type" TEXT NOT NULL DEFAULT 'MOONSHOT',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "color" TEXT,
    "healthMetrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Objective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyResult" (
    "id" SERIAL NOT NULL,
    "objectiveId" INTEGER NOT NULL,
    "metric" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT NOT NULL DEFAULT 'count',
    "direction" TEXT NOT NULL DEFAULT 'INCREASE',
    "baselineValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetValue" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "grade" DOUBLE PRECISION,
    "targetDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Initiative" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "hypothesis" TEXT,
    "objectiveId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "priority" TEXT NOT NULL DEFAULT 'P1',
    "dri" TEXT,
    "targetDate" TIMESTAMP(3),
    "ambiguityLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
    "keyUnknowns" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Initiative_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InitiativeKeyResult" (
    "initiativeId" INTEGER NOT NULL,
    "keyResultId" INTEGER NOT NULL,

    CONSTRAINT "InitiativeKeyResult_pkey" PRIMARY KEY ("initiativeId","keyResultId")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "successCriteria" TEXT,
    "initiativeId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PLANNING',
    "priority" TEXT NOT NULL DEFAULT 'P1',
    "dri" TEXT,
    "targetDate" TIMESTAMP(3),
    "color" TEXT,
    "stakeholderGroupId" INTEGER,
    "expectedImpact" TEXT,
    "actualImpact" TEXT,
    "isL6PromoMaterial" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sprint" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "aiSummary" TEXT,
    "capacityMinutes" INTEGER NOT NULL DEFAULT 2400,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "context" TEXT,
    "status" TEXT NOT NULL DEFAULT 'BACKLOG',
    "size" TEXT NOT NULL DEFAULT 'M',
    "impact" TEXT NOT NULL DEFAULT 'BUCKET',
    "actualMinutes" INTEGER NOT NULL DEFAULT 0,
    "isUnplanned" BOOLEAN NOT NULL DEFAULT false,
    "sprintId" INTEGER,
    "projectId" INTEGER,
    "stakeholderGroupId" INTEGER,
    "parentTaskId" INTEGER,
    "captureResolvedId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StakeholderGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "type" TEXT NOT NULL DEFAULT 'ENGINEERING',
    "slackChannel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StakeholderGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayPlan" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "meetingHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "energyLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
    "availableFocusMinutes" INTEGER NOT NULL DEFAULT 0,
    "scheduledTaskIds" JSONB,
    "captureInboxIds" JSONB,
    "aiScheduleSummary" TEXT,
    "aiFocusAdvice" TEXT,
    "interruptLog" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DayPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaptureItem" (
    "id" SERIAL NOT NULL,
    "rawText" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "resolvedTaskId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaptureItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_date_key" ON "Plan"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Task_captureResolvedId_key" ON "Task"("captureResolvedId");

-- CreateIndex
CREATE UNIQUE INDEX "DayPlan_date_key" ON "DayPlan"("date");

-- AddForeignKey
ALTER TABLE "KeyResult" ADD CONSTRAINT "KeyResult_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Initiative" ADD CONSTRAINT "Initiative_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InitiativeKeyResult" ADD CONSTRAINT "InitiativeKeyResult_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InitiativeKeyResult" ADD CONSTRAINT "InitiativeKeyResult_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "KeyResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_stakeholderGroupId_fkey" FOREIGN KEY ("stakeholderGroupId") REFERENCES "StakeholderGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "Sprint"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_stakeholderGroupId_fkey" FOREIGN KEY ("stakeholderGroupId") REFERENCES "StakeholderGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_captureResolvedId_fkey" FOREIGN KEY ("captureResolvedId") REFERENCES "CaptureItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
