/**
 * Script responsible for rendering Enemies.
 *
 * Author: Tomas Mudrunka
 */

define(function() {
	var speakTime = 3000;
	// animation frames in the enemy sprite
	var enemyAnimation = {
		walk: [
		],
		stand: [
		],
		attack: [
		]
	};

	var enemyImg = new Image();
	enemyImg.src = 'img/game/enemy-sprite.png';


	var explosionImg = new Image();
	explosionImg.src = 'img/game/explosion.png';

	var explosionAnimation = {
		explode: [
		]
	};	

	Enemy.prototype.rotate = function(sprite,rotation){
		const degToRad = Math.PI / 180;

		const rotatePoint = ({x, y}, deg) => {
			const rcos = Math.cos(deg * degToRad), rsin = Math.sin(deg * degToRad)
			return {x: x*rcos - y*rsin, y: y*rcos + x*rsin}
		};

		//current rotation origin (0, 0) relative to desired origin - center (node.width()/2, node.height()/2)
		const displayedWidth = sprite.image.width() * sprite.image.scaleX();
		const displayedHeight = sprite.image.height() * sprite.image.scaleY();
		const topLeft = {x:-displayWidth/2, y:-displayedHeight/2};
		const current = rotatePoint(topLeft, sprite.getRotation());
		const rotated = rotatePoint(topLeft, rotation);
		const dx = rotated.x - current.x, dy = rotated.y - current.y;
		
		sprite.setRotation(rotation);
		sprite.setOffsetX(node.getOffsetX() + dx);
		sprite.setOffsetY(node.getOffsetY() + dy);
	};	

	/** The Enemy object. */
	function Enemy() {
		this.id = null;

		this.enemyLayer = null;
		this.generator = null;

		var i;
		var imgWidth = 9*82;
		var imgHeight = 141;
		var enemyAnimationFrames = 9;
		var spriteWidth = imgWidth/enemyAnimationFrames;
		var enemy = this;

		for(i=0;i<imgWidth/spriteWidth;i++)
		{
			enemyAnimation.walk.push({ x: i*spriteWidth, y: 0, width: spriteWidth, height: imgHeight });
			enemyAnimation.stand.push({ x: i*spriteWidth, y: 0, width: spriteWidth, height: imgHeight });
			enemyAnimation.attack.push({ x: i*spriteWidth, y: 0, width: spriteWidth, height: imgHeight });
		}

		this.sprite = new Kinetic.Sprite({
			x: 0,
			y: 0,
			offset: [82/2,141/2],
			image: enemyImg,
			animation: 'stand',
			animations: enemyAnimation,
			frameRate: 64
		});


		imgWidth = 90*160;
		imgHeight = 120;
		enemyAnimationFrames = 90;
		spriteWidth = imgWidth/enemyAnimationFrames;

		for(i=0;i<imgWidth/spriteWidth;i++)
		{
			explosionAnimation.explode.push({ x: i*spriteWidth, y: 0, width: spriteWidth, height: imgHeight });
		}

		this.explosion = new Kinetic.Sprite({
			x: 0,
			y: 0,
			offset: [160/2,120/2],
			image: explosionImg,
			animation: 'explode',
			animations: explosionAnimation,
			frameRate: 64
		});

		this.explosion.afterFrame(90, function(){
			enemy.explosion.stop();
			enemy.explosion.hide();
		});

		this.blood = new Kinetic.Circle({
			x: 0,
			y: 0,
			offset: [0,0],
			radius: 12,
			fill: '#da4f49',
			opacity: 0.0
		});
		
		this.text = new Kinetic.Text({
			x: 0,
			y: 0,
			offset: [0,-25],
			text: 'undefined',
			fontSize: 30,
			fontFamily: 'Calibri',
			fill: 'red',
		});

		this.typedText = new Kinetic.Text({
			x: 0,
			y: 0,
			offset: [0,-25],
			text: '',
			fontSize: 30,
			fontFamily: 'Calibri',
			fill: 'green',
		});

		this.text.setOffsetX(this.text.getTextWidth() / 2);  //center text below monster
		this.typedText.setOffsetX(this.text.getTextWidth() / 2);  //center text below monster

		this.damageTween = null;
		this.deathTween = null;

		this.speed = 2.0;
		this.moveAnim = null;

		this.attackCallback = null;
		this.attackIntId = null;

		this.paused = false;
		this.disabled = false;

		this.explosionSound = new Audio();
		this.explosionSound.src = 'audio/explosion.mp3';
		this.explosionSound.load();
		this.explosionSound.volume = 0.3;	
	
	}

	/**
	 * The Enemy initialization.
	 * @param enemyLayer KineticJS Layer
	 * @param enemyGroup KineticJS Group
	 */
	Enemy.prototype.init = function(enemyLayer, enemyGroup, playground, generator, word, opacity) {
		// add enemy to the layer
		enemyGroup.add(this.sprite);
		enemyGroup.add(this.blood);
		enemyGroup.add(this.explosion);
		enemyGroup.add(this.text);
		enemyGroup.add(this.typedText);
		this.sprite.start();
		this.enemyLayer = enemyLayer;
		this.generator = generator;

		this.text.setText(word);

		var typedText = this.typedText;
		var text = this.text;
		var self = this;
		text.setOpacity(opacity);

		var speak = function() {
			if (!self.paused) {
				self.generator.speakWord(word);
			}
		};

		this.speakIntId = setInterval(speak, speakTime);
		speak();

		// add damage animation tween
		this.damageTween = new Kinetic.Tween({
			node: this.blood,
			opacity: 0.5,
			duration: 0.5,
			easing: Kinetic.Easings.StrongEaseOut,
			onFinish: function() {
				this.reverse();
			}
		});

		playground.on('keydown', function(event) {
			var todo=text.getText();
			var done=typedText.getText();
			var rest=todo.substring(done.length);

			if(rest.substring(0,1).toUpperCase() === event.key.toUpperCase())
			{
				var add = rest.substring(0,1);
				typedText.setText(done + add);
				generator.handleEnemyHit(generator.getEnemyId(self));

			}
		});

	};

	Enemy.prototype.isDead = function() {
		var required = this.text.getText();
		var done = this.typedText.getText();
		return required === done;
	};	

	Enemy.prototype.getText = function() {
		return this.text.getText();
	};	

	/**
	 * Starts the enemies' animation.
	 */
	Enemy.prototype.start = function() {
		this.paused = false;
		this.sprite.start();
		if (this.moveAnim != null) {
			this.moveAnim.start();
		}
	};

	/**
	 * Stops the enemies' animation.
	 */
	Enemy.prototype.stop = function() {
		this.paused = true;
		this.sprite.stop();
		this.explosion.stop();
		if (this.moveAnim != null) {
			this.moveAnim.stop();
		}
	};

	/**
	 * Sets moving speed of the enemy.
	 * @param speed number
	 */
	Enemy.prototype.setSpeed = function(speed) {
		this.speed = speed;
		this.sprite.stop();
		this.sprite.setFrameRate(speed * 32);
		this.sprite.start();
	};

	/**
	 * Sets position of the enemy.
	 * @param position X Y coordinates
	 */
	Enemy.prototype.setPosition = function(position) {
		this.sprite.setX(position.x);
		this.sprite.setY(position.y);
		this.blood.setX(position.x);
		this.blood.setY(position.y);
		this.text.setX(position.x);
		this.text.setY(position.y);
		this.typedText.setX(position.x);
		this.typedText.setY(position.y);
	};

	/**
	 * Returns position of the enemy.
	 * @returns {{x: *, y: *}} X Y coordinates
	 */
	Enemy.prototype.getPosition = function() {
		return { x: this.sprite.getX(), y: this.sprite.getY() };
	};

	/**
	 * Starts 'damage' animation.
	 */
	Enemy.prototype.showDamage = function() {
		this.damageTween.play();
	};

	Enemy.prototype.stopSpeaking = function() {
		if (this.speakIntId != null) {
			clearInterval(this.speakIntId);
			this.speakIntId = null;
		}
	};


	/**
	 * Starts 'death' animation.
	 */
	Enemy.prototype.showDeath = function() {
		this.disabled = true;
		if (this.speakIntId != null) {
			clearInterval(this.speakIntId);
			this.speakIntId = null;
		}
		this.generator.removeWord(this.getText());

		// create death animation tween
		this.deathTween = new Kinetic.Tween({
			node: this.blood,
			opacity: 0.7,
			radius: 20,
			duration: 2,
			easing: Kinetic.Easings.EaseOut
		});
		this.deathTween.play();

		if (this.moveAnim != null) {
			this.moveAnim.stop();
		}
		this.sprite.stop();
		this.sprite.hide();

		this.explosion.setX(this.sprite.getX());
		this.explosion.setY(this.sprite.getY());
		this.explosion.start();
		this.explosionSound.play();
	};

	/**
	 * The enemy will move towards given target then
	 * it will attack when the target is reached.
	 * @param target X Y coordinates
	 */
	Enemy.prototype.goTo = function(target) {
		var self = this;
		var enemy = this.sprite;
		var blood = this.blood;
		var text = this.text;
		var typedText = this.typedText;
		var x = target.x;
		var y = target.y;

		var E = 100.0; // epsilon for position comparison

		// already at the target
		if (x - E < enemy.getX() && enemy.getX() < x + E && y - E < enemy.getY() && enemy.getY() < y + E) {
			if (enemy.getAnimation() != 'attack') {
				enemy.setAnimation('attack');
			}
			return;
		}

		// do nothing if the game is paused of the enemy is disabled
		if (this.paused || this.disabled) {
			return;
		}

		if (this.moveAnim != null) {
			this.moveAnim.stop();
		}
		if (enemy.getAnimation() != 'walk') {
			enemy.setAnimation('walk');
		}
		if (this.attackIntId != null) {
			clearInterval(this.attackIntId);
			this.attackIntId = null;
		}

		// rotate towards the target
		var angle = Math.atan((y - enemy.getY()) / (x - enemy.getX()));
		enemy.setRotation(angle);
		blood.setRotation(angle);
		if (x >= enemy.getX()) {
			enemy.rotateDeg(-90);
			blood.rotateDeg(-90);
		} else {
			enemy.rotateDeg(90);
			blood.rotateDeg(90);
		}

		// start moving, then attack when the target is reached
		this.moveAnim = new Kinetic.Animation(function() {
			var dx, dy, move = self.speed;

			dx = x - enemy.getX();
			dy = y - enemy.getY();
			var oolength = move/Math.sqrt(dx*dx+dy*dy);
			dx = dx*oolength;
			dy = dy*oolength;

			enemy.move(dx, dy);
			blood.move(dx, dy);
			text.move(dx, dy);
			typedText.move(dx, dy);
			
			if (x - E < enemy.getX() && enemy.getX() < x + E && y - E < enemy.getY() && enemy.getY() < y + E) {
				enemy.setAnimation('attack');
				self.moveAnim.stop();
				if (self.attackCallback) {
					// attack in intervals based on speed
					var time = 200 + 2000 / self.speed;
					var attack = function() {
						if (!self.paused) {
							self.attackCallback(x, y, self);
						}
					};
					//self.attackIntId = setInterval(attack, time);
					attack();
				}
			}
		}, this.enemyLayer);
		this.moveAnim.start();
	};

	/**
	 * Destroys and removes this Enemy instance.
	 */
	Enemy.prototype.destroy = function() {
		if (this.attackIntId != null) {
			clearInterval(this.attackIntId);
			this.attackIntId = null;
		}
		if (this.speakIntId != null) {
			clearInterval(this.speakIntId);
			this.speakIntId = null;
		}

		this.disabled = true;
		if (this.moveAnim != null) {
			this.moveAnim.stop();
		}
		if (this.damageTween != null) {
			this.damageTween.destroy();
		}
		if (this.deathTween != null) {
			this.deathTween.destroy();
		}
		
		this.sprite.destroy();
		this.blood.destroy();
		this.explosion.destroy();
		this.text.destroy();
		this.typedText.destroy();

	};

	return Enemy;
});
