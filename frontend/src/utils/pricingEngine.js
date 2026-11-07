import baselineData from '../data/routeBaselines.json';

/**
 * Precision Airfare Pricing Engine
 * Computes exact route-calibrated fair prices, percentage deltas,
 * value scores, and actionable passenger verdicts grounded in 300,153 records.
 */
export const calculatePreciseFareVerdict = ({
  source_city,
  destination_city,
  airline,
  travel_class,
  days_left,
  price,
  duration
}) => {
  const userPrice = Number(price) || 5000;
  const days = Number(days_left) || 14;

  // 1. Locate Route Baseline
  const routeKey = `${source_city}_${destination_city}_${travel_class}`;
  const routeInfo = baselineData.routes[routeKey] || {
    median: travel_class === 'Business' ? 52000 : 6500,
    mean: travel_class === 'Business' ? 53000 : 7000,
    p25: travel_class === 'Business' ? 48000 : 4500,
    p75: travel_class === 'Business' ? 58000 : 8500,
    min: travel_class === 'Business' ? 30000 : 2500,
    max: travel_class === 'Business' ? 95000 : 32000,
  };

  // 2. Airline Weight Factor
  const airlineKey = `${airline}_${travel_class}`;
  const airlineFactor = baselineData.airline_multipliers[airlineKey] || 1.0;

  // 3. Days Left Lead Time Curve Factor
  let daysFactor = 1.0;
  if (days <= 4) {
    daysFactor = 1.45; // High urgency surge window
  } else if (days <= 14) {
    daysFactor = 1.15; // Standard 2-week domestic window
  } else if (days <= 30) {
    daysFactor = 0.90; // Advance booking sweet spot
  } else {
    daysFactor = 0.82; // Early-bird leisure window
  }

  // 4. Expected Fair Market Benchmark Price
  const expectedFairPrice = Math.round(routeInfo.median * airlineFactor * daysFactor);

  // 5. Exact Mathematical Deltas
  const priceDiff = userPrice - expectedFairPrice;
  const percentDelta = Math.round(((userPrice - expectedFairPrice) / expectedFairPrice) * 100);
  const absDiff = Math.abs(priceDiff);

  // 6. Dynamic Score (1.0 to 10.0 scale)
  let score = 10 - (priceDiff / expectedFairPrice) * 8.5;
  score = Math.max(1.2, Math.min(9.8, Math.round(score * 10) / 10));

  // 7. Verdict & Tailored Intelligence
  let verdict = '';
  let badge = '';
  let badgeColor = '';
  let tip = '';
  let savingsText = '';

  if (travel_class === 'Business') {
    if (priceDiff <= -5000) {
      verdict = '🔥 Deep Business Class Discount';
      badge = 'Executive Deal';
      badgeColor = 'purple';
      tip = `Expected executive fare on this corridor is ₹${expectedFairPrice.toLocaleString()}. You are saving ₹${absDiff.toLocaleString()} (${Math.abs(percentDelta)}% below benchmark). Highly recommended to lock in.`;
      savingsText = `Saving ₹${absDiff.toLocaleString()} below corporate benchmark`;
    } else if (priceDiff > 8000) {
      verdict = '⚠️ Premium Surcharge Detected';
      badge = 'Peak Executive';
      badgeColor = 'amber';
      tip = `This fare is ₹${absDiff.toLocaleString()} above the ₹${expectedFairPrice.toLocaleString()} route average. Consider alternative departure times for the same day.`;
      savingsText = `Overpaying by ₹${absDiff.toLocaleString()} (+${percentDelta}%)`;
    } else {
      verdict = '💼 Standard Executive Fare';
      badge = 'Market Parity';
      badgeColor = 'purple';
      tip = `Aligned with executive corporate benchmarks for ${source_city} ➔ ${destination_city} (Expected: ₹${expectedFairPrice.toLocaleString()}).`;
      savingsText = `Within standard ±${Math.abs(percentDelta)}% market variance`;
    }
  } else if (duration >= 14.0) {
    verdict = '⏳ Layover Transit Compromise';
    badge = 'Long Transit Warning';
    badgeColor = 'amber';
    tip = `This journey takes ${duration} hours due to connecting layovers. The fare is lower because of transit inconvenience rather than a real promotion.`;
    savingsText = 'Non-stop flights save 8–15 transit hours';
  } else if (percentDelta <= -20) {
    verdict = '🔥 Exceptional Deal — Book Now';
    badge = 'Super Saver';
    badgeColor = 'emerald';
    tip = `Expected fair fare for ${airline} on this date is ₹${expectedFairPrice.toLocaleString()}. You found it at ₹${userPrice.toLocaleString()} (Saving ₹${absDiff.toLocaleString()} / ${Math.abs(percentDelta)}% discount). Rare low inventory!`;
    savingsText = `Saving ₹${absDiff.toLocaleString()} (${Math.abs(percentDelta)}% off fair benchmark)`;
  } else if (percentDelta <= -5) {
    verdict = '🎯 Good Value — Below Average';
    badge = 'Below Route Median';
    badgeColor = 'emerald';
    tip = `This ticket is ₹${absDiff.toLocaleString()} cheaper than the normal route expectation (₹${expectedFairPrice.toLocaleString()}). Recommended for purchase.`;
    savingsText = `Saving ₹${absDiff.toLocaleString()} below typical fare`;
  } else if (percentDelta <= 15) {
    verdict = '✅ Fair Market Price — Normal Rate';
    badge = 'Standard Route Fare';
    badgeColor = 'blue';
    tip = `This fare (₹${userPrice.toLocaleString()}) matches the historical expected average of ₹${expectedFairPrice.toLocaleString()} within normal airline variance.`;
    savingsText = `Within ±${Math.abs(percentDelta)}% of route median (₹${expectedFairPrice.toLocaleString()})`;
  } else if (percentDelta <= 35) {
    verdict = '⚠️ Mild Surge — Higher Than Normal';
    badge = 'Surge Alert';
    badgeColor = 'amber';
    tip = `You are paying ₹${absDiff.toLocaleString()} (+${percentDelta}%) more than the standard ₹${expectedFairPrice.toLocaleString()} benchmark. If possible, consider flying mid-week or adjusting departure by 2–3 days.`;
    savingsText = `Overpaying by ₹${absDiff.toLocaleString()} (+${percentDelta}%)`;
  } else {
    verdict = '🚨 Severe Surge Trap Detected';
    badge = 'Algorithmic Surge';
    badgeColor = 'rose';
    tip = `The airline algorithm is applying emergency surge pricing (Expected: ₹${expectedFairPrice.toLocaleString()}, Quoted: ₹${userPrice.toLocaleString()}). You are overpaying by ₹${absDiff.toLocaleString()} (+${percentDelta}%). Do not book unless travel is strictly mandatory!`;
    savingsText = `Surge penalty: Overpaying by ₹${absDiff.toLocaleString()} (+${percentDelta}%)`;
  }

  return {
    deal_verdict: verdict,
    deal_score: score,
    deal_badge: badge,
    badge_color: badgeColor,
    actionable_tip: tip,
    savings_estimate: savingsText,
    expected_fair_price: expectedFairPrice,
    user_price: userPrice,
    price_diff: priceDiff,
    percent_delta: percentDelta,
    route_median: routeInfo.median,
    route_p25: Math.round(routeInfo.p25 * airlineFactor),
    route_surge_threshold: Math.round(routeInfo.p75 * airlineFactor * 1.3),
    airline_name: airline.replace('_', ' '),
    route_label: `${source_city} ➔ ${destination_city}`
  };
};
