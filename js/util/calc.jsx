import {carbsToBu} from "./bu.jsx";

export function calc(carbs, k) {
  return Math.round(carbsToBu(carbs) * k * 10)/10;
};