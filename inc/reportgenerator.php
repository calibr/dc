<?php

namespace Diab;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ReportGenerator {
  private $currentRow = 1;
  private $servings;
  private $insulinTreatments;
  private $bloodSugars;
  private $dishById;
  private $timeZoneOffset;
  private $spreadsheet;
  private $carbsPerBu;

  private $arrows = [
    'FortyFiveDown' => '↘',
    'FortyFiveUp' => '↗',
    'Flat' => '→',
    'DoubleUp' => '⇈',
    'SingleDown' => '↓',
    'SingleUp' => '↑'
  ];

  private function log($str) {

  }

  private function toMmol($mgDl) {
    return round($mgDl/18, 1);
  }
  private function groupData($data) {
    usort($data, function($t1, $t2) {
      $d1 = $t1['date'].' '.$t1['time'];
      $d2 = $t2['date'].' '.$t2['time'];
      if($d1 > $d2) {
        return 1;
      }
      if($d1 < $d2) {
        return -1;
      }
      return 0;
    });
    // group by date
    $grouppedData = [];
    foreach($data as $item) {
      if(!isset($grouppedData[$item['date']])) {
        $grouppedData[$item['date']] = [];
      }
      $grouppedData[$item['date']][] = $item;
    }
    return $grouppedData;
  }
  private function getNextDate() {
    $dateServings = key($this->servings);
    $dateInsulin = key($this->insulinTreatments);
    $dates = array_filter([$dateServings, $dateInsulin]);
    if(!$dates) {
      return null;
    }
    return min($dates);
  }
  private function deleteDate($date) {
    unset($this->insulinTreatments[$date]);
    unset($this->bloodSugars[$date]);
    unset($this->servings[$date]);
  }
  private function getHourMinutes($time) {
    $parts = explode(':', $time);
    array_pop($parts);
    return implode(':', $parts);
  }
  public function setCarbsPerBu($carbs) {
    $this->carbsPerBu = $carbs;
    return $this;
  }
  public function setDishes($dishes) {
    $dishById = [];
    foreach($dishes as $dish) {
      $dishById[$dish->id] = $dish;
    }
    $this->dishById = $dishById;
    return $this;
  }
  public function setMeals($meals) {
    // we are not interested in meals, but servings
    $servings = [];
    $time = new Time();
    foreach($meals as $meal) {
      foreach($meal->servings as $serving) {
        $date = $serving->eat_date;
        if(!$date) {
          $date = $serving->add_date;
        }
        $userDate = $time->convertDateTo($time->timestampStrFromJS($date), $this->timeZoneOffset);
        $servings[] = [
          'date' => $userDate['date'],
          'time' => $userDate['time'],
          'dish_id' => $serving->dish_id,
          'weight' => $serving->weight
        ];
      }
    }
    $grouppedByDate = $this->groupData($servings);
    // group by time
    foreach($grouppedByDate as $date => $items) {
      $byTimeItems = [];
      foreach($items as $item) {
        $time = $this->getHourMinutes($item['time']);
        if(!isset($byTimeItems[$time])) {
          $byTimeItems[$time] = [];
        }
        $byTimeItems[$time][] = $item;
      }
      $grouppedByDate[$date] = $byTimeItems;
    }
    $this->servings = $grouppedByDate;
    return $this;
  }
  public function setBloodSugars($bloodSugars) {
    $data = [];
    $time = new Time();
    // prepare
    foreach($bloodSugars as $bs) {
      // need to split date to date and time parts
      $userDate = $time->convertDateTo($time->timestampStrFromJS($bs->date), $this->timeZoneOffset);
      $data[] = [
        'date' => $userDate['date'],
        'time' => $userDate['time'],
        'value' => $bs->sgv,
        'valueMmol' => $this->toMmol($bs->sgv),
        'direction' => $bs->direction
      ];
    }
    $grouppedByDate = $this->groupData($data);
    foreach($grouppedByDate as $date => $items) {
      $byTime = [];
      foreach($items as $item) {
        $time = $this->getHourMinutes($item['time']);
        $byTime[$time] = $item;
      }
      $grouppedByDate[$date] = $byTime;
    }
    $this->bloodSugars = $grouppedByDate;
    return $this;
  }
  public function setInsulinTreatments($insulinTreatments) {
    $data = [];
    $time = new Time();
    foreach($insulinTreatments as $treatment) {
      // convert date from UTC
      $userDate = $time->convertDateTo($treatment->created_at, $this->timeZoneOffset);
      $data[] = [
        'date' => $userDate['date'],
        'time' => $userDate['time'],
        'value' => $treatment->insulin
      ];
    }
    $grouppedByDate = $this->groupData($data);
    // group by time and summarize insulin values
    foreach($grouppedByDate as $date => $items) {
      $byTime = [];
      foreach($items as $item) {
        $time = $this->getHourMinutes($item['time']);
        if(isset($byTime[$time])) {
          $byTime['value'] += $item['value'];
        }
        else {
          $byTime[$time] = $item;
        }
      }
      $grouppedData[$date] = $byTime;
    }
    $this->insulinTreatments = $grouppedData;
    return $this;
  }
  public function setTimeZoneOffset($timeZoneOffset) {
    $this->timeZoneOffset = $timeZoneOffset;
    return $this;
  }

