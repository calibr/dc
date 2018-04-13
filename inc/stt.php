<?php

namespace Diab;

class STT {
  public static function lookupDishesByKeywords($keywords) {
    $res = [];
    foreach($keywords as $keyword) {
      $dishes = DB::inst()->to_array("SELECT id, MATCH(title) against (#s) as Relevance FROM `dishes` WHERE MATCH(title) against (#s) ORDER
BY Relevance DESC", [$keyword, $keyword]);
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