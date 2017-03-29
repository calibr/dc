<?php

namespace Diab;

class Meal {
  public $id;
  public $date;
  public $date_end;
  public $active;
  public $servings = null;

  private static function _initMeal($row, $getServings = false) {
    $meal = new Meal();
    foreach($row as $k => $v) {
      $meal->{$k} = $v;
    }
    if($getServings) {
      $meal->servings = Serving::getForMeal($meal->id);
    }
    return $meal;
  }

  public static function getActive() {
    $rows = DB::inst()->to_array("select * from meals where `active` = 1");
    if(!$rows) {
      return null;
    }
    $meal = new Meal();
    $row = $rows[0];
    foreach($row as $k => $v) {
      $meal->{$k} = $v;
    }
    return $meal;
  }

  public static function get($id) {
    $rows = DB::inst()->to_array("select * from meals where `id` = #d", [$id]);
    if(!$rows) {
      return null;
    }
    $meal = new Meal();
    $row = $rows[0];
    foreach($row as $k => $v) {
      $meal->{$k} = $v;
    }
    return $meal;
  }

  public static function getAll($params) {
    $query = "
      SELECT
        *
      FROM
        `meals`
      WHERE
        `active` = 0
      ORDER BY
        `id` DESC
      LIMIT #d, #d
    ";
    $rows = DB::inst()->to_array($query, [$params["offset"], $params["limit"]]);
    $meals = [];
    foreach($rows as $row) {
      $meal = self::_initMeal($row, true);
      $meals[] = $meal;
    }
    return $meals;
  }

  public static function end($id) {
    DB::inst()->q("update meals set `active` = 0, `date_end` = NOW() where `id` = #d", [$id]);
    return self::get($id);
  }

  public static function setCoef($id, $coef) {
    DB::inst()->q("update meals set `coef` = #s where `id` = #d", [$coef, $id]);
  }

  public static function add($data) {
    DB::inst()->q(
      "INSERT INTO `meals`
      SET `date` = NOW()"
    );
    $id = DB::inst()->id();
    if(!$id) {
      throw new \Exception("Fail to create meal");
    }
    if(isset($data["coef"])) {
      self::setCoef($id, $data["coef"]);
    }
    return self::get($id);
  }
}