<?php

namespace Diab;

class Util {
  public static function outDate($date) {
    return strtotime($date) * 1000;
  }
  public static function binarySearch($arr, $x) {
    // check for empty array
    if (count($arr) === 0) {
      return false;
    }
    $low = 0;
    $high = count($arr) - 1;
    while ($low <= $high) {
      // compute middle index
      $mid = floor(($low + $high) / 2);
      // element found at mid
      if($arr[$mid] == $x) {
        return true;
      }
      if ($x < $arr[$mid]) {
        // search the left side of the array
        $high = $mid -1;
      }
      else {
        // search the right side of the array
        $low = $mid + 1;
      }
    }
    // If we reach here element x doesnt exist
    return false;
  }
  public static function binarySearchClosest($arr, $x) {
    // check for empty array
    if (count($arr) === 0) {
      return false;
    }
    $low = 0;
    $high = count($arr) - 1;
    while ($low <= $high) {
      // compute middle index
      $mid = floor(($low + $high) / 2);
      // element found at mid
      if($arr[$mid] == $x) {
        return $x;
      }
      if ($x < $arr[$mid]) {
        // search the left side of the array
        $high = $mid -1;
      }
      else {
        // search the right side of the array
        $low = $mid + 1;
      }
    }
    if(isset($arr[$mid])) {
      return $arr[$mid];
    }
    // If we reach here element x doesnt exist
    return false;
  }
  public static function getCarbsInServing($carbsPer100g, $weight) {
    return round($carbsPer100g/100 * $weight, 2);
  }
  public static function carbsToBu($carbsPerBu, $carbs) {
    return round($carbs/$carbsPerBu, 2);
  }
}