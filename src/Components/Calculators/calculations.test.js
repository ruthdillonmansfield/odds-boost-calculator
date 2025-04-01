import { expect } from "chai";
import { 
    computeBackMatched, 
    calculateAdditionalLayNew, 
    calculateGroupProfit,
    calculateOverallProfit,
    calcMinProfit,
    getIdealLayStake,
    calcRiskFreeProfit,
    calcUnwantedLayAdjustment
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
      potExchangeLoss: -514.12,
      profitIfBookieWins: -25.32,
      profitIfExchangeWins: -25.31,
      minProfit: -25.32
    };

    const result = calcMinProfit(S, B, L, commission, freeBet, stakeReturned);
    console.log(expected,result);
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
      potExchangeLoss: -514.12,
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

describe("calcRiskFreeProfit", () => {
  it("should return 7.2 profit for a risk-free bet with S=10, B=10, L=10, commission=0, freeBetAmount=10, retention=80", () => {
    // commissionValue = 0, retentionRate = 0.8
    // rawLayStake = (10*10 - 0.8*10) / (10 - 0) = (100 - 8)/10 = 92/10 = 9.2
    // backProfit = 10 * (10-1) = 90
    // layLoss = 9.2 * (10-1) = 82.8
    // profitIfBookieWins = 90 - 82.8 = 7.2
    // exchangeWin = 9.2 * 1 = 9.2
    // freeBetRefund = 0.8 * 10 = 8
    // profitIfExchangeWins = 9.2 - 10 + 8 = 7.2
    // minProfit = 7.2
    const profit = calcRiskFreeProfit(10, 10, 10, 0, 10, 80);
    expect(profit.layStake).to.be.closeTo(9.2, 0.01);
    expect(profit.potBookieWinnings).to.be.closeTo(90, 0.01);
    expect(profit.potBookieLoss).to.be.closeTo(10, 0.01);
    expect(profit.potExchangeWinnings).to.be.closeTo(9.2, 0.01);
    expect(profit.potExchangeLoss).to.be.closeTo(82.8, 0.01);
    expect(profit.freeBetRefund).to.be.closeTo(8, 0.01);
    expect(profit.profitIfBookieWins).to.be.closeTo(7.2, 0.01);
    expect(profit.profitIfExchangeWins).to.be.closeTo(7.2, 0.01);
    expect(profit.minProfit).to.be.closeTo(7.2, 0.01);
  });

  it("should return ~7.02 profit for a risk-free bet with S=10, B=10, L=10, commission=2, freeBetAmount=10, retention=80", () => {
    // commissionValue = 0.02, retentionRate = 0.8
    // rawLayStake = (10*10 - 0.8*10) / (10 - 0.02) = 92 / 9.98 ≈ 9.22
    // backProfit = 90
    // layLoss = 9.22 * 9 = 82.98
    // profitIfBookieWins ≈ 90 - 82.98 = 7.02
    // exchangeWin = 9.22 * 0.98 ≈ 9.04
    // profitIfExchangeWins = 9.04 - 10 + 8 = 7.04
    // minProfit = ~7.02
    const profit = calcRiskFreeProfit(10, 10, 10, 2, 10, 80);
    expect(profit.layStake).to.be.closeTo(9.22, 0.01);
    expect(profit.potBookieWinnings).to.be.closeTo(90, 0.01);
    expect(profit.potBookieLoss).to.be.closeTo(10, 0.01);
    expect(profit.potExchangeWinnings).to.be.closeTo(9.04, 0.01);
    expect(profit.potExchangeLoss).to.be.closeTo(82.98, 0.01);
    expect(profit.freeBetRefund).to.be.closeTo(8, 0.01);
    expect(profit.profitIfBookieWins).to.be.closeTo(7.02, 0.01);
    expect(profit.profitIfExchangeWins).to.be.closeTo(7.04, 0.01);
    expect(profit.minProfit).to.be.closeTo(7.02, 0.01);
  });

  it("should return approximately 37.7 profit for a risk-free bet with larger numbers", () => {
    // Using S=204.89, B=81.923, L=133, commission=34.2, freeBetAmount=204.89, retention=80
    // commissionValue = 34.2/100 = 0.342, retentionRate = 0.8
    // rawLayStake = (204.89*81.923 - 0.8*204.89) / (133 - 0.342)
    // Approximation:
    // 204.89*81.923 ≈ 16796.75, then 16796.75 - 163.912 ≈ 16632.84,
    // denominator = 132.658, so layStake ≈ 125.28
    // backProfit = 204.89*(81.923-1) ≈ 204.89*80.923 ≈ 16570.7
    // layLoss = 125.28*(133-1) = 125.28*132 ≈ 16533.0
    // profitIfBookieWins ≈ 16570.7 - 16533.0 = 37.7
    // exchangeWin = 125.28*(1-0.342) = 125.28*0.658 ≈ 82.43
    // freeBetRefund = 0.8 * 204.89 ≈ 163.912
    // profitIfExchangeWins = 82.43 - 204.89 + 163.912 ≈ 41.45
    // minProfit ≈ 37.7
    const profit = calcRiskFreeProfit(204.89, 81.923, 133, 34.2, 204.89, 80);
    expect(profit.layStake).to.be.closeTo(125.29, 0.5);
    expect(profit.potBookieWinnings).to.be.closeTo(16580.31, 1);
    expect(profit.potBookieLoss).to.be.closeTo(204.89, 0.01);
    expect(profit.potExchangeWinnings).to.be.closeTo(82.44, 0.5);
    expect(profit.potExchangeLoss).to.be.closeTo(16538.31, 1);
    expect(profit.freeBetRefund).to.be.closeTo(163.912, 0.01);
    expect(profit.profitIfBookieWins).to.be.closeTo(42.03, 0.5);
    expect(profit.profitIfExchangeWins).to.be.closeTo(41.46, 0.5);
    expect(profit.minProfit).to.be.closeTo(41.46, 0.5);
  });

  it("should return an object with the correct keys", () => {
    const result = calcRiskFreeProfit(122.2, 5, 6, 2, 122.2, 80);
    expect(result).to.have.property('layStake');
    expect(result).to.have.property('potBookieWinnings');
    expect(result).to.have.property('potBookieLoss');
    expect(result).to.have.property('potExchangeWinnings');
    expect(result).to.have.property('potExchangeLoss');
    expect(result).to.have.property('freeBetRefund');
    expect(result).to.have.property('profitIfBookieWins');
    expect(result).to.have.property('profitIfExchangeWins');
    expect(result).to.have.property('minProfit');
  });

  it("should return the expected outcome for the given risk-free bet input", () => {
    const S = 122.2;
    const B = 5;
    const L = 6.2;
    const commission = 2;
    const freeBetAmount = 122.2;
    const retention = 70;

    // commissionValue = 0.02, retentionRate = 0.8
    // rawLayStake = (122.2*5 - 0.8*122.2) / (6.2 - 0.02)
    //             = (611 - 97.76) / 6.18 ≈ 513.24 / 6.18 ≈ 83.06
    // layStake = 83.06
    // backProfit = 122.2*(5-1)=488.8
    // layLoss = 83.06*(6.2-1)=83.06*5.2 ≈ 431.912
    // profitIfBookieWins = 488.8 - 431.912 ≈ 56.888
    // exchangeWin = 83.06*(1-0.02)=83.06*0.98 ≈ 81.3988
    // freeBetRefund = 0.8*122.2 = 97.76
    // profitIfExchangeWins = 81.3988 - 122.2 + 97.76 ≈ 56.9588
    // minProfit ≈ 56.888
    const expected = {
      layStake: 85.03,
      potBookieWinnings: 488.8,
      potBookieLoss: 122.2,
      potExchangeWinnings: 83.33,
      potExchangeLoss: 442.16,
      freeBetRefund: 85.54,
      profitIfBookieWins: 46.64,
      profitIfExchangeWins: 46.67,
      minProfit: 46.64
    };

    const result = calcRiskFreeProfit(S, B, L, commission, freeBetAmount, retention);
    expect(result.layStake).to.be.closeTo(expected.layStake, 0.01);
    expect(result.potBookieWinnings).to.be.closeTo(expected.potBookieWinnings, 0.01);
    expect(result.potBookieLoss).to.be.closeTo(expected.potBookieLoss, 0.01);
    expect(result.potExchangeWinnings).to.be.closeTo(expected.potExchangeWinnings, 0.01);
    expect(result.potExchangeLoss).to.be.closeTo(expected.potExchangeLoss, 0.01);
    expect(result.freeBetRefund).to.be.closeTo(expected.freeBetRefund, 0.01);
    expect(result.profitIfBookieWins).to.be.closeTo(expected.profitIfBookieWins, 0.01);
    expect(result.profitIfExchangeWins).to.be.closeTo(expected.profitIfExchangeWins, 0.01);
    expect(result.minProfit).to.be.closeTo(expected.minProfit, 0.01);
  });
});


