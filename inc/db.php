<?php

namespace Diab;

class DB {
  var $handle = null;

  public $last_query = "";
  private $table_prefix = "";

  private $cache = array();

  private static $_inst;
  public static function inst() {
    if(!self::$_inst) {
      $dbConfig = Config::get("db");
      self::$_inst = new DB(
        $dbConfig["host"], $dbConfig["user"], $dbConfig["password"], $dbConfig["dbname"]
      );
    }
    return self::$_inst;
  }

  function __construct($host, $login, $pass, $db, $table_prefix = "") {
    $this->host = $host;
    $this->login = $login;
    $this->pass = $pass;
    $this->db = $db;
    $this->table_prefix = $table_prefix;

    $this->init();
  }

  function escKey($key) {
    return str_replace("`", "", $key);
  }

  function init() {
    $startTime = microtime(true);
    $this->handle = mysql_connect($this->host, $this->login, $this->pass, true);
    mysql_select_db($this->db, $this->handle);
    $this->q("SET NAMES UTF8MB4");
  }

  function qr($q, $params = array()) {
    return new Ever_DB_Qr($this->q($q, $params));
  }

  function q($q, $params = array())
  {

    if($params) {
      preg_match_all("@#([sdf])@", $q, $matches);

    //  print $q;

      foreach($matches[1] as $match){

        if(empty($params)){
          die("DB request failed!");
        }

        $value = array_shift( $params );
        switch($match){
          case "s":
            if(!get_magic_quotes_gpc()){
              $value = "'".mysql_real_escape_string( str_replace("\\", "\\\\", $value), $this->handle )."'";
            }
            else{
              $value = "'$value'";
            }
          break;
          case "d":
            $value = (int)$value;
          break;
          case "f":
            $value = "'".((float)$value)."'";
          break;
        }

        $value = str_replace("$", "\\$", $value);

        $q = preg_replace("@#$match@", $value, $q, 1);
      }

    }

    $q = str_replace( "#p", $this->table_prefix, $q );

    $this->last_query = $q;

    $startTime = microtime(true);
    $qr = mysql_query($q, $this->handle);
    $elapsedTime = microtime(true) - $startTime;
    if(defined("EVER_DB_PROFILE")) {
      print "\n--------\n";
      print "$q\n";
      print "Took: {$elapsedTime}s\n";
      print "\n--------\n";
    }
    if(!$qr) {
      if(defined("EVER_MYSQL_ERRORS")) {
        trigger_error(mysql_error($this->handle)." in $q");
      }
      //mysql_close($this->handle);
      //$this->init();
      $qr = mysql_query($q, $this->handle);
    }
    return $qr;
  }

  function assoc($q, $params = array())
  {
    $data = mysql_fetch_assoc($this->q($q, $params));

    return $data;
  }

  function first($q, $params = array())
  {
    $qr = $this->q($q, $params);
    if(!$qr)
      return false;
    $r = @mysql_result($qr ,0);

    return $r;
  }

  function to_array($q, $params = array()) {

    $qr = $this->q($q, $params);
    $data = array();
    while($d = mysql_fetch_assoc($qr))
      $data[] = $d;

    return $data;
  }

  function id() {
    return mysql_insert_id($this->handle);
  }
}