<?php

namespace Diab;

class Dish {
  public $id;
  public $title;
  public $carbs;
  public $proteins;
  public $fats;
  public $gi;
  public $is_complex;
  public $complex_data;
  public $deleted;

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
      $row["is_complex"] = !empty($row["complex_data"]);
      $row["deleted"] = boolval($row["deleted"]);
      unset($row["complex_data"]);
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
    $row["is_complex"] = !empty($row["complex_data"]);
    $row["deleted"] = boolval($row["deleted"]);
    foreach($row as $k => $v) {
      $dish->{$k} = $v;
    }
    return $dish;
  }

  public static function add($dish) {
    self::checkInputDish($dish);
    DB::inst()->q(
      "INSERT INTO `dishes`
      SET `date` = NOW(), `title` = #s, `carbs` = #s,
      `proteins` = #s, `fats` = #s, `gi` = #s, `complex_data` = #s", [
        $dish["title"], $dish["carbs"], $dish["proteins"],
        $dish["fats"], $dish["gi"], isset($dish["complex_data"]) ? $dish["complex_data"] : ""
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
      SET `title` = #s, `carbs` = #s, `proteins` = #s, `fats` = #s, `gi` = #s
      WHERE `id` = #d", [
        $dish["title"], $dish["carbs"], $dish["proteins"], $dish["fats"], $dish["gi"], $id
      ]
    );
    return self::get($id);
  }

  public static function delete($id) {
    DB::inst()->q(
      "DELETE FROM `dishes`
      WHERE `id` = #d", [
        $id
      ]
    );
  }

  public static function markDelete($id) {
    DB::inst()->q(
      "UPDATE `dishes`
      SET `deleted` = 1
      WHERE `id` = #d", [
        $id
      ]
    );
  }
}