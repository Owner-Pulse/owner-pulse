import React from "react";
import { ACCENTS, STATUS } from "@/lib/theme-tokens";

// Coloured strip along the top of a dashboard card. The card needs `relative`; the strip is
// absolutely positioned, so it does not change the card's layout.
const CardAccent = ({ group }) => {
  if (group === "none") {
    return <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${STATUS.none.dot}`} />;
  }
  const accent = ACCENTS[group];
  if (!accent) return null;
  return <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${accent.bar}`} />;
};

export default CardAccent;
