
var new_game = function() {
    var game = {};
    game.level = 1;
    game.field_size = { width: 800, height: 600 - 60 };
    game.tile_size = 20;
    game.lives = game.level + 1;
    game.percent = 0;
    game.wait = false;


    game.physics = new_physics(game);
    game.graphics = new_graphics(game);

    game.table = [];

    (function() {
        var requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame;
        var prev_date = new Date();
        game.tick = function () {
            var current_date = new Date();
            var ticks = Math.ceil((current_date - prev_date) / 3);
            prev_date = current_date;
            for (var i = 0; i < ticks; i++) {
                game.physics.tick();
            }
            game.fill_table();
            if (game.percent >= 80) {
                game.graphics.draw();
                game.graphics.show_pause_screen("Новый уровень!\nКликните, чтобы продолжить.");
                game.level++;
                game.lives = game.level + 1;
                objects_init();
            }
            if (game.lives <= 0) {
                game.graphics.draw();
                game.graphics.show_pause_screen("Игра окончена!\nВы дошли до уровня " + game.level + ".\nКликните, чтобы начать заново.");
                game.level = 1;
                game.lives = game.level + 1;
                objects_init();
            }
            game.graphics.draw();
            requestAnimationFrame(game.tick);
        };
    })();

    game.field_contains_point = function(p) {
        return p.x >= 0 && p.x < game.field_size.width && p.y >= 0 && p.y < game.field_size.height;
    };

    game.add_walls = function(pos, axis) {
        for(var i = 0; i < game.physics.objects.length; i++) {
            var obj = game.physics.objects[i];
            if (obj.growing) {
                //previous wall exists
                return;
            }
        }
        if (game.table[Math.floor(pos.x/game.tile_size)][Math.floor(pos.y/game.tile_size)] == 0) {
            //already covered
            return;
        }
        if (axis == "x") {
            var x = Math.round(pos.x / game.tile_size) * game.tile_size;
            var y1 = Math.floor(pos.y / game.tile_size) * game.tile_size;
            var y2 = y1 + game.tile_size;
            var rect = { left: x, top: y1, right: x, bottom: y2 };
            if (game.physics.object_at(rect)) {
                //space occupied
                return;
            }
            game.physics.objects.push({
                rect: $.extend({}, rect),
                color: "#888",
                growing: { side: "left", dir: -1 },
                type: "growing_wall"
            });
            game.physics.objects.push({
                rect: $.extend({}, rect),
                color: "#aaa",
                growing: { side: "right", dir: 1 },
                type: "growing_wall"
            });
        } else {
            var y = Math.round(pos.y / game.tile_size) * game.tile_size;
            var x1 = Math.floor(pos.x / game.tile_size) * game.tile_size;
            var x2 = x1 + game.tile_size;
            var rect = { left: x1, top: y, right: x2, bottom: y };
            if (game.physics.object_at(rect)) {
                //space occupied
                return;
            }
            game.physics.objects.push({
                rect: $.extend({}, rect),
                color: "#888",
                growing: { side: "top", dir: -1 },
                type: "growing_wall"
            });
            game.physics.objects.push({
                rect: $.extend({}, rect),
                color: "#aaa",
                growing: { side: "bottom", dir: 1 },
                type: "growing_wall"
            });
        }
    };



    game.fill_table = function() {
        var check_and_possibly_change = function(i, j) {
            if (i < 0 || j < 0 || i >= game.field_size.width / game.tile_size || j >= game.field_size.height / game.tile_size) {
                return false;
            }
            var obj = game.physics.object_at({left: game.tile_size * i, top: game.tile_size * j, right: game.tile_size * (i + 1), bottom: game.tile_size * (j + 1)});
            if (obj && obj.type != "tontatta" && obj.type != "growing_wall") {
                return false;
            } else if (game.table[i][j] == 0) {
                game.table[i][j] = 1;
                return true;
            } else {
                return false;
            }
        };

        game.table = [];
        for (var i = 0; i < game.field_size.width / game.tile_size; i++) {
            var row = [];
            for (var j = 0; j < game.field_size.height / game.tile_size; j++) {
                row.push(0);
            }
            game.table.push($.extend([], row));
        }
        var propagation_array = [];
        var filled_squares = 0;
        for(var k = 0; k < game.physics.objects.length; k++) {
            var obj = game.physics.objects[k];
            if (obj.type == "tontatta") {
                var x = obj.rect.left;
                var y = obj.rect.top;
                var i = Math.round(x/game.tile_size);
                var j = Math.round(y/game.tile_size);
                game.table[i][j] = 1;
                filled_squares++;
                propagation_array.push([i,j]);
            }
        }
        while (propagation_array.length > 0) {
            var point = propagation_array.pop();
            var i = point[0];
            var j = point[1];
            array_to_check = [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]];
            for (var m = 0; m < array_to_check.length; m++) {
                var new_i = array_to_check[m][0];
                var new_j = array_to_check[m][1];
                if (check_and_possibly_change(new_i, new_j)) {
                    propagation_array.push([new_i, new_j]);
                    filled_squares++;
                }
            }
        }

        game.percent = 100 - Math.round(100 * filled_squares / (game.field_size.width / game.tile_size * game.field_size.height / game.tile_size));

    };

    var objects_init = function() {
        game.physics.objects = [];
        var wall_width = game.tile_size;
        game.physics.objects.push({
            rect: { left: -wall_width, top: 0, right: 0, bottom: game.field_size.height},
            type: "field_box"
        });
        game.physics.objects.push({
            rect: { left: 0, top: -wall_width, right: game.field_size.width, bottom: 0},
            type: "field_box"
        });
        game.physics.objects.push({
            rect: { left: game.field_size.width, top: 0, right: game.field_size.width + wall_width, bottom: game.field_size.height},
            type: "field_box"
        });
        game.physics.objects.push({
            rect: { left: 0, top: game.field_size.height, right: game.field_size.width, bottom: game.field_size.height + wall_width},
            type: "field_box"
        });
        var add_tontatta = function(x, y, vx, vy) {
            var rect = { left: x, top: y, right: x + 32, bottom: y + 32 };
            if (game.physics.object_at(rect)) {
                return null;
            }
            game.physics.objects.push({
                rect: rect,
                image: game.graphics.images['/images/tontatta.png'],
                velocity: { x: 0.3 * vx, y: 0.3 * vy },
                type: "tontatta"
            });
            return true;
        };
        var create_tontatta = function() {
            for(var i = 0; i < 1000; i++) {
                var x = Math.round(Math.random() * game.field_size.width);
                var y = Math.round(Math.random() * game.field_size.height);
                var vx = Math.sign(Math.random() - 0.5);
                var vy = Math.sign(Math.random() - 0.5);
                if (add_tontatta(x, y, vx, vy)) {
                    return;
                }
            }
        };
        for(var i = 0; i < game.level; i++) {
            create_tontatta();
        }
        game.tick();
    };

    game.graphics.init(objects_init);

};


$(document).ready(function() {
    var game = new_game();
});
