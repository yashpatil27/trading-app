-- Remove float fields from Transaction table
-- Create new table without float fields
CREATE TABLE "Transaction_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "btcAmountSatoshi" BIGINT,
    "btcPriceUsdInt" INTEGER,
    "btcPriceInrInt" INTEGER,
    "usdInrRateInt" INTEGER,
    "inrAmountInt" INTEGER NOT NULL,
    "inrBalanceAfterInt" INTEGER NOT NULL,
    "btcBalanceAfterSat" BIGINT NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Copy data from old table to new table
INSERT INTO "Transaction_new" (
    "id", "userId", "type", "btcAmountSatoshi", "btcPriceUsdInt", "btcPriceInrInt", 
    "usdInrRateInt", "inrAmountInt", "inrBalanceAfterInt", "btcBalanceAfterSat", 
    "reason", "createdAt"
)
SELECT 
    "id", "userId", "type", "btcAmountSatoshi", "btcPriceUsdInt", "btcPriceInrInt",
    "usdInrRateInt", "inrAmountInt", "inrBalanceAfterInt", "btcBalanceAfterSat",
    "reason", "createdAt"
FROM "Transaction";

-- Drop old table
DROP TABLE "Transaction";

-- Rename new table
ALTER TABLE "Transaction_new" RENAME TO "Transaction";

-- Recreate indexes
CREATE INDEX "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt");
CREATE INDEX "Transaction_userId_type_idx" ON "Transaction"("userId", "type");
CREATE INDEX "Transaction_type_createdAt_idx" ON "Transaction"("type", "createdAt");
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
