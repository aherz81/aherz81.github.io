/**
 * Main script (entry-point) for the 2D Shooter game.
 *
 * Author: Tomas Mudrunka
 */
require.config({
	baseUrl: "js/game"
});

require(["game","users","htmlBuilder"], function(Game, Users, HTMLBuilder) {
	var builder = new HTMLBuilder();

	var users = new Users();
	users.init();

	$('#users, #users a[href="#all-users"]').on('shown', function() {
		var tab = builder.buildUsersTable(users.getAllUsers());
		var content = $('#all-users').find('div.content');
		content.empty().append(tab);
		content.find('button').on('click', function(event) {
			var target = $(event.target);
			users.login(target.attr('data-id'));
			game.setUser(users.loggedUser());
			content.find('tr.info').removeClass('info');
			target.parents('tr').addClass('info');
		});
		var logged = users.loggedUser();
		if (logged) {
			content.find('tr[data-id="' + logged.id + '"]').addClass('info');
			$('#message-score').text("You are logged as " + logged.name + ".");
		}
	});

	$('#users').find('a[href="#new-user"]').on('shown', function() {
		$('#new-user-name').val('').focus();
		$('#new-user').find('.control-group').removeClass('success').removeClass('error');
	});

	$('#new-user').find('form').on('submit', function(event) {
		event.preventDefault();
		var name = $('#new-user-name').val();
		users.newUser(name);
		var group = $(this).find('.control-group').addClass('success');
		setTimeout(function() {
			group.removeClass('success');
		}, 2000);
	});

	var game = new Game();
	var running = false;
	game.init();
	game.setUser(users.loggedUser());
	game.playground.focus();
	game.gameOverCallback = function(result) {
		var time =  Math.round(result.time / 100) / 10;
		users.updateScore(time, result.kills, !this.textVisible);
		running = false;
		$('#message-score').text("GAME OVER: You've have achieved a score of " + result.score + " and killed " + result.kills + " enemies, in " + time + "s" + " where cloaking was " + !this.textVisible + ".");
		$('#game-menu').modal('show');
	};

	game.playground.on('keypress', function(event) {
		if (event.which == 0) { // ESC
			$('#game-menu').modal('show');
		}
	});

	if (users.loggedUser()) {
		$('#message-score').text("You are logged as " + users.loggedUser().name + ".");
	} else {
		$('#message-score').text("You must log-in to track your high-scores.");
	}

	var W = $(window);
	var getWidth = function() { return W.width() - 10; };
	var getHeight = function() { return W.height() - 51; };
	W.resize(function() {
		game.resizePlayground(getWidth(), getHeight());
	});

	$('#the-navbar').find('a').on('click', function(event) {
		event.preventDefault();
		game.playground.focus();
	});
	$('#game-menu, #settings, #users, #about').on('hidden', function() {
		game.playground.focus();
	});

	$('#game-begin').on('click', function() {
		game.beginNewGame();
		running = true;
		$('#message-score').text('');
	});
	$('#game-end').on('click', function() {
		if (running) {
			game.endGame();
		}
	});
	$('#game-play').on('click', function() {
		if (running) {
			game.play();
		}
	});
	$('#game-pause').on('click', function() {
		if (running) {
			game.pause();
		}
	});
	
	$('#settings').on('show', function() {
		if (localStorage) {
			var textVisible = localStorage.getItem('textVisible');
			if (textVisible) {
				$('#text-visible').prop('checked', JSON.parse(textVisible));
			}
			var difficulty = localStorage.getItem('difficulty');
			if (difficulty) {
				$('#difficulty').val(JSON.parse(difficulty));
			}
/*			
			var files = localStorage.getItem('files');
			if (files) {
				$('#level-files')[0].files= (JSON.parse(textVisible));
			}		
*/			
			var spawns = localStorage.getItem('spawns');
			if (spawns) {
				$('#spawn').val(JSON.parse(spawns));
			}							
		}
	});

	$('#settings-save').on('click', function() {
		var textVisible = $('#text-visible').prop('checked');
		if (!'speechSynthesis' in window)
		{
			alert("Your browser does not suport speech synthesis, will keep text on.");
			textVisible = true;
		}
		game.setTextVisible(textVisible);
		if (localStorage) {
			localStorage.setItem('textVisible', JSON.stringify(textVisible));
		}

		var difficulty = $('#difficulty').val();
		game.setDifficulty(parseFloat(difficulty));

		if (localStorage) {
			localStorage.setItem('difficulty', JSON.stringify(difficulty));
		}

		var files = $('#level-files')[0].files;

		game.clearLevels();

		var i;
		for (i = 0; i < files.length; i++) {
			var reader = new FileReader();
			reader.readAsText(files[i], "UTF-8");
			reader.onload = function (evt) {
				game.addLevel(evt.target.result);
			}
			reader.onerror = function (evt) {
				alert("error reading file");
			}		
		}
/*
		if (localStorage) {
			localStorage.setItem('files', JSON.stringify(files));
		}
*/
		var spawns = $('#spawn').val();
		game.setSpawnCount(parseInt(spawns));

		if (localStorage) {
			localStorage.setItem('spawns', JSON.stringify(spawns));
		}
	});

	$('#settings').modal('show');
});
