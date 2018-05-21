<?php

namespace Diab;

class NightscoutController extends Controller {
  protected $onlyAuthorized = true;

  public function actionAddTreatment() {
    $nightscout = new Nightscout($this->context->userId);
    $res = $nightscout->bufferTreatment($_POST);
  }
}