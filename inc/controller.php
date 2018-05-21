<?php

namespace Diab;

class Controller {
  protected $context;
  protected $onlyAuthorized = false;

  public function __construct($context) {
    $this->context = $context;
  }

  public function isAccessAllowed($action) {
    if($this->onlyAuthorized && !$this->context->userId) {
      return false;
    }
    return true;
  }
}