import {carbsToBu} from "./bu.jsx";

// calculates amount of insulin for specific carbs value and K(insulin to carbs ratio)
// INS Units = Carbs(BU) * K
export function calc(carbs, k) {
  return Math.round(carbsToBu(carbs) * k * 20)/20;
};

export function round(value) {
  return Math.round(value * 100)/100;
}