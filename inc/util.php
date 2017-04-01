<?php

namespace Diab;

class Util {
  public static function outDate($date) {
    return strtotime($date) * 1000;
  }
}