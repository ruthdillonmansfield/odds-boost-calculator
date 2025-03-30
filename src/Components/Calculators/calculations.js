import { LetterText } from "lucide-react";

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
      const profitIfBackWins = groupBack * (B - 1) - groupLayLiability - (groupBack / B);
      const profitIfExchangeWins = groupLayStake * (1 - commission / 100) - groupBack;
      return Math.min(profitIfBackWins, profitIfExchangeWins);
    } else {
      const profitIfBackWins = groupBack * (B - 1) - groupLayLiability;
      const profitIfExchangeWins = groupLayStake * (1 - commission / 100) - groupBack;
      return Math.min(profitIfBackWins, profitIfExchangeWins);
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
      lockedProfit = calcMinProfit(lockedBackMatched, backOdds, avgLockedLayOdds, avgLockedCommission, freeBet, stakeReturned);
    }
  
    const remainingBackStake = Math.max(0, backStake - lockedBackMatched);
    let unlockedProfit = 0;
    if (unlockedPartials.length > 0 && remainingBackStake > 0) {
      const currentRow = unlockedPartials[0];
      const lOdds = parseFloat(currentRow.layOdds) || 0;
      const comm = parseFloat(currentRow.commission) || 0;
      unlockedProfit = calcMinProfit(remainingBackStake, backOdds, lOdds, comm, freeBet, stakeReturned);
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
 * Calculates the worst‐case profit for a full hedge in matched betting.
 *
 * For a normal bet:
 *   - Profit if back wins = S × (B - 1) - layStake × (L - 1)
 *   - Profit if exchange wins = layStake × (1 - commission/100) - S
 *
 * For a free bet:
 *   - If stake is returned:
 *       Profit = S × B - layStake × (L - 1)
 *   - If stake is NOT returned (SNR):
 *       Profit if free bet wins = (B - 1) × S - layStake × (L - 1)
 *       Profit if lay bet wins = layStake × (1 - commission/100)
 *       (Both outcomes are equal by design using the ideal lay stake.)
 *
 * @param {number} S - Back bet stake or free bet size.
 * @param {number} B - Back odds.
 * @param {number} L - Lay odds.
 * @param {number} commission - Commission percentage.
 * @param {boolean} freeBet - True if this is a free bet.
 * @param {boolean} stakeReturned - True if the free bet stake is returned.
 * @returns {number} The worst-case profit.
 */
export const calcMinProfit = (S, B, L, commission, freeBet, stakeReturned) => {
  const layStake = getIdealLayStake(S, B, L, commission, freeBet, stakeReturned);  
  let profitIfExchangeWins;
  
  if (!freeBet) {
    const profitIfBackWins = S * (B - 1) - layStake * (L - 1);
    profitIfExchangeWins = layStake * (1 - commission / 100) - S;
    return Math.min(profitIfBackWins, profitIfExchangeWins);
  } else {
    if (stakeReturned) {
      profitIfExchangeWins = layStake * (1 - commission / 100);
      return Math.min(S * B - layStake * (L - 1), profitIfExchangeWins)
    } else {
      profitIfExchangeWins = layStake * (1 - commission / 100);
      return Math.min((B - 1) * S - layStake * (L - 1), profitIfExchangeWins);
    }
  }
};


 /**
 * Calculates the worst‐case profit when the bookmaker wins in a full hedge matched betting scenario.
 *
 * For a normal bet (or free bet with stake returned):
 *   Profit if back wins = S*(B - 1) - layStake*(L - 1)
 *   Profit if exchange wins = layStake*(1 - commission/100) - S
 *
 * For a free bet where stake is NOT returned:
 *   Profit if back wins = S*B - layStake*(L - 1)
 *   Profit if exchange wins = layStake*(1 - commission/100) - (S/B)
 *
 * @param {number} S - Back bet stake.
 * @param {number} B - Back bet odds.
 * @param {number} L - Lay odds.
 * @param {number} commission - Commission percentage.
 * @param {boolean} freeBet - True if this is a free bet.
 * @param {boolean} stakeReturned - True if the free bet stake is returned.
 * @returns {number} The worst-case profit when the bookmaker wins.
 */
export const calcOutcomeIfBookieWins = (S, B, L, commission, freeBet, stakeReturned) => {
    const layStake = getIdealLayStake(S, B, L, commission, freeBet, stakeReturned);  
    
    if (!freeBet) {
      return S * (B - 1) - layStake * (L - 1);
    } else {
      if (stakeReturned) {
        return S * B - layStake * (L - 1);
      } else {
        return (B - 1) * S - layStake * (L - 1)
      }
    }
  };

/**
 * Calculates the worst‐case profit when the exchange wins in a full hedge matched betting scenario.
 *
 * For a normal bet (or free bet with stake returned):
 *   Profit if back wins = S*(B - 1) - layStake*(L - 1)
 *   Profit if exchange wins = layStake*(1 - commission/100) - S
 *
 * For a free bet where stake is NOT returned:
 *   Profit if back wins = S*B - layStake*(L - 1)
 *   Profit if exchange wins = layStake*(1 - commission/100) - (S/B)
 *
 * @param {number} S - Back bet stake.
 * @param {number} B - Back bet odds.
 * @param {number} L - Lay odds.
 * @param {number} commission - Commission percentage.
 * @param {boolean} freeBet - True if this is a free bet.
 * @param {boolean} stakeReturned - True if the free bet stake is returned.
 * @returns {number} The worst-case profit when the exchange wins.
 */
export const calcOutcomeIfExchangeWins = (S, B, L, commission, freeBet, stakeReturned) => {
  const layStake = getIdealLayStake(S, B, L, commission, freeBet, stakeReturned);
  
  if (!freeBet) {
    return layStake * (1 - commission / 100) - S;
  } else {
    return layStake * (1 - commission / 100);
  }
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
  