const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkFloatFieldUsage() {
  console.log('🔍 Checking for float field usage in critical paths...\n');
  
  try {
    // Check if any transactions have float data but missing integer data
    const problematicTransactions = await prisma.transaction.findMany({
      where: {
        OR: [
          // Has BTC amount but missing satoshi equivalent
          {
            AND: [
              { btcAmount: { not: null } },
              { btcAmountSatoshi: null }
            ]
          },
          // Has BTC price but missing integer equivalent
          {
            AND: [
              { btcPriceInr: { not: null } },
              { btcPriceInrInt: null }
            ]
          },
          // Has USD price but missing integer equivalent
          {
            AND: [
              { btcPriceUsd: { not: null } },
              { btcPriceUsdInt: null }
            ]
          }
        ]
      },
      select: {
        id: true,
        type: true,
        btcAmount: true,
        btcAmountSatoshi: true,
        btcPriceInr: true,
        btcPriceInrInt: true,
        btcPriceUsd: true,
        btcPriceUsdInt: true,
        inrAmount: true,
        inrAmountInt: true,
        createdAt: true
      }
    });

    if (problematicTransactions.length > 0) {
      console.log(`⚠️  Found ${problematicTransactions.length} transactions with incomplete integer fields:`);
      problematicTransactions.forEach(tx => {
        console.log(`\n  Transaction ${tx.id} (${tx.type}):`);
        if (tx.btcAmount !== null && tx.btcAmountSatoshi === null) {
          console.log(`    Missing btcAmountSatoshi for btcAmount: ${tx.btcAmount}`);
        }
        if (tx.btcPriceInr !== null && tx.btcPriceInrInt === null) {
          console.log(`    Missing btcPriceInrInt for btcPriceInr: ${tx.btcPriceInr}`);
        }
        if (tx.btcPriceUsd !== null && tx.btcPriceUsdInt === null) {
          console.log(`    Missing btcPriceUsdInt for btcPriceUsd: ${tx.btcPriceUsd}`);
        }
      });
      return false;
    } else {
      console.log('✅ All transactions with float data have corresponding integer fields');
    }

    // Check specific transaction types
    const btcTransactions = await prisma.transaction.findMany({
      where: {
        type: { in: ['DEPOSIT_BTC', 'WITHDRAWAL_BTC', 'BUY', 'SELL'] }
      },
      select: {
        id: true,
        type: true,
        btcAmount: true,
        btcAmountSatoshi: true,
        btcPriceInr: true,
        btcPriceInrInt: true,
        inrAmount: true,
        inrAmountInt: true
      }
    });

    console.log(`\n📊 BTC-related transaction analysis (${btcTransactions.length} transactions):`);
    
    let hasFloatOnly = false;
    btcTransactions.forEach(tx => {
      const hasFloatBtc = tx.btcAmount !== null;
      const hasIntBtc = tx.btcAmountSatoshi !== null;
      const hasFloatPrice = tx.btcPriceInr !== null;
      const hasIntPrice = tx.btcPriceInrInt !== null;
      
      if ((hasFloatBtc && !hasIntBtc) || (hasFloatPrice && !hasIntPrice)) {
        console.log(`  ⚠️  ${tx.type} transaction ${tx.id} has incomplete integer fields`);
        hasFloatOnly = true;
      }
    });

    if (!hasFloatOnly) {
      console.log('  ✅ All BTC transactions have complete integer field coverage');
    }

    return !hasFloatOnly;

  } catch (error) {
    console.error('❌ Check failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Also check code files for dangerous float usage patterns
function checkCodeFiles() {
  console.log('\n🔍 Checking code files for direct float field access...\n');
  
  const criticalFiles = [
    'src/app/api/trade/route.ts',
    'src/app/api/admin/balance/route.ts', 
    'src/app/api/performance/route.ts',
    'src/lib/performanceCalculations.ts'
  ];

  const dangerousPatterns = [
    /\.btcAmount[^S]/g,  // .btcAmount but not .btcAmountSatoshi
    /\.inrAmount[^I]/g,  // .inrAmount but not .inrAmountInt
    /\.btcPriceInr[^I]/g, // .btcPriceInr but not .btcPriceInrInt
    /\.btcBalanceAfter[^S]/g // .btcBalanceAfter but not .btcBalanceAfterSat
  ];

  let foundIssues = false;

  criticalFiles.forEach(filePath => {
    const fullPath = path.join('/home/ubuntu/trading-app', filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      dangerousPatterns.forEach((pattern, index) => {
        const matches = content.match(pattern);
        if (matches) {
          const patternNames = ['.btcAmount', '.inrAmount', '.btcPriceInr', '.btcBalanceAfter'];
          console.log(`⚠️  ${filePath}: Found ${matches.length} uses of ${patternNames[index]}`);
          foundIssues = true;
        }
      });
    }
  });

  if (!foundIssues) {
    console.log('✅ No dangerous float field patterns found in critical files');
  }

  return !foundIssues;
}

async function main() {
  const dbCheck = await checkFloatFieldUsage();
  const codeCheck = checkCodeFiles();
  
  console.log(`\n${dbCheck && codeCheck ? '🎉' : '⚠️'} Overall Status: ${dbCheck && codeCheck ? 'SAFE TO PROCEED' : 'NEEDS ATTENTION'}`);
  
  if (!dbCheck || !codeCheck) {
    console.log('\n❌ Some issues found. Float field migration is not complete.');
    console.log('   Review the issues above before deprecating float fields.');
  } else {
    console.log('\n✅ Float field usage appears safe. Ready for deprecation.');
  }
}

main().catch(console.error);
