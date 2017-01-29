<?php

namespace Diab;

include "../inc/header.php";

header("Content-Type: text/json;charset=utf-8");

switch($_GET["a"]) {
  case "fetch":
    print json_encode(Settings::getAll());
  break;
  case "save":
    print json_encode(Settings::setMass($_POST));
  break;
  case "set":
    Settings::set($_POST["name"], $_POST["value"]);
    print json_encode(Settings::getAll());
  break;
}