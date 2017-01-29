<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, minimal-ui">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<title>My App</title>

<link rel="stylesheet" href="css/framework7/framework7.ios.min.css">
<link rel="stylesheet" href="css/framework7/framework7.ios.colors.min.css">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">

<link rel="stylesheet" href="css/app.css">
</head>
<body>

  <div class="statusbar-overlay"></div>

  <div class="panel-overlay"></div>

  <div class="panel panel-left panel-reveal">
    <div class="content-block">
      <p>Left panel content goes here</p>
    </div>
  </div>

  <div class="panel panel-right panel-cover">
    <div class="content-block">
      <p>Right panel content goes here</p>
    </div>
  </div>

  <div class="views tabs toolbar-through">
    <div class="tab active view navbar-fixed" id="calc-view">
      <div class="navbar">
        <div id="list-navbar" class="navbar-inner"></div>
      </div>
      <div class="pages">
        <div class="page"></div>
      </div>
    </div>
    <div class="tab view navbar-fixed" id="dishes-view">
      <div class="navbar">
        <div id="list-navbar" class="navbar-inner"></div>
      </div>
      <div class="pages">
        <div class="page"></div>
      </div>
    </div>
    <div class="tab view navbar-fixed" id="history-view">
      <div class="navbar">
        <div id="list-navbar" class="navbar-inner"></div>
      </div>
      <div class="pages">
        <div class="page"></div>
      </div>
    </div>
    <div class="tab view navbar-fixed" id="settings-view">
      <div class="navbar">
        <div id="list-navbar" class="navbar-inner"></div>
      </div>
      <div class="pages">
        <div class="page"></div>
      </div>
    </div>
    <div class="toolbar tabbar tabbar-labels">
      <div class="toolbar-inner">
        <a href="#calc-view" class="tab-link active">
          <i class="fa fa-calculator"></i><span class="tabbar-label">Рассчет</span>
        </a>
        <a href="#dishes-view" class="tab-link">
          <i class="fa fa-book"></i><span class="tabbar-label">Блюда</span>
        </a>
        <a href="#history-view" class="tab-link">
          <i class="fa fa-history"></i><span class="tabbar-label">История</span>
        </a>
        <a href="#settings-view" class="tab-link">
          <i class="fa fa-cog"></i><span class="tabbar-label">Настройки</span>
        </a>
      </div>
    </div>
  </div>

  <?php include __DIR__."/direct_body_elems.php" ?>

  <script type="text/javascript" src="js/framework7/framework7.min.js"></script>
  <script type="text/javascript" src="js/bundle.js?<?php echo time() ?>"></script>

</body>
</html>