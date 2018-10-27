<?php

$finput = fopen(__DIR__.'/dishes.csv', 'r');

$head = fgetcsv($finput);

function mb_ucfirst($string, $encoding) {
  $strlen = mb_strlen($string, $encoding);
  $firstChar = mb_substr($string, 0, 1, $encoding);
  $then = mb_substr($string, 1, $strlen - 1, $encoding);
  return mb_strtoupper($firstChar, $encoding) . $then;
}

function makeAssoc($head, $row) {
  $res = [];
  for($i = 0; $i !== count($head); $i++) {
    if(!isset($row[$i])) {
       break;
    }
    $res[$head[$i]] = $row[$i];
  }
  return $res;
}

$data = [
  'dishes'
];
while($finput && ($row = fgetcsv($finput))) {
  $row = makeAssoc($head, $row);
  if(!@$row['title']) {
    continue;
  }

  $row['title'] = trim(mb_ucfirst($row['title'], 'UTF-8'));

  $data['dishes'][] = [
    'title' => $row['title'],
    'carbs' => $row['carbs'],
    'proteins' => $row['proteins'],
    'fats' => $row['fats'],
    'gi' => $row['gi']
  ];
}

file_put_contents(__DIR__.'/../data/default.json', json_encode($data));