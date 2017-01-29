export function getCurrentCoefName() {
  var h = new Date().getHours();
  if(h >= 0 && h < 6) {
    return "night-coef";
  }
  else if(h >= 6 && h < 12) {
    return "morning-coef";
  }
  else if(h >= 12 && h < 18) {
    return "day-coef";
  }
  else if(h >= 18) {
    return "evening-coef";
  }
}