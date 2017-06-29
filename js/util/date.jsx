import moment from 'moment'

function jsDate(date) {
  if(typeof date === "string" || typeof date === "number") {
    date = moment(date).toDate()
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

var relDays = {
  today: 'Сегодня',
  yesterday: 'Вчера'
}

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

export function visibleRel(date) {
  date = jsDate(date)
  let dateTimestamp = date.getTime()
  let now = new Date().getTime()
  let diffDays = Math.ceil((now - dateTimestamp)/(24 * 3600))
  if(now - dateTimestamp < 24 * 3600 * 1000) {
    return relDays.today
  }
  else if(now - dateTimestamp < 48 * 3600 * 1000) {
    return relDays.yesterday
  }
  else if(diffDays < 5) {
    return diffDays + ' дня назад'
  }
  else {
    return visible(date)
  }
}