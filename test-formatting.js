// Test the new formatting functions
const { formatBtc, formatInrPlain, btcToSatoshi } = require('./src/lib/currencyUtils.ts');

console.log('Testing BTC formatting:');
console.log('0 BTC:', formatBtc(0));
console.log('0.02 BTC:', formatBtc(0.02));
console.log('0.00000001 BTC:', formatBtc(0.00000001));
console.log('1.23456789 BTC:', formatBtc(1.23456789));

console.log('\nTesting INR formatting:');
console.log('1000 INR:', formatInrPlain(1000));
console.log('9719437 INR:', formatInrPlain(9719437));
console.log('123456789 INR:', formatInrPlain(123456789));

console.log('\nTesting Satoshi conversion:');
console.log('0 satoshi:', formatBtc(0n));
console.log('50000 satoshi:', formatBtc(50000n));
console.log('100000000 satoshi (1 BTC):', formatBtc(100000000n));
