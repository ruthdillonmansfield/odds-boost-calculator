import { LetterText } from "lucide-react";
import { Result } from "postcss";

/**
 * Calculate the suggested additional lay using the new method.
 *
 * @param {number} S - Back bet stake.
 * @param {number} B - Back bet odds.
 * @param {boolean} freeBet - True if it’s a free bet.
 * @param {boolean} stakeReturned - True if stake is returned.
 * @param {number} totalBackMatched - Total back bet matched.
 * @param {number} chosenOdds - The effective chosen lay odds.
 * @param {number} commission - Commission percentage.
 * @returns {number} The additional lay stake required.
 */
export const calculateAdditionalLayNew = (S, B, freeBet, stakeReturned, totalBackMatched, chosenOdds, commission) => {
    const remainingStake = S - totalBackMatched;
    if (remainingStake <= 0) return 0;
    // Use B for normal bets or free bets with stake returned; otherwise, use (B - 1)
    const multiplier = (!freeBet || (freeBet && stakeReturned)) ? B : (B - 1);
    return (remainingStake * multiplier) / (chosenOdds - commission / 100);
  };
  
  /**
   * Calculate the profit for a group of partials.
   *
   * Uses:
   *   profit if back wins = (groupBack × (B – 1)) – groupLayLiability.
   *   profit if exchange wins = (groupLayStake × (1 – commission/100)) – groupBack.
   *
   * @param {number} groupBack - Total back stake matched for the group.
   * @param {number} groupLayStake - Sum of lay stakes for the group.
   * @param {number} groupLayLiability - Sum of (amount × (layOdds – 1)) for the group.
   * @param {number} B - Back bet odds.
   * @param {number} commission - Commission percentage.
   * @param {boolean} freeBet - True if free bet.
   * @param {boolean} stakeReturned - True if stake returned.
   * @returns {number} The minimum profit for the group.
   */
  export const calculateGroupProfit = (groupBack, groupLayStake, groupLayLiability, B, commission, freeBet, stakeReturned) => {
    if (freeBet && !stakeReturned) {
      const profitIfBookieWins = groupBack * (B - 1) - groupLayLiability - (groupBack / B);
      const profitIfExchangeWins = groupLayStake * (1 - commission / 100) - groupBack;
      return Math.min(profitIfBookieWins, profitIfExchangeWins);
    } else {
      const profitIfBookieWins = groupBack * (B - 1) - groupLayLiability;
      const profitIfExchangeWins = groupLayStake * (1 - commission / 100) - groupBack;
      return Math.min(profitIfBookieWins, profitIfExchangeWins);
    }
  };
  
  /**
   * Calculate the overall profit for a matched betting scenario by combining:
   *
   * 1. Locked partials: Compute profit for locked partials using weighted averages.
   * 2. Unlocked partial: Compute profit for the remaining unmatched back stake.
   *
   * @param {number} backStake - Total back bet stake.
   * @param {number} backOdds - Back bet odds.
   * @param {boolean} freeBet - True if it’s a free bet.
   * @param {boolean} stakeReturned - True if the free bet returns its stake.
   * @param {Array<Object>} partials - Array of partial lay entries with {layOdds, amount, commission, locked}.
   * @returns {number} The overall worst-case profit.
   */
  export const calculateOverallProfit = (backStake, backOdds, freeBet, stakeReturned, partials) => {
    const lockedPartials = partials.filter(row => row.locked);
    const unlockedPartials = partials.filter(row => !row.locked);
  
    let lockedBackMatched = 0;
    let totalLockedAmount = 0;
    let sumLockedLayOdds = 0;
    let sumLockedCommission = 0;
    lockedPartials.forEach(row => {
      const bm = computeBackMatched(row, backOdds, freeBet, stakeReturned);
      lockedBackMatched += bm;
      const amt = parseFloat(row.amount) || 0;
      totalLockedAmount += amt;
      sumLockedLayOdds += (parseFloat(row.layOdds) || 0) * amt;
      sumLockedCommission += (parseFloat(row.commission) || 0) * amt;
    });
  
    let lockedProfit = 0;
    if (lockedPartials.length > 0 && totalLockedAmount > 0) {
      const avgLockedLayOdds = sumLockedLayOdds / totalLockedAmount;
      const avgLockedCommission = sumLockedCommission / totalLockedAmount;
      lockedProfit = calcMinProfit(lockedBackMatched, backOdds, avgLockedLayOdds, avgLockedCommission, freeBet, stakeReturned).minProfit;
    }
  
    const remainingBackStake = Math.max(0, backStake - lockedBackMatched);
    let unlockedProfit = 0;
    if (unlockedPartials.length > 0 && remainingBackStake > 0) {
      const currentRow = unlockedPartials[0];
      const lOdds = parseFloat(currentRow.layOdds) || 0;
      const comm = parseFloat(currentRow.commission) || 0;
      unlockedProfit = calcMinProfit(remainingBackStake, backOdds, lOdds, comm, freeBet, stakeReturned).minProfit;
    }
  
    return lockedProfit + unlockedProfit;
  };
  
