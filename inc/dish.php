<?php

namespace Diab;

class Dish {
  public $id;
  public $title;
  public $carbs;
  public $proteins;
  public $fats;
  public $gi;

  private static function checkInputDish($dish) {
    if(empty($dish["title"])) {
      throw new \Exception("Dish title should not be empty");
    }
    $required = [
      "carbs", "proteins", "fats"
    ];
    foreach($required as $key) {
      if(!isset($dish[$key])) {
        throw new \Exception("Required param $key is missed or empty");
      }
    }
  }

  public static function getAll() {
    $rows = DB::inst()->to_array("select * from dishes");
    $res = [];
    foreach($rows as $row) {
      $dish = new Dish();
      foreach($row as $k => $v) {
        $dish->{$k} = $v;
      }
      $res[] = $dish;
    }
    return $res;
  }

  public static function get($id) {
    $rows = DB::inst()->to_array("select * from dishes where `id` = #d", [$id]);
    if(!$rows) {
      throw new \Exception("Dish not found($id)");
    }
    $dish = new Dish();
    $row = $rows[0];
    foreach($row as $k => $v) {
      $dish->{$k} = $v;
    }
    return $dish;
  }

  public static function add($dish) {
    self::checkInputDish($dish);
    DB::inst()->q(
      "INSERT INTO `dishes`
      SET `title` = #s, `carbs` = #d, `proteins` = #d, `fats` = #d, `gi` = #d", [
        $dish["title"], $dish["carbs"], $dish["proteins"], $dish["fats"], $dish["gi"]
      ]
    );
    $id = DB::inst()->id();
    if(!$id) {
      throw new \Exception("Fail to create dish");
    }
    return self::get($id);
  }

  public static function update($id, $dish) {
    self::checkInputDish($dish);
    DB::inst()->q(
      "UPDATE `dishes`
      SET `title` = #s, `carbs` = #d, `proteins` = #d, `fats` = #d, `gi` = #d
      WHERE `id` = #d", [
        $dish["title"], $dish["carbs"], $dish["proteins"], $dish["fats"], $dish["gi"], $id
      ]
    );
    return self::get($id);
  }
}