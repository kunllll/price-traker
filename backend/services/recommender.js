function recommend(currentPrice, history) {
  if (!history.length) {
    return { verdict: 'NO_DATA', message: 'Not enough price history yet.' };
  }
  const prices = history.map((h) => h.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  let verdict, message;
  if (currentPrice <= min * 1.02) {
    verdict = 'BUY_NOW';
    message = 'Price is at its lowest in the tracked period. Great time to buy!';
  } else if (currentPrice <= avg * 0.95) {
    verdict = 'BUY_NOW';
    message = 'Price is well below the average. Good time to buy.';
  } else if (currentPrice >= avg * 1.05) {
    verdict = 'WAIT';
    message = 'Price is above the average. Better to wait for a drop.';
  } else {
    verdict = 'OK';
    message = 'Price is close to the average. Buy if you need it now.';
  }

  const dropFromMax = Math.round(((max - currentPrice) / max) * 100);
  return { verdict, message, min, max, avg, dropFromMax };
}

module.exports = { recommend };