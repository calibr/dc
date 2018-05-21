<?php

namespace Diab;

class ServingController extends Controller {
  private $_model = null;
  protected $onlyAuthorized = true;

  private function model() {
    if($this->_model === null) {
      $this->_model = new Serving($this->context->userId);
    }
    return $this->_model;
  }
  public function actionFetch() {
    if(empty($_GET['meal_id'])) {
      throw new ValidationError('meal is required');
    }
    return $this->model()->getForMeal($_GET['meal_id']);
  }
  public function actionAdd() {
    return $this->model()->add($_POST);
  }
  public function actionImport() {
    $servings = [];
    foreach(@$_POST['serving'] as $serving) {
      $servings[] = $this->model()->add($serving);
    }
    return ['servings' => $servings];
  }
  public function actionUpdate() {
    return $this->model()->update($_GET['id'], $_POST);
  }
  public function actionDelete() {
    return $this->model()->delete($_GET['id']);
  }
}