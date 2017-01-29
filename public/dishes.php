<?php

namespace Diab;

include "../inc/header.php";

header("Content-Type: text/json;charset=utf-8");

switch($_GET["a"]) {
  case "fetch":
    print json_encode(Dish::getAll());
  break;
  case "add":
    print json_encode(Dish::add($_POST));
  break;
  case "update":
    print json_encode(Dish::update($_GET["id"], $_POST));
  break;
}