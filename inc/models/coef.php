<?php

namespace Diab;

class Coef extends Model {
  public $id;
  public $name;
  public $user_id;
  public $values;

  public function getAll() {
    $rows = DB::inst()->to_array("select * from coeffs where user_id = #d and `deleted` = 0", [$this->userId]);
    $res = [];
    foreach ($rows as $row) {
      $coef = new Coef();
      foreach($row as $k => $v) {
        $coef->{$k} = $v;
      }
      if ($coef->values) {
        $coef->values = json_decode($coef->values, true);
      }
      $res[] = $coef;
    }
    return $res;
  }

  public function get($id) {
    $rows = DB::inst()->to_array("select * from coeffs where `id` = #d and user_id = #d", [$id, $this->userId]);
    if(!$rows) {
      throw new \Exception("Coef not found($id)");
    }
    $coef = new Coef();
    $row = $rows[0];
    $row["deleted"] = boolval($row["deleted"]);
    foreach($row as $k => $v) {
      $coef->{$k} = $v;
    }
    if ($coef->values) {
      $coef->values = json_decode($coef->values, true);
    }
    return $coef;
  }

  private static function checkInputCoef($coef) {
    if(empty($coef["name"])) {
      throw new \Exception("Name should not be empty");
    }
    $required = [
      "values"
    ];
    foreach($required as $key) {
      if(!isset($coef[$key])) {
        throw new \Exception("Required param $key is missed or empty");
      }
    }
  }

  public function add($coef) {
    self::checkInputCoef($coef);
    DB::inst()->q(
      "INSERT INTO `coeffs`
      SET `name` = #s, `user_id` = #d,
      `values` = #s", [
        $coef["name"], $this->userId, json_encode($coef["values"])
      ]
    );
    $id = DB::inst()->id();
    if(!$id) {
      throw new \Exception("Fail to create dish");
    }
    return self::get($id);
  }

  public function update($id, $coef) {
    DB::inst()->q(
      "UPDATE `coeffs`
      SET `name` = #s, `values` = #s
      WHERE `id` = #d AND user_id = #d", [
        $coef['name'], json_encode($coef['values']), $id, $this->userId
      ]
    );
    return self::get($id);
  }

  public function delete($id) {
    DB::inst()->q(
      "DELETE FROM `coeffs`
      WHERE `id` = #d AND user_id = #d", [
        $id, $this->userId
      ]
    );
  }

  public function markDelete($id) {
    DB::inst()->q(
      "UPDATE `coeffs`
      SET `deleted` = 1
      WHERE `id` = #d AND user_id = #d", [
        $id, $this->userId
      ]
    );
  }
}