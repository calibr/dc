<?php

namespace Diab;

require "../inc/header.php";

$session = new Session();

$userId = $session->get('userId');
$userModel = new User();
$prepopulateStores = [
  [
    'store' => 'user',
    'data' => [
      'auth' => boolval($userId),
      'user' => $userId ? $userModel->get($userId) : null
    ]
  ]
];

include "../templates/main.php";