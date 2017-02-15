var gramsInBu = 12;

export function buToCarbs(bu) {
  return gramsInBu * bu;
}

export function carbsToBu(carbs) {
  var bu = carbs/gramsInBu;
  return Math.round(bu * 100)/100;
};