/**
 * Returns the ideal lay stake for a bet.
 *
 * For a qualifying bet (or free bet where stake is returned):
 *   Lay stake = (back odds × back stake) / (lay odds – commission/100)
 *
 * For a free bet where stake is NOT returned:
 *   Lay stake = ((back odds – 1) / (lay odds – commission/100)) × free bet size
 *
 * @param {number} S - Back stake or free bet size.
 * @param {number} B - Back odds.
 * @param {number} L - Lay odds.
 * @param {number} commission - Commission percentage.
 * @param {boolean} freeBet - True if this is a free bet.
 * @param {boolean} stakeReturned - True if the free bet stake is returned.
 * @returns {number} The ideal lay stake rounded to two decimals.
 */
export const getIdealLayStake = (S, B, L, commission, freeBet, stakeReturned) => {
  const layCommission = commission / 100;
  const effectiveLayOdds = L - layCommission;
  let layStake;
  
  if (freeBet && !stakeReturned) {
    // For a free bet where the stake is not returned:
    // Lay stake = ((back odds – 1) / (lay odds – commission/100)) × free bet size
    layStake = ((B - 1) / effectiveLayOdds) * S;
  } else {
    // For a qualifying bet (or free bet where the stake is returned):
    // Lay stake = (back odds × back stake) / (lay odds – commission/100)
    layStake = (B * S) / effectiveLayOdds;
  }
  
  return parseFloat(layStake.toFixed(2));
};

/**
 * Calculates detailed outcome values for a full hedge in matched betting and returns a breakdown object.
 *
 * For a normal bet:
 *   - Potential bookmaker winnings = S × (B - 1)
 *   - Potential exchange loss = layStake × (L - 1)
 *   - Profit if bookmaker wins (back bet wins) = S × (B - 1) - layStake × (L - 1)
 *   - Profit if exchange wins (lay bet wins) = (layStake × (1 - commission/100)) - S
 *
 * For a free bet:
 *   - If the free bet stake is returned:
 *       - Adjusted potential exchange loss = S × B - layStake × (L - 1)
 *       - Profit if bookmaker wins = S × (B - 1) - (S × B - layStake × (L - 1))
 *       - Profit if exchange wins = layStake × (1 - commission/100)
 *   - If the free bet stake is NOT returned:
 *       - Adjusted potential exchange loss = (B - 1) × S - layStake × (L - 1)
 *       - Profit if bookmaker wins = S × (B - 1) - [(B - 1) × S - layStake × (L - 1)]
 *       - Profit if exchange wins = layStake × (1 - commission/100)
 *
 * The function returns an object containing:
 *   - potBookieWinnings: The potential winnings from the bookmaker bet.
 *   - potBookieLoss: The stake amount placed at the bookmaker.
 *   - potExchangeWinnings: The potential winnings from the exchange bet.
 *   - potExchangeLoss: The potential loss from the exchange bet.
 *   - profitIfBookieWins: The profit if the bookmaker (back bet) wins.
 *   - profitIfExchangeWins: The profit if the exchange (lay bet) wins.
 *   - minProfit: The worst-case profit (the minimum of profitIfBookieWins and profitIfExchangeWins).
 *
 * @param {number} S - Back bet stake or free bet size.
 * @param {number} B - Back odds.
 * @param {number} L - Lay odds.
 * @param {number} commission - Commission percentage.
 * @param {boolean} freeBet - True if this is a free bet.
 * @param {boolean} stakeReturned - True if the free bet stake is returned.
 * @returns {Object} An object with detailed outcome values and the worst-case profit.
 */

