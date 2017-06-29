<?php

namespace Diab;

date_default_timezone_set('UTC');
error_reporting(E_ALL & ~E_DEPRECATED);

include __DIR__."/config.php";
include __DIR__."/db.php";
include __DIR__."/util.php";

include __DIR__."/dish.php";
include __DIR__."/meal.php";
include __DIR__."/serving.php";
include __DIR__."/settings.php";