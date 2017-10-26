window.addEventListener("load", function () {
  game_manager = GameManager("config.json");
  game_manager.start_game();
});

let ConfigManager = (function (url) {
  // TODO: replace spec with ajax call to url
  // TODO: or, just put the spec at a location and put it in a script tag
  // it may be time to break these managers up anyway
  let config = null,
    config_spec = {
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
      "initial_map_id": "map1",
      "maps": {
        "map1": {
          "height": 500,
          "width": 500,
          "id": "map1",
          "player_layer": 2,
          "layers": [
            [
              {
                "id": "bg1",
                "img": "bg",
                "x": 0,
                "y": 0,
                "x_scale": 1,
                "y_scale": 1,
                "x_size": 500,
                "y_size": 500,
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
                "x": 0,
                "y": 0,
                "x_scale": 1,
                "y_scale": 1,
                "x_size": 500,
                "y_size": 500,
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
        }         // map object
      }           // maps object
    },            // config object
    load = function (config_spec) {
      config = JSON.parse(config_spec);
      return config;
    },
    get = function () {
      return config;
    },
    set = function (k, v) {
      config[k] = v;
      return config;
    },
    get_player = function () {
      return config.player;
    },
    get_maps = function () {
      return config.maps;
    };

  config = config_spec;

  return function () {
    return {
      get_config: get,
      set_config: set,
      get_player: get_player,
      get_maps: get_maps,
    };
  };
})();

let ContextManager = (function () {
  let context = null,
    canvas = null,
    get_context = function () {
      return context;
    },
    get_canvas = function () {
      return canvas;
    },
    set_context = function (new_context) {
      context = new_context;
      return context;
    },
    set_canvas = function (new_canvas) {
      canvas = new_canvas;
      context = canvas.getContext("2d");
      return canvas;
    },
    init = function (config) {
      let id = config.get_config()['canvas_id'];
      set_canvas(document.getElementById(id));
    };

  return function (config) {
    init(config);
    console.log("ContextManager init.");

    return {
      get_context: get_context,
      get_canvas: get_canvas,
      set_context: set_context,
      set_canvas: set_canvas,
    };
  };
})();

let ResourceManager = (function () {
  let image_base_url = null,
    resources = {
      'image': {},
      'sound': {},
    },
    parse = function (in_file) {
      return JSON.parse(in_file);
    },
    load = function (list) {
      let promises = [],
        load_resource = function (resource) {
          let load_image = function (resource) {
            let img = new Image(),
              promise = new Promise(
                function(resolve, reject) {
                  img.addEventListener("load", function () {
                    console.log("image filename " + resource.url + " loaded.");
                    resolve({
                      "type": resource.type,
                      "id": resource.id,
                      "url": resource.url,
                      "img": img,
                      "source_x": resource.source_x,
                      "source_y": resource.source_y,
                      "source_width": resource.source_width,
                      "source_height": resource.source_height,
                    });
                  }, false);
                  img.addEventListener("error", function () {
                    console.log("image filename " + resource.url + " failed to load.");
                    reject();
                  }, false);
                }
              );
            img.src = resource.url;
            return promise;
          };

          if (resource.type === 'image') {
            resource = load_image(resource);
          } else {
            console.log("attempted to load unsupported resource type: " + resource.type);
          }

          return resource;
        };

      parsed_resources = parse(list)['resources'];
      for (parsed_index in parsed_resources) {
        resource = parsed_resources[parsed_index];
        promises.push(load_resource(resource));
      }

      Promise.all(promises).then(
        function (loaded) {
          for (resource_index in loaded) {
            resource = loaded[resource_index];
            resources[resource.type][resource.id] = resource;
          }
          console.log("resources after load are:");
          console.log(resources);
        }, function () {
          console.log("trouble loading resources.");
        }
      );
    },
    get_resources = function () {
      return resources;
    },
    get_image = function (name) {
      return resources['image'][name];
    },
    init = function (config) {
      // TODO: use url to get list
      // url = config.get_config().resources.url
      url = {"resources":
        [
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
          }
        ]
      };
      load(JSON.stringify(url));
    };


  return function (config) {
    init(config);
    console.log("ResourceManager init.");

    return {
      load: load,
      get_resources: get_resources,
      get_image: get_image,
    };
  };
})();

let ControlManager = (function () {
  let controls = {},
    get_controls = function () {
      return controls;
    },
    init = function (_config) {
      document.addEventListener("keydown", function (e) {
        controls[e.code] = e;
      });

      document.addEventListener("keyup", function (e) {
        delete controls[e.code];
      });

      document.addEventListener("mousedown", function (e) {
        controls["mouse"] = e;
      });

      document.addEventListener("mouseup", function (e) {
        delete controls["mouse"];
      });
    };

  return function (_config) {
    init(_config);
    console.log("ControlManager init.");

    return {
      get_controls: get_controls
    };
  };
})();

let MapManager = (function () {
  let maps = null,
    current_map_id = null,
    last_change_time = null,
    min_change_time = null,
    get_entities = function (map_id) {
      map_id = map_id || current_map_id;
      return maps[map_id].layers;
    },
    get_current_map_id = function () {
      return current_map_id;
    },
    get_map = function (map_id) {
      map_id = map_id || current_map_id;
      console.log("map_id is " + map_id);
      return maps[map_id];
    },
    get_maps = function () {
      return maps;
    },
    change_maps = function (map_id) {
      let now = performance.now();
      if (now - last_change_time > min_change_time) {
        current_map_id = map_id;
        last_change_time = now;
      }
    },
    get_quadtree = function (map, leaf_size) {
      leaf_size = leaf_size || 25;
      map = map || maps[current_map_id];
      // iterate over map and produce quadtree

      let tree = build_quadtree(0, 0, map.width, map.height, leaf_size),
        entities = null;
      for (i in map.layers) {
        entities = map.layers[i];
        for (j in entities) {
          quadtree_insert(tree, entities[j]);
        }
      }

      return tree;
    },
    init = function (config_manager) {
      config = config_manager.get_config();
      maps = config_manager.get_maps();
      min_change_time = config['min_map_change_time'] || 150;
      current_map_id = config['initial_map_id'];
      last_change_time = performance.now();
    };

  return function (_config) {
    init(_config);
    console.log("MapManager init.");

    return {
      get_entities: get_entities,
      change_maps: change_maps,
      get_map: get_map,
      get_quadtree: get_quadtree,
      get_maps: get_maps,
      get_current_map_id: get_current_map_id,
    };
  };
})();

let PlayerManager = (function () {
  let player = null,
    controls = null,
    get_player = function () {
      return player;
    },
    get_tile = function () {
      return {
        "id": player.id,
        "img": player.img,
        "x": player.x,
        "y": player.y,
        "x_scale": player.x_scale,
        "y_scale": player.y_scale,
        "x_size": player.x_size,
        "y_size": player.y_size,
      };
    },
    modify_player = function (key, value) {
      player[key] = value;
    },
    update = function (delta, entity_manager) {
      keys = controls.get_controls();

      if (keys['KeyW'] || keys['ArrowUp']) {
        player.y_velocity -= player.y_acceleration;
      } else if (keys['KeyS'] || keys['ArrowDown']) {
        player.y_velocity += player.y_acceleration;
      } else {
        player.y_velocity *= 0.8;
      }

      if (keys['KeyA'] || keys['ArrowLeft']) {
        player.x_velocity -= player.x_acceleration;
      } else if (keys['KeyD'] || keys['ArrowRight']) {
        player.x_velocity += player.x_acceleration;
      } else {
        player.x_velocity *= 0.8;
      }

      // todo: write generic clamp
      if (player.x_velocity > player.max_x_velocity) {
        player.x_velocity = player.max_x_velocity;
      } else if (player.x_velocity < -player.max_x_velocity) {
        player.x_velocity = -player.max_x_velocity;
      }
      if (player.y_velocity > player.max_y_velocity) {
        player.y_velocity = player.max_y_velocity;
      } else if (player.y_velocity < -player.max_y_velocity) {
        player.y_velocity = -player.max_y_velocity;
      }

      player.x += delta * player.x_velocity;
      player.y += delta * player.y_velocity;

      // todo: the map should probably clamp max/min positions
      if (player.x > player.max_x) {
        player.x = player.max_x;
      } else if (player.x < player.min_x) {
        player.x = player.min_x;
      }
      if (player.y > player.max_y) {
        player.y = player.max_y;
      } else if (player.y < player.min_y) {
        player.y = player.min_y;
      }

      entity_manager.move_entity(player, player.x, player.y);

      if (player.score >= 1) {
        console.log("player wins.");
        player.score = 0;
      }
    },
    init = function (config, _controls) {
      player = config.get_player(),
      controls = _controls;
    };

  return function (config, _controls) {
    init(config, _controls);
    console.log("PlayerManager init.");

    return {
      get_player: get_player,
      get_tile: get_tile,
      update: update,
      modify_player: modify_player,
    };
  };
})();

let PhysicsManager = (function () {
  let physics = null,
    to_rect = function (entity) {
      return {
        'left': entity.x,
        'width': entity.x_size,
        'top': entity.y,
        'height': entity.y_size,
        'mid_x': entity.x + entity.x_size / 2,
        'mid_y': entity.y + entity.y_size / 2,
        'collide_distance': Math.max(entity.x_size / 2, entity.y_size / 2),
      };
    },
    distance = function (rect_one, rect_two, debug) {
      let x_distance = Math.abs(rect_one.mid_x - rect_two.mid_x),
        y_distance = Math.abs(rect_one.mid_y - rect_two.mid_y),
        hypotenuse = Math.sqrt(
          x_distance * x_distance + y_distance * y_distance
        );

        debug = debug || false;
        if (debug) {
          console.log("r1");
          console.log(rect_one);
          console.log("r2");
          console.log(rect_two);
          console.log("xd");
          console.log(x_distance);
          console.log("yd");
          console.log(y_distance);
          console.log("hyp");
          console.log(hypotenuse);
          debugger;
        }

        return hypotenuse;
    },
    collide = function (entity_one, entity_two, debug) {
      let rect_one = to_rect(entity_one),
        rect_two = to_rect(entity_two);
        rect_distance = distance(rect_one, rect_two, debug);

      return (rect_distance <= rect_one.collide_distance+rect_two.collide_distance);
    },
    init = function () {
      physics = {};
    };

  return function () {
    init();

    return {
      physics: physics,
      collide: collide,
    };
  };
})();

let EntityManager = (function () {
  let entities = null,
    player = null,
    controls = null,
    maps = null,
    current_map_id = null,
    physics = null,
    tree = null,
    particle_count = 0,
    last_particle_added = null,
    stale_entities = function () {
      let debug = true; // TODO: make a debug manager
      let stale = current_map_id !== maps.get_current_map_id();
      if (debug && stale) {
        console.log("found stale entities.");
      }
      return stale;
    },
    get_entity = function (id) {
      for (i in entities) {
        if (entities[i].id === id) {
          return entities[i].id;
        }
      }
    },
    get_player_manager = function () {
      return player;
    },
    get_entities = function () {
      let x = -100, y = -100, width = 600, height = 600;
      let et = quadtree_get_by_range(tree, x, y, width, height);
      return et.sort(
        function (a, b) {
          return a.layer - b.layer;
        }
      );
    },
    setup_entities = function () {
      let current_map = maps.get_map(),
        layers = current_map.layers;

      current_map_id = current_map.id;

      // paste the player layer into the correct spot
      layers.splice(current_map.player_layer, 0, [player.get_player()]);
      tree = maps.get_quadtree(current_map);
      layers.splice(current_map.player_layer, 1);
      entities = get_entities();
    },
    move_entity = function (entity, x, y) {
      quadtree_remove_by_id(tree, entity.id);
      entity.x = x;
      entity.y = y;
      quadtree_insert(tree, entity);
    },
    add_entity = function (entity) {
      quadtree_insert(tree, entity); // TODO: continue thinking about dynamic entities
    },
    remove_entity = function (id) {
      quadtree_remove_by_id(tree, id);
    },
    collide = function (entity) {
      let collisions = [], target = null;
      if (stale_entities()) {
        setup_entities();
      }

      for (i in entities) {
        target = entities[i];
        if (target.active !== false && entity.id !== target.id && physics.collide(entity, target)) {
          collisions.push(target);
        }
      }

      return collisions;
    },
    update = function (delta) {
      let keys = controls.get_controls();
      if (keys['KeyM']) {
        // should use real map ids and not just ascending integer indexes of the map's location in the map array
        if (maps.get_current_map_id() === "map2") {
          maps.change_maps("map1");
        } else {
          maps.change_maps("map2");
        }
      } else if (keys['KeyZ']) {
        if (performance.now() - last_particle_added > 100) {
          particle_count += 1;
          last_particle_added = performance.now();

          add_entity({
            'x': Math.random()*500,
            'y': Math.random()*500,
            'x_scale': 1,
            'y_scale': 1,
            'x_size': 10,
            'y_size': 10,
            'x_velocity': Math.random()*50-25,
            'y_velocity': Math.random()*50-25,
            'layer': 1.5,
            'id': 'projectile' + particle_count,
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

      if (stale_entities()) {
        setup_entities();
      }

      entities = get_entities();
      for (i in entities) {
        if (entities[i].update) {
          entities[i].update(delta, this);
        }
      }

      player.update(delta, this);
    },
    init = function (_controls, _player, _maps, _physics) {
      controls = _controls;
      player = _player;
      maps = _maps;
      physics = _physics;
      last_particle_added = performance.now();
      setup_entities();
    };

  return function (_controls, _player, _maps, _physics) {
    init(_controls, _player, _maps, _physics);
    console.log("EntityManager init.");

    return {
      get_entities: get_entities,
      get_entity: get_entity,
      get_player_manager: get_player_manager,
      stale_entities: stale_entities,
      setup_entities: setup_entities,
      update: update,
      collide: collide,
      move_entity: move_entity,
    };
  };
})();

let RenderManager = (function () {
  let context = null,
    context_manager = null,
    frames_per_second = null,
    last_time = performance.now(),
    current_time = performance.now(),
    entities = null,
    resources = null;

    set_context = function (passed_context) {
      context_manager = passed_context;
      context = passed_context.get_context();
    },
    draw = function (tile, context, delta) {
      let resource = resources.get_image(tile.img);
      if (resource && tile.active !== false) {
        context.drawImage(
          resource.img,
          resource.source_x, resource.source_y,
          resource.source_width, resource.source_height,
          tile.x, tile.y,
          tile.x_scale * resource.source_width,
          tile.y_scale * resource.source_height
        );
      }
    },
    next_frame = function () {
      current_time = performance.now();
      let delta = ((current_time - last_time)/1000) * frames_per_second;
      last_time = current_time;

      draw_list = entities.get_entities();
      //console.log(draw_list.length);
      for (i in draw_list) {
        draw(draw_list[i], context, delta);
      }
      entities.update(delta);

      requestAnimationFrame(next_frame);
    },
    init = function (config, global_context, _resources, _entities) {
      set_context(global_context);
      frames_per_second = config.get_config()['frames_per_second'];
      resources = _resources;
      entities = _entities;
    };

  return function (config, global_context, _resources, _entities) {
    init(config, global_context, _resources, _entities);
    console.log("RenderManager init.");

    return {
      next_frame: next_frame,
      set_context: set_context,
    };
  }
})();

let GameManager = (function () {
  let config_manager = null,
    control_manager = null,
    player_manager = null,
    map_manager = null,
    entity_manager = null,
    context_manager = null,
    resource_manager = null,
    render_manager = null,
    physics_manager= null,
    start_game = function () {
      console.log("the loop would now begin.");
      render_manager.next_frame();
    },
    init = function (config_url) {
      config_manager = ConfigManager(config_url);

      physics_manager = PhysicsManager();
      control_manager = ControlManager();
      player_manager = PlayerManager(config_manager, control_manager);
      map_manager = MapManager(config_manager);
      entity_manager = EntityManager(
        control_manager,
        player_manager,
        map_manager,
        physics_manager
      );

      context_manager = ContextManager(config_manager);
      resource_manager = ResourceManager(config_manager);
      render_manager = RenderManager(
        config_manager,
        context_manager,
        resource_manager,
        entity_manager,
      );
    };

  return function (config_url) {
    init(config_url);
    console.log("GameManager init.");

    return {
      start_game: start_game
    };
  };
})();