export const calcMinProfit = (S, B, L, commission, freeBet, stakeReturned) => {
  const layStake = getIdealLayStake(S, B, L, commission, freeBet, stakeReturned); 
  let potBookieWinnings = S * (B - 1);
  let potBookieLoss = S;
  let potExchangeWinnings = layStake * (1 - commission / 100);
  let potExchangeLoss = (layStake * (L - 1));
  let profitIfBookieWins = potBookieWinnings - potExchangeLoss;
  let profitIfExchangeWins = potExchangeWinnings - S;
  
  let returnResult = {
    layStake: layStake,
    potBookieWinnings: potBookieWinnings,
    potBookieLoss: potBookieLoss,
    potExchangeWinnings: potExchangeWinnings,
    potExchangeLoss: -potExchangeLoss,
    profitIfBookieWins: profitIfBookieWins,
    profitIfExchangeWins: profitIfExchangeWins,
    minProfit: null
  }
  
  if (!freeBet) {
    profitIfBookieWins = S * (B - 1) - layStake * (L - 1);
    profitIfExchangeWins = potExchangeWinnings - S;
    returnResult.minProfit = Math.min(profitIfBookieWins, profitIfExchangeWins);
  } else {
    if (stakeReturned) {
      potBookieWinnings = S * B; 
      potBookieLoss = 0; 
      potExchangeLoss = layStake * (L - 1); 
      profitIfBookieWins = potBookieWinnings - potExchangeLoss;
      profitIfExchangeWins = layStake * (1 - commission / 100);
      
      returnResult.potBookieWinnings = potBookieWinnings;
      returnResult.potBookieLoss = potBookieLoss;
      returnResult.potExchangeLoss = -potExchangeLoss;
      returnResult.profitIfBookieWins = profitIfBookieWins;
      returnResult.profitIfExchangeWins = profitIfExchangeWins;
      returnResult.minProfit = Math.min(profitIfBookieWins, profitIfExchangeWins);
    } else {
      potExchangeLoss = (B - 1) * S - layStake * (L - 1);
      profitIfBookieWins = S * (B - 1) - layStake * (L - 1);
      returnResult.potExchangeLoss = -(layStake * (L - 1));
      returnResult.profitIfBookieWins = profitIfBookieWins;
      returnResult.profitIfExchangeWins = potExchangeWinnings;
      returnResult.minProfit = Math.min(potExchangeLoss, potExchangeWinnings);
    }
  }
  return returnResult;
};

  
  /**
   * Compute the portion of the back bet matched by a given partial row.
   *
   * For free bets without stake returned, the formula adjusts by using (backOdds - 1).
   *
   * @param {Object} row - A partial row with properties: layOdds, amount, commission.
   * @param {number|string} backOdds - The back bet odds.
   * @param {boolean} freeBet - True if it’s a free bet.
   * @param {boolean} stakeReturned - True if the stake is returned.
   * @returns {number} The computed back bet matched for that row.
   */
  export const computeBackMatched = (row, backOdds, freeBet, stakeReturned) => {
    const amt = parseFloat(row.amount) || 0;
    const lOdds = parseFloat(row.layOdds) || 0;
    const comm = parseFloat(row.commission) || 0;
    const effectiveLay = lOdds - comm / 100;
    const B = parseFloat(backOdds) || 0;
    return freeBet && !stakeReturned ? (amt * effectiveLay) / (B - 1) : (amt * effectiveLay) / B;
  };
  


  /**
 * Calculates detailed outcome values for a risk-free bet in matched betting and returns a breakdown object.
 *
 * For a risk-free bet:
 *   - The ideal lay stake is calculated as: (S × B - (retention/100 × freeBetAmount)) / (L - (commission/100))
 *   - If Bookie Wins:
 *       - Back Profit = S × (B - 1)
 *       - Lay Loss = layStake × (L - 1)
 *       - Net Profit = Back Profit - Lay Loss
 *   - If Exchange Wins:
 *       - Exchange Win = layStake × (1 - commission/100)
 *       - Free Bet Refund = (retention/100) × freeBetAmount
 *       - Net Profit = Exchange Win - S + Free Bet Refund
 *
 * @param {number} S - The back bet stake.
 * @param {number} B - The back odds.
 * @param {number} L - The lay odds.
 * @param {number} commission - The commission percentage on the exchange.
 * @param {number} freeBetAmount - The value of the free bet.
 * @param {number} retention - The free bet retention rate as a percentage.
 * @returns {Object} An object with detailed outcome values and the worst-case profit.
 */
