<?php

namespace Diab;

class Time {
  public function toStringOffset($offset) {
    // offset in PHP and JS have different signs
    $offsetSign = $offset >= 0 ? '-' : '+';
    $offset = abs($offset);
    $hours = floor($offset/60);
    $minutes = $offset - $hours * 60;
    return $offsetSign.sprintf('%02d', $hours).sprintf('%02d', $minutes);
  }
  // converts js timestamp to fromat readable by DateTime
  public function timestampStrFromJS($timestamp) {
    return '@'.round($timestamp/1000);
  }
  // $date - must an UTC date string
  public function convertDateTo($date, $offset, $key = '') {
    if(!is_numeric($offset)) {
      $offset = 0;
    }
    $dateInst = new \DateTime($date, new \DateTimeZone('UTC'));
    $dateInst->setTimezone(new \DateTimeZone($this->toStringOffset($offset)));
    $res = [
      'date' => $dateInst->format('Y-m-d'),
      'time' => $dateInst->format('H:i:s'),
      'dateTime' => $dateInst->format('Y-m-d H:i:s')
    ];
    if($key) {
      return $res[$key];
    }
    return $res;
  }

  public static function now() {
    return date('Y-m-d H:i:s');
  }
}