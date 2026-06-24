import React from "react";

const EmptyRow = ({ text = "None this period." }) => (
  <div className="text-xs text-gray-400 italic text-center py-4 bg-gray-50 rounded-xl">{text}</div>
);

export default EmptyRow;
