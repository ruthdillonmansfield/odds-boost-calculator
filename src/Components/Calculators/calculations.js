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
  let potExchangeLoss = layStake * (L - 1);
  let profitIfBookieWins = potBookieWinnings - potExchangeLoss;
  let profitIfExchangeWins = potExchangeWinnings - S;
  
  let returnResult = {
    layStake: layStake,
    potBookieWinnings: potBookieWinnings,
    potBookieLoss: potBookieLoss,
    potExchangeWinnings: potExchangeWinnings,
    potExchangeLoss: potExchangeLoss,
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
      returnResult.potExchangeLoss = potExchangeLoss;
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
