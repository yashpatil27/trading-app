-- Remove float columns from Transaction table
-- SQLite doesn't support DROP COLUMN directly, so we need to recreate the table

-- Step 1: Create new Transaction table without float fields
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

-- Step 2: Copy data from old table to new table (using only integer fields)
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

-- Step 3: Drop old table
DROP TABLE "Transaction";

-- Step 4: Rename new table
ALTER TABLE "Transaction_new" RENAME TO "Transaction";

-- Step 5: Recreate indexes
CREATE INDEX "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt");
CREATE INDEX "Transaction_userId_type_idx" ON "Transaction"("userId", "type");
CREATE INDEX "Transaction_type_createdAt_idx" ON "Transaction"("type", "createdAt");
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- Step 6: Update BtcPrice table to remove float field
CREATE TABLE "BtcPrice_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "priceUsdInt" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "BtcPrice_new" ("id", "priceUsdInt", "createdAt")
SELECT "id", "priceUsdInt", "createdAt"
FROM "BtcPrice";

DROP TABLE "BtcPrice";
ALTER TABLE "BtcPrice_new" RENAME TO "BtcPrice";
CREATE INDEX "BtcPrice_createdAt_idx" ON "BtcPrice"("createdAt");
