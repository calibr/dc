<?php

namespace Diab;

class User extends Model {
  public function get($id, $password = false) {
    $fields = ['id', 'login'];
    if($password) {
      $fields[] = 'password';
    }
    $user = DB::inst()->assoc('
      SELECT
        `'.implode('`,`', $fields).'`
      FROM
        `users`
      WHERE
        `id` = #d
    ', [$id]);
    return $user;
  }

  public function getByLogin($login) {
    $user = DB::inst()->assoc('
      SELECT
        *
      FROM
        `users`
      WHERE
        `login` = #s
    ', [$login]);
    return $user;
  }

  public function create($data) {
    DB::inst()->q('
      INSERT INTO
        `users`
      SET
        `login` = #s,
        `password` = #s,
        `date` = #s
    ', [
      $data['login'],
      $data['password'],
      date('Y-m-d H:i:s')
    ]);
    $id = DB::inst()->id();
    return $this->get($id);
  }
}