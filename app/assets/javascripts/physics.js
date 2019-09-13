var new_physics = function(game) {
    var physics = {
        objects: []
    };
    physics.tick = function() {
        for(var i = 0; i < physics.objects.length; i++) {
            var obj = physics.objects[i];
            if (obj.remove) { continue; }
            if (obj.velocity) {
                var new_rect = {
                    left: obj.rect.left + obj.velocity.x,
                    right: obj.rect.right + obj.velocity.x,
                    top: obj.rect.top + obj.velocity.y,
                    bottom: obj.rect.bottom + obj.velocity.y
                }
                var colliding_obj = physics.object_at(new_rect, obj);
                if (colliding_obj) {
                    var crossing_x = crossing_value(new_rect, colliding_obj.rect);
                    var crossing_y = crossing_value(
                        { left: new_rect.top, right: new_rect.bottom },
                        { left: colliding_obj.rect.top, right: colliding_obj.rect.bottom });
                    if (Math.abs(crossing_x - crossing_y) < 0.001) {
                        obj.velocity.x *= -1;
                        obj.velocity.y *= -1;
                    } else if (crossing_x > crossing_y) {
                        obj.velocity.y *= -1;
                    } else {
                        obj.velocity.x *= -1;
                    }
                    if (colliding_obj.type == "growing_wall") {
                        colliding_obj.remove = true;
                        game.lives--;
                    }
                } else {
                    obj.rect = new_rect;
                }
            }
            if (obj.growing) {
                var new_rect = jQuery.extend({}, obj.rect);
                new_rect[obj.growing.side] += 0.6 * obj.growing.dir;
                var colliding_obj = physics.object_at(new_rect, obj);
                if (colliding_obj) {
                    if (colliding_obj.type == "tontatta") {
                        obj.remove = true;
                        game.lives--;
                    } else {
                        obj.growing = null;
                        obj.rect.left = Math.round(new_rect.left/game.tile_size) * game.tile_size;
                        obj.rect.right = Math.round(new_rect.right/game.tile_size) * game.tile_size;
                        obj.rect.top = Math.round(new_rect.top/game.tile_size) * game.tile_size;
                        obj.rect.bottom = Math.round(new_rect.bottom/game.tile_size) * game.tile_size;
                        obj.color = "#FFF";
                        obj.type = "static_wall";
                    }
                } else {
                    obj.rect = new_rect;
                }
            }
        }
        var remaining_objects = [];
        for(var i = 0; i < physics.objects.length; i++) {
            var obj = physics.objects[i];
            if (!obj.remove) {
                remaining_objects.push(obj);
            }
        }
        physics.objects = remaining_objects;
    };
    physics.object_at = function(rect, exclude_obj) {
        for(var i = 0; i < physics.objects.length; i++) {
            var obj = physics.objects[i];
            if (obj == exclude_obj) {
                continue;
            }
            if (are_crossing(rect, obj.rect)) {
                return obj;
            }
        }
    };
    return physics;
};