  private function outDateHeader($date) {
    $sheet = $this->spreadsheet->getActiveSheet();
    $sheet->setCellValue('A'.$this->currentRow, $date);
    $sheet->mergeCells('A'.$this->currentRow.':I'.$this->currentRow);
    $sheet->getStyle('A'.$this->currentRow)->getAlignment()->setHorizontal(
      \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER
    );
    $sheet->getStyle('A'.$this->currentRow)->getFont()->setBold(true);
    $this->currentRow++;
  }

  private function outHeader() {
    $sheet = $this->spreadsheet->getActiveSheet();
    $sheet->setCellValue('A'.$this->currentRow, 'Время');
    $sheet->setCellValue('B'.$this->currentRow, 'Инсулин');
    $sheet->setCellValue('C'.$this->currentRow, 'СК');
    $sheet->setCellValue('D'.$this->currentRow, 'Еда');
    $sheet->setCellValue('E'.$this->currentRow, 'Вес(гр)');
    $sheet->setCellValue('F'.$this->currentRow, 'Углеводы(гр)');
    $sheet->setCellValue('G'.$this->currentRow, 'ХЕ');
    $sheet->setCellValue('H'.$this->currentRow, 'Активность');
    $sheet->setCellValue('I'.$this->currentRow, 'Прочее');
    $this->currentRow++;
  }

  private function nextTime(&$servings, &$insulinTreatments) {
    $timeServings = key($servings);
    $timeInsulin = key($insulinTreatments);
    $this->log("Time servings: $timeServings");
    $this->log("Time insulin: $timeInsulin");
    $times = array_filter([$timeServings, $timeInsulin]);
    if(!$times) {
      return null;
    }
    return min($times);
  }

  private function getBloodSugar($date, $time) {
    $byDate = $this->bloodSugars[$date];
    $times = array_keys($byDate);
    $closestTime = Util::binarySearchClosest($times, $time);
    return $byDate[$closestTime];
  }

  private function getDirectionArrow($key) {
    if(isset($this->arrows[$key])) {
      return $this->arrows[$key];
    }
    return $key;
  }

  public function generate($file) {
    $this->spreadsheet = new Spreadsheet();
    $sheet = $this->spreadsheet->getActiveSheet();
    $sheet->setCellValue('A1', 'Экспорт данных приема пищи');
    $this->currentRow++;
    $date = null;
    do {
      $date = $this->getNextDate();
      $this->log("Processing $date");
      if(!$date) {
        break;
      }
      $this->outDateHeader($date);
      $this->outHeader();
      $servings = @$this->servings[$date];
      if(!$servings) {
        $servings = [];
      }
      $insulinTreatments = @$this->insulinTreatments[$date];
      if(!$insulinTreatments) {
        $insulinTreatments = [];
      }
      $this->log("Count servings: ".count($servings));
      $this->log("Count insulin: ".count($insulinTreatments));

      do {
        $time = $this->nextTime($servings, $insulinTreatments);
        if(!$time) {
          break;
        }
        $this->log("Processing time: $time");

        $timeServings = @$servings[$time];
        if(!$timeServings) {
          $timeServings = [];
        }
        $insulinTreatment = @$insulinTreatments[$time];

        $startRow = $this->currentRow;
        $sheet->setCellValue('A'.$this->currentRow, $time);
        if($insulinTreatment) {
          $sheet->setCellValue('B'.$this->currentRow, $insulinTreatment['value']);
        }
        $bs = $this->getBloodSugar($date, $time);
        $sheet->setCellValue('C'.$this->currentRow, $bs['valueMmol'].$this->getDirectionArrow($bs['direction']));
        // add servings
        foreach($timeServings as $i => $serving) {
          $dish = @$this->dishById[$serving['dish_id']];
          $carbs = Util::getCarbsInServing($dish->carbs, $serving['weight']);
          $sheet->setCellValue('D'.$this->currentRow, $dish->title);
          $sheet->setCellValue('E'.$this->currentRow, $serving['weight']);
          $sheet->setCellValue('F'.$this->currentRow, $carbs);
          $sheet->setCellValue('G'.$this->currentRow, Util::carbsToBu($this->carbsPerBu, $carbs));
          if($i !== count($timeServings) - 1) {
            $this->currentRow++;
          }
        }
        $this->currentRow++;

        //var_dump($servings, $insulinTreatment);die;

        unset($servings[$time]);
        unset($insulinTreatments[$time]);
        $this->log("\n");
      }
      while(true);

      $this->deleteDate($date);
    }
    while(true);
    $writer = new Xlsx($this->spreadsheet);
    $writer->save($file);
  }
}