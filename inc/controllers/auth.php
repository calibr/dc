<?php

namespace Diab;

class AuthController extends Controller {
  private $_model = null;

  private function model() {
    if($this->_model === null) {
      $this->_model = new User($this->context->userId);
    }
    return $this->_model;
  }

  private function verifyPassword($password, $storedHash) {
    return password_verify($password, $storedHash);
  }

  private function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
  }

  public function actionLogin() {
    if(empty($_POST['login'])) {
      throw new ValidationError('login is empty', 'login_empty');
    }
    if(empty($_POST['password'])) {
      throw new ValidationError('password is empty', 'password_empty');
    }

    $user = $this->model()->getByLogin($_POST['login']);
    if(!$user) {
      throw new Error('auth failed');
    }
    if(!$this->verifyPassword($_POST['password'], $user['password'])) {
      throw new Error('auth failed');
    }

    $this->context->session->set('userId', $user['id']);
    return [
      'user' => $this->model()->get($user['id'])
    ];
  }

  public function actionRegister() {
    if(empty($_POST['login'])) {
      throw new ValidationError('login is empty', 'login_empty');
    }
    if(empty($_POST['password'])) {
      throw new ValidationError('password is empty', 'password_empty');
    }
    if(strlen($_POST['login']) < Config::get('minLoginLength')) {
      throw new ValidationError('login is too short', 'login_short');
    }
    if(strlen($_POST['password']) < Config::get('minPasswordLength')) {
      throw new ValidationError('password is too short', 'password_short');
    }
    $password = $this->hashPassword($_POST['password']);
    $alreadyExistsUser = $this->model()->getByLogin($_POST['login']);
    if($alreadyExistsUser) {
      throw new ValidationError('login is taken', 'login_taken');
    }
    $user = $this->model()->create([
      'login' => $_POST['login'],
      'password' => $password
    ]);
    if(!empty($user) && !empty($user['id'])) {
      // fill the dishes db with the default dishes for just created user
      $model = new Dish($user['id']);
      $model->addDefaultDishes();
    }
    $this->context->session->set('userId', $user['id']);
    return [
      'user' => $user
    ];
  }
}