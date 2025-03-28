import React from "react";
import pageConfig from "../../config/pageConfig.js";

const groupedCategories = Object.values(pageConfig).reduce((acc, page) => {
  if (page.sidebar) {
    const { category, icon, label, sub } = page.sidebar;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({
      icon,
      label,
      sub,
      link: page.route,
    });
  }
  return acc;
}, {});

export const sidebarCategories = Object.entries(groupedCategories).map(
  ([title, items]) => ({
    title,
    items,
  })
);
