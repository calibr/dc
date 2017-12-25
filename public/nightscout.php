<?php

namespace Diab;

include "../inc/header.php";

header("Content-Type: text/json;charset=utf-8");

switch($_GET["a"]) {
  case "addTreatment":
    $nightscout = new Nightscout();
    $res = $nightscout->addTreatment($_POST);
    print json_encode($res);
  break;
}