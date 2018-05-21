<?php

namespace Diab;

class DishController extends Controller {
  protected $onlyAuthorized = true;

  private function model() {
    $model = new Dish($this->context->userId);
    return $model;
  }
  public function actionFetch() {
    return $this->model()->getAll();
  }
  public function actionAdd() {
    return $this->model()->add($_POST);
  }
  public function actionUpdate() {
    return $this->model()->update($_GET['id'], $_POST);
  }
  public function actionDelete() {
    return $this->model()->markDelete($_GET['id']);
  }
}