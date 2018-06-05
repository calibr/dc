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
    $meals = $this->model()->getAll([
      "offset" => $_GET["offset"],
      "limit" => $_GET["limit"]
    ]);

    if(!empty($_GET['doNotCut']) && $_GET['doNotCut'] === 'true' && $meals) {
      // need to not cut the last day, check if the previous meals are from the same day as the last fetched, if so add them to the returning list
      while(true) {
        $lastMeal = $meals[count($meals) - 1];
        $timeInst = new Time();
        // use dates in local user's time
        $lastMealDate = $timeInst->convertDateTo($timeInst->timestampStrFromJS($lastMeal->date), $_GET['timeZoneOffset'], 'date');
        $mealsBefore = $this->model()->getBefore($lastMeal->id, 5);
        if($mealsBefore) {
          $addedMeals = 0;
          foreach($mealsBefore as $mealBefore) {
            $mealBeforeDate = $timeInst->convertDateTo($timeInst->timestampStrFromJS($mealBefore->date), $_GET['timeZoneOffset'], 'date');

            if($mealBeforeDate === $lastMealDate) {
              $meals[] = $mealBefore;
              $addedMeals++;
            }
          }
          if($addedMeals === count($mealsBefore)) {
            // need to look further there might be more meals from the same day
            continue;
          }
        }
        break;
      }
    }
    return $meals;
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