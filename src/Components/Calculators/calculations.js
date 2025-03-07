/**
 * Calculate the suggested additional lay using the new method.
 * It subtracts total back bet matched from the back stake (S)
 * and calculates how much additional lay is needed against what’s left.
 *
 * @param {number} S - Back bet stake.
 * @param {number} B - Back bet odds.
 * @param {boolean} freeBet - True if it’s a free bet.
 * @param {boolean} stakeReturned - True if stake is returned.
 * @param {number} totalBackMatched - Total back bet matched computed from partial rows.
 * @param {number} chosenOdds - The effective chosen lay odds (latest valid or weighted).
 * @param {number} commission - Commission percentage.
 * @returns {number} The additional lay stake required.
 */
export const calculateAdditionalLayNew = (S, B, freeBet, stakeReturned, totalBackMatched, chosenOdds, commission) => {
    const remainingStake = S - totalBackMatched;
    if (remainingStake <= 0) return 0;
    // For normal bets or free bets with stake returned, use B; else use (B - 1)
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
 * @param {number} groupLayStake - Sum of lay stakes (i.e. amounts) for the group.
 * @param {number} groupLayLiability - Sum of (amount × (layOdds – 1)) for the group.
 * @param {number} B - Back bet odds.
 * @param {number} commission - Commission percentage (assumed same for the group).
 * @param {boolean} freeBet - True if free bet.
 * @param {boolean} stakeReturned - True if stake returned.
 * @returns {number} The minimum profit for the group.
 */
export const calculateGroupProfit = (groupBack, groupLayStake, groupLayLiability, B, commission, freeBet, stakeReturned) => {
    // For free bets where stake is not returned, we subtract an adjustment.
    if (freeBet && !stakeReturned) {
      // Adjust back win profit to account for the fact that the stake is not returned.
      // Here we subtract (groupBack / B) as a simple adjustment.
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
 * Calculate the overall profit for a matched betting scenario by breaking
 * the calculation into two halves:
 *
 *   1. Locked partials: examine all locked partials and compute their total “back matched” amount,
 *      then compute the profit for these using a weighted average of their lay odds and commission.
 *
 *   2. Unlocked partial: for the remaining unmatched back stake (backStake minus locked back matched),
 *      use the unlocked partial’s parameters to compute profit.
 *
 * The overall profit is then the sum of the locked and unlocked profits.
 *
 * @param {number} backStake - The total back bet stake.
 * @param {number} backOdds - The back bet odds.
 * @param {boolean} freeBet - True if it’s a free bet.
 * @param {boolean} stakeReturned - True if the free bet returns its stake.
 * @param {Array<Object>} partials - Array of partial lay entries. Each object should have {layOdds, amount, commission, locked}.
 * @returns {number} The overall worst-case profit.
 */
export const calculateOverallProfit = (backStake, backOdds, freeBet, stakeReturned, partials) => {
    // Partition the partials into locked and unlocked
    const lockedPartials = partials.filter(row => row.locked);
    const unlockedPartials = partials.filter(row => !row.locked);
  
    // 1. Calculate locked profit:
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
      // Compute weighted averages for lay odds and commission for locked partials
      const avgLockedLayOdds = sumLockedLayOdds / totalLockedAmount;
      const avgLockedCommission = sumLockedCommission / totalLockedAmount;
      lockedProfit = simpleProfitCalculator(lockedBackMatched, backOdds, avgLockedLayOdds, avgLockedCommission, freeBet, stakeReturned);
    }
  
    // 2. Calculate unlocked profit:
    // Determine the remaining unmatched back stake:
    const lockedBack = lockedBackMatched;
    const remainingBackStake = Math.max(0, backStake - lockedBack);
    let unlockedProfit = 0;
    if (unlockedPartials.length > 0 && remainingBackStake > 0) {
      // We assume the first unlocked partial is used.
      const currentRow = unlockedPartials[0];
      const lOdds = parseFloat(currentRow.layOdds) || 0;
      const comm = parseFloat(currentRow.commission) || 0;
      unlockedProfit = simpleProfitCalculator(remainingBackStake, backOdds, lOdds, comm, freeBet, stakeReturned);
    }
  
    return lockedProfit + unlockedProfit;
  };
  
  /**
 * Compute the portion of the back bet matched by a given partial row.
 * This function reverse-engineers the lay stake into an equivalent back stake.
 *
 * For normal bets (or free bets with stake returned), we use:
 *    backMatched = (amount * (layOdds - commission/100)) / backOdds.
 *
 * For free bets where the stake is not returned (FB SNR), we use:
 *    backMatched = (amount * (layOdds - commission/100)) / (backOdds - 1).
 *
 * @param {Object} row - A partial row object with properties: layOdds, amount, commission.
 * @param {number|string} backOdds - The back bet odds.
 * @param {boolean} freeBet - True if it’s a free bet.
 * @param {boolean} stakeReturned - True if the stake is returned.
 * @returns {number} The computed back bet matched for that row.
 */


  /**
 * A simple helper function that calculates the worst‐case profit
 * for a full hedge in matched betting.
 *
 * It takes:
 *   S: Back bet stake
 *   B: Back bet odds
 *   L: Lay odds
 *   commission: Commission percentage (e.g. 2 for 2%)
 *   freeBet: boolean indicating if this is a free bet
 *   stakeReturned: boolean indicating if the stake is returned (only applicable for free bets)
 *
 * It internally calculates the ideal lay stake using:
 *   layStake = (S * B) / (L - commission/100)
 *
 * Then it computes:
 *
 * For a normal bet (or free bet with stake returned):
 *   Profit if back wins = S*(B - 1) - layStake*(L - 1)
 *   Profit if exchange wins = layStake*(1 - commission/100) - S
 *
 * For a free bet where stake is NOT returned (FB SNR):
 *   Profit if back wins = S*(B - 1) - layStake*(L - 1)
 *   Profit if exchange wins = layStake*(1 - commission/100)
 *
 * The function returns the lower (worst-case) of the two profits.
 *
 * @param {number} S - Back bet stake.
 * @param {number} B - Back bet odds.
 * @param {number} L - Lay odds.
 * @param {number} commission - Commission percentage.
 * @param {boolean} freeBet - True if this is a free bet.
 * @param {boolean} stakeReturned - True if the free bet stake is returned.
 * @returns {number} The worst-case profit.
 */
  export const simpleProfitCalculator = (S, B, L, commission, freeBet, stakeReturned) => {
    // Calculate effective lay odds (adjusted for commission)
    const effectiveLayOdds = L - commission / 100;
    // Calculate ideal lay stake (full hedge)
    const layStake = (S * B) / effectiveLayOdds;
  
    if (!freeBet) {
      // Normal bet: both outcomes matter
      const profitIfBackWins = S * (B - 1) - layStake * (L - 1);
      const profitIfExchangeWins = layStake * (1 - commission / 100) - S;
      return Math.min(profitIfBackWins, profitIfExchangeWins);
    } else {
      // Free bet: different treatment for stake returned vs. not returned.
      if (stakeReturned) {
        // FB SR: profit if back wins = S*B - layStake*(L-1)
        return S * B - layStake * (L - 1);
      } else {
        // FB SNR: subtract the free stake adjustment S/B.
        return S * B - layStake * (L - 1) - (S / B);
      }
    }
  };
  
export const computeBackMatched = (row, backOdds, freeBet, stakeReturned) => {
    const amt = parseFloat(row.amount) || 0;
    const lOdds = parseFloat(row.layOdds) || 0;
    const comm = parseFloat(row.commission) || 0;
    // Commission reduces the effective lay odds for both bet types.
    const effectiveLay = lOdds - comm / 100;
    const B = parseFloat(backOdds) || 0;
    if (freeBet && !stakeReturned) {
      return (amt * effectiveLay) / (B - 1);
    } else {
      return (amt * effectiveLay) / B;
    }
  };