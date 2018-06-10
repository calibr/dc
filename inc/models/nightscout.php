<?php

namespace Diab;

use Ramsey\Uuid\Uuid;

class NightScout extends Model {
  const ENTERED_BY = 'boluscalc';

  // delay after adding treatments after which they should be flushed to nightscout
  // TODO make it configurable
  private $treatmentDelay = 300;
  public function flushTreatmentsIfNeed() {
    $now = time();
    $maxTime = $now - $this->treatmentDelay;
    $rows = DB::inst()->to_array("SELECT user_id FROM `treatments_buffer` WHERE `time` < #d GROUP BY user_id", [$maxTime]);
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
      $t = json_decode($row['json'], true);
      $t['time'] = intval($row['time']);
      return $t;
    }, $rows);
    // now only merge carbs and notes fields
    $result = array_shift($treatments);
    // need to save minimum time among treatments
    $minTime = $result['time'];
    foreach($treatments as $treatment) {
      if($treatment['time'] < $minTime) {
        $minTime = $treatment['time'];
      }
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
    if(!empty($result['carbs'])) {
      // round carbs to integer
      $result['carbs'] = round($result['carbs']);
    }
    $result['time'] = $minTime;
    $result['created_at'] = gmdate(DATE_ISO8601, $minTime);
    DB::inst()->q('DELETE FROM `treatments_buffer` WHERE `id` IN ('.implode(',', $ids).')');
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
    $data['timestamp'] = $data['time'] * 1000;
    $data['eventType'] = '<none>';
    $data['enteredBy'] = self::ENTERED_BY;
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
  public function getTreatments($startDayTimestamp, $endDayTimestamp, $query = []) {
    $settings = new Settings($this->userId);

    $url = $settings->get('ns_url');
    $secret = $settings->get('ns_secret');
    if(!$url) {
      // nightscout is not configured
      return;
    }
    $query = array_merge($query, [
      // created_at must be in UTC
      'find[created_at][$gte]' => date('Y-m-d', $startDayTimestamp).'T00:00:00',
      'find[created_at][$lte]' => date('Y-m-d', $endDayTimestamp).'T23:59:59'
    ]);
    $ch = curl_init();
    curl_setopt_array($ch, [
      CURLOPT_URL => "$url/api/v1/treatments.json?".http_build_query($query),
      CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'api-secret: '.sha1($secret)
      ],
      CURLOPT_RETURNTRANSFER => true
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    $parsed = json_decode($response);
    return $parsed;
  }
  public function getBloodSugars($startDayTimestamp, $endDayTimestamp, $timeZoneOffset, $query = []) {
    $settings = new Settings($this->userId);

    $url = $settings->get('ns_url');
    $secret = $settings->get('ns_secret');
    if(!$url) {
      // nightscout is not configured
      return;
    }
    $time = new Time();
    $startDayUser = $time->convertDateTo('@'.$startDayTimestamp, $timeZoneOffset, 'date');
    $endDayUser = $time->convertDateTo('@'.$endDayTimestamp, $timeZoneOffset, 'date');
    $query = array_merge($query, [
      // dateString in local user time, need to convert
      'find[dateString][$gte]' => $startDayUser.'T00:00:00',
      'find[dateString][$lte]' => $endDayUser.'T23:59:59',
      // sugar records for a year max
      'count' => 8640 * 12
    ]);
    $ch = curl_init();
    curl_setopt_array($ch, [
      CURLOPT_URL => "$url/api/v1/entries/sgv.json?".http_build_query($query),
      CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'api-secret: '.sha1($secret)
      ],
      CURLOPT_RETURNTRANSFER => true
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    $parsed = json_decode($response);
    return $parsed;
  }
}