<?php

namespace Diab;

class Dish extends Model {
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

  public function getAll() {
    $rows = DB::inst()->to_array("select * from dishes where user_id = #d", [$this->userId]);
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

  public function get($id) {
    $rows = DB::inst()->to_array("select * from dishes where `id` = #d and user_id = #d", [$id, $this->userId]);
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

  public function add($dish) {
    self::checkInputDish($dish);
    DB::inst()->q(
      "INSERT INTO `dishes`
      SET `date` = '".Time::now()."', `title` = #s, `carbs` = #s,
      `proteins` = #s, `fats` = #s, `gi` = #s, `complex_data` = #s, `user_id` = #d", [
        $dish["title"], $dish["carbs"], $dish["proteins"],
        $dish["fats"], $dish["gi"], isset($dish["complex_data"]) ? $dish["complex_data"] : "",
        $this->userId
      ]
    );
    $id = DB::inst()->id();
    if(!$id) {
      throw new \Exception("Fail to create dish");
    }
    return self::get($id);
  }

  public function update($id, $dish) {
    self::checkInputDish($dish);
    DB::inst()->q(
      "UPDATE `dishes`
      SET `title` = #s, `carbs` = #s, `proteins` = #s, `fats` = #s, `gi` = #s
      WHERE `id` = #d AND user_id = #d", [
        $dish["title"], $dish["carbs"], $dish["proteins"], $dish["fats"], $dish["gi"], $id, $this->userId
      ]
    );
    return self::get($id);
  }

  public function delete($id) {
    DB::inst()->q(
      "DELETE FROM `dishes`
      WHERE `id` = #d AND user_id = #d", [
        $id, $this->userId
      ]
    );
  }

  public function markDelete($id) {
    DB::inst()->q(
      "UPDATE `dishes`
      SET `deleted` = 1
      WHERE `id` = #d AND user_id = #d", [
        $id, $this->userId
      ]
    );
  }
}