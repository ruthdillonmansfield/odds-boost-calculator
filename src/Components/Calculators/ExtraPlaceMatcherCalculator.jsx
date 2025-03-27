import { useState, useEffect } from "react";
import "./calculators.css";
import Seo from "../Seo.jsx";
import seoConfig from "../../config/seoConfig.js";

const calcOutcomeIfBookieWins = (S, B, L, commission) => {
  const commissionValue = commission / 100;
  const layStake = ((S * B) / (L - commissionValue)).toFixed(2);
  const outcome = S * (B - 1) - layStake * (L - 1);
  return parseFloat(outcome.toFixed(2));
};

const calcOutcomeIfExchangeWins = (S, B, L, commission) => {
  const commissionValue = commission / 100;
  const layStake = parseFloat((S * B) / (L - commissionValue)).toFixed(2);
  const outcome = layStake * (1 - commissionValue) - S;
  return parseFloat(outcome.toFixed(2));
};

const ExtraPlaceMatcherCalculator = () => {
  const meta = seoConfig["ExtraPlaceMatcherCalculator"] || {};

  const [stake, setStake] = useState(20);
  const [backOdds, setBackOdds] = useState();
  const [placeTerm, setPlaceTerm] = useState(5);

  const [standardPlaces, setStandardPlaces] = useState(5);
  const [extraPlaces, setExtraPlaces] = useState(1);
  const [runners, setRunners] = useState("");

  const [winLayOdds, setWinLayOdds] = useState("");
  const [winLayCommission, setWinLayCommission] = useState(0);
  const [placeLayOdds, setPlaceLayOdds] = useState("");
  const [placeLayCommission, setPlaceLayCommission] = useState(0);

  const [Lwin, setLwin] = useState(0);
  const [Lplace, setLplace] = useState(0);

  const [resultWin, setResultWin] = useState(null);
  const [resultPlace, setResultPlace] = useState(null);
  const [resultLose, setResultLose] = useState(null);
  const [resultExtra, setResultExtra] = useState(null);

  const [riskRewardDisplay, setRiskRewardDisplay] = useState(null);
  const [impliedOdds, setImpliedOdds] = useState(null);
  const [chanceExtra, setChanceExtra] = useState(null);
  const [evMoney, setEvMoney] = useState(null);
  const [evPercentage, setEvPercentage] = useState(null);

  useEffect(() => {
    const st = parseFloat(stake) || 0;
    const bo = parseFloat(backOdds) || 0;
    const pt = parseFloat(placeTerm) || 1;
    const wLO = parseFloat(winLayOdds) || 0;
    const pLO = parseFloat(placeLayOdds) || 0;
    const run = parseFloat(runners) || 0;
    const extra = parseFloat(extraPlaces) || 0;

    if (st <= 0 || bo <= 1 || wLO <= 1 || pLO <= 1 || pt < 1 || run <= 0) {
      setResultWin(null);
      setResultPlace(null);
      setResultLose(null);
      setResultExtra(null);
      setRiskRewardDisplay(null);
      setChanceExtra(null);
      setEvMoney(null);
      setEvPercentage(null);
      setLwin(0);
      setLplace(0);
      return;
    }

    const S_win = st / 2;
    const S_place = st / 2;

    const B_win = bo;
    const L_win = wLO;
    const comm_win = winLayCommission;

    const B_place = ((bo - 1) / pt) + 1;
    const L_place = pLO;
    const comm_place = placeLayCommission;

    const lossIfBookieWinsWinPart = calcOutcomeIfBookieWins(S_win, B_win, L_win, comm_win);
    const lossIfExchangeWinsWinPart = calcOutcomeIfExchangeWins(S_win, B_win, L_win, comm_win);
    const lossIfBookieWinsPlacePart = calcOutcomeIfBookieWins(S_place, B_place, L_place, comm_place);
    const lossIfExchangeWinsPlacePart = calcOutcomeIfExchangeWins(S_place, B_place, L_place, comm_place);

    const netIfWon = lossIfBookieWinsWinPart + lossIfBookieWinsPlacePart;
    const netIfPlaced = lossIfExchangeWinsWinPart + lossIfBookieWinsPlacePart;
    const netIfLost = lossIfExchangeWinsWinPart + lossIfExchangeWinsPlacePart;

    // Calculate commission-adjusted lay stakes
    const commWinDec = winLayCommission / 100;
    const commPlaceDec = placeLayCommission / 100;
    const computedLwin = parseFloat(((S_win * B_win) / (winLayOdds - commWinDec)).toFixed(2));
    const computedLplace = parseFloat(((S_place * B_place) / (placeLayOdds - commPlaceDec)).toFixed(2));
    setLwin(computedLwin);
    setLplace(computedLplace);

    // Extra place outcome: exchange returns plus back winnings, minus the win stake
    const extraOutcome = (computedLwin * (1 - commWinDec) + computedLplace * (1 - commPlaceDec))
                         - S_win + (S_place * (B_place - 1));
    const netIfExtra = parseFloat(extraOutcome.toFixed(2));

    setResultWin(netIfWon);
    setResultPlace(netIfPlaced);
    setResultLose(netIfLost);
    setResultExtra(netIfExtra);

    const potentialLoss = Math.min(netIfWon, netIfPlaced, netIfLost);
    const potentialWin = netIfExtra;
    const rrRatio = potentialLoss < 0 ? (potentialWin / -potentialLoss) : 0;
    setImpliedOdds((rrRatio + 1).toFixed(2));
    setRiskRewardDisplay(rrRatio ? `1:${parseFloat(rrRatio.toFixed(2))}` : "N/A");

    const pExtra = extra / run;
    const chancePercent = pExtra * 100;
    const chanceRatio = pExtra > 0 ? `${parseFloat((1 / pExtra - 1))}:1` : "N/A";
    setChanceExtra(`${chanceRatio} (${chancePercent.toFixed(0)}%)`);

    const qualLoss = Math.abs(netIfLost);
    const EV = pExtra * netIfExtra - qualLoss;
    setEvMoney(EV);
    setEvPercentage((EV / st) * 100);
  }, [stake, backOdds, placeTerm, winLayOdds, placeLayOdds, runners, extraPlaces, winLayCommission, placeLayCommission]);

  const formatResult = (amount) => {
    if (amount == null) return "";
    return amount < 0 ? `£-${Math.abs(amount).toFixed(2)}` : `£${amount.toFixed(2)}`;
  };

  const formatLayStake = (value) => `£${parseFloat(value).toFixed(2)}`;

  const formatEV = (money, perc) => {
    if (money == null || perc == null) return "";
    const moneyStr = money < 0 ? `–£${Math.abs(money).toFixed(2)}` : `£${money.toFixed(2)}`;
    const percStr = perc < 0 ? `–${Math.abs(perc).toFixed(2)}%` : `${perc.toFixed(2)}%`;
    return `${moneyStr} (${percStr})`;
  };

  return (
    <>
      <Seo title={meta.title} description={meta.description} />
      <div className="container">
        <h2 className="title with-subhead">Extra Place Analyser</h2>
        <h4 className="subhead">
          Assess risk vs reward on extra places events.
        </h4>

        <div className="inline-fields">
          <div className="input-group-inline">
            <label>Total Stake:</label>
            <div className="input-prefix-suffix prefix-suffix">
              <span className="prefix">£</span>
              <input type="number" step="0.01" value={stake} onChange={(e) => setStake(e.target.value)} />
              <span className="suffix lg">£{(parseFloat(stake) / 2 || 0).toFixed(2)} EW</span>
            </div>
          </div>
          <div className="input-group-inline">
            <label>
              Place Terms:
              <span className="info-icon">
                i
                <span className="tooltip-text">
                  The odds you get for the place part of your bet – e.g. 1/5 of the win price.
                </span>
              </span>
            </label>
            <div className="input-prefix-suffix prefix-suffix">
              <span className="prefix">1 /</span>
              <input type="number" step="1" min="1" value={placeTerm} onChange={(e) => setPlaceTerm(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="inline-fields">
          <div className="input-group-inline">
            <label>Back Odds:</label>
            <input type="number" step="0.01" value={backOdds} onChange={(e) => setBackOdds(e.target.value)} />
          </div>
          <div className="input-group-inline">
            <label>Field Size:</label>
            <input type="number" value={runners} onChange={(e) => setRunners(e.target.value)} />
          </div>
        </div>

        <div className="inline-fields">
          <div className="input-group-inline">
            <label>
              Standard Places:
              <span className="info-icon">
                i
                <span className="tooltip-text">
                  How many standard places are paid for this event?
                </span>
              </span>
            </label>
            <input type="number" value={standardPlaces} onChange={(e) => setStandardPlaces(e.target.value)} />
          </div>
          <div className="input-group-inline">
            <label>
              Extra Places:
              <span className="info-icon">
                i
                <span className="tooltip-text">
                  How many extra places are paid for this event?
                </span>
              </span>
            </label>
            <input type="number" value={extraPlaces} onChange={(e) => setExtraPlaces(e.target.value)} />
          </div>
        </div>

        <h3>Lay the Win</h3>
        <div className="inline-fields">
          <div className="input-group-inline">
            <label>Win Lay Odds:</label>
            <input type="number" step="0.01" value={winLayOdds} onChange={(e) => setWinLayOdds(e.target.value)} />
          </div>
          <div className="input-group-inline">
            <label>Win Lay Commission</label>
            <div className="input-prefix-suffix only-suffix">
              <input type="number" step="0.1" value={winLayCommission} onChange={(e) => setWinLayCommission(e.target.value)} />
              <span className="suffix">%</span>
            </div>
          </div>
        </div>
        {Lwin > 0 && parseFloat(winLayOdds) > 1 && (
          <div className="instructions-box">
            <p style={{ margin: 0 }}>
              <strong>Lay</strong>{" "}
              <span style={{ color: "#00aaff", fontWeight: "bold" }}>
                {formatLayStake(Lwin)}
              </span>{" "}
              at odds <span style={{ color: "#00aaff", fontWeight: "bold" }}>{winLayOdds}</span>
            </p>
          </div>
        )}

        <h3>Lay the Place</h3>
        <div className="inline-fields">
          <div className="input-group-inline">
            <label>Place Lay Odds:</label>
            <input type="number" step="0.01" value={placeLayOdds} onChange={(e) => setPlaceLayOdds(e.target.value)} />
          </div>
          <div className="input-group-inline">
            <label>Place Lay Commission</label>
            <div className="input-prefix-suffix only-suffix">
              <input type="number" step="0.1" value={placeLayCommission} onChange={(e) => setPlaceLayCommission(e.target.value)} />
              <span className="suffix">%</span>
            </div>
          </div>
        </div>
        {Lplace > 0 && parseFloat(placeLayOdds) > 1 && (
          <div className="instructions-box">
            <p style={{ margin: 0 }}>
              <strong>Lay</strong>{" "}
              <span style={{ color: "#00aaff", fontWeight: "bold" }}>
                {formatLayStake(Lplace)}
              </span>{" "}
              at odds <span style={{ color: "#00aaff", fontWeight: "bold" }}>
               {placeLayOdds}
              </span>
            </p>
          </div>
        )}

        <div className="divider" />

        {resultWin === null ? "" : (
          <>
            <div className="result-box" style={{ textAlign: "left" }}>
                <h3 style={{ marginTop: 0, marginBottom: "12px" }}>Outcomes</h3>
                <div className="outcome-line">
                    <span className="outcome-label">Selection wins:</span>
                    <span className={`outcome-value ${resultWin < 0 ? "negative" : "positive"}`}>
                    {formatResult(resultWin)}
                    </span>
                </div>
                <div className="outcome-line">
                    <span className="outcome-label">Selection places:</span>
                    <span className={`outcome-value ${resultPlace < 0 ? "negative" : "positive"}`}>
                    {formatResult(resultPlace)}
                    </span>
                </div>
                <div className="outcome-line">
                    <span className="outcome-label">Selection loses:</span>
                    <span className={`outcome-value ${resultLose < 0 ? "negative" : "positive"}`}>
                    {formatResult(resultLose)}
                    </span>
                </div>
                <div className="outcome-line">
                    <span className="outcome-label outcome-primary">Extra place:</span>
                    <span className={`outcome-value ${resultExtra < 0 ? "negative" : "positive"}`}>
                    {formatResult(resultExtra)}
                    </span>
                </div>
                </div>


            <div className="result-box" style={{ textAlign: "left", marginTop: "16px" }}>
              <h3 style={{ marginTop: 0, marginBottom: "12px" }}>Detailed Stats</h3>
              <div className="outcome-line">
                <span className="outcome-label">Risk : Reward Ratio:</span>
                <span className="outcome-value">{riskRewardDisplay}</span>
              </div>
              <div className="outcome-line">
                <span className="outcome-label"><em>Or: Implied Odds:</em></span>
                <span className="outcome-value">{parseFloat(impliedOdds)}</span>
              </div>
              <div className="outcome-line">
                <span className="outcome-label">Chance of Extra Place:</span>
                <span className="outcome-value">{chanceExtra}</span>
              </div>
              <div className="outcome-line">
                <span className="outcome-label">Expected Value:</span>
                <span className={`outcome-value ${evMoney < 0 ? "negative" : "positive"}`}>
                    {formatEV(evMoney, evPercentage)}</span>
              </div>
              <div className="outcome-line">
                <span className="outcome-label">Profitability:</span>
                <span className="outcome-value" style={{ color: evMoney > 0 ? "#00ff00" : "#ff5555" }}>
                  {evMoney > 0 ? "✓ Theoretically Profitable" : "✕ Not Profitable"}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ExtraPlaceMatcherCalculator;
