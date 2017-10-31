let config_spec = {
  "game": {
    "init": function (entity_manager, control_manager, map_manager, player_manager) {
      this.particle_count = 0;
      this.last_particle_added = performance.now();
    },
    "update": function (delta, entity_manager) {
      let control_manager = entity_manager.get_control_manager(),
        map_manager = entity_manager.get_map_manager(),
        player_manager = entity_manager.get_player_manager(),
        keys = control_manager.get_controls();

      if (keys['KeyM']) {
        // should build a means to cycle that doesn't rely on hardcoding an if-ladder
        if (map_manager.get_current_map_id() === "map1") {
          map_manager.change_maps("map2", entity_manager);
        } else if (map_manager.get_current_map_id() === "map2") {
          map_manager.change_maps("map_field", entity_manager);
        } else if (map_manager.get_current_map_id() === 'map_field'){
          map_manager.change_maps('map_test', entity_manager);
        } else {
          map_manager.change_maps("map1", entity_manager);
        }
        player_manager.modify_player('layer', map_manager.get_map().player_layer);
      } else if (keys['KeyZ']) {
        if (performance.now() - this.last_particle_added > 200) {
          this.particle_count += 1;
          this.last_particle_added = performance.now();

          entity_manager.add_entity({
            'x': Math.random()*500,
            'y': Math.random()*500,
            'x_scale': 1,
            'y_scale': 1,
            'x_size': 10,
            'y_size': 10,
            'x_velocity': Math.random()*50-25,
            'y_velocity': Math.random()*50-25,
            'layer': 1.5,
            'id': 'projectile' + this.particle_count,
            'img': "particle",
            'x_acceleration': 2,
            'x_acceleration': 2,
            'update': function (delta, et) {
              this.x += this.x_velocity * delta;
              this.y += this.y_velocity * delta;
              this.x_velocity *= 0.8;
              this.y_velocity *= 0.8;
              if (Math.random() > 0.95) {
                this.x_velocity += Math.random() * 50 - 25;
                this.y_velocity += Math.random() * 50 - 25;
              }
              et.move_entity(this, this.x, this.y);
            }
          });
        }
      }
    }
  },
  "canvas_id": "canvas",
  "frames_per_second": 40,
  "resource_url": "resources.json",
  "controls": null,
  "base_url": "",
  "player": {
    "id": "player1",
    "img": "player",
    "x": 10,
    "y": 10,
    "layer": 2,
    "x_scale": 1,
    "y_scale": 1,
    "x_size": 26,
    "y_size": 32,
    "x_velocity": 0,
    "y_velocity": 0,
    "max_x_velocity": 12,
    "max_y_velocity": 12,
    "x_acceleration": 1.8,
    "y_acceleration": 1.8,
    "health": 10,
    "score": 0,
  },
  "camera": {
    "x": 0,
    "y": 0,
    "width": 500,
    "height": 500,
    "left_margin": 100,
    "right_margin": 100,
    "top_margin": 100,
    "bottom_margin": 100,
  },
  "initial_map_id": "map_field",
  "maps": {
    "map1": {
      "height": 2000,
      "width": 600,
      "id": "map1",
      "player_layer": 2,
      "init": function (entity_manager) {
        console.log("map " + this.id + ": initialized");
        console.log(entity_manager);
      },
      "deinit": function (entity_manager) {
        console.log("map " + this.id + ": de-initialized");
        console.log(entity_manager);
      },
      "layers": [
        [
          {
            "id": "bg1",
            "img": "bg",
            "x": -3000,
            "y": -3000,
            "x_scale": 12,
            "y_scale": 12,
            "x_size": 6000,
            "y_size": 6000,
            "layer": -1,
          }
        ],
        [
          {
            "id": "grass1",
            "img": "grass",
            "x": 0,
            "y": 0,
            "x_scale": 1,
            "y_scale": 1,
            "x_size": 64,
            "y_size": 64,
            "layer": 0,
          },
          {
            "id": "grass2",
            "img": "grass",
            "x": 64,
            "y": 0,
            "x_scale": 1,
            "y_scale": 1,
            "x_size": 64,
            "y_size": 64,
            "layer": 0,
          },
          {
            "id": "water1",
            "img": "water",
            "x": 128,
            "y": 0,
            "x_scale": 1,
            "y_scale": 1,
            "x_size": 64,
            "y_size": 64,
            "layer": 0,
          },
          {
            "id": "dirt1",
            "img": "dirt",
            "x": 0,
            "y": 64,
            "x_scale": 1,
            "y_scale": 1,
            "x_size": 64,
            "y_size": 64,
            "layer": 0,
          },
          {
            "id": "dirt2",
            "img": "dirt",
            "x": 64,
            "y": 64,
            "x_scale": 1,
            "y_scale": 1,
            "x_size": 64,
            "y_size": 64,
            "layer": 0,
          }
        ],
        [
          {
            "id": "coin1",
            "img": "coin",
            "x": 64,
            "y": 0,
            "x_scale": 1,
            "y_scale": 1,
            "x_size": 48,
            "y_size": 48,
            "layer": 1,
          },
          {
            "id": "coin2",
            "img": "coin",
            "x": 64,
            "y": 50,
            "x_scale": 0.5,
            "y_scale": 0.5,
            "x_size": 24,
            "y_size": 24,
            "layer": 1,
            "x_velocity": 10,
            "y_velocity": 10,
            "max_x_velocity": 10,
            "max_y_velocity": 10,
            "x_acceleration": 2,
            "y_acceleration": 2,
            "value": 1,
            "flip": 1,
            "update": function (delta, entity_manager) {
              /* object only runs when active */
              if (this.active === false) {
                return;
              }

              /* bookkeeping */
              this.last_x = this.x;
              this.last_y = this.y;

              /* movement and dumb friction */
              this.x += this.x_velocity * delta;
              this.y += this.y_velocity * delta;
              this.x_velocity *= 0.8;
              this.y_velocity *= 0.8;

              /* perturbation upon rest to keep the coin moving */
              if (Math.abs(this.last_x - this.x) < 0.01) {
                this.flip *= -1;
                this.x_velocity = this.max_x_velocity * this.flip;
                this.y_velocity = this.max_y_velocity * this.flip;
              }

              /* collision w/ player for scorekeeping/deactivation */
              let collisions = entity_manager.collide(this);
              let player_manager = entity_manager.get_player_manager();
              let player = player_manager.get_player();
              for (i in collisions) {
                if (collisions[i].id === player.id) {
                  player_manager.modify_player('score', player.score+1);
                  this.active = false;
                }
              }
              entity_manager.move_entity(this, this.x, this.y);
            }
          }
        ]
      ]
    },
    "map2": {
      "id": "map2",
      "height": 500,
      "width": 500,
      "player_layer": 2,
      "layers": [
        [
          {
            "id": "bg1",
            "img": "bg",
            "x": -3000,
            "y": -3000,
            "x_scale": 12,
            "y_scale": 12,
            "x_size": 6000,
            "y_size": 6000,
            "layer": -1,
          }
        ],
        [
          {
            "id": "dirt1",
            "img": "dirt",
            "x": 0,
            "y": 0,
            "x_scale": 1,
            "y_scale": 1,
            "x_size": 64,
            "y_size": 64,
            "layer": 0,
          },
          {
            "id": "dirt2",
            "img": "dirt",
            "x": 64,
            "y": 0,
            "x_scale": 1,
            "y_scale": 1,
            "x_size": 64,
            "y_size": 64,
            "layer": 0,
          },
          {
            "id": "water1",
            "img": "water",
            "x": 128,
            "y": 0,
            "x_scale": 1,
            "y_scale": 1,
            "x_size": 64,
            "y_size": 64,
            "layer": 0,
          },
          {
            "id": "dirt3",
            "img": "dirt",
            "x": 0,
            "y": 64,
            "x_scale": 1,
            "y_scale": 1,
            "x_size": 64,
            "y_size": 64,
            "layer": 0,
          },
          {
            "id": "dirt4",
            "img": "dirt",
            "x": 64,
            "y": 64,
            "x_scale": 1,
            "y_scale": 1,
            "x_size": 64,
            "y_size": 64,
            "layer": 0,
          }
        ],
        [
          {
            "id": "coin1",
            "img": "coin",
            "x": 64,
            "y": 0,
            "x_scale": 1,
            "y_scale": 1,
            "x_size": 48,
            "y_size": 48,
            "layer": 1,
          },
          {
            "id": "coin2",
            "img": "coin",
            "x": 64,
            "y": 50,
            "x_scale": 0.5,
            "y_scale": 0.5,
            "x_size": 24,
            "y_size": 24,
            "layer": 1,
            "x_velocity": 10,
            "y_velocity": 10,
            "max_x_velocity": 10,
            "max_y_velocity": 10,
            "x_acceleration": 2,
            "y_acceleration": 2,
            "value": 1,
            "flip": 1,
            "update": function (delta, entity_manager) {
              /* object only runs when active */
              if (this.active === false) {
                return;
              }

              /* bookkeeping */
              this.last_x = this.x;
              this.last_y = this.y;

              /* movement and dumb friction */
              this.x += this.x_velocity * delta;
              this.y += this.y_velocity * delta;
              this.x_velocity *= 0.8;
              this.y_velocity *= 0.8;

              /* perturbation upon rest to keep the coin moving */
              if (Math.abs(this.last_x - this.x) < 0.01) {
                this.flip *= -1;
                this.x_velocity = this.max_x_velocity * this.flip;
                this.y_velocity = this.max_y_velocity * this.flip;
              }

              /* collision w/ player for scorekeeping/deactivation */
              let collisions = entity_manager.collide(this);
              let player_manager = entity_manager.get_player_manager();
              let player = player_manager.get_player();
              for (i in collisions) {
                if (collisions[i].id === player.id) {
                  player_manager.modify_player('score', player.score+1);
                  this.active = false;
                }
              }
              entity_manager.move_entity(this, this.x, this.y);
            } // update method
          }   // coin entity
        ]     // layer
      ]       // array of layers
    },        // map object
  }           // maps object
};            // config object