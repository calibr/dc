<?php

namespace Diab;

require dirname(__DIR__).'/inc/header.php';

if(empty($argv[1])) {
  die('user id is required');
}

$userId = intval($argv[1]);

$dishModel = new Dish($userId);

$dishes = $dishModel->getAll();

if(!$dishes) {
  die('No dishes were found');
}

$head = array_keys(get_object_vars($dishes[0]));

$out = fopen('php://output', 'w');

fputcsv($out, $head);

foreach($dishes as $dish) {
  $values = [];
  foreach($head as $k) {
    $values[] = $dish->{$k};
  }
  fputcsv($out, $values);
}