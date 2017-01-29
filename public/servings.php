<?php

namespace Diab;

include "../inc/header.php";

header("Content-Type: text/json;charset=utf-8");

switch($_GET["a"]) {
  case "fetch":
    if(!empty($_GET["meal_id"])) {
      print json_encode(Serving::getForMeal($_GET["meal_id"]));
    }
  break;
  case "add":
    print json_encode(Serving::add($_POST));
  break;
  case "update":
    print json_encode(Serving::update($_GET["id"], $_POST));
  break;
  case "delete":
    Serving::delete($_GET["id"]);
  break;
}