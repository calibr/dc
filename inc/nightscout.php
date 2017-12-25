<?php

namespace Diab;

use Ramsey\Uuid\Uuid;

class NightScout {
  public function addTreatment($data) {
    $data['timestamp'] = time() * 1000;
    $data['eventType'] = '<none>';
    $data['enteredBy'] = 'boluscalc';
    $data['uuid'] = Uuid::uuid4();
    $nsConfig = Config::get('nightscout');
    $ch = curl_init();
    curl_setopt_array($ch, [
      CURLOPT_URL => $nsConfig['url']."/api/v1/treatments.json",
      CURLOPT_POST => true,
      CURLOPT_POSTFIELDS => json_encode($data),
      CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'api-secret: '.sha1($nsConfig['secret'])
      ],
      CURLOPT_RETURNTRANSFER => true
    ]);
    $response = curl_exec($ch);
    curl_close($ch);
    $parsed = json_decode($response);
    if($parsed && is_array($parsed)) {
      $parsed = $parsed[0];
    }
    return $parsed;
  }
}