describe('calcUnwantedLayAdjustment', () => {
  it('should handle simple cases', () => {
    const result = calcUnwantedLayAdjustment(10,10,11,0,5);
    console.log(result);
    const expected = {
      backStake: 10.95,
      breakdown: {
        backWins: {
          back: 98.55,
          backCommission: 0,
          lay: -100,
          layCommission: 0,
          total: -1.45,
        },
        layWins: {
          back: -10.95,
          backCommission: 0,
          lay: 10,
          layCommission: -0.5,
          total: -1.45,
        },
      },
    };

    expect(result.backStake).to.be.closeTo(expected.backStake, 0.01);
    expect(result.breakdown.backWins.back).to.be.closeTo(expected.breakdown.backWins.back, 0.01);
    expect(result.breakdown.backWins.backCommission).to.be.closeTo(expected.breakdown.backWins.backCommission, 0.01);
    expect(result.breakdown.backWins.lay).to.be.closeTo(expected.breakdown.backWins.lay, 0.01);
    expect(result.breakdown.backWins.total).to.be.closeTo(expected.breakdown.backWins.total, 0.01);
    expect(result.breakdown.layWins.back).to.be.closeTo(expected.breakdown.layWins.back, 0.01);
    expect(result.breakdown.layWins.lay).to.be.closeTo(expected.breakdown.layWins.lay, 0.01);
    expect(result.breakdown.layWins.layCommission).to.be.closeTo(expected.breakdown.layWins.layCommission, 0.01);
    expect(result.breakdown.layWins.total).to.be.closeTo(expected.breakdown.layWins.total, 0.01);
  });
  it('should calculate the correct breakdown for sample inputs with rounding', () => {
    // Sample values:
    // layStake = 100, backOdds = 3, layOdds = 2,
    // backCommission = 1.25%, layCommission = 0%
    // Expected:
    // backStake = 100 * (2 - 0) / 3 = 66.67
    // Back Wins:
    //   Gross profit = 66.67 * (3 - 1) = 133.33
    //   Back commission = 133.33 * 0.0125 = 1.67 (as a cost, shown as -1.67)
    //   Net = 133.33 - 1.67 = 131.66
    //   Lay loss = 100 * (2 - 1) = 100
    //   Total = 131.66 - 100 = 31.66
    // Lay Wins:
    //   Back loss = 66.67
    //   Gross win = 100 * (2 - 1) = 100
    //   Total = 100 - 66.67 = 33.33
    const result = calcUnwantedLayAdjustment(100, 2, 3, 5, 1.25);


    const expected = {
      backStake: 153.21,
      breakdown: {
        backWins: {
          back: 153.21,
          backCommission: -7.66,
          lay: -200,
          layCommission: 0,
          total: -54.46,
        },
        layWins: {
          back: -153.21,
          backCommission: -1.25,
          lay: 100.00,
          layCommission: 0,
          total: -54.46,
        },
      },
    };

    expect(result.backStake).to.be.closeTo(expected.backStake, 0.01);
    expect(result.breakdown.backWins.back).to.be.closeTo(expected.breakdown.backWins.back, 0.01);
    expect(result.breakdown.backWins.backCommission).to.be.closeTo(expected.breakdown.backWins.backCommission, 0.01);
    expect(result.breakdown.backWins.lay).to.be.closeTo(expected.breakdown.backWins.lay, 0.01);
    expect(result.breakdown.backWins.total).to.be.closeTo(expected.breakdown.backWins.total, 0.01);
    expect(result.breakdown.layWins.back).to.be.closeTo(expected.breakdown.layWins.back, 0.01);
    expect(result.breakdown.layWins.lay).to.be.closeTo(expected.breakdown.layWins.lay, 0.01);
    expect(result.breakdown.layWins.total).to.be.closeTo(expected.breakdown.layWins.total, 0.01);
  });

  it('should handle non-zero lay commission on outcomes and account for rounding', () => {
    // Example:
    // layStake = 80, backOdds = 4, layOdds = 3,
    // backCommission = 2%, layCommission = 5%
    // Expected:
    // backStake = 80 * (3 - (5/100)) / 4 = 80 * 2.95 / 4 = 59.00
    // Back Wins:
    //   Gross profit = 59.00 * (4 - 1) = 177.00
    //   Back commission = 177.00 * 0.02 = 3.54 (shown as -3.54)
    //   Net = 177.00 - 3.54 = 173.46
    //   Lay loss = 80 * (3 - 1) = 160.00
    //   Total = 173.46 - 160.00 = 13.46
    // Lay Wins:
    //   Back loss = 59.00
    //   Gross win = 80 * (3 - 1) = 160.00
    //   Lay commission = 160.00 * 0.05 = 8.00 (shown as -8.00)
    //   Net = 160.00 - 8.00 = 152.00
    //   Total = 152.00 - 59.00 = 93.00
    const result = calcUnwantedLayAdjustment(12.34, 22.22, 33.33, 1.23, 2.34);
    const expected = {
      backStake: 18.72,
      breakdown: {
        backWins: {
          back: 397.17,
          backCommission: -4.89,
          lay: -398.95,
          layCommission: 0,
          total: -6.67,
        },
        layWins: {
          back: -18.72,
          backCommission: 0,
          lay: 12.34,
          layCommission: -0.29,
          total: -6.67,
        },
      },
    };

    expect(result.backStake).to.be.closeTo(expected.backStake, 0.01);
    expect(result.breakdown.backWins.back).to.be.closeTo(expected.breakdown.backWins.back, 0.01);
    expect(result.breakdown.backWins.backCommission).to.be.closeTo(expected.breakdown.backWins.backCommission, 0.01);
    expect(result.breakdown.backWins.lay).to.be.closeTo(expected.breakdown.backWins.lay, 0.01);
    expect(result.breakdown.backWins.total).to.be.closeTo(expected.breakdown.backWins.total, 0.01);
    expect(result.breakdown.layWins.back).to.be.closeTo(expected.breakdown.layWins.back, 0.01);
    expect(result.breakdown.layWins.lay).to.be.closeTo(expected.breakdown.layWins.lay, 0.01);
    expect(result.breakdown.layWins.layCommission).to.be.closeTo(expected.breakdown.layWins.layCommission, 0.01);
    expect(result.breakdown.layWins.total).to.be.closeTo(expected.breakdown.layWins.total, 0.01);
  });

  it('should handle zero commission on both sides and round correctly', () => {
    // For:
    // layStake = 100, backOdds = 2.5, layOdds = 2.0, with zero commission:
    // Expected:
    // backStake = 100 * 2.0 / 2.5 = 80.00
    // Back Wins:
    //   Gross profit = 80 * (2.5 - 1) = 120.00
    //   Lay loss = 100 * (2.0 - 1) = 100.00
    //   Total = 120.00 - 100.00 = 20.00
    // Lay Wins:
    //   Back loss = 80.00
    //   Gross win = 100 * (2.0 - 1) = 100.00
    //   Total = 100.00 - 80.00 = 20.00
    const result = calcUnwantedLayAdjustment(100, 2.5, 2.0, 0, 0);
    const expected = {
      backStake: 80.00,
      breakdown: {
        backWins: {
          back: 120.00,
          backCommission: 0,
          lay: -100.00,
          layCommission: 0,
          total: 20.00,
        },
        layWins: {
          back: -80.00,
          backCommission: 0,
          lay: 100.00,
          layCommission: 0,
          total: 20.00,
        },
      },
    };

    expect(result.backStake).to.be.closeTo(expected.backStake, 0.01);
    expect(result.breakdown.backWins.back).to.be.closeTo(expected.breakdown.backWins.back, 0.01);
    expect(result.breakdown.backWins.backCommission).to.be.closeTo(expected.breakdown.backWins.backCommission, 0.01);
    expect(result.breakdown.backWins.lay).to.be.closeTo(expected.breakdown.backWins.lay, 0.01);
    expect(result.breakdown.backWins.total).to.be.closeTo(expected.breakdown.backWins.total, 0.01);
    expect(result.breakdown.layWins.back).to.be.closeTo(expected.breakdown.layWins.back, 0.01);
    expect(result.breakdown.layWins.lay).to.be.closeTo(expected.breakdown.layWins.lay, 0.01);
    expect(result.breakdown.layWins.total).to.be.closeTo(expected.breakdown.layWins.total, 0.01);
  });
});
