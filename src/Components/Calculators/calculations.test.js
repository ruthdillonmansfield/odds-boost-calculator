import { expect } from "chai";
import { 
    computeBackMatched, 
    calculateAdditionalLayNew, 
    calculateGroupProfit,
    calculateOverallProfit,
    calcMinProfit,
    getIdealLayStake
  } from "./calculations.js";
  
describe("computeBackMatched", () => {
  it("should calculate back matched as 9.90 when backOdds=10, layOdds=10, amount=9.9, commission=0 for a normal bet", () => {
    const row = { layOdds: "10", amount: "9.9", commission: "0" };
    const backOdds = 10;
    const freeBet = false;
    const stakeReturned = false;
    const result = computeBackMatched(row, backOdds, freeBet, stakeReturned);
    // Normal bet: (9.9 * 10) / 10 = 9.9
    expect(result).to.be.closeTo(9.9, 0.01);
  });

  it("should calculate back matched as 60 when backOdds=3, layOdds=4, amount=45, commission=0 for a normal bet", () => {
    const row = { layOdds: "4", amount: "45", commission: "0" };
    const backOdds = 3;
    const freeBet = false;
    const stakeReturned = false;
    const result = computeBackMatched(row, backOdds, freeBet, stakeReturned);
    // Normal bet: (45 * 4) / 3 = 60
    expect(result).to.be.closeTo(60, 0.01);
  });

  it("Normal bet commission: should calculate back matched as ~9.85 when backOdds=10, layOdds=10, amount=9.9, commission=5", () => {
    const row = { layOdds: "10", amount: "9.9", commission: "5" };
    const backOdds = 10;
    const freeBet = false;
    const stakeReturned = false;
    const result = computeBackMatched(row, backOdds, freeBet, stakeReturned);
    // effectiveLay = 10 - 0.05 = 9.95, so: (9.9 * 9.95)/10 ≈ 9.85
    expect(result).to.be.closeTo(9.85, 0.01);
  });

  it("FB SNR: should calculate back matched as 10 when backOdds=10, layOdds=10, amount=9, commission=0", () => {
    const row = { layOdds: "10", amount: "9", commission: "0" };
    const backOdds = 10;
    const freeBet = true;
    const stakeReturned = false;
    const result = computeBackMatched(row, backOdds, freeBet, stakeReturned);
    // FB SNR: (9 * 10) / (10 - 1) = 90 / 9 = 10
    expect(result).to.be.closeTo(10, 0.01);
  });

  it("FB SNR commission: should calculate back matched as ~9.95 when backOdds=10, layOdds=10, amount=9, commission=5", () => {
    const row = { layOdds: "10", amount: "9", commission: "5" };
    const backOdds = 10;
    const freeBet = true;
    const stakeReturned = false;
    const result = computeBackMatched(row, backOdds, freeBet, stakeReturned);
    // effectiveLay = 10 - 0.05 = 9.95, so: (9 * 9.95)/(10 - 1) = (89.55)/9 ≈ 9.95
    expect(result).to.be.closeTo(9.95, 0.01);
  });

  it("FB SNR: should calculate back matched as 60 when backOdds=3, layOdds=4, amount=30, commission=0 for a free bet", () => {
    const row = { layOdds: "4", amount: "30", commission: "0" };
    const backOdds = 3;
    const freeBet = true;
    const stakeReturned = false;
    const result = computeBackMatched(row, backOdds, freeBet, stakeReturned);
    // FB SNR: (30 * 4) / (3 - 1) = 120 / 2 = 60
    expect(result).to.be.closeTo(60, 0.01);
  });

  it("FB SNR commission: should calculate back matched as ~60 when backOdds=3, layOdds=4, amount=30.38, commission=5 for a free bet", () => {
    const row = { layOdds: "4", amount: "30.38", commission: "5" };
    const backOdds = 3;
    const freeBet = true;
    const stakeReturned = false;
    const result = computeBackMatched(row, backOdds, freeBet, stakeReturned);
    // effectiveLay = 4 - 0.05 = 3.95, so: (30.38 * 3.95) / (3 - 1) ≈ 60
    expect(result).to.be.closeTo(60, 0.01);
  });
});


