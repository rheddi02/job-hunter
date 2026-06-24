-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('MATCHED', 'DRAFTED', 'APPLIED', 'INTERVIEWING', 'REJECTED', 'GHOSTED');

-- CreateEnum
CREATE TYPE "JobSourceType" AS ENUM ('GREENHOUSE', 'LEVER', 'ADZUNA', 'ARBEITNOW', 'REMOTEOK');

-- CreateEnum
CREATE TYPE "RemoteType" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE', 'UNKNOWN');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "organizationId" UUID,
    "fullName" TEXT,
    "email" TEXT,
    "rawCvPath" TEXT,
    "parsedSkills" JSONB,
    "parsedExperience" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_sources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "type" "JobSourceType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sourceId" UUID NOT NULL,
    "externalId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT,
    "remoteType" "RemoteType" NOT NULL DEFAULT 'UNKNOWN',
    "url" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3),
    "closesAt" TIMESTAMP(3),
    "rawData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "matchedSkills" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "organizationId" UUID,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'MATCHED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cover_letters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "applicationId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cover_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "applicationId" UUID NOT NULL,
    "fromStatus" "ApplicationStatus",
    "toStatus" "ApplicationStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "status_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_contentHash_key" ON "jobs"("contentHash");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_sourceId_externalId_key" ON "jobs"("sourceId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "matches_userId_jobId_key" ON "matches"("userId", "jobId");

-- CreateIndex
CREATE UNIQUE INDEX "applications_userId_jobId_key" ON "applications"("userId", "jobId");

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "job_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cover_letters" ADD CONSTRAINT "cover_letters_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_events" ADD CONSTRAINT "status_events_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
