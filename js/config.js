let config_spec = {
  "game": {
    "init": function (entity_manager, control_manager, ui_manager, map_manager, player_manager) {
      this.particle_count = 0;
      this.last_particle_added = performance.now();
      this.player = player_manager.get_player();
      ui_manager.add_button({
        id: "map_cycle",
        x: 15, y: 50, width: 80, height: 30, text: "<p style='margin: 8px 0'>Next Map</p>",
        background: "black", style: 'color: white; text-align: center'
      });
      this.xy_text = {
        id: "xy",
        text: "x, y: " + this.player.x + ", " + this.player.y,
        x: 10, //this.player.x.toFixed(3),
        y: 20, //this.player.y.toFixed(3),
        offset_type: "camera",
        font: "14px sans",
        color: "white",
        update: function (delta, entity_manager) {
          let player = entity_manager.get_player_manager().get_player();
          this.text = "x, y: " + player.x.toFixed(3) + ", " + player.y.toFixed(3);
        },
      };
      this.velo_text = {
        id: "xy",
        text: "xv, yv: " + this.player.x_velocity + ", " + this.player.y_velocity,
        x: 10, //this.player.x.toFixed(3),
        y: 95, //this.player.y.toFixed(3),
        offset_type: "camera",
        font: "14px sans",
        color: "white",
        update: function (delta, entity_manager) {
          let player = entity_manager.get_player_manager().get_player();
          this.text = "xv, yv: " + player.x_velocity.toFixed(3) + ", " + player.y_velocity.toFixed(3);
        },
      };
      this.map_text = {
        id: "map",
        text: "map: " + map_manager.get_current_map_id,
        x: 10,
        y: 38,
        offset_type: "camera",
        font: "14px sans",
        color: "white",
        update: function (delta, entity_manager) {
          this.text = "map: " + entity_manager.get_map_manager().get_current_map_id();
        },
      }
      entity_manager.add_text(this.xy_text);
      entity_manager.add_text(this.velo_text);
      entity_manager.add_text(this.map_text);
    },
    "update": function (delta, entity_manager) {
      let control_manager = entity_manager.get_control_manager(),
        map_manager = entity_manager.get_map_manager(),
        player_manager = entity_manager.get_player_manager(),
        player = player_manager.get_player(),
        keys = control_manager.get_controls(),
        lol_text = null;

      if (keys.buttons.map_cycle.down) {
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
      } else if (keys['KeyL'] && keys['KeyL'].down) {
        if (this.loling) {
          entity_manager.remove_text("lol");
          this.loling = false;
        } else {
          lol_text = {
            id: "lol",
            text: "lol",
            x: player.x,
            y: player.y,
            rando_x: Math.random() * 5 - 2.5,
            rando_y: Math.random() * 5 - 2.5,
            offset_type: "world",
            font: "20px serif",
            color: "white",
            update: function (delta, entity_manager) {
              let player = entity_manager.get_player_manager().get_player();
              this.x = player.x+this.rando_x;
              this.y = player.y+this.rando_y;
            },
          }
          entity_manager.add_text(lol_text);
          this.loling = true;
        }
      } else if (keys['KeyZ'] && keys['KeyZ'].down) {
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
  "stage_id": "stage",
  "fullscreen": true,
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
  },          // maps object
  "resources": [
    {
      "type": "image",
      "url": "resources/images/player.png",
      "id": "player",
      "source_x": 0,
      "source_y": 0,
      "source_width": 26,
      "source_height": 32,
    },
    {
      "type": "image",
      "url": "resources/images/dirt.png",
      "id": "dirt",
      "source_x": 0,
      "source_y": 0,
      "source_width": 64,
      "source_height": 64,
    },
    {
      "type": "image",
      "url": "resources/images/grass.png",
      "id": "grass",
      "source_x": 0,
      "source_y": 0,
      "source_width": 64,
      "source_height": 64,
    },
    {
      "type": "image",
      "url": "resources/images/coin.png",
      "id": "coin",
      "source_x": 0,
      "source_y": 0,
      "source_width": 48,
      "source_height": 48,
    },
    {
      "type": "image",
      "url": "resources/images/water.png",
      "id": "water",
      "source_x": 0,
      "source_y": 0,
      "source_width": 64,
      "source_height": 64,
    },
    {
      "type": "image",
      "url": "resources/images/bg.png",
      "id": "bg",
      "source_x": 0,
      "source_y": 0,
      "source_width": 500,
      "source_height": 500,
    },
    {
      "type": "image",
      "url": "resources/images/particle.png",
      "id": "particle",
      "source_x": 0,
      "source_y": 0,
      "source_width": 10,
      "source_height": 10,
    },
    {
      "type": "image",
      "url": "resources/images/tileset.png",
      "id": "tileset",
      "source_x": 0,
      "source_y": 0,
      "source_width": 480,
      "source_height": 256,
    },
  ],          // resources array
};            // config object
