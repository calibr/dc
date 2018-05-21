<?php

namespace Diab;

class Settings extends Model {
  public function getAll() {
    $rows = DB::inst()->to_array("select `name`, `value` from settings where user_id = #d", [$this->userId]);
    $result = [];
    foreach($rows as $row) {
      $result[$row["name"]] = $row["value"];
    }
    return $result;
  }

  public function setMass($data) {
    foreach($data as $k => $v) {
      $set = "
        `name` = '".mysql_escape_string($k)."',
        `value` = '".mysql_escape_string($v)."',
        `user_id` = ".intval($this->userId)."
      ";
      $query = "
        REPLACE INTO
          `settings`
        SET
          $set
      ";
      DB::inst()->q($query);
    }
    return $this->getAll();
  }

  public function set($k, $v) {
    $set = "
      `name` = '".mysql_escape_string($k)."',
      `value` = '".mysql_escape_string($v)."',
      `user_id` = ".intval($this->userId)."
    ";
    $query = "
      REPLACE INTO
        `settings`
      SET
        $set
    ";
    DB::inst()->q($query);
  }

  public function get($k) {
    $query = "
      SELECT
        `value`
      FROM
        `settings`
      WHERE
        `name` = #s AND user_id = #d
    ";
    return DB::inst()->first($query, [$k, $this->userId]);
  }

  public function delete($k) {
    if(!is_array($k)) {
      $k = [$k];
    }
    $query = "
      DELETE FROM
        `settings`
      WHERE
        `name` IN ('".implode("','", array_map('mysql_escape_string', $k))."') AND user_id = #d
    ";
    DB::inst()->q($query, [$this->userId]);
  }
}