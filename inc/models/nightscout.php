<?php

namespace Diab;

use Ramsey\Uuid\Uuid;

class NightScout extends Model {
  // delay after adding treatments after which they should be flushed to nightscout
  // TODO make it configurable
  private $treatmentDelay = 300;
  public function flushTreatmentsIfNeed() {
    $now = time();
    $minTime = $now - $this->treatmentDelay;
    $rows = DB::inst()->to_array("SELECT user_id FROM `treatments_buffer` WHERE `time` > #d GROUP BY user_id", [$minTime]);
    if(!$rows) {
      print "Nothing to flush...\n";
      // nothing to flush
      return;
    }
    $usersIds = array_map(function($row) {
      return $row['user_id'];
    }, $rows);
    $this->flushTreatments($usersIds);
  }
  private function flushTreatments($usersIds) {
    foreach($usersIds as $userId) {
      $this->flushTreatmentsForUser($userId);
    }
  }
  private function flushTreatmentsForUser($userId) {
    // squash all treatments into one
    $rows = DB::inst()->to_array('
      SELECT
        *
      FROM
        `treatments_buffer`
      WHERE
        user_id = #d
    ', [$userId]);
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
    print "Flushing treatment to NS: ".json_encode($result)." for $userId\n";
    $this->addTreatment($userId, $result);
  }
  public function bufferTreatment($data) {
    DB::inst()->q("
      INSERT INTO
        `treatments_buffer`
      SET
        `json` = #s,
        `time` = #d,
        `user_id` = #d
    ", [json_encode($data), time(), $this->userId]);
  }
  public function addTreatment($userId, $data) {
    $data['timestamp'] = time() * 1000;
    $data['eventType'] = '<none>';
    $data['enteredBy'] = 'boluscalc';
    $data['uuid'] = Uuid::uuid4();
    $ch = curl_init();

    $settings = new Settings($userId);

    $url = $settings->get('ns_url');
    $secret = $settings->get('ns_secret');

    if(!$url) {
      print "Nightscout is not configured for $userId\n";
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