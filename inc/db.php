<?php

namespace Diab;

class DB {
  var $handle = null;

  private static $_inst = null;

  public $last_query = "";
  private $table_prefix = "";

  private $cache = array();

  public static function inst() {
    if(!self::$_inst) {
      $dbConfig = Config::get("db");
      self::$_inst = new DB(
        $dbConfig["host"], $dbConfig["user"], $dbConfig["password"], $dbConfig["dbname"]
      );
    }
    return self::$_inst;
  }

  function __construct($host, $login, $pass, $db, $table_prefix = "")
  {
    $this->host = $host;
    $this->login = $login;
    $this->pass = $pass;
    $this->db = $db;
    $this->table_prefix = $table_prefix;

    $this->init();
  }

  function init() {
    $startTime = microtime(true);
    if ($this->host[0] === ':') {
      $this->handle = new \mysqli('localhost', $this->login, $this->pass, $this->db, 0, substr($this->host, 1));
    } else {
      $this->handle = new \mysqli($this->host, $this->login, $this->pass, $this->db);
    }
    $this->handle->set_charset("utf8");
    $elapsedTime = microtime(true) - $startTime;
    if(defined("EVER_DB_PROFILE")) {
      print "\n--------\n";
      print "Connect time: {$elapsedTime}s\n";
      print "\n--------\n";
    }
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
              $value = "'".$this->handle->escape_string( str_replace("\\", "\\\\", $value) )."'";
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
    $qr = $this->handle->query($q);
    $elapsedTime = microtime(true) - $startTime;
    if(defined("EVER_DB_PROFILE")) {
      print "\n--------\n";
      print "$q\n";
      print "Took: {$elapsedTime}s\n";
      print "\n--------\n";
    }
    if(!$qr) {
      if(defined("EVER_MYSQL_ERRORS")) {
        trigger_error($this->handle->error." in $q");
      }
      //mysql_close($this->handle);
      //$this->init();
      $qr = $this->handle->query($q);
    }
    return $qr;
  }

  function assoc($q, $params = array())
  {
    $data = $this->q($q, $params)->fetch_assoc();

    return $data;
  }

  function first($q, $params = array())
  {
    $qr = $this->q($q, $params);
    if(!$qr)
      return false;
    $r = $qr->fetch_array()[0];

    return $r;
  }

  function to_array($q, $params = array())
  {

    $qr = $this->q($q, $params);
    return $qr->fetch_all(MYSQLI_ASSOC);
  }

  function id()
  {
    return $this->handle->insert_id;
  }

  function close()
  {
    $this->handle->close();
  }

  // Parametrized methods

  private function _make_set_data( $data, $separator ){
    $result = array();
    foreach($data as $k=>$v){
      $result[] = "`$k` = '".$this->handle->escape_string($v)."'";
    }
    return implode($separator, $result);
  }

  public function escape_str($str) {
    return $this->handle->escape_string($str);
  }

  private function _make_fields_data( $data, $separator ){
    $result = array();
    foreach($data as $v){
      $result[] = "`$v`";
    }
    return implode($separator, $result);
  }

  private function _p_filter_fields( $table, $data ){
    $query = "SHOW COLUMNS FROM `$table`";
    $fields = array();
    foreach( $this->to_array($query) as $field ){
      $fields[] = strtolower( $field["Field"] );
    }

    foreach( $data as $k => $v ){

      if( !in_array(strtolower($k), $fields) ){
        unset( $data[$k] );
      }

    }

    return $data;
  }

  public function p_update( $table, $data, $where ){

    $data = $this->_p_filter_fields( $table, $data );

    $data_str = $this->_make_set_data($data, ", ");
    $where_str = $this->_make_set_data($where, " AND ");

    $query = "
      UPDATE
        `$table`
      SET
        $data_str
      WHERE
        $where_str
    ";


    return $this->q($query);

  }


  public function p_get($table, $fields, $where){



    $fields_str = $this->_make_fields_data($fields, ", ");
    $where = $this->_make_set_data($where, " AND ");

    if(empty($where)){
      $where = "1=1";
    }


    $query = "
      SELECT
        $fields_str
      FROM
        `$table`
      WHERE
        $where
    ";


    return $this->to_array($query);

  }

  public function p_insert($table, $data){

    $data = $this->_p_filter_fields( $table, $data );

    $data_str = $this->_make_set_data($data, ", ");

    $query = "
      INSERT IGNORE INTO
        `$table`
        SET $data_str
    ";

    if($this->q($query)){
      return $this->id();
    }

    return false;
  }
}