
var new_graphics = function(game) {
    var graphics = {};

    var offset_top = 60;
    var offset_right = 0;

    var field_rect = {
        left: 0,
        right: game.field_size.width,
        top: offset_top,
        bottom: game.field_size.height + offset_top
    };

    var ctx;
    graphics.draw = function() {
        if (game.wait) {
            return;
        }
        for (var i = 0; i < (field_rect.right - field_rect.left)/20; i++) {
            for (var j = 0; j < (field_rect.bottom - field_rect.top)/20; j++) {
                if (game.table[i][j] == 0) {
                    ctx.fillStyle = 'rgb(255, 255, 255)';
                } else if ((i + j)%2 == 0) {
                    ctx.fillStyle = 'rgb(0, 10, 0)';
                } else {
                    ctx.fillStyle = 'rgb(0, 30, 0)';
                }
                ctx.fillRect(field_rect.left + i * 20, field_rect.top + j * 20, 20, 20);
            }
        }

        for(var i = 0; i < game.physics.objects.length; i++) {
            var obj = game.physics.objects[i];
            var x = field_rect.left + obj.rect.left;
            var y = field_rect.top + obj.rect.top;
            if (obj.color) {
                ctx.fillStyle = obj.color;
                ctx.fillRect(
                    x,
                    y,
                    obj.rect.right - obj.rect.left,
                    obj.rect.bottom - obj.rect.top);
            } else if (obj.image) {
                ctx.drawImage(obj.image, x, y);
            }
        }

        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, field_rect.right, offset_top);
        ctx.font = "20px Arial";
        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.fillText("Уровень: " + game.level, 10, 25);
        ctx.fillText("Жизни: " + game.lives, 10, 50);
        ctx.fillText("" + game.percent + "%", 750, 50);
        ctx.drawImage(graphics.images['/images/hint.png'], 370, 0);


    };
    var canvas;

    graphics.event_to_field_pos = function(e) {
        var offset = $(canvas).offset();
        var x = e.pageX - offset.left;
        var y = e.pageY - offset.top;
        return { x: x - field_rect.left, y: y - field_rect.top };
    };

    
    graphics.init = function(callback) {
        //  рисуем поле из трёх частей
        //  сначала закрасим
        canvas = document.getElementById('game_canvas');
        canvas.width = field_rect.right + offset_right;
        canvas.height = field_rect.bottom;

        ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, field_rect.right, offset_top);

        ctx.fillStyle = 'rgb(0, 0, 200)';
        ctx.fillRect(field_rect.right, 0, offset_right, 400);

        loadImages(['/images/tontatta.png', '/images/mouse.png', '/images/hint.png', '/images/feathers.png'], function(images) {
            graphics.images = images;
            $(canvas).on("mousemove", function(e) {
                var pos = graphics.event_to_field_pos(e);
                if (game.field_contains_point(pos)) {
                    $(canvas).css("cursor", "url('/images/mouse.png') 16 16, crosshair");
                } else {
                    $(canvas).css("cursor", "");
                }
            });

            var onclick_normal = function(e) {
                e.preventDefault();
                e.stopPropagation();
                var pos = graphics.event_to_field_pos(e);
                if (game.field_contains_point(pos)) {
                    game.add_walls(pos, e.type == "click" ? "x" : "y");
                }

            };

            ctx.fillStyle = 'rgb(0, 0, 0)';
            ctx.fillRect(0, 0, field_rect.right, offset_top);
            ctx.font = "20px Arial";
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fillText("Уровень: " + game.level, 10, 25);
            ctx.fillText("Жизни: " + game.lives, 10, 50);
            ctx.fillText("" + game.percent + "%", 750, 50);
            ctx.drawImage(graphics.images['/images/hint.png'], 370, 0);

            $(canvas).on("click contextmenu", onclick_normal);
            graphics.show_pause_screen("Поймайте всех тонтатта!\nКликните, чтобы начать игру.");
            callback();
        });


    };

    graphics.show_pause_screen = function(text) {
        graphics.show_screen_with_text(text);
        game.wait = true;
        $(canvas).off();
        $(canvas).on("mousemove", function(e) {
            var pos = graphics.event_to_field_pos(e);
            if (game.field_contains_point(pos)) {
                $(canvas).css("cursor", "url('/images/mouse.png') 16 16, crosshair");
            } else {
                $(canvas).css("cursor", "");
            }
        });
        $(canvas).on("click contextmenu", function(e) {
            e.preventDefault();
            e.stopPropagation();
            graphics.remove_pause_screen();
        });
    };

    graphics.remove_pause_screen = function() {
        $(canvas).off();
        $(canvas).on("click contextmenu", function(e) {
            e.preventDefault();
            e.stopPropagation();
            var pos = graphics.event_to_field_pos(e);
            if (game.field_contains_point(pos)) {
                game.add_walls(pos, e.type == "click" ? "x" : "y");
            }
        });
        $(canvas).on("mousemove", function(e) {
            var pos = graphics.event_to_field_pos(e);
            if (game.field_contains_point(pos)) {
                $(canvas).css("cursor", "url('/images/mouse.png') 16 16, crosshair");
            } else {
                $(canvas).css("cursor", "");
            }
        });
        game.wait = false;
    };

    graphics.show_screen_with_text = function(text) {
        ctx.drawImage(graphics.images['/images/feathers.png'], 0, 60);
        ctx.fillStyle = 'rgb(255, 150, 210)';
        var rect_offset_left = 220;
        var rect_offset_top = 270;
        ctx.fillRect(rect_offset_left, rect_offset_top, field_rect.right - field_rect.left - 2 * rect_offset_left, 130);
        ctx.font = "20px Arial";
        ctx.fillStyle = 'rgb(255, 255, 255)';
        var text_array = text.split("\n");
        for (var k = 0; k < text_array.length; k++) {
            ctx.fillText(text_array[k], 260, 315 + 25 * k);
        }
    }

    return graphics;
};