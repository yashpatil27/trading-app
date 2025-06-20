-- AlterTable
ALTER TABLE "BtcPrice" ADD COLUMN "priceUsdInt" INTEGER;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN "btcAmountSatoshi" BIGINT;
ALTER TABLE "Transaction" ADD COLUMN "btcBalanceAfterSat" BIGINT;
ALTER TABLE "Transaction" ADD COLUMN "btcPriceInrInt" INTEGER;
ALTER TABLE "Transaction" ADD COLUMN "btcPriceUsdInt" INTEGER;
ALTER TABLE "Transaction" ADD COLUMN "inrAmountInt" INTEGER;
ALTER TABLE "Transaction" ADD COLUMN "inrBalanceAfterInt" INTEGER;
ALTER TABLE "Transaction" ADD COLUMN "usdInrRateInt" INTEGER;
