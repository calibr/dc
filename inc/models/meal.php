<?php

namespace Diab;

class Meal extends Model {
  public $id;
  public $date;
  public $date_end;
  public $active;
  public $servings = null;

  private function _initMeal($row, $getServings = false) {
    $meal = new Meal();
    foreach($row as $k => $v) {
      if($k === "date" || $k === "date_end") {
        $v = Util::outDate($v);
      }
      $meal->{$k} = $v;
    }
    if($getServings) {
      $serving = new Serving($this->userId);
      $meal->servings = $serving->getForMeal($meal->id);
    }
    return $meal;
  }

  public function getActive() {
    $rows = DB::inst()->to_array("select * from meals where `active` = 1 AND user_id = #d", [$this->userId]);
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

  public function get($id) {
    $rows = DB::inst()->to_array("select * from meals where `id` = #d AND user_id = #d", [$id, $this->userId]);
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

  public function getAll($params) {
    $query = "
      SELECT
        *
      FROM
        `meals`
      WHERE
        `active` = 0 AND user_id = #d
      ORDER BY
        `id` DESC
      LIMIT #d, #d
    ";
    $rows = DB::inst()->to_array($query, [$this->userId, $params["offset"], $params["limit"]]);
    $meals = [];
    foreach($rows as $row) {
      $meal = $this->_initMeal($row, true);
      $meals[] = $meal;
    }
    return $meals;
  }

  public function end($id) {
    $servingModel = new Serving($this->userId);
    $servings = $servingModel->getForMeal($id);
    if($servings) {
      $eatDates = array_map(function($s) {
        return $s->eat_date;
      }, $servings);
      $eatDates = array_filter($eatDates);
      $date = "`date`";
      $date_end = "NOW()";
      if($eatDates) {
        $date = "'".date("Y-m-d H:i:s", round(min($eatDates)/1000))."'";
        $date_end = "'".date("Y-m-d H:i:s", round(max($eatDates)/1000))."'";
      }
      DB::inst()->q(
        "update meals set `active` = 0, `date_end` = $date_end, `date` = $date where `id` = #d and user_id = #d",
        [$id, $this->userId]
      );
      $res = self::get($id);
    }
    else {
      $res = null;
      DB::inst()->q("delete from `meals` where `id` = #d and user_id = #d", [$id, $this->userId]);
    }
    return $res;
  }

  public function setCoef($id, $coef) {
    DB::inst()->q("update meals set `coef` = #s where `id` = #d and user_id = #d", [$coef, $id, $this->userId]);
  }

  public function add($data) {
    DB::inst()->q("
      INSERT INTO
        `meals`
      SET
        `date` = NOW(), user_id = #d
    ", [$this->userId]);
    $id = DB::inst()->id();
    if(!$id) {
      throw new \Exception("Fail to create meal");
    }
    if(isset($data["coef"])) {
      $this->setCoef($id, $data["coef"]);
    }
    return $this->get($id);
  }
}