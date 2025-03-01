// Example icons from lucide-react
import { Scale, Zap, Rocket, Percent, Calculator, Repeat, Star, AlertTriangle } from "lucide-react";

export const sidebarCategories = [
    {
        title: "Lay Calculators",
        items: [
            {
                icon: <Scale size={24} color="#fff" />,
                label: "Lay Stake",
                sub: "",
                link: "/lay-stake-calculator"
            },
            {
                icon: <Zap size={24} color="#fff" />,
                label: "Lay Stake",
                sub: "With Boost",
                link: "/boost-calculator-advanced"
            },
            {
                icon: <Star size={24} color="#fff" />,
                label: "Risk-Free Bet",
                sub: "",
                link: "/risk-free-calculator"
            }
            // Add more if desired...
        ]
    },
    {
      title: "Advantage",
      items: [
        {
          icon: <Rocket size={24} color="#fff" />,
          label: "Odds Boost",
          sub: "Simple",
          link: "/boost-calculator"
        },
        {
            icon: <AlertTriangle size={24} color="#fff" />,
            label: "AP",
            sub: "Risk-Free",
            link: "/risk-free-ebo"
          }
      ]
    },
    {
        title: "Converters",
        items: [
            {
                icon: <Repeat size={24} color="#fff" />,
                label: "Odds Converter",
                sub: "",
                link: "/odds-converter"
            },
            {
                icon: <Repeat size={24} color="#fff" />,
                label: "Fractional",
                sub: "to Decimal",
                link: "/fractional-to-decimal"
            },
            {
                icon: <Repeat size={24} color="#fff" />,
                label: "Decimal",
                sub: "to Fractional",
                link: "/decimal-to-fractional"
            }
        ]
    }
];
