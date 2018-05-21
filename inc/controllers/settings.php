<?php

namespace Diab;

class SettingsController extends Controller {
  private $_model = null;
  protected $onlyAuthorized = true;

  private function model() {
    if($this->_model === null) {
      $this->_model = new Settings($this->context->userId);
    }
    return $this->_model;
  }

  public function actionFetch() {
    return $this->model()->getAll();
  }

  public function actionSave() {
    if(isset($_POST['___delete'])) {
      $this->model()->delete(json_decode($_POST['___delete'], true));
      unset($_POST['___delete']);
    }
    return $this->model()->setMass($_POST);
  }

  public function actionSet() {
    $this->model()->set($_POST["name"], $_POST["value"]);
    return $this->model()->getAll();
  }

  public function actionDelete() {
    $this->model()->delete($_POST["name"]);
    return $this->model()->getAll();
  }

  public function actionDeleteMass() {
    $this->model()->delete($_POST["names"]);
    return $this->model()->getAll();
  }
}