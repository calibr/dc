<?php

namespace Diab;

require "../inc/header.php";

$session = new Session();

header('Content-Type: text/json; charset=utf8');

try {
  if(!isset($_GET['a'])) {
    throw new Error('a is required');
  }
  if(substr_count($_GET['a'], '/') !== 1) {
    throw new Error('a has wrong format');
  }
  list($controller, $action) = explode('/', $_GET['a']);
  $controllerClassName = 'Diab\\'.$controller.'Controller';
  if(!class_exists($controllerClassName)) {
    throw new Error('unknown controller');
  }

  $context = new Context();
  $context->session = $session;
  if($session->get('userId')) {
    $context->userId = intval($session->get('userId'));
  }
  $controllerInst = new $controllerClassName($context);
  if(!$controllerInst->isAccessAllowed($action)) {
    throw new Error('access denied');
  }
  $methodName = 'action'.$action;
  if(!method_exists($controllerInst, $methodName)) {
    throw new Error('unknown action');
  }
  $res = $controllerInst->{$methodName}();
  print json_encode($res);
}
catch(\Exception $ex) {
  $message = 'Something wrong, shut the light...';
  $code = '';
  if($ex instanceof Error) {
    $message = $ex->getMessage();
    $code = $ex->codeStr;
  }
  print json_encode(['error' => $message, 'errorCode' => $code]);
}