export const calcRiskFreeProfit = (S, B, L, commission, freeBetAmount, retention) => {
  // Convert commission and retention from percentage to fraction.
  const commissionValue = commission / 100;
  const retentionRate = retention / 100;

  // Calculate the ideal lay stake using the risk-free bet formula.
  const rawLayStake = (S * B - retentionRate * freeBetAmount) / (L - commissionValue);
  const layStake = parseFloat(rawLayStake.toFixed(2));

  // Calculate outcomes if the bookmaker (back bet) wins.
  const backProfit = S * (B - 1);
  const layLoss = layStake * (L - 1);
  const profitIfBookieWins = parseFloat((backProfit - layLoss).toFixed(2));

  // Calculate outcomes if the exchange (lay bet) wins.
  const exchangeWin = layStake * (1 - commissionValue);
  const freeBetRefund = retentionRate * freeBetAmount;
  const profitIfExchangeWins = parseFloat((exchangeWin - S + freeBetRefund).toFixed(2));

  // Determine the worst-case profit.
  const minProfit = Math.min(profitIfBookieWins, profitIfExchangeWins);

  // Return the breakdown object.
  return {
    layStake,
    potBookieWinnings: backProfit,
    potBookieLoss: S,
    potExchangeWinnings: exchangeWin,
    potExchangeLoss: layLoss,
    freeBetRefund,
    profitIfBookieWins,
    profitIfExchangeWins,
    minProfit
  };
};
/**
 * Calculates the back stake needed to adjust an unwanted lay bet 
 * and returns a detailed breakdown for both outcomes.
 *
 * The back stake (BS) is calculated as:
 *   BS = LS * (LO - (layCommission/100)) / BO
 *
 * Outcome breakdown:
 * - If the Back bet wins:
 *     Back gross profit = BS × (BO - 1)
 *     Back commission cost = (BS × (BO - 1)) × (backCommission/100)
 *     Net back win = Back gross profit - back commission cost
 *     Lay loss = LS × (LO - 1)
 *     Total = Net back win - Lay loss
 *
 * - If the Lay bet wins:
 *     Back loss = BS (lost stake)
 *     Lay gross win = LS × (LO - 1)
 *     Lay commission cost = (LS × (LO - 1)) × (layCommission/100)
 *     Net lay win = Lay gross win - lay commission cost
 *     Total = Net lay win - BS
 *
 * @param {number} layStake - The unwanted lay stake (LS).
 * @param {number} backOdds - The back odds (BO).
 * @param {number} layOdds - The lay odds (LO).
 * @param {number} backCommission - The commission percentage for the back bet.
 * @param {number} layCommission - The commission percentage for the lay bet.
 * @returns {Object} An object containing the calculated back stake and a detailed breakdown.
 */
