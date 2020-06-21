<?php

$config = require(__DIR__.'/config.php');

return [
  'paths' => [
    'migrations' => '%%PHINX_CONFIG_DIR%%/db/migrations'
  ],
  'environments' => [
    'default_database' => 'development',
    'development' => [
      'adapter' => 'mysql',
      'host' => $config['db']['host'],
      'user' => $config['db']['user'],
      'pass' => $config['db']['password'],
      'name' => $config['db']['dbname']
    ]
  ]
];
