import pageConfig from "./pageConfig.js";

const seoConfig = Object.keys(pageConfig).reduce((acc, key) => {
  const page = pageConfig[key];
  if (page.seo) {
    acc[key] = page.seo;
  }
  return acc;
}, {});

seoConfig["*"] = {
  title: "Lay Stake Calculator | Matched Betting Calculators",
  description:
    "Find the optimum lay stake and potential profit for your matched bets. Free online matched betting calculators for locking in profit.",
};

export default seoConfig;
