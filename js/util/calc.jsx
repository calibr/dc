import {carbsToBu} from "./bu.jsx";

export function calc(carbs, k) {
  return Math.round(carbsToBu(carbs) * k * 10)/10;
};

export function round(value) {
  return Math.round(value * 100)/100;
}