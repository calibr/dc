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

  let dateFormatted = moment(date).format('YYYY-MM-DD')
  let todayDate = moment().format('YYYY-MM-DD')
  let yesterdayDate = moment(now - 24 * 3600 * 1000).format('YYYY-MM-DD')

  if(dateFormatted === todayDate) {
    return relDays.today
  }
  else if(dateFormatted === yesterdayDate) {
    return relDays.yesterday
  }
  else if(diffDays < 5) {
    return diffDays + ' дня назад'
  }
  else {
    return visible(date)
  }
}

export function hour2(hour) {
  hour = hour.toString()
  if(hour.length < 2) {
    hour = '0' + hour
  }
  return hour
}