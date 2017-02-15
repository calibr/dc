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

  public static function get($id) {
    $rows = DB::inst()->to_array("select * from servings where `id` = #d", [$id]);
    if(!$rows) {
      return null;
    }
    return self::fromRow($rows[0]);
  }

  public static function eat($id) {
    DB::inst()->to_array("update servings set `eat` = 1 where `id` = #d", [$id]);
  }

  public static function add($serving) {
    if(empty($serving["meal_id"]) || empty($serving["dish_id"])) {
      throw new \Exception("meal_id and dish_id is required");
    }
    DB::inst()->q(
      "INSERT INTO `servings`
      SET `add_date` = NOW(), `dish_id` = #d, `meal_id` = #d, `weight` = #s", [
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
    if(empty($serving["dish_id"])) {
      throw new \Exception("dish_id is required");
    }
    DB::inst()->q(
      "UPDATE `servings`
      SET `dish_id` = #d, `weight` = #s
      WHERE `id` = #d", [
        $serving["dish_id"], $serving["weight"], $id
      ]
    );
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