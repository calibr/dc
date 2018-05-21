<?php

namespace Diab;

class Config {
  private static $_config;

  private static $_defaults = [
    'minPasswordLength' => 8,
    'minLoginLength' => 3
  ];

  public static function get($key = "") {
    if(!self::$_config) {
      self::$_config = require dirname(__DIR__)."/config.php";
    }
    if($key) {
      if(!isset(self::$_config[$key]) && isset(self::$_defaults[$key])) {
        return self::$_defaults[$key];
      }
      return self::$_config[$key];
    }
    return self::$_config;
  }
}