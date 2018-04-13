<?php

namespace Diab;

include "../inc/header.php";

header("Content-Type: text/json;charset=utf-8");

switch($_GET["a"]) {
  case "keywordsToDishes":
    $keywords = json_decode($_POST['keywords']);
    $res = STT::lookupDishesByKeywords($keywords);
    print json_encode($res);
  break;
}