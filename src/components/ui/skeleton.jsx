import React from "react";

export const Skeleton = ({ className = "", ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-xl bg-gray-200/80 ${className}`}
      {...props}
    />
  );
};
