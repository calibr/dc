<?php

namespace Diab;

class Config {
  private static $_config;
  public static function get($key = "") {
    if(!self::$_config) {
      self::$_config = require dirname(__DIR__)."/config.php";
    }
    if($key) {
      return self::$_config[$key];
    }
    return self::$_config;
  }
}