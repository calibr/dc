<?php

namespace Diab;

use Ramsey\Uuid\Uuid;

class NightScout {
  // delay after adding treatments after which they should be flushed to nightscout
  // TODO make it configurable
  private $treatmentDelay = 300;
  public function flushTreatmentsIfNeed() {
    $now = time();
    $maxTime = DB::inst()->first("SELECT MAX(`time`) FROM `treatments_buffer`");
    if(!$maxTime) {
      // no records in db
      return;
    }
    $delay = $now - $maxTime;
    if($delay < $this->treatmentDelay) {
      // not time
      return;
    }
    $this->flushTreatments();
  }
  private function flushTreatments() {
    // squash all treatments into one
    $rows = DB::inst()->to_array("SELECT * FROM `treatments_buffer`");
    if(!$rows) {
      return;
    }
    $treatments = array_map(function($row) {
      return json_decode($row['json'], true);
    }, $rows);
    // now only merge carbs and notes fields
    $result = array_shift($treatments);
    foreach($treatments as $treatment) {
      if(!empty($treatment['carbs'])) {
        if(!isset($result['carbs'])) {
          $result['carbs'] = 0;
        }
        $result['carbs'] += $treatment['carbs'];
      }
      if(!empty($treatment['notes'])) {
        if(!isset($result['notes'])) {
          $result['notes'] = '';
        }
        if($result['notes']) {
          $result['notes'] .= ', ';
        }
        $result['notes'] .= $treatment['notes'];
      }
    }
    $ids = array_map(function($row) {
      return $row['id'];
    }, $rows);
    DB::inst()->q('DELETE FROM `treatments_buffer` WHERE `id` IN ('.implode(',', $ids).')');
    if(!empty($result['carbs'])) {
      // round carbs to integer
      $result['carbs'] = round($result['carbs']);
    }
    print "Flushing treatment to NS: ".json_encode($result)."\n";
    $this->addTreatment($result);
  }
  public function bufferTreatment($data) {
    DB::inst()->q("
      INSERT INTO
        `treatments_buffer`
      SET
        `json` = #s,
        `time` = #d
    ", [json_encode($data), time()]);
  }
  public function addTreatment($data) {
    $data['timestamp'] = time() * 1000;
    $data['eventType'] = '<none>';
    $data['enteredBy'] = 'boluscalc';
    $data['uuid'] = Uuid::uuid4();
    $ch = curl_init();

    $url = Settings::get('ns_url');
    $secret = Settings::get('ns_secret');

    if(!$url) {
      print "Nightscout is not configured\n";
      // nightscout is not configured
      return;
    }

    curl_setopt_array($ch, [
      CURLOPT_URL => "$url/api/v1/treatments.json",
      CURLOPT_POST => true,
      CURLOPT_POSTFIELDS => json_encode($data),
      CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'api-secret: '.sha1($secret)
      ],
      CURLOPT_RETURNTRANSFER => true
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    print "Response from NS: $response\n";
    $parsed = json_decode($response);
    if($parsed && is_array($parsed)) {
      $parsed = $parsed[0];
    }
    return $parsed;
  }
}