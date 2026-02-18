"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

type ChartProps = {
  groupNames: string[];
  groupActuals: number[];
};

export function MonthlyExpensesChart({ groupNames, groupActuals }: ChartProps) {
  return (
    <Bar
      data={{
        labels: groupNames,
        datasets: [{ label: "Monthly Expenses", data: groupActuals, backgroundColor: "rgba(139,92,246,0.45)" }]
      }}
      options={{ responsive: true, plugins: { legend: { display: false } } }}
    />
  );
}

export function ExpenseDistributionChart({ groupNames, groupActuals }: ChartProps) {
  return (
    <Doughnut
      data={{
        labels: groupNames,
        datasets: [
          {
            label: "Distribution",
            data: groupActuals,
            backgroundColor: ["#d8b4fe", "#f9a8d4", "#fde68a", "#93c5fd", "#a7f3d0", "#fca5a5"]
          }
        ]
      }}
      options={{ responsive: true }}
    />
  );
}
