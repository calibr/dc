<?php

namespace Diab;

include "../inc/header.php";

header("Content-Type: text/json;charset=utf-8");

switch($_GET["a"]) {
  case "fetch":
    print json_encode(Settings::getAll());
  break;
  case "save":
    if(isset($_POST['___delete'])) {
      Settings::delete(json_decode($_POST['___delete'], true));
      unset($_POST['___delete']);
    }
    print json_encode(Settings::setMass($_POST));
  break;
  case "set":
    Settings::set($_POST["name"], $_POST["value"]);
    print json_encode(Settings::getAll());
  break;
  case "delete":
    Settings::delete($_POST["name"]);
    print json_encode(Settings::getAll());
  break;
  case "deleteMass":
    Settings::delete($_POST["names"]);
    print json_encode(Settings::getAll());
  break;
}