<?php

namespace Diab;

class STT extends Model {
  public function lookupDishesByKeywords($keywords) {
    $res = [];
    foreach($keywords as $keyword) {
      $dishes = DB::inst()->to_array("SELECT id, MATCH(title) against (#s) as Relevance FROM `dishes` WHERE user_id = #d AND MATCH(title) against (#s) ORDER
BY Relevance DESC", [$keyword, $this->userId, $keyword]);
      $dishes = array_map(function($dish) {
        return $dish['id'];
      }, $dishes);
      $res[$keyword] = [
        'dishes' => $dishes
      ];
    }
    return $res;
  }
}