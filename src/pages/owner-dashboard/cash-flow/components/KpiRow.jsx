import React from "react";
import { motion } from "framer-motion";
import KpiCard from "./KpiCard";
import { itemVariants } from "../cashflow.utils";

const KpiRow = ({ items }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
    {items.map((item, i) => (
      <motion.div key={item.label || i} variants={itemVariants}>
        <KpiCard {...item} />
      </motion.div>
    ))}
  </div>
);

export default KpiRow;
