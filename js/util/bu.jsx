import Settings from '../stores/Settings.jsx'

export function buToCarbs(bu) {
  return Settings.getSetting('carbs_per_bu') * bu;
}

export function carbsToBu(carbs) {
  var bu = carbs/Settings.getSetting('carbs_per_bu');
  return Math.round(bu * 100)/100;
};