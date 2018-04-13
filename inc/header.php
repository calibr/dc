<?php

namespace Diab;

date_default_timezone_set('UTC');
error_reporting(E_ALL & ~E_DEPRECATED);

require dirname(__DIR__)."/vendor/autoload.php";

include __DIR__."/config.php";
include __DIR__."/db.php";
include __DIR__."/util.php";

include __DIR__."/dish.php";
include __DIR__."/meal.php";
include __DIR__."/serving.php";
include __DIR__."/settings.php";
include __DIR__."/nightscout.php";
include __DIR__."/stt.php";