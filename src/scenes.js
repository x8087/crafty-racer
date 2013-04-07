// Game scene
// -------------
Crafty.scene('Game', function() {
  this.pauseControl = Crafty.e('PauseControl');
  this.pauseControl.setName("PauseControl");

  Crafty.viewport.scroll('_x', 0);
  Crafty.viewport.scroll('_y', 0);

  Crafty.e("2D, Canvas, TiledMapBuilder").setMapDataSource( SOURCE_FROM_TILED_MAP_EDITOR )
    .createWorld( function( tiledmap ){

      // Set properties of entities on the 'Solid_Sides' layer
      for (var obstacle = 0; obstacle < tiledmap.getEntitiesInLayer('Solid_Sides').length; obstacle++){
        var entity = tiledmap.getEntitiesInLayer('Solid_Sides')[obstacle];

        //Set z-index for correct view: front, back
        entity.z = Math.floor(entity._y );

        // Set collision settings
        entity.addComponent("Collision, Solid")
        entity.collision( new Crafty.polygon([0,32],[64,0],[128,32],[64,64]) );

        // Hide collision marker
        if (entity.__image === "assets/Collision_Marker.png") {
          entity._visible = false;
        }
      }

      // Set properties of entities on the 'Solid_Tops' layer
      for (var obstacle = 0; obstacle < tiledmap.getEntitiesInLayer('Solid_Tops').length; obstacle++){

        //Set z-index for correct view: front, back
        var solidTop = tiledmap.getEntitiesInLayer('Solid_Tops')[obstacle];
        solidTop.z = Math.floor(solidTop._y + solidTop._h);
      }

    });

  this.player = Crafty.e('Car').at(1,7);
  this.player.setName("Player");

  Crafty.viewport.scroll('_x', Crafty.viewport.width/2 - this.player.x - this.player.w/2);
  Crafty.viewport.scroll('_y', Crafty.viewport.height/2 - this.player.y - this.player.h/2);

  Game.initLevel();

  // uncomment to show FPS
//  this.showFps = Crafty.e('ShowFPS');
//  this.showFps.setName("ShowFPS");

  // Show the victory screen once all waypoints are reached
  this.show_victory = function() {
    if (Game.isLevelComplete()) {
      Game.stopAllSoundsExcept('woop');
      Crafty.scene('Victory');
    } else {
      Game.nextWaypoint();
    }
  }
  this.bind('WaypointReached', this.show_victory);

  // Show the game over screen when time is up
  this.show_game_over = function() {
    Crafty.scene('GameOver');
  }
  this.bind('TimesUp', this.show_game_over);

  Game.playMusic();

}, function() {
  // Remove our event binding from above so that we don't
  //  end up having multiple redundant event watchers after
  //  multiple restarts of the game
  this.unbind('WaypointReached', this.show_victory);
  this.unbind('TimesUp', this.show_game_over);
});


// Loading scene
// -------------
Crafty.scene('Loading', function(){
  Crafty.e('2D, DOM, Text')
    .text('Loading; please wait...')
    .attr({ x: 0, y: Game.height()/2 - 24, w: Game.width() });

  Crafty.load([
    'assets/car.png',
    'assets/block.png',
    'assets/waypoint_animation.png',
    'assets/navigator.png',
    "assets/Iso_Cubes_01_128x128_Alt_00_003.png",
    "assets/Iso_Cubes_01_128x128_Alt_00_004.png"
  ], function(){
    Crafty.sprite(98, 'assets/car.png', {
      spr_car:  [6, 1]
    }, 0, 0);
    Crafty.sprite(96, 'assets/block.png', {
      spr_block:  [0, 0]
    }, 0, 0);
    Crafty.sprite(64, 'assets/waypoint_animation.png', {
      spr_waypoint:  [0, 0]
    }, 0, 0);
    Crafty.sprite(96, 'assets/navigator.png', {
      spr_navigator:  [0, 0]
    }, 0, 0);
    Crafty.scene('Game');
  })

  // Define our sounds for later use
  Crafty.audio.add({
    engine_idle:        ['assets/engine_idle.ogg'],
    engine_rev:         ['assets/engine_rev.ogg'],
    engine_rev_faster:  ['assets/engine_rev_faster.ogg'],
    wheel_spin:         ['assets/wheel_spin.ogg'],
    woop:               ['assets/woop.ogg'],
    music:              ['assets/Happy Bee.mp3']
  });

});

// Victory scene
// -------------
Crafty.scene('Victory', function() {

  this.levelCompleteControl = Crafty.e('LevelCompleteControl');
  this.levelCompleteControl.setName("LevelCompleteControl");

  Game.stopAllSoundsExcept();

}, function() {
});

// GameOver scene
// -------------
Crafty.scene('GameOver', function() {
  var timesUpText = Crafty.e('2D, DOM, Text');
  timesUpText.text('Times Up')
  var x = Crafty.viewport.width/2 - Crafty.viewport.x - 160;
  var y = Crafty.viewport.height/2 - Crafty.viewport.y - 60;
  timesUpText.attr({ x: x, y: y, w: 320 })
  timesUpText.textFont({ type: 'normal', weight: 'bold', size: '40px', family: 'Arial' })
  timesUpText.textColor('#0061FF');

  var gameOverText = Crafty.e('2D, DOM, Text');
  gameOverText.text('GAME OVER!')
  x = Crafty.viewport.width/2 - Crafty.viewport.x - 160;
  y = Crafty.viewport.height/2 - Crafty.viewport.y - 20;
  gameOverText.attr({ x: x, y: y, w: 320 })
  gameOverText.textFont({ type: 'normal', weight: 'bold', size: '50px', family: 'Arial' })
  gameOverText.textColor('#0061FF');

  var pressAnyKey = Crafty.e('2D, DOM, FlashingText');
  pressAnyKey.attr({ x: x, y: y + 60, w: 320 })
  pressAnyKey.text("PRESS ANY KEY TO CONTINUE");
  pressAnyKey.textFont({ type: 'normal', weight: 'normal', size: '20px', family: 'Arial' })
  pressAnyKey.textColor('#0061FF');

  // After a short delay, watch for the player to press a key, then restart
  // the game when a key is pressed
  var delay = true;
  setTimeout(function() { delay = false; }, 1000);

  this.restart_game = function() {
    if (!delay) {
      Crafty.scene('Game');
    }
  };
  Crafty.bind('KeyDown', this.restart_game);

  Game.stopAllSoundsExcept();

}, function() {
  // Remove our event binding from above so that we don't
  //  end up having multiple redundant event watchers after
  //  multiple restarts of the game
  this.unbind('KeyDown', this.restart_game);
});
