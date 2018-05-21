<?php

namespace Diab;

class MealController extends Controller {
  protected $onlyAuthorized = true;
  private $_model = null;

  private function model() {
    if($this->_model === null) {
      $this->_model = new Meal($this->context->userId);
    }
    return $this->_model;
  }
  public function actionFetchActive() {
    return $this->model()->getActive();
  }
  public function actionFetch() {
    if(!isset($_GET["offset"]) || !isset($_GET["limit"])) {
      throw new ValidationError('Offset/limit are required');
    }
    return $this->model()->getAll([
      "offset" => $_GET["offset"],
      "limit" => $_GET["limit"]
    ]);
  }
  public function actionAdd() {
    return $this->model()->add($_POST);
  }
  public function actionEnd() {
    return $this->model()->end($_GET["id"]);
  }
  public function actionSetCoef() {
    $this->model()->setCoef($_GET["id"], $_POST["coef"]);
    return $this->model()->get($_GET["id"]);
  }
}