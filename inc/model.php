<?php

namespace Diab;

class Model {
  protected $userId;

  public function __construct($userId = 0) {
    $this->userId = $userId;
  }
}