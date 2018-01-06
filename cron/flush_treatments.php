<?php

namespace Diab;

include dirname(__DIR__).'/inc/header.php';

$ns = new NightScout();
$ns->flushTreatmentsIfNeed();