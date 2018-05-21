<?php

namespace Diab;

class ValidationError extends Error {
  public function __construct($message, $codeStr = '') {
    parent::__construct($message);
    $this->codeStr = $codeStr;
  }
}