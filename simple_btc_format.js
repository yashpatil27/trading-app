// Simple function to format Bitcoin amounts by removing trailing zeros
function formatBtc(btcAmount) {
  if (typeof btcAmount === 'number') {
    // Convert to string with 8 decimal places, then remove trailing zeros
    let formatted = btcAmount.toFixed(8);
    formatted = formatted.replace(/\.?0+$/, '');
    return formatted === '' ? '0' : formatted;
  }
  return btcAmount.toString();
}

console.log('Testing BTC formatting:');
console.log('0.02000000 ->', formatBtc(0.02000000));
console.log('0.12345678 ->', formatBtc(0.12345678));
console.log('1.00000000 ->', formatBtc(1.00000000));
console.log('0.00000000 ->', formatBtc(0.00000000));