describe("calculateAdditionalLayNew", () => {
    it("should calculate additional lay as 0.10 when stake=10, backOdds=10, layOdds=10, totalMatched=9.9, commission=0", () => {
        const S = 10;
        const B = 10;
        const freeBet = false;
        const stakeReturned = false;
        const totalMatched = 9.9;
        const chosenOdds = 10;
        const commission = 0;
        const result = calculateAdditionalLayNew(S, B, freeBet, stakeReturned, totalMatched, chosenOdds, commission);
        expect(result).to.be.closeTo(0.10, 0.01);
      });
      it("should calculate additional lay as 10.05 when stake=10, backOdds=10, layOdds=10, totalMatched=0, commission=5", () => {
        const S = 10;
        const B = 10;
        const freeBet = false;
        const stakeReturned = false;
        const totalMatched = 0;
        const chosenOdds = 10;
        const commission = 5;
        const result = calculateAdditionalLayNew(S, B, freeBet, stakeReturned, totalMatched, chosenOdds, commission);
        expect(result).to.be.closeTo(10.05, 0.01);
      });
      it("should calculate additional lay as 4.55 when stake=10, backOdds=10, layOdds=11, totalMatched=5, commission=0", () => {
        const S = 10;
        const B = 10;
        const freeBet = false;
        const stakeReturned = false;
        const totalMatched = 5;
        const chosenOdds = 11;
        const commission = 0;
        const result = calculateAdditionalLayNew(S, B, freeBet, stakeReturned, totalMatched, chosenOdds, commission);
        expect(result).to.be.closeTo(4.55, 0.1);
      });
      it("should calculate additional lay as 10 when stake=10, backOdds=10, layOdds=10, totalMatched=0, commission=0", () => {
        const S = 10;
        const B = 10;
        const freeBet = false;
        const stakeReturned = false;
        const totalMatched = 0;
        const chosenOdds = 10;
        const commission = 0;
        const result = calculateAdditionalLayNew(S, B, freeBet, stakeReturned, totalMatched, chosenOdds, commission);
        expect(result).to.be.closeTo(10, 0.001);
      });
      it("should calculate additional lay as 9 when stake=10, backOdds=10, layOdds=10, totalMatched=0, commission=0", () => {
        const S = 10;
        const B = 10;
        const freeBet = true;
        const stakeReturned = false;
        const totalMatched = 0;
        const chosenOdds = 10;
        const commission = 0;
        const result = calculateAdditionalLayNew(S, B, freeBet, stakeReturned, totalMatched, chosenOdds, commission);
        expect(result).to.be.closeTo(9, 0.001);
      });
      it("should calculate additional lay as 10 when stake=10, backOdds=10, layOdds=10, totalMatched=0, commission=0", () => {
        const S = 10;
        const B = 10;
        const freeBet = true;
        const stakeReturned = true;
        const totalMatched = 0;
        const chosenOdds = 10;
        const commission = 0;
        const result = calculateAdditionalLayNew(S, B, freeBet, stakeReturned, totalMatched, chosenOdds, commission);
        expect(result).to.be.closeTo(10, 0.001);
      });
      it("should calculate additional lay as 10.02 when stake=10, backOdds=10, layOdds=10, totalMatched=0, commission=2", () => {
        const S = 10;
        const B = 10;
        const freeBet = false;
        const stakeReturned = false;
        const totalMatched = 0;
        const chosenOdds = 10;
        const commission = 2;
        const result = calculateAdditionalLayNew(S, B, freeBet, stakeReturned, totalMatched, chosenOdds, commission);
        expect(result).to.be.closeTo(10.02, 0.001);
      });
      it("should calculate additional lay as 9.02 when stake=10, backOdds=10, layOdds=10, totalMatched=0, commission=2", () => {
        const S = 10;
        const B = 10;
        const freeBet = true;
        const stakeReturned = false;
        const totalMatched = 0;
        const chosenOdds = 10;
        const commission = 2;
        const result = calculateAdditionalLayNew(S, B, freeBet, stakeReturned, totalMatched, chosenOdds, commission);
        expect(result).to.be.closeTo(9.02, 0.5);
      });
      it("should calculate additional lay as 10.02 when stake=10, backOdds=10, layOdds=10, totalMatched=0, commission=2", () => {
        const S = 10;
        const B = 10;
        const freeBet = true;
        const stakeReturned = true;
        const totalMatched = 0;
        const chosenOdds = 10;
        const commission = 2;
        const result = calculateAdditionalLayNew(S, B, freeBet, stakeReturned, totalMatched, chosenOdds, commission);
        expect(result).to.be.closeTo(10.02, 0.001);
      });
  it("should return 0 if remaining stake is 0 or negative", () => {
    // Case: totalMatched equals or exceeds S
    expect(calculateAdditionalLayNew(100, 3.5, false, false, 100, 3, 0)).to.equal(0);
    expect(calculateAdditionalLayNew(100, 3.5, false, false, 120, 3, 0)).to.equal(0);
  });
});
describe("calculateGroupProfit", () => {
  it("should compute group profit as 0 for a perfectly hedged normal bet group", () => {
    // Example: lockedBack=30, lockedLayStake=30, lockedLayLiability=270, B=10, commission=0.
    // Profit if back wins = 30*(9) - 270 = 270 - 270 = 0.
    // Profit if exchange wins = 30 - 30 = 0.
    const profit = calculateGroupProfit(30, 30, 270, 10, 0, false, false);
    expect(profit).to.be.closeTo(0, 0.01);
  });
  it("should compute group profit for FB SNR correctly", () => {
    // For FB SNR, assume lockedBack=30, lockedLayStake=30, lockedLayLiability=270, B=10, commission=0.
    // Then profit if back wins = 30*(9) - 270 - (30/10)=270-270-3= -3.
    // Profit if exchange wins = 30 - 30 = 0, so min profit = -3.
    const profit = calculateGroupProfit(30, 30, 270, 10, 0, true, false);
    expect(profit).to.be.closeTo(-3, 0.01);
  });
});

