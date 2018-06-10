<?php

namespace Diab;

date_default_timezone_set('UTC');
error_reporting(E_ALL & ~E_DEPRECATED);

require dirname(__DIR__)."/vendor/autoload.php";

include __DIR__."/config.php";
include __DIR__."/db.php";
include __DIR__."/util.php";
include __DIR__."/model.php";
include __DIR__."/controller.php";
include __DIR__."/session.php";
include __DIR__."/context.php";
include __DIR__."/time.php";
include __DIR__."/reportgenerator.php";

include __DIR__."/controllers/dish.php";
include __DIR__."/controllers/meal.php";
include __DIR__."/controllers/nightscout.php";
include __DIR__."/controllers/serving.php";
include __DIR__."/controllers/settings.php";
include __DIR__."/controllers/stt.php";
include __DIR__."/controllers/auth.php";
include __DIR__."/controllers/history.php";

include __DIR__."/models/dish.php";
include __DIR__."/models/meal.php";
include __DIR__."/models/nightscout.php";
include __DIR__."/models/serving.php";
include __DIR__."/models/settings.php";
include __DIR__."/models/stt.php";
include __DIR__."/models/user.php";

include __DIR__."/errors/error.php";
include __DIR__."/errors/validation.php";
include __DIR__."/errors/notfound.php";