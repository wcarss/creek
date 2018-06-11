"use strict";

let config_spec = {
  "game": {
    "init": function (manager) {
      let entity_manager = manager.get('entity'),
        control_manager = manager.get('control'),
        ui_manager = manager.get('ui'),
        map_manager = manager.get('map'),
        player_manager = manager.get('player'),
        request_manager = manager.get('request');

      this.particle_count = 0;
      this.last_particle_added = performance.now();
      this.player = player_manager.get_player();

      let data_load_request = request_manager.get("test.json");
      let data_load_request2 = request_manager.get("test.json");

      this.data_load = {
        id: "data_load",
        text: "null",
        x: 10,
        y: 110,
        offset_type: "camera",
        font: "14px sans",
        color: "white",
        update: function (delta, manager) {
          let requests = manager.get('request'),
            request = requests.get_request(data_load_request),
            data = request.data,
            init_at = request.initialized_at,
            resolved_at = request.resolved_at;

          if (data) {
            if (data.example) {
              this.text = "request " + request.id + ": " + data.example + ", in " + ((resolved_at-init_at)/1000).toFixed(3) + " seconds";
            } else {
              this.text = "request " + request.id + ": failed in " + ((resolved_at-init_at)/1000).toFixed(3) + " seconds";
              console.log("data_load request failed!");
              console.log(data);
            }
          }
        }
      }

      ui_manager.add_button({
        id: "map_cycle",
        x: 15,
        y: 50,
        width: 80,
        height: 30,
        text: "<p style='margin: 8px 0'>Next Map</p>",
        background: "black",
        style: 'color: white; text-align: center'
      });

      this.xy_text = {
        id: "xy",
        text: "x, y: " + this.player.x + ", " + this.player.y,
        x: 10, //this.player.x.toFixed(3),
        y: 20, //this.player.y.toFixed(3),
        offset_type: "camera",
        font: "14px sans",
        color: "white",
        update: function (delta, manager) {
          let player = manager.get('player').get_player();
          this.text = "x, y: " + player.x.toFixed(3) + ", " + player.y.toFixed(3);
        }
      };

     this.velo_text = {
        id: "xy",
        text: "xv, yv: " + this.player.x_velocity + ", " + this.player.y_velocity,
        x: 10, //this.player.x.toFixed(3),
        y: 95, //this.player.y.toFixed(3),
        offset_type: "camera",
        font: "14px sans",
        color: "white",
        update: function (delta, manager) {
          let player = manager.get('player').get_player();
          this.text = "xv, yv: " + player.x_velocity.toFixed(3) + ", " + player.y_velocity.toFixed(3);
        }
      };

      this.map_text = {
        id: "map",
        text: "map: " + map_manager.get_current_map_id(),
        x: 10,
        y: 38,
        offset_type: "camera",
        font: "14px sans",
        color: "white",
        update: function (delta, manager) {
          this.text = "map: " + manager.get('map').get_current_map_id();
        },
      }

      entity_manager.add_text(this.xy_text);
      entity_manager.add_text(this.velo_text);
      entity_manager.add_text(this.map_text);
      entity_manager.add_text(this.data_load);
    },
    "update": function (delta, manager) {
      let controls = manager.get('control'),
        entity_manager = manager.get('entity'),
        map_manager = manager.get('map'),
        player_manager = manager.get('player'),
        player = player_manager.get_player(),
        lol_text = null;

      if (controls.buttons('map_cycle') || controls.keys('KeyM')) {
        // should build a means to cycle that doesn't rely on hardcoding an if-ladder
        if (map_manager.get_current_map_id() === "map1") {
          map_manager.change_maps("map2");
        } else if (map_manager.get_current_map_id() === "map2") {
          map_manager.change_maps("field");
        } else if (map_manager.get_current_map_id() === 'field'){
          map_manager.change_maps('test');
        } else {
          map_manager.change_maps("map1");
        }
        player_manager.modify_player('layer', map_manager.get_map().player_layer);
      } else if (controls.keys('KeyL')) {
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
            update: function (delta, manager) {
              let player = manager.get('player').get_player();
              this.x = player.x+this.rando_x;
              this.y = player.y+this.rando_y;
            },
          }
          entity_manager.add_text(lol_text);
          this.loling = true;
        }
      } else if (controls.keys('KeyZ')) {
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
            'update': function (delta, manager) {
              let entity_manager = manager.get('entity');
              this.x += this.x_velocity * delta;
              this.y += this.y_velocity * delta;
              this.x_velocity *= 0.8;
              this.y_velocity *= 0.8;
              if (Math.random() > 0.95) {
                this.x_velocity += Math.random() * 50 - 25;
                this.y_velocity += Math.random() * 50 - 25;
              }
              entity_manager.move_entity(this, this.x, this.y);
            }
          });
        }
      }
    }
  },
  "canvas_id": "canvas",
  "stage_id": "stage",
  "fullscreen": false,
  "frames_per_second": 40,
  "resource_url": "resources.json",
  "controls": null,
  "base_url": "",
  "player": {
    "id": "player1",
    "img": "player",
    "x": 256,
    "y": 384,
    "layer": 2,
    "x_scale": 1,
    "y_scale": 1,
    "x_size": 26,
    "y_size": 32,
    "x_velocity": 0,
    "y_velocity": 0,
    "max_x_velocity": 8,
    "max_y_velocity": 8,
    "x_acceleration": 0.8,
    "y_acceleration": 0.8,
    "health": 10,
    "score": 0,
    "update": function (delta, manager) {
      let map_manager = manager.get('map'),
        controls = manager.get('control'),
        entity_manager = manager.get('entity');

      if (controls.keys('KeyW') || controls.keys('ArrowUp')) {
        this.y_velocity -= this.y_acceleration * delta;
      } else if (controls.keys('KeyS') || controls.keys('ArrowDown')) {
        this.y_velocity += this.y_acceleration * delta;
      } else {
        this.y_velocity *= 0.8;
      }

      if (controls.keys('KeyA') || controls.keys('ArrowLeft')) {
        this.x_velocity -= this.x_acceleration * delta;
      } else if (controls.keys('KeyD') || controls.keys('ArrowRight')) {
        this.x_velocity += this.x_acceleration * delta;
      } else {
        this.x_velocity *= 0.8;
      }

      this.x_velocity = clamp(
        this.x_velocity, -this.max_x_velocity, this.max_x_velocity
      );
      this.y_velocity = clamp(
        this.y_velocity, -this.max_y_velocity, this.max_y_velocity
      );

      this.x += delta * this.x_velocity;
      this.y += delta * this.y_velocity;

      let bounds = map_manager.get_bounds();
      this.x = clamp(this.x, bounds.x, bounds.width - this.x_size);
      this.y = clamp(this.y, bounds.y, bounds.height - this.y_size);

      entity_manager.move_entity(this, this.x, this.y);
      manager.get('camera').center(this.x, this.y);

      if (this.score >= 1) {
        console.log("this wins.");
        this.score = 0;
      }
    }
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
  "initial_map_id": "field",
  "maps": {
    "to_load": [
      "field",
      "test"
    ],
    "map1": {
      "height": 600,
      "width": 600,
      "id": "map1",
      "player_layer": 2,
      "needs_bg": true,
      "init": function (manager) {
        console.log("map " + this.id + ": initialized");
      },
      "deinit": function (manager) {
        console.log("map " + this.id + ": de-initialized");
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
            "update": function (delta, manager) {
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
              let collisions = manager.get('entity').collide(this);
              let player_manager = manager.get('player');
              let player = player_manager.get_player();
              for (i in collisions) {
                if (collisions[i].id === player.id) {
                  player_manager.modify_player('score', player.score+1);
                  this.active = false;
                }
              }
              manager.get('entity').move_entity(this, this.x, this.y);
            }
          }
        ]
      ]
    },
    "map2": {
      "id": "map2",
      "height": 600,
      "width": 600,
      "player_layer": 2,
      "needs_bg": true,
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
            "update": function (delta, manager) {
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
              let collisions = manager.get('entity').collide(this);
              let player_manager = manager.get('player');
              let player = player_manager.get_player();
              for (i in collisions) {
                if (collisions[i].id === player.id) {
                  player_manager.modify_player('score', player.score+1);
                  this.active = false;
                }
              }
              manager.get('entity').move_entity(this, this.x, this.y);
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