describe("calculateOverallProfit", () => {
  it("should return 0 profit when locked partials fully match the back stake for a normal bet", () => {
    const backStake = 10;
    const backOdds = 10;
    const freeBet = false;
    const stakeReturned = false;
    const partials = [
      { layOdds: "10", amount: "5", commission: "0", locked: true },
      { layOdds: "10", amount: "5", commission: "0", locked: true },
    ];
    const profit = calculateOverallProfit(backStake, backOdds, freeBet, stakeReturned, partials);
    expect(profit).to.be.closeTo(0, 0.001);
  });

  it("should combine locked and unlocked profits for a normal bet", () => {
    const backStake = 10;
    const backOdds = 10;
    const freeBet = false;
    const stakeReturned = false;
    const partials = [
      { layOdds: "10", amount: "6", commission: "0", locked: true },
      { layOdds: "10", amount: "4", commission: "0", locked: false }
    ];
    const profit = calculateOverallProfit(backStake, backOdds, freeBet, stakeReturned, partials);
    expect(profit).to.be.closeTo(0, 0.5);
  });

  it("should compute overall profit for a FB SNR bet combining locked and unlocked portions", () => {
    const backStake = 10;
    const backOdds = 10;
    const freeBet = true;
    const stakeReturned = false;
    const partials = [
      { layOdds: "10", amount: "8", commission: "0", locked: true },
      { layOdds: "10", amount: "2", commission: "0", locked: false }
    ];
    const profit = calculateOverallProfit(backStake, backOdds, freeBet, stakeReturned, partials);
    expect(profit).to.be.above(0);
    expect(profit).to.be.closeTo(9, 1);
  });
});