export const calcUnwantedLayAdjustment = (
  layStake,
  backOdds,
  layOdds,
  backCommission,
  layCommission
) => {
  // Calculate effective odds:
  const effectiveBackOdds = backOdds - ((backCommission / 100) * (backOdds - 1));
  const effectiveLayOdds  = layOdds - (layCommission / 100);

  // Calculate raw back stake (unrounded)
  const backStakeRaw = layStake * effectiveLayOdds / effectiveBackOdds;
  // Round back stake for display (since bets can only be in pennies)
  const displayBackStake = parseFloat(backStakeRaw.toFixed(2));

  // --- Outcome when the Back bet wins ---
  // Use the unrounded back stake to compute gross profit
  const backWinsBackGross = parseFloat((backStakeRaw * (backOdds - 1)).toFixed(2));
  const backWinsBackComm = parseFloat((backWinsBackGross * (backCommission / 100)).toFixed(2));
  const backWinsBackNet = parseFloat((backWinsBackGross - backWinsBackComm).toFixed(2));
  const backWinsLayLoss = parseFloat((layStake * (layOdds - 1)).toFixed(2));
  const backWinsTotal = parseFloat((backWinsBackNet - backWinsLayLoss).toFixed(2));

  // --- Outcome when the Lay bet wins ---
  // For a losing back bet, we can only lose the actual (display) stake
  const layWinsBackLoss = displayBackStake;
  const layWinsLayGross = parseFloat(layStake.toFixed(2)); // layStake is given
  const layWinsLayComm = parseFloat((layWinsLayGross * (layCommission / 100)).toFixed(2));
  const layWinsLayNet = parseFloat((layWinsLayGross - layWinsLayComm).toFixed(2));
  const layWinsTotal = parseFloat((layWinsLayNet - layWinsBackLoss).toFixed(2));

  return {
    backStake: displayBackStake,
    breakdown: {
      backWins: {
        back: backWinsBackGross,
        backCommission: -backWinsBackComm,
        lay: -backWinsLayLoss,
        layCommission: 0,
        total: backWinsTotal,
      },
      layWins: {
        back: -layWinsBackLoss,
        backCommission: 0,
        lay: layWinsLayGross,
        layCommission: -layWinsLayComm,
        total: layWinsTotal,
      }
    }
  };
};
/**
 * Calculates the Dutching bet amounts for back bets and returns a detailed breakdown.
 *
 * This function calculates the individual stakes for a series of back bets so that the distribution
 * is proportional to the odds. You can choose between two targeting methods:
 *
 * 1. Target Total Stake:
 *    - Let S be the target total stake.
 *    - Compute the sum of inverses: M = (1 / price1) + (1 / price2) + ... + (1 / priceN).
 *    - The intermediate payout is: P = S / M.
 *    - Each individual stake is calculated as: stake_i = P / price_i.
 *
 * 2. Target First Selection Stake:
 *    - Let T be the target stake for the first selection.
 *    - Let firstOdds be the odds of the first selection.
 *    - The intermediate payout is: P = T * firstOdds.
 *    - Each individual stake is calculated as: stake_i = P / price_i.
 *
 * The function returns:
 *   - {number} totalOutlay: The sum of all stakes.
 *   - {number[]} stakes: The calculated stake amounts for each outcome.
 *   - {number[]} profits: The potential profit for each outcome (each computed as stake_i × price_i - totalOutlay).
 *   - {number[]} returns: The total return for each outcome (each computed as stake_i × price_i).
 *   - {number} minProfit: The minimum guaranteed profit (the worst-case profit) across all outcomes.
 *
 * Additionally, if the "round" option is enabled, the calculated stakes will be rounded to whole numbers.
 *
 * @param {Object} options - The input parameters for the dutching calculator.
 * @param {'totalStake'|'firstStake'} options.targetType - The target type:
 *          'totalStake' means the sum of all stakes equals the target value,
 *          'firstStake' means the stake for the first selection equals the target value.
 * @param {number} options.targetValue - The target total stake or target stake for the first selection.
 * @param {number[]} options.prices - An array of odds for each outcome.
 * @param {boolean} [options.round=false] - Optional flag; if true, the calculated stakes will be rounded.
 *
 * @returns {Object} An object containing:
 *   - {number} totalOutlay: The sum of all stakes.
 *   - {number[]} stakes: The calculated stake amounts for each outcome.
 *   - {number[]} profits: The potential profit for each outcome.
 *   - {number[]} returns: The total return for each outcome.
 *   - {number} minProfit: The minimum guaranteed profit across outcomes.
 */
export const dutchingCalc = ({ targetType, targetValue, prices, round = false }) => {
  if (!Array.isArray(prices) || prices.some(price => price <= 0)) {
    throw new Error("Invalid prices: Provide an array of positive numbers.");
  }
  if (typeof targetValue !== "number" || targetValue <= 0) {
    throw new Error("Invalid targetValue: Must be a positive number.");
  }

  let payout;
  if (targetType === "totalStake") {
    const sumInverse = prices.reduce((sum, price) => sum + (1 / price), 0);
    payout = targetValue / sumInverse;
  } else if (targetType === "firstStake") {
    payout = targetValue * prices[0];
  } else {
    throw new Error("Invalid targetType: Must be 'totalStake' or 'firstStake'.");
  }

  // Calculate individual stakes: stake_i = payout / price_i.
  let stakes = prices.map(price => payout / price);

  // If round flag is enabled, round to whole numbers; otherwise round to 2 decimal places.
  if (round) {
    stakes = stakes.map(stake => Math.round(stake));
  } else {
    stakes = stakes.map(stake => Number(stake.toFixed(2)));
  }

  const totalOutlay = stakes.reduce((sum, stake) => sum + stake, 0);
  const profits = stakes.map((stake, i) => (stake * prices[i]) - totalOutlay);
  const returns = stakes.map((stake, i) => stake * prices[i]);
  const minProfit = Math.min(...profits);

  return {
    totalOutlay,
    stakes,
    profits,
    returns,
    minProfit,
  };
};
