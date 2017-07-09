var app = require("../../f7app");
var $ = app.$

function fixValues(startChanged) {
  var vStart = parseInt($('#coef-start-hour').val())
  var vEnd = parseInt($('#coef-end-hour').val())
  function fix(s, e) {
    if(s < 0) {
      s = 0
      return fix(s, e)
    }
    if(e < 0) {
      e = 1
      return fix(s, e)
    }
    if(s > 24) {
      s = 23
      return fix(s, e)
    }
    if(e > 24) {
      e = 24
      return fix(s, e)
    }
    if(s > e) {
      if(startChanged) {
        e = s + 1
      }
      else {
        s = e - 1
      }
      return fix(s, e)
    }
    if(s === e) {
      if(startChanged) {
        e = s + 1
      }
      else {
        s = e - 1
      }
      return fix(s, e)
    }
    if(e > s) {
      return {s, e}
    }
  }
  var fixed = fix(vStart, vEnd)
  if(fixed.s !== vStart) {
    $('#coef-start-hour').val(fixed.s)
  }
  if(fixed.e !== vEnd) {
    $('#coef-end-hour').val(fixed.e)
  }
}

export function listenCoefModal(coefs) {
  $('#coef-start-hour').on('change', () => {
    setTimeout(() => {
      fixValues(true)
    }, 0)
  })
  $('#coef-end-hour').on('change', () => {
    setTimeout(() => {
      fixValues(false)
    }, 0)
  })
  fixValues(true)
}

export function unListenCoefModal() {
}