describe("calcMinProfit", () => {
  it("should return 0 profit for a normal bet with S=10, B=10, L=10, commission=0", () => {
    const profit = calcMinProfit(10, 10, 10, 0, false, false);
    expect(profit.minProfit).to.be.closeTo(0, 0.001);
  });

  it("should return -0.18 profit for a normal bet with S=10, B=10, L=10, commission=2", () => {
    const profit = calcMinProfit(10, 10, 10, 2, false, false);
    expect(profit.minProfit).to.be.closeTo(-0.18, 0.01);
  });

  it("should return -2.73 profit for a normal bet with S=14, B=14.83, L=17.5, commission=5", () => {
    const profit = calcMinProfit(14, 14.83, 17.5, 5, false, false);
    expect(profit.minProfit).to.be.closeTo(-2.73, 0.01);
  });
  it("should return -128.83 for a normal bet with 204.89, 81.923, 144.5, 34.2", () => {
    const profit = calcMinProfit(204.89, 81.923, 144.5, 34.2, false, false);
    expect(profit.minProfit).to.be.closeTo(-128.83, 0.01);
  });
  it("should return -121.65 for a normal bet with 204.89, 81.923, 133, 34.2", () => {
    const profit = calcMinProfit(204.89, 81.923, 133, 34.2, false, false);
    expect(profit.minProfit).to.be.closeTo(-121.65, 0.01);
  });
  it("should return 83.24 for a FB SR with 204.89, 81.923, 133, 34.2", () => {
    const profit = calcMinProfit(204.89, 81.923, 133, 34.2, true, true);
    expect(profit.minProfit).to.be.closeTo(83.24, 0.01);
  });
  it("should return 9 profit for a FB SNR bet with S=10, B=10, L=10, commission=0", () => {

    const profit = calcMinProfit(10, 10, 10, 0, true, false);
    expect(profit.minProfit).to.be.closeTo(9, 0.001);
  });

  it("should return 10 profit for a FB SR bet with S=10, B=10, L=10, commission=0", () => {
    const profit = calcMinProfit(10, 10, 10, 0, true, true);
    expect(profit.minProfit).to.be.closeTo(10, 0.001);
  });

  it("should return ~8.82 profit for a FB SNR bet with S=10, B=10, L=10, commission=2", () => {
    const profit = calcMinProfit(10, 10, 10, 2, true, false);
    expect(profit.minProfit).to.be.closeTo(8.82, 0.01);
  });

  it("should return 10.47 profit for a FB SNR bet with S=14, B=14.83, L=17.5, commission=5", () => {
    const profit = calcMinProfit(14, 14.83, 17.5, 5, true, false);
    expect(profit.minProfit).to.be.closeTo(10.47, 0.01);
  });
  it("should return 75.68 for a FB SNR bet with 204.89, 81.923, 144.5, 34.2", () => {
    const profit = calcMinProfit(204.89, 81.923, 144.5, 34.2, true, false);
    expect(profit.minProfit).to.be.closeTo(75.68, 0.01);
  });
  it("should return 81.63 for a FB SNR bet with 204.89, 81.923, 133, 34.2", () => {
    const profit = calcMinProfit(204.89, 81.923, 133, 34.2, true, false);
    expect(profit.minProfit).to.be.closeTo(81.63, 0.01);
  });
  it("should return ~9.82 profit for a FB SR bet with S=10, B=10, L=10, commission=2", () => {
    const profit = calcMinProfit(10, 10, 10, 2, true, true);
    expect(profit.minProfit).to.be.closeTo(9.82, 0.01);
  });
  it('should return an object with the correct keys', () => {
    const result = calcMinProfit(122.2, 5, 6, 2, false, false);
    expect(result).to.have.property('layStake');
    expect(result).to.have.property('potBookieWinnings');
    expect(result).to.have.property('potBookieLoss');
    expect(result).to.have.property('potExchangeWinnings');
    expect(result).to.have.property('potExchangeLoss');
    expect(result).to.have.property('profitIfBookieWins');
    expect(result).to.have.property('profitIfExchangeWins');
    expect(result).to.have.property('minProfit');
  });
  it('should return the expected outcome for the given normal bet input', () => {
    const S = 122.2;
    const B = 5;
    const L = 6.2;
    const commission = 2;
    const freeBet = false;
    const stakeReturned = false;

    const expected = {
      layStake: 98.87,
      potBookieWinnings: 488.80,
      potBookieLoss: 122.2,
      potExchangeWinnings: 96.89,
      potExchangeLoss: 514.12,
      profitIfBookieWins: -25.32,
      profitIfExchangeWins: -25.31,
      minProfit: -25.32
    };

    const result = calcMinProfit(S, B, L, commission, freeBet, stakeReturned);
    expect(result.layStake).to.be.closeTo(expected.layStake, 0.01);
    expect(result.potBookieWinnings).to.be.closeTo(expected.potBookieWinnings, 0.01);
    expect(result.potBookieLoss).to.be.closeTo(expected.potBookieLoss, 0.01);
    expect(result.potExchangeWinnings).to.be.closeTo(expected.potExchangeWinnings, 0.01);
    expect(result.potExchangeLoss).to.be.closeTo(expected.potExchangeLoss, 0.01);
    expect(result.profitIfBookieWins).to.be.closeTo(expected.profitIfBookieWins, 0.01);
    expect(result.profitIfExchangeWins).to.be.closeTo(expected.profitIfExchangeWins, 0.01);
    expect(result.minProfit).to.be.closeTo(expected.minProfit, 0.01);
  });
  it('should return the expected outcome for the given free bet input', () => {
    const S = 122.2;
    const B = 5;
    const L = 6.2;
    const commission = 2;
    const freeBet = true;
    const stakeReturned = false;

    const expected = {
      layStake: 79.09,
      potBookieWinnings: 488.80,
      potBookieLoss: 122.2,
      potExchangeWinnings: 77.51,
      potExchangeLoss: -411.27,
      profitIfBookieWins: 77.53,
      profitIfExchangeWins: 77.51,
      minProfit: 77.51
    };

    const result = calcMinProfit(S, B, L, commission, freeBet, stakeReturned);
    expect(result.layStake).to.be.closeTo(expected.layStake, 0.01);
    expect(result.potBookieWinnings).to.be.closeTo(expected.potBookieWinnings, 0.01);
    expect(result.potBookieLoss).to.be.closeTo(expected.potBookieLoss, 0.01);
    expect(result.potExchangeWinnings).to.be.closeTo(expected.potExchangeWinnings, 0.01);
    expect(result.potExchangeLoss).to.be.closeTo(expected.potExchangeLoss, 0.01);
    expect(result.profitIfBookieWins).to.be.closeTo(expected.profitIfBookieWins, 0.01);
    expect(result.profitIfExchangeWins).to.be.closeTo(expected.profitIfExchangeWins, 0.01);
    expect(result.minProfit).to.be.closeTo(expected.minProfit, 0.01);
  });
  it('should return the expected outcome for the given FB SR input', () => {
    const S = 122.2;
    const B = 5;
    const L = 6.2;
    const commission = 2;
    const freeBet = true;
    const stakeReturned = true;

    const expected = {
      layStake: 98.87,
      potBookieWinnings: 611,
      potBookieLoss: 0,
      potExchangeWinnings: 96.89,
      potExchangeLoss: 514.12,
      profitIfBookieWins: 96.88,
      profitIfExchangeWins: 96.89,
      minProfit: 96.88
    };

    const result = calcMinProfit(S, B, L, commission, freeBet, stakeReturned);
    expect(result.layStake).to.be.closeTo(expected.layStake, 0.01);
    expect(result.potBookieWinnings).to.be.closeTo(expected.potBookieWinnings, 0.01);
    expect(result.potBookieLoss).to.be.closeTo(expected.potBookieLoss, 0.01);
    expect(result.potExchangeWinnings).to.be.closeTo(expected.potExchangeWinnings, 0.01);
    expect(result.potExchangeLoss).to.be.closeTo(expected.potExchangeLoss, 0.01);
    expect(result.profitIfBookieWins).to.be.closeTo(expected.profitIfBookieWins, 0.01);
    expect(result.profitIfExchangeWins).to.be.closeTo(expected.profitIfExchangeWins, 0.01);
    expect(result.minProfit).to.be.closeTo(expected.minProfit, 0.01);
  });
});

describe("getIdealLayStake", () => {
  it("should return 10.00 for a normal bet with S=10, B=10, L=10, commission=0", () => {
    const layStake = getIdealLayStake(10, 10, 10, 0, false, false);
    expect(layStake).to.be.closeTo(10.00, 0.001);
  });

  it("should return 10.02 for a normal bet with S=10, B=10, L=10, commission=2", () => {
    const layStake = getIdealLayStake(10, 10, 10, 2, false, false);
    expect(layStake).to.be.closeTo(10.02, 0.01);
  });

  it("should return 11.90 for a normal bet with S=14, B=14.83, L=17.5, commission=5", () => {
    const layStake = getIdealLayStake(14, 14.83, 17.5, 5, false, false);
    expect(layStake).to.be.closeTo(11.90, 0.01);
  });

  it("should return 116.44 for a normal bet with 204.89, 81.923, 144.5, 34.2", () => {
    const layStake = getIdealLayStake(204.89, 81.923, 144.5, 34.2, false, false);
    expect(layStake).to.be.closeTo(116.44, 0.01);
  });

  it("should return 9.00 for a free bet SNR (stake not returned) with S=10, B=10, L=10, commission=0", () => {
    const layStake = getIdealLayStake(10, 10, 10, 0, true, false);
    expect(layStake).to.be.closeTo(9.00, 0.001);
  });

  it("should return 10.00 for a free bet SR (stake returned) with S=10, B=10, L=10, commission=0", () => {
    const layStake = getIdealLayStake(10, 10, 10, 0, true, true);
    expect(layStake).to.be.closeTo(10.00, 0.001);
  });

  it("should return ~9.02 for a free bet SNR with S=10, B=10, L=10, commission=2", () => {
    const layStake = getIdealLayStake(10, 10, 10, 2, true, false);
    expect(layStake).to.be.closeTo(9.02, 0.01);
  });

  it("should return 11.09 for a free bet SNR with S=14, B=14.83, L=17.5, commission=5", () => {
    const layStake = getIdealLayStake(14, 14.83, 17.5, 5, true, false);
    expect(layStake).to.be.closeTo(11.1, 0.01);
  });
  it("should return 115.01 for a FB SNR bet with 204.89, 81.923, 144.5, 34.2", () => {
    const layStake = getIdealLayStake(204.89, 81.923, 144.5, 34.2, true, false);
    expect(layStake).to.be.closeTo(115.01, 0.01);
  });
  it("should return ~10.02 for a free bet SR with S=10, B=10, L=10, commission=2", () => {
    const layStake = getIdealLayStake(10, 10, 10, 2, true, true);
    expect(layStake).to.be.closeTo(10.02, 0.01);
  });
});
