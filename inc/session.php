<?php

namespace Diab;

class Session {
  public function __construct() {
    // other session configuration need to be made on php config level(php.ini, apache, etc...), these params are especially useful:
    // session.gc_maxlifetime - lifetime of the session data on the server
    // session.cookie_lifetime - lifetime of the cookie that stores session identificator
    session_name('diabsess');
    session_start();
  }

  public function get($key) {
    return @$_SESSION[$key];
  }

  public function set($key, $value) {
    $_SESSION[$key] = $value;
  }
}