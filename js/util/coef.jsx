export function getCurrentCoef(coefs) {
  var h = new Date().getHours();
  for(let coef of coefs) {
    if(h >= coef.from && h < coef.to) {
      return coef.k
    }
  }
  return null
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

export function getCoefsFromSettings(settings) {
  let result = []
  for(let name in settings) {
    let coef = unpack(name)
    if(coef) {
      coef.k = settings[name]
      result.push(coef)
    }
  }
  return result
}