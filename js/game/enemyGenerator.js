/**
 * Script responsible for generating new enemies and
 * handling game events associated with enemies.
 *
 * Author: Tomas Mudrunka
 */

define(["enemy"], function(Enemy) {
	// Enemy-Generator constants
	this.generateInterval = 25000;
	var speedMultiplier = 1.0;
	var healthMultiplier = 3.0;
	var goToIntLength = 10; //was 10
	var killThreshold = 4;

	/** The Enemy-Generator object. */
	function EnemyGenerator() {
		this.enemyLayer = null;
		this.enemyGroup = null;
		this.foreground = null;
		this.playground = null;

		this.attackCallback = null;
		this.goToCallback = null;

		this.enemies = [];
		this.enemiesData = [];
		this.player = null;
		this.levels = [];
		this.speak = [];

		this.difficulty = 0.3;
		this.killCount = 0;
		this.textVisible = true;

		this.cleanerQueue = [];

		this.generatorIntId = null;
		this.enemyGoToIntId = null;
		this.cleanerIntId = null;
		this.generateNumber = 1;
		}

	/**
	 * The Enemy-Generator initialization.
	 * @param enemyLayer KineticJS Layer
	 * @param enemyGroup KineticJS Group
	 * @param foreground object used to get dimensions
	 * @param attackCallback callback for enemy attacks
	 * @param goToCallback callback for go-to target
	 */
	EnemyGenerator.prototype.init = function(enemyLayer, enemyGroup, foreground, playground, player, textVisible, attackCallback, goToCallback) {
		this.enemyLayer = enemyLayer;
		this.enemyGroup = enemyGroup;
		this.foreground = foreground;
		this.attackCallback = attackCallback;
		this.goToCallback = goToCallback;
		this.playground = playground;
		this.player = player;
		this.textVisible = textVisible;
	};

	EnemyGenerator.prototype.clearLevels = function() {
		this.levels = [];
	};

	EnemyGenerator.prototype.addLevel = function(level) {
		this.levels.push(level);
	};	

	EnemyGenerator.prototype.setSpawnCount = function(count) {
		this.generateNumber = count;
	};

	EnemyGenerator.prototype.setTextVisible = function(textVisible) {
		this.textVisible = textVisible;
	};

	EnemyGenerator.prototype.speakNext = function() {
			if(this.speak.length<=0)
			return;

		var word = this.speak.splice(0,1);
		this.speakNow(word);
	};

	EnemyGenerator.prototype.speakNow = function(word) {
		if ('speechSynthesis' in window) {
			var msg = new SpeechSynthesisUtterance();
			msg.text = word;
			var generator = this;
			msg.onend = function (event) {
				generator.speakNext();
			}
			window.speechSynthesis.speak(msg);		
		}
	};

	EnemyGenerator.prototype.speakWord = function(word) {
		if(this.speak.length < 10)
		{
			this.speak.push(word);
			//discard if there are too many
		}
		if ('speechSynthesis' in window) {
			if(!window.speechSynthesis.speaking)
				this.speakNext();
		}		
	};

	EnemyGenerator.prototype.removeWord = function(word) {
		this.speak=this.speak.filter(x => x !== word);
	}

	/**
	 * Performs clean-up of the enemy generator.
	 */
	EnemyGenerator.prototype.clean = function() {
		// set-up cleaner interval
		var queue = this.cleanerQueue;
		
		for (var i = 0; i < queue.length; i++) {
			if (queue[i].timeout-- <= 0) {
				queue[i].enemy.destroy();
				queue.splice(i, 1);
				i--;
			}
		}

		for (var i = 0; i < this.enemies.length; i++) {
			this.enemies[i].destroy();
		}
		this.enemies = [];
		this.speak = [];
		this.enemiesData = [];

		this.killCount = 0;

		this.cleanerQueue = [];

		if (this.generatorIntId != null) {
			clearInterval(this.generatorIntId);
			this.generatorIntId = null;
		}
		if (this.enemyGoToIntId != null) {
			clearInterval(this.enemyGoToIntId);
			this.enemyGoToIntId = null;
		}
		if (this.cleanerIntId != null) {
			clearInterval(this.cleanerIntId);
			this.cleanerIntId = null;
		}
	};


	EnemyGenerator.prototype.stopSpeaking = function() {
		this.speak = [];
		for (var i = 0; i < this.enemies.length; i++) {
			this.enemies[i].stopSpeaking();
		}	
	};

	/**
	 * Starts generating new enemies and starts all enemies.
	 */
	EnemyGenerator.prototype.start = function() {
		var self = this;

		if(this.levels.length==0)
		{
			alert("Please upload a set of words (one word per line text files, see e.g. 'words/level1.txt') in menu settings->code words to be used for the game. Afterwards, go to 'Menu->Begin New Game' to start (or create a user in the Users menu if you want to track your high score).");
			return false;
		}		

		// set-up enemy-generator interval
		this.generatorIntId = setInterval(function() {
			self.newEnemies(this.generateNumber);
		}, generateInterval);

		// set-up enemy-go-to interval
		var data = this.enemiesData;
		this.enemyGoToIntId = setInterval(function() {
			for (var i = 0; i < data.length; i++) {
				if (data[i].timeout-- <= 0) {
					data[i].timeout = data[i].intLength;
					self.goToCallback.call(self.enemies[i]);
				}
			}
		}, 300);

		// set-up cleaner interval
		var queue = this.cleanerQueue;
		this.cleanerIntId = setInterval(function() {
			for (var i = 0; i < queue.length; i++) {
				if (queue[i].timeout-- <= 0) {
					queue[i].enemy.destroy();
					queue.splice(i, 1);
					i--;
				}
			}
		}, 500);

		// start-up enemies
		for (var i = 0; i < this.enemies.length; i++) {
			this.enemies[i].start();
		}
		this.newEnemies(this.generateNumber);
		return true;
	};

	/**
	 * Stops generating new enemies and stops all enemies.
	 */
	EnemyGenerator.prototype.stop = function() {
		if (this.generatorIntId != null) {
			clearInterval(this.generatorIntId);
			this.generatorIntId = null;
		}
		if (this.enemyGoToIntId != null) {
			clearInterval(this.enemyGoToIntId);
			this.enemyGoToIntId = null;
		}
		if (this.cleanerIntId != null) {
			clearInterval(this.cleanerIntId);
			this.cleanerIntId = null;
		}

		for (var i = 0; i < this.enemies.length; i++) {
			this.enemies[i].stop();
		}
	};

	EnemyGenerator.prototype.killEnemy = function(id){
		this.enemies[id].showDeath();

		// schedule clean-up of the enemy
		this.cleanerQueue.push({
			enemy: this.enemies[id],
			timeout: 6
		});

		this.enemies.splice(id, 1);
		this.enemiesData.splice(id, 1);

		if(this.allDead())
		{
			this.newEnemies(this.generateNumber);
		}		
	};

	/**
	 * Handles the enemy-hit event, decreases its HP.
	 * @param id numeric id/index of the enemy
	 */
	EnemyGenerator.prototype.handleEnemyHit = function(id) {
		this.enemies[id].showDamage();
		this.player.shootat(this.enemies[id].getPosition().x,this.enemies[id].getPosition().y);

		if (this.enemies[id].isDead()) {
			// the enemy was killed
			this.killEnemy(id);

			if (++this.killCount % killThreshold == 0) {
				this.incrementDifficulty();
			}
		}

	};

	EnemyGenerator.prototype.allDead = function() {
		for (var i = 0; i < this.enemies.length; i++) {
			if(!this.enemies[i].isDead())
				return false;
		}
		return true;
	};

	/**
	 * Returns an array of all enemies in the game.
	 * @returns {Array} Enemy array
	 */
	EnemyGenerator.prototype.getEnemies = function() {
		return this.enemies;
	};

	EnemyGenerator.prototype.getEnemyId = function(enemy) {
		var pos = enemy.getPosition();
		for (var i = 0; i < this.enemies.length; i++) {
			var ipos = this.enemies[i].getPosition()
			if(ipos.x == pos.x && ipos.y == pos.y && this.enemies[i].getText() === enemy.getText())
			{
				return i;
			}
		}
		return 0;
	}		

	/**
	 * Creates given number of Enemies with random position.
	 * @param number number of new enemies
	 */
	EnemyGenerator.prototype.newEnemies = function(number) {
		for (var i = 0; i < number; i++) {
			this.newRandomEnemy();
		}
	};

	/**
	 * Creates new instance of Enemy with random position.
	 * @returns Enemy new Enemy
	 */
	EnemyGenerator.prototype.newRandomEnemy = function() {
		var x, y;
		if (Math.random() < 0.5) {
			x = Math.random() * this.foreground.getWidth();
			y = (Math.random() < 0.5) ? 0 : this.foreground.getHeight();
		} else {
			x = (Math.random() < 0.5) ? 0 : this.foreground.getWidth();
			y = Math.random() * this.foreground.getHeight();
		}

		return this.newEnemy(x, y);
	};

	EnemyGenerator.prototype.rand = function(max) {
		return  Math.floor(Math.random() * Math.floor(max));
	};

	/**
	 * Creates new instance of Enemy with given position.
	 * @param x X coordinate
	 * @param y Y coordinate
	 * @returns Enemy new Enemy
	 */
	EnemyGenerator.prototype.newEnemy = function(x, y) {
		var enemy = new Enemy();
		
		var index = this.enemies.length;
		var getUrl = window.location;

		var lvl = this.rand(this.levels.length);
		var level = this.levels[lvl];
		var rnd = this.rand(level.length);
		var word = level[rnd].trim();

		enemy.id = this.enemies.length;
		var opacity;
		if(this.textVisible != true)
			opacity = 0.0;
		else
			opacity = 1.0;
		enemy.init(this.enemyLayer, this.enemyGroup, this.playground, this, word, opacity);
		enemy.setSpeed(this.difficulty * speedMultiplier);
		enemy.setPosition({ x: x, y: y });
		enemy.attackCallback = this.attackCallback;

		var metadata = {
			HP: this.difficulty * healthMultiplier,
			timeout: 0,
			intLength: goToIntLength / this.difficulty
		};

		this.enemies.push(enemy);
		this.enemiesData.push(metadata);
		return enemy;
	};

	/**
	 * Set a difficulty of newly generated enemies.
	 * @param difficulty number > 0
	 */
	EnemyGenerator.prototype.setDifficulty = function(difficulty) {
		this.difficulty = parseFloat(difficulty);
	};

	/**
	 * Increases difficulty of newly generated enemies.
	 */
	EnemyGenerator.prototype.incrementDifficulty = function() {
		this.difficulty+=0.05;
	};

	return EnemyGenerator;
});
