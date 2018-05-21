<?php

namespace Diab;

class STTController extends Controller {
  private $_model = null;
  protected $onlyAuthorized = true;

  private function model() {
    if($this->_model === null) {
      $this->_model = new STT($this->context->userId);
    }
    return $this->_model;
  }

  public function actionKeywordsToDishes() {
    $keywords = json_decode($_POST['keywords']);
    $res = $this->model()->lookupDishesByKeywords($keywords);
    return $res;
  }
}