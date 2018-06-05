<?php

namespace Diab;

class Serving {
  public $id;
  public $add_date;
  public $eat_date;
  public $dish_id;
  public $meal_id;
  public $weight;

  private static function fromRow($row) {
    $serving = new Serving();
    foreach($row as $k => $v) {
      if($k === "add_date" || $k === "eat_date") {
        $v = Util::outDate($v);
      }
      $serving->{$k} = $v;
    }
    return $serving;
  }

  public static function getForMeal($id) {
    $rows = DB::inst()->to_array("select * from servings where `meal_id` = #d", [$id]);
    $res = [];
    foreach($rows as $row) {
      $res[] = self::fromRow($row);
    }
    return $res;
  }

  public static function countForMeal($id) {
    $cnt = DB::inst()->first("select count(*) from servings where `meal_id` = #d", [$id]);
    return $cnt;
  }

  public static function get($id) {
    $rows = DB::inst()->to_array("select * from servings where `id` = #d", [$id]);
    if(!$rows) {
      return null;
    }
    return self::fromRow($rows[0]);
  }

  public static function add($serving) {
    if(empty($serving["meal_id"]) || empty($serving["dish_id"])) {
      throw new \Exception("meal_id and dish_id is required");
    }
    DB::inst()->q(
      "INSERT INTO `servings`
      SET `add_date` = '".Time::now()."', `dish_id` = #d, `meal_id` = #d, `weight` = #s", [
        $serving["dish_id"],
        $serving["meal_id"],
        $serving["weight"]
      ]
    );
    $id = DB::inst()->id();
    if(!$id) {
      throw new \Exception("Fail to create serving");
    }
    return self::get($id);
  }

  public static function update($id, $serving) {
    if(isset($serving["dish_id"]) && isset($serving["weight"])) {
      DB::inst()->q(
        "UPDATE `servings`
        SET `dish_id` = #d, `weight` = #s
        WHERE `id` = #d", [
          $serving["dish_id"], $serving["weight"], $id
        ]
      );
    }
    if(isset($serving["eaten"])) {
      if($serving["eaten"] === "true") {
        $serving["eaten"] = true;
      }
      if($serving["eaten"] === "false") {
        $serving["eaten"] = false;
      }
      if($serving["eaten"]) {
        $value = "'".Time::now()."'";
      }
      else {
        $value = "NULL";
      }
      DB::inst()->q("
        UPDATE
          `servings`
        SET
          `eat_date` = $value
        WHERE
          `id` = #d
      ", [
          $id
      ]);
    }
    return self::get($id);
  }

  public static function delete($id) {
    DB::inst()->q(
      "DELETE FROM `servings`
      WHERE `id` = #d", [
        $id
      ]
    );
  }
}