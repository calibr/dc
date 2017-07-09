<?php

namespace Diab;

class Settings {
  public static function getAll() {
    $rows = DB::inst()->to_array("select `name`, `value` from settings");
    $result = [];
    foreach($rows as $row) {
      $result[$row["name"]] = $row["value"];
    }
    return $result;
  }

  public static function setMass($data) {
    foreach($data as $k => $v) {
      $set = "
        `name` = '".mysql_escape_string($k)."',
        `value` = '".mysql_escape_string($v)."'
      ";
      $query = "
        REPLACE INTO
          `settings`
        SET
          $set
      ";
      DB::inst()->q($query);
    }
    return self::getAll();
  }

  public static function set($k, $v) {
    $set = "
      `name` = '".mysql_escape_string($k)."',
      `value` = '".mysql_escape_string($v)."'
    ";
    $query = "
      REPLACE INTO
        `settings`
      SET
        $set
    ";
    DB::inst()->q($query);
  }

  public static function delete($k) {
    if(!is_array($k)) {
      $k = [$k];
    }
    $query = "
      DELETE FROM
        `settings`
      WHERE
        `name` IN ('".implode("','", array_map('mysql_escape_string', $k))."')
    ";
    DB::inst()->q($query);
  }
}