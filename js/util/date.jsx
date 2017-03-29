function jsDate(date) {
  if(typeof date === "string") {
    date = new Date(date + " +0000")
  }
  return date
}

function twoDigits(v) {
  v = v.toString()
  if(v.length === 1) {
    v = "0" + v
  }
  return v
}

var months = [
  "Января",
  "Февраля",
  "Марта",
  "Апреля",
  "Мая",
  "Июня",
  "Июля",
  "Августа",
  "Сентября",
  "Октября",
  "Ноября",
  "Декабря"
]

var days = [
  'Воскресенье',
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота'
]

export function storedDay(date) {
  date = jsDate(date)
  var parts = [
    date.getFullYear(),
    twoDigits(date.getMonth() + 1),
    twoDigits(date.getDate())
  ]
  return parts.join('-')
}

export function storedMonth(date) {
  date = jsDate(date)
  var parts = [
    date.getFullYear(),
    twoDigits(date.getMonth() + 1)
  ]
  return parts.join('-')
}

export function visibleMonthYear(date) {
  date = jsDate(date)
  var month = months[date.getMonth()]
  return month + ", " + date.getFullYear()
}

export function visibleMonthYearDay(date) {
  date = jsDate(date)
  var month = months[date.getMonth()]
  var day = days[date.getDay()]
  return day + ", " + date.getDate() + " " + month + ", " + date.getFullYear()
}

export function visible(date) {
  date = jsDate(date)
  return date.toLocaleString()
}

export function visibleTime(date) {
  date = jsDate(date)
  return twoDigits(date.getHours()) + ":" + twoDigits(date.getMinutes())
}