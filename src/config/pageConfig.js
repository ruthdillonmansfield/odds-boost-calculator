// pageConfig.js
import React from "react";
import {
  Scale,
  Zap,
  Rocket,
  ChevronsUp,
  Calculator,
  Repeat,
  Star,
  AlertTriangle,
  ZoomIn,
  Combine,
  Plus,
  TrendingUp,
  Ban
} from "lucide-react";

import OddsBoostCalculator from "../Components/Calculators/OddsBoostCalculator.jsx";
import FractionalToDecimalConverter from "../Components/Calculators/FractionalToDecimalConverter.jsx";
import DecimalToFractionalConverter from "../Components/Calculators/DecimalToFractionalConverter.jsx";
import OddsConverter from "../Components/Calculators/OddsConverter.jsx";
import RiskFreeEBOCalculator from "../Components/Calculators/RiskFreeEBOCalculator.jsx";
import PartialLayCalculator from "../Components/Calculators/PartialLayCalculator.jsx";
import EnhancedOddsCalculator from "../Components/Calculators/EnhancedOddsCalculator.jsx";
import AccaPickerCalculator from "../Components/Calculators/AccaPickerCalculator.jsx";
import MatchPickerCalculator from "../Components/Calculators/MatchPickerCalculator.jsx";
import ExtraPlaceMatcherCalculator from "../Components/Calculators/ExtraPlaceMatcherCalculator.jsx";
import OddsBoostCalculatorAdv from "../Components/Calculators/OddsBoostCalculatorAdv.jsx";
import LayStakeCalculator from "../Components/Calculators/LayStakeCalculator.jsx";
import RiskFreeCalculator from "../Components/Calculators/RiskFreeCalculator.jsx";
import UnwantedLayCalculator from "../Components/Calculators/UnwantedLayCalculator.jsx";
import ArbCalculator from "../Components/Calculators/ArbCalculator.jsx";


const createInstructions = (jsx) => jsx;

const pageConfig = {
  layStakeCalculator: {
    route: "/lay-stake-calculator",
    component: LayStakeCalculator,
    seo: {
      title: "Lay Stake Calculator | Matched Betting Calculators",
      description:
        "Find the optimum lay stake and potential profit for your matched bets. Free online matched betting calculators for locking in profit.",
    },
    use: {
      title: "Lay Calculator",
      matched: true,
      advantage: false,
      experimental: false,
      copyable: true,
    },
    sidebar: {
      category: "Lay Calculators",
      icon: <Scale size={24} color="#fff" />,
      label: "Lay Stake",
      sub: "",
    },
    instructions: createInstructions(
      <div>
        <p>Find the optimum lay stake and profit from your matched bets.</p>
      </div>
    ),
  },

  advancedOddsBoostCalculator: {
    route: "/boost-calculator-advanced",
    component: OddsBoostCalculatorAdv,
    seo: {
      title:
        "Lay Stake Calculator - Boosted Odds | Matched Betting Calculators",
      description:
        "Calculate optimum lay stakes and expected profit from boosted odds. Free online matched betting calculators for locking in profit.",
    },
    use: {
      title: "Boosted Lay Calculator",
      matched: true,
      advantage: false,
      experimental: false,
      copyable: true,
    },
    sidebar: {
      category: "Lay Calculators",
      icon: <Zap size={24} color="#fff" />,
      label: "Lay Stake",
      sub: "With Boost",
    },
    instructions: createInstructions(
      <div>
        <p>Get your optimum lay stake and expected profit from boosted odds bets.</p>
      </div>
    ),
  },

  riskFreeBetCalculator: {
    route: "/risk-free-calculator",
    component: RiskFreeCalculator,
    seo: {
      title: "Risk-Free Bet Calculator | Matched Betting Calculators",
      description:
        "Calculate your lay stake and potential profit from risk-free bet offers. Free online matched betting calculators for locking in profit.",
    },
    use: {
      title: "Risk-Free Bet Calculator",
      matched: true,
      advantage: false,
      experimental: false,
      copyable: true,
    },
    sidebar: {
      category: "Lay Calculators",
      icon: <Star size={24} color="#fff" />,
      label: "Risk-Free Bet",
      sub: "",
    },
    instructions: createInstructions(
      <div>
        <p>
          Calculate your lay stake and potential profit from risk-free bet offers.
        </p>
        <p>
          Free bet retention is how much of that bet you can lock in if it loses.
        </p>
      </div>
    ),
  },

  partialLayCalculator: {
    route: "/partial-lay",
    component: PartialLayCalculator,
    seo: {
      title: "Partial Lay Calculator | Matched Betting Calculators",
      description:
        "Determine the optimal additional lay stake when liquidity is limited. Free online matched betting calculators for locking in profit.",
    },
    use: {
      title: "Partial Lay Calculator",
      matched: true,
      advantage: false,
      experimental: true,
      copyable: true,
    },
    sidebar: {
      category: "Lay Calculators",
      icon: <Calculator size={24} color="#fff" />,
      label: "Partial Lay",
      sub: "",
    },
    instructions: createInstructions(
      <div>
        <p>
          Sometimes we need to lay our back bets at multiple odds, because there's limited lay liquidity.
        </p>
        <p>
          This calculator helps you work out how much more to lay at the available odds.
        </p>
      </div>
    ),
  },

  arbCalculator: {
    route: "/arb-calculator",
    component: ArbCalculator,
    seo: {
      title: "Arb Calculator | Matched Betting Calculators",
      description:
        "Calculate arbitrage opportunities and find guaranteed profit scenarios in matched betting. Free online matched betting calculators.",
    },
    use: {
      title: "Arb Calculator",
      matched: true,
      advantage: false,
      experimental: false,
      copyable: true,
    },
    sidebar: {
      category: "Lay Calculators",
      icon: <TrendingUp size={24} color="#fff" />,
      label: "Arbitrage",
      sub: "",
    },
    instructions: createInstructions(
      <div>
        <p>
          Use the Arb Calculator to compute arbitrage opportunities and secure risk-free profits from your matched bets.
        </p>
      </div>
    ),
  },

  matchPickerCalculator: {
    route: "/match-picker",
    component: MatchPickerCalculator,
    seo: {
      title: "Match Picker | Matched Betting Calculators",
      description:
        "Compare lay options quickly when you don't have a matcher available. Free online matched betting calculators for locking in profit.",
    },
    use: {
      title: "Match Picker",
      matched: true,
      advantage: false,
      experimental: false,
      copyable: true,
    },
    sidebar: {
      category: "Lay Calculators",
      icon: <ZoomIn size={24} color="#fff" />,
      label: "Match Picker",
      sub: "",
    },
    instructions: createInstructions(
      <div>
        <p>
          Compare lay options quickly when you don't have a matcher available. The picker will highlight the best match available.
        </p>
      </div>
    ),
  },

  accaPickerCalculator: {
    route: "/acca-picker",
    component: AccaPickerCalculator,
    seo: {
      title: "Acca Picker | Matched Betting Calculators",
      description:
        "Compare acca options quickly when you don't have a matcher available. Free online matched betting calculators for locking in profit.",
    },
    use: {
      title: "Acca Picker",
      matched: true,
      advantage: false,
      experimental: false,
      copyable: true,
    },
    sidebar: {
      category: "Lay Calculators",
      icon: <Combine size={24} color="#fff" />,
      label: "Acca Picker",
      sub: "",
    },
    instructions: createInstructions(
      <div>
        <p>
          Find the best combination for matched betting accas quickly. The picker will highlight the best combo available that meets the minimum odds requirements.
        </p>
        <p>
          Add single outcomes (ideal for golf or horses), 2-way events (like tennis), or 3-way events (such as football).
        </p>
        <p>
          The picker will only select <strong>one outcome per event</strong> so you can find valid accas.
        </p>
      </div>
    ),
  },

  oddsBoostCalculator: {
    route: "/boost-calculator",
    component: OddsBoostCalculator,
    seo: {
      title: "Odds Boost Calculator | Matched Betting Calculators",
      description:
        "Easily calculate boosted odds by entering decimal odds and a boost percentage. For profit boost and odds boost offers.",
    },
    use: {
      title: "Odds Boost Calculator",
      matched: true,
      advantage: false,
      experimental: false,
      copyable: true,
    },
    sidebar: {
      category: "Advantage",
      icon: <Rocket size={24} color="#fff" />,
      label: "Odds Boost",
      sub: "Simple",
    },
    instructions: createInstructions(
      <div>
        <p>
          Enter decimal odds and a boost percentage to see the improved odds instantly.
        </p>
      </div>
    ),
  },

  riskFreeEBOCalculator: {
    route: "/risk-free-ebo",
    component: RiskFreeEBOCalculator,
    seo: {
      title: "Risk-Free EBO Calculator | Matched Betting Calculators",
      description:
        "Assess risk-free bets with Equivalent Boosted Odds with this Risk-Free Bet Calculator. Accurately assess potential profit and loss to make informed matched betting decisions.",
    },
    use: {
      title: "Risk-Free Advantage Play Calculator and Equivalent Boosted Odds",
      matched: false,
      advantage: true,
      experimental: true,
      copyable: false,
    },
    sidebar: {
      category: "Advantage",
      icon: <AlertTriangle size={24} color="#fff" />,
      label: "AP",
      sub: "Risk-Free",
    },
    instructions: createInstructions(
      <div>
        <p>
          Equivalent Boosted Odds (EBO) reframes risk‐free bet offers as value bets by converting the risk-free aspect of the bet into an odds boost.
        </p>
        <p>
          In other words, treating a risk-free bet offer as Advantage Play is equivalent to punting a bet at greatly improved odds.
        </p>
        <p>
          Use this calculator to decide whether to AP, lay it if possible, or skip.
        </p>
        <p>
          Use sharp odds or a conservative guess for your true odds.
        </p>
        <p>
          <strong>
            Despite the name "risk-free bet" that bookies use, these offers are not entirely risk-free!
          </strong>{" "}
          Unless your stake is returned as cash, if your first bet loses, your stake is not usually returned in any winnings from the free bet.
        </p>
      </div>
    ),
  },

  enhancedOddsCalculator: {
    route: "/enhanced-odds",
    component: EnhancedOddsCalculator,
    seo: {
      title: "Enhanced Odds Calculator | Matched Betting Calculators",
      description:
        "Use this calculator to work out the original odds when bookies offer enhanced winnings. Free online matched betting calculators for locking in profit.",
    },
    use: {
      title: "Enhanced Odds Calculator",
      matched: true,
      advantage: false,
      experimental: false,
      copyable: true,
    },
    sidebar: {
      category: "Advantage",
      icon: <ChevronsUp size={24} color="#fff" />,
      label: "Enhanced Odds",
      sub: "",
    },
    instructions: createInstructions(
      <div>
        <p>
          When bookies offer enhanced winnings, sometimes they don't tell you the new odds.
        </p>
        <p>
          Use this calculator to work out the original odds.
        </p>
      </div>
    ),
  },

  extraPlaceMatcherCalculator: {
    route: "/extra-place",
    component: ExtraPlaceMatcherCalculator,
    seo: {
      title: "Extra Place Calculator | Matched Betting Calculators",
      description:
        "Assess potential profitability of matched betting on extra place offers. Free online matched betting calculators for locking in profit.",
    },
    use: {
      title: "Extra Place Analyser",
      matched: false,
      advantage: true,
      experimental: true,
      copyable: false,
    },
    sidebar: {
      category: "Advantage",
      icon: <Plus size={24} color="#fff" />,
      label: "Extra Place",
      sub: "Analyser",
    },
    instructions: createInstructions(
      <div>
        <p>
          Assess the risk vs. reward and theoretical profitability of extra place matched betting.
        </p>
        <p>
          When we matched bet extra place offers, we accept a small potential loss on our lay bet for the chance to make a profit if our selection lands in an extra place.
        </p>
        <p>
          Use this calculator to assess potential profitability by weighing that small loss against the profit opportunity.
        </p>
      </div>
    ),
  },

  oddsConverter: {
    route: "/odds-converter",
    component: OddsConverter,
    seo: {
      title: "Odds Converter | Matched Betting Calculators",
      description:
        "Easily convert between decimal, fractional, and American odds. Free online matched betting calculators for locking in profit.",
    },
    use: {
      title: "Odds Converter",
      matched: true,
      advantage: false,
      experimental: false,
      copyable: true,
    },
    sidebar: {
      category: "Converters",
      icon: <Repeat size={24} color="#fff" />,
      label: "Odds Converter",
      sub: "",
    },
    instructions: createInstructions(
      <div>
        <p>
          Convert instantly between decimal, fractional and American odds.
        </p>
      </div>
    ),
  },

  fractionalToDecimalConverter: {
    route: "/fractional-to-decimal",
    component: FractionalToDecimalConverter,
    seo: {
      title:
        "Fractional to Decimal Converter | Matched Betting Calculators",
      description:
        "Quickly convert fractional odds into decimal odds. Free online matched betting calculators for locking in profit.",
    },
    use: {
      title: "Fractional to Decimal Converter",
      matched: true,
      advantage: false,
      experimental: false,
      copyable: true,
    },
    sidebar: {
      category: "Converters",
      icon: <Repeat size={24} color="#fff" />,
      label: "Fractional",
      sub: "to Decimal",
    },
    instructions: createInstructions(
      <div>
        <p>
          Enter fractional odds (e.g. 5/2) to instantly see their decimal form.
        </p>
      </div>
    ),
  },

  decimalToFractionConverter: {
    route: "/decimal-to-fractional",
    component: DecimalToFractionalConverter,
    seo: {
      title:
        "Decimal to Fractional Converter | Matched Betting Calculators",
      description:
        "Instantly convert decimal odds into fractional odds. Free online matched betting calculators for locking in profit.",
    },
    use: {
      title: "Decimal to Fractional Converter",
      matched: true,
      advantage: false,
      experimental: false,
      copyable: true,
    },
    sidebar: {
      category: "Converters",
      icon: <Repeat size={24} color="#fff" />,
      label: "Decimal",
      sub: "to Fractional",
    },
    instructions: createInstructions(
      <div>
        <p>
          Enter decimal odds (e.g. 3.5) to instantly see their fractional form.
        </p>
      </div>
    ),
  },

  defaultPage: {
    route: "*",
    component: LayStakeCalculator,
    seo: {
      title: "Lay Stake Calculator | Matched Betting Calculators",
      description:
        "Find the optimum lay stake and potential profit for your matched bets. Free online matched betting calculators for locking in profit.",
    },
    use: {
      title: "Lay Calculator",
      matched: true,
      advantage: false,
      experimental: false,
      copyable: true,
    },
    sidebar: {
      category: "Lay Calculators",
      icon: <Scale size={24} color="#fff" />,
      label: "Lay Stake",
      sub: "",
    },
    instructions: createInstructions(
      <div>
        <p>Find the optimum lay stake and profit from your matched bets.</p>
      </div>
    ),
  },

  unwantedLayCalculator: {
    route: "/unwanted-lay-calculator",
    component: UnwantedLayCalculator,
    seo: {
      title: "Unwanted Lay Calculator | Matched Betting Calculators",
      description:
        "Calculate the required back stake to adjust your unwanted lay bet and minimize your losses. Free online matched betting calculator.",
    },
    use: {
      title: "Unwanted Lay Calculator",
      matched: true,
      advantage: false,
      experimental: false,
      copyable: true,
    },
    sidebar: {
      category: "Lay Calculators",
      icon: <Ban size={24} color="#fff" />,
      label: "Unwanted Lay",
      sub: "",
    },
    instructions: createInstructions(
      <div>
        <p>
          Use this calculator to determine the back stake required to adjust your unwanted lay bet.
        </p>
        <p>
          You can either enter the unwanted lay amount directly or calculate it from your total lay bet and intended lay bet.
        </p>
      </div>
    ),
  },
};



export default pageConfig;
