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

export function unpack(value) {
  var match = value.match(/^coef_([0-9]{1,2})\|([0-9]{1,2})$/)
  if(match) {
    return {
      from: parseInt(match[1]),
      to: parseInt(match[2])
    }
  }
  return null
}

export function pack(fromValue, toValue) {
  fromValue = fromValue.toString()
  toValue = toValue.toString()
  if(fromValue.length < 1 || fromValue.length > 2) {
    throw new Error('bad packing for coef ' + fromValue + ' is illegal from value')
  }
  if(toValue.length < 1 || toValue.length > 2) {
    throw new Error('bad packing for coef ' + toValue + ' is illegal to value')
  }
  return 'coef_' + fromValue + '|' + toValue
}