export function carbsToBu(carbs) {
  var bu = carbs/12;
  return Math.round(bu * 100)/100;
};