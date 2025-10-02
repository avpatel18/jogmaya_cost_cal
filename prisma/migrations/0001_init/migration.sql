-- Generated from schema.prisma for initial deploy on Railway
-- Do not edit manually unless you know what you're doing.

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "calculations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "qualityName" TEXT NOT NULL,
    "totalCard" DOUBLE PRECISION NOT NULL,
    "pickOnLooms" DOUBLE PRECISION NOT NULL,
    "pano" DOUBLE PRECISION NOT NULL,
    "wastagePercent" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "jobCharge" DOUBLE PRECISION NOT NULL DEFAULT 0.35,
    "rebatePercent" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "salesRate" DOUBLE PRECISION NOT NULL DEFAULT 335,
    "brokeragePercent" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "calculations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weft_feeders" (
    "id" TEXT NOT NULL,
    "calculationId" TEXT NOT NULL,
    "feederName" TEXT NOT NULL,
    "yarnName" TEXT NOT NULL,
    "card" DOUBLE PRECISION NOT NULL,
    "denier" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "wastagePercent" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "weft_feeders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "warp_yarns" (
    "id" TEXT NOT NULL,
    "calculationId" TEXT NOT NULL,
    "yarnName" TEXT NOT NULL,
    "tar" DOUBLE PRECISION NOT NULL,
    "denier" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "warp_yarns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calculations" ADD CONSTRAINT "calculations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weft_feeders" ADD CONSTRAINT "weft_feeders_calculationId_fkey" FOREIGN KEY ("calculationId") REFERENCES "calculations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "warp_yarns" ADD CONSTRAINT "warp_yarns_calculationId_fkey" FOREIGN KEY ("calculationId") REFERENCES "calculations"("id") ON DELETE CASCADE ON UPDATE CASCADE;