<?php

namespace Diab;

include "../inc/header.php";

header("Content-Type: text/json;charset=utf-8");

switch($_GET["a"]) {
  case "fetch_active":
    print json_encode(Meal::getActive());
  break;
  case "fetch":
    if(!isset($_GET["offset"]) || !isset($_GET["limit"])) {
      die("Offset/limit are required");
    }
    print json_encode(Meal::getAll([
      "offset" => $_GET["offset"],
      "limit" => $_GET["limit"]
    ]));
  break;
  case "add":
    print json_encode(Meal::add($_POST));
  break;
  case "end":
    print json_encode(Meal::end($_GET["id"]));
  break;
  case "setCoef":
    Meal::setCoef($_GET["id"], $_POST["coef"]);
    print json_encode(Meal::get($_GET["id"]));
  break;
}