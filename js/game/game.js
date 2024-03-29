/**
 * Script responsible for basic game mechanics.
 *
 * Author: Tomas Mudrunka
 */

define(["player","shoot","enemyGenerator"], function(Player, Shoot, EnemyGenerator) {
	// background image pattern
	var bgImg = new Image();
	bgImg.src = 'img/game/bg-texture.jpg';

	/** The Game object. */
	function Game() {
		this.playground = $('#playground');

		var width = $(window).width() - 10;
		var height = $(window).height() - 51;

		this.stage = new Kinetic.Stage({
			container: 'playground',
			width: width,
			height: height
		});

		this.background = new Kinetic.Rect({
			x: 0,
			y: 0,
			width: width,
			height: height,
			stroke: 'black',
			strokeWidth: 4,
			fillPatternImage: bgImg
		});
		this.foreground = new Kinetic.Rect({
			x: 0,
			y: 0,
			width: width,
			height: height,
			fill: 'black',
			opacity: 0.5
		});

		this.firstLayer = new Kinetic.Layer();
		this.mainLayer = new Kinetic.Layer();
		this.lastLayer = new Kinetic.Layer();

		this.text = new Kinetic.Text({
			x: 10,
			y: 10,
			fontSize: 30,
			fontStyle: 'bold',
			text: 'Start the game (menu->new game) or select new words if\n you do not want to use the defaults (settings->code words).\nDefault is math without dot.',
			fill: '#357735',
			shadowColor: 'gray'
		});

		this.user = null;

		this.playerGroup = new Kinetic.Group();
		this.player = new Player();
		this.playerHP = 0;

		this.shootGroup = new Kinetic.Group();
		this.shoot = new Shoot();

		this.enemyGroup = new Kinetic.Group();
		this.enemyGenerator = new EnemyGenerator();

		this.textVisible = true;
		this.difficulty = 1;
		this.math = true;
		this.advancedMath = true;

		this.gameTime = null;
		this.gamePauseTime = null;
		this.gameOverCallback = null;
	}

	/**
	 * The Game initialization.
	 */
	Game.prototype.init = function() {
		var self = this;
		var player = this.player;
		var shoot = this.shoot;
		var generator = this.enemyGenerator;

		// bind all layers
		this.firstLayer.add(this.background);
		this.mainLayer.add(this.shootGroup);
		this.mainLayer.add(this.enemyGroup);
		this.mainLayer.add(this.playerGroup);
		this.mainLayer.add(this.text);
		this.lastLayer.add(this.foreground);

		this.refreshIntervalId = null;
		this.paused = false;

		var E1 = 0.05; // epsilon for angle comparison
		var E2 = 40.0; // epsilon for position comparison

		// create callback for shooting
		player.shootCallback = function(points) {
			shoot.renderShoot(points);
/*
			var enemies = generator.getEnemies();

			var x = points[2], y = points[3];
			var p = player.getPosition();

			var angle = Math.atan((y - p.y) / (x - p.x));
			if (x >= p.x) {
				angle = -angle;
			}

			// iterate over all enemies
			for (var i = 0; i < enemies.length; i++) {
				var e = enemies[i].getPosition();
				var a = Math.atan((e.y - p.y) / (e.x - p.x));
				if (e.x >= p.x) {
					a = -a;
				}
				if (angle - E1 < a && a < angle + E1) {
					generator.handleEnemyHit(i);
				}
			}
*/
		};

		player.init(this.mainLayer, this.playerGroup, this.foreground, this.playground);

		shoot.init(this.shootGroup, this.foreground);

		// create callbacks for enemy generator
		var attackCallback = function(x, y, enemy) {
			var p = player.getPosition();
			if (x - E2 < p.x && p.x < x + E2 && y - E2 < p.y && p.y < y + E2) {
				var id = self.enemyGenerator.getEnemyId(enemy);
				self.enemyGenerator.error(id);
				self.enemyGenerator.killEnemy(id);
				
				player.showDamage();
				self.playerHP-=10;//enemy attacks only once and explodes
				if (self.playerHP <= 0) {
					self.enemyGenerator.stopSpeaking();
					self.endGame();
				}
				//self.refreshText();
			}
		};
		
		var goToCallback = function() {
			this.goTo(player.getPosition());
			//self.refreshText();
		};


		var levels = [];
		var level = [];
		var next = true;
		var index = 1;

		generator.init(this.mainLayer, this.enemyGroup, this.foreground, this.playground, this.player, this.textVisible, this.math, this.advancedMath, attackCallback, goToCallback);

		//needs --allow-file-access-from-files for chrome (or via http)
		while(next)
		{
			jQuery.ajax({
				url: 'words/level'+index+'.txt',
				success: function (result) {
					self.addLevel(result.replace(/\r/g, "\n"));
					index++;
				},
				error: function(result){
					next=false;
				}
				,
				async: false
			});
		}

		// add layers to the stage
		this.stage.add(this.firstLayer);
		this.stage.add(this.mainLayer);
		this.stage.add(this.lastLayer);

		bgImg.onload = function() {
			self.firstLayer.draw();
		};

	};

	/**
	 * Begins new game (also re-start).
	 */
	Game.prototype.beginNewGame = function() {
		// clean-up before start
		this.playerHP = 50;
		this.player.setSpeed(this.playerSpeed);
		this.enemyGroup.removeChildren();
		this.enemyGenerator.clean();
		this.enemyGenerator.setDifficulty(this.difficulty);
		self = this;

		// start new game
		if(!this.enemyGenerator.start())
		{
			return;
		}
		this.player.gameBegin();
		this.gameTime = new Date().getTime();
		this.gamePauseTime = null;

		this.refreshIntervalId = setInterval(function() {
			self.refreshText();
		}, 250);		

		this.foreground.setOpacity(0.0);
		this.lastLayer.draw();
	};

	/**
	 * Ends current game, terminates the Player.
	 */
	Game.prototype.endGame = function() {
		this.player.gameOver();
		if (this.refreshIntervalId != null) {
			clearInterval(this.refreshIntervalId);
			this.refreshIntervalId = null;
		}

		if (this.gameOverCallback) {
			var self = this;
			var result = {
				user: this.user,
				speed: this.player.speed,
				difficulty: this.enemyGenerator.difficulty,
				time: new Date().getTime() - this.gameTime,
				kills: this.enemyGenerator.killCount,
				score: this.getScore()
			};
			setTimeout(function() {
				self.pause();
				self.gameOverCallback(result);
			}, 3000);
		}
	};

	/**
	 * Will play/resume the game.
	 */
	Game.prototype.play = function() {
		this.paused = false;
		this.player.start();
		this.enemyGenerator.start();

		if (this.gamePauseTime) {
			this.gameTime += new Date().getTime() - this.gamePauseTime;
			this.gamePauseTime = null;
		}
		this.refreshIntervalId = setInterval(function() {
			self.refreshText();
		}, 250);		

		this.foreground.setOpacity(0.0);
		this.lastLayer.draw();
	};

	/**
	 * Will pause the game.
	 */
	Game.prototype.pause = function() {
		this.paused = true;
		this.player.stop();
		this.enemyGenerator.stop();

		this.gamePauseTime = new Date().getTime();

		if (this.refreshIntervalId != null) {
			clearInterval(this.refreshIntervalId);
			this.refreshIntervalId = null;
		}

		this.foreground.setOpacity(0.5);
		this.lastLayer.draw();
	};

	Game.prototype.getScore = function()
	{
		var time = Math.round((new Date().getTime() - this.gameTime) / 100) / 10;
		return Math.ceil(100.0*this.enemyGenerator.killCount/time*(!this.textVisible? 1.5:1.0));
	};

	Game.prototype.setSpawnCount = function(count) {
		this.enemyGenerator.setSpawnCount(count);
	};

	/**
	 * Renders up-to-date text with username and HP.
	 */
	Game.prototype.refreshText = function() {
		var username = (this.user) ? this.user.name : 'Player';
		this.text.setText(username + ' HP: ' + this.playerHP + ' Score: ' + this.getScore());

		this.mainLayer.draw();
	};

	/**
	 * Sets current user/player.
	 * @param user User object
	 */
	Game.prototype.setUser = function(user) {
		this.user = user;
	};

	/**
	 * Sets moving speed of the Player.
	 * @param speed number > 0
	 */
	Game.prototype.setTextVisible = function(visible) {
		this.textVisible = visible;
		this.enemyGenerator.setTextVisible(visible);
	};

	Game.prototype.setMath = function(math) {
		this.math = math;
		this.enemyGenerator.setMath(math);
	};	
	
	Game.prototype.setAdvancedMath = function(advancedMath) {
		this.math = advancedMath;
		this.enemyGenerator.setAdvancedMath(advancedMath);
	};

	Game.prototype.getErrors = function(advancedMath) {
		return this.enemyGenerator.getErrors();
	};

	/**
	 * Sets initial difficulty of enemies.
	 * @param difficulty number > 0
	 */
	Game.prototype.setDifficulty = function(difficulty) {
		this.difficulty = difficulty
	};

	Game.prototype.clearLevels = function() {
		this.enemyGenerator.clearLevels();
	};

	Game.prototype.addLevel = function(level) {
		this.enemyGenerator.addLevel(level.split(/\r?\n/).filter(x => x !== ""));
	};


	/**
	 * Resize the playground.
	 * @param width new width
	 * @param height new height
	 */
	Game.prototype.resizePlayground = function(width, height) {
		this.stage.setWidth(width);
		this.stage.setHeight(height);
		this.background.setWidth(width);
		this.background.setHeight(height);
		this.foreground.setWidth(width);
		this.foreground.setHeight(height);
		this.player.setPos(width/2,height/2);

		this.stage.draw();
	};

	return Game;
});
