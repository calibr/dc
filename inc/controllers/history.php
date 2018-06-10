<?php

namespace Diab;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class HistoryController extends Controller {
  private $_mealModel = null;
  private $_nightscoutModel = null;
  private $_dishModel = null;
  protected $onlyAuthorized = true;

  private $breakfastHours = [5, 11];
  private $launchHours = [11, 16];
  private $dinnerHours = [
    [16, 23], [0, 5]
  ];

  private function mealModel() {
    if($this->_mealModel === null) {
      $this->_mealModel = new Meal($this->context->userId);
    }
    return $this->_mealModel;
  }
  private function nighscoutModel() {
    if($this->_nightscoutModel === null) {
      $this->_nightscoutModel = new NightScout($this->context->userId);
    }
    return $this->_nightscoutModel;
  }
  private function dishModel() {
    if($this->_dishModel === null) {
      $this->_dishModel = new Dish($this->context->userId);
    }
    return $this->_dishModel;
  }
  public function actionExport() {
    if(empty($_GET['format'])) {
      throw new ValidationError('format is required');
    }
    if(empty($_GET['periodStart'])) {
      throw new ValidationError('periodStart is required');
    }
    if(empty($_GET['periodEnd'])) {
      throw new ValidationError('periodEnd is required');
    }
    if(empty($_GET['timeZoneOffset'])) {
      throw new ValidationError('timeZoneOffset is required');
    }
    if(empty($_GET['carbsPerBu'])) {
      throw new ValidationError('carbsPerBu is required');
    }
    $periodStartDate = date('Y-m-d', $_GET['periodStart']);
    $periodEndDate = date('Y-m-d', $_GET['periodEnd']);
    $meals = $this->mealModel()->getInPeriod($periodStartDate, $periodEndDate);
    if(!$meals) {
      throw new NotFoundError('No meals found in the specified period', 'meals_not_found');
    }
    $insulinTreatments = $this->nighscoutModel()->getTreatments($_GET['periodStart'], $_GET['periodEnd'], [
      'find[insulin][$gt]' => 0
    ]);
    $bloodSugars = $this->nighscoutModel()->getBloodSugars($_GET['periodStart'], $_GET['periodEnd'], $_GET['timeZoneOffset']);
    $dishes = $this->dishModel()->getAll();

    $generator = new ReportGenerator();
    $generator
      ->setCarbsPerBu($_GET['carbsPerBu'])
      ->setTimeZoneOffset($_GET['timeZoneOffset'])
      ->setDishes($dishes)
      ->setMeals($meals)
      ->setBloodSugars($bloodSugars)
      ->setInsulinTreatments($insulinTreatments);

    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="report.xlsx"');
    $generator->generate('php://output');
  }
}