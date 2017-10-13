let game = null,
  config = null;

window.addEventListener("load", function () {
  game_manager = GameManager("config.json");
  game_manager.start_game();
});

let ConfigManager = (function (url) {
  let config = null,
    // TODO: replace spec with ajax call to url
    config_spec = {
      "canvas_id": "canvas",
      "frames_per_second": 40,
      "resource_url": "resources.json",
      "controls": null,
      "base_url": "",
      "player": {
        "id": "player",
        "img": "player",
        "x_position": 10,
        "y_position": 10,
        "x_scale": 1,
        "y_scale": 1,
        'x_velocity': 0,
        'y_velocity': 0,
        'max_x_velocity': 12,
        'max_y_velocity': 12,
        'x_acceleration': 1.8,
        'y_acceleration': 1.8,
        'health': 10,
      },
      "initial_map_id": 0,
      "maps": [
        {
          "id": "some_map",
          "player_layer": 2,
          "layers": [
            [
              {
                "id": "tile1",
                "img": "grass",
                "x_position": 0,
                "y_position": 0,
                "x_scale": 1,
                "y_scale": 1,
              },
              {
                "id": "tile2",
                "img": "grass",
                "x_position": 64,
                "y_position": 0,
                "x_scale": 1,
                "y_scale": 1,
              },
              {
                "id": "tile3",
                "img": "water",
                "x_position": 128,
                "y_position": 0,
                "x_scale": 1,
                "y_scale": 1,
              },
              {
                "id": "tile4",
                "img": "dirt",
                "x_position": 0,
                "y_position": 64,
                "x_scale": 1,
                "y_scale": 1,
              },
              {
                "id": "tile5",
                "img": "dirt",
                "x_position": 64,
                "y_position": 64,
                "x_scale": 1,
                "y_scale": 1,
              }
            ],
            [
              {
                "id": "tile4",
                "img": "coin",
                "x_position": 64,
                "y_position": 0,
                "x_scale": 1,
                "y_scale": 1,
              },
              {
                "id": "tile5",
                "img": "coin",
                "x_position": 64,
                "y_position": 50,
                "x_scale": 0.5,
                "y_scale": 0.5,
                "x_velocity": 10,
                "y_velocity": 10,
                "max_x_velocity": 10,
                "max_y_velocity": 10,
                "x_acceleration": 2,
                "y_acceleration": 2,
                "value": 1,
                "flip": 1,
                "update": function (delta) {
                  this.last_x = this.x_position;
                  this.last_y = this.y_position;
                  this.x_position += this.x_velocity * delta;
                  this.y_position += this.y_velocity * delta;
                  this.x_velocity *= 0.8;
                  this.y_velocity *= 0.8;
                  if (Math.abs(this.last_x - this.x_position) < 0.01) {
                    this.flip *= -1;
                    this.x_velocity = this.max_x_velocity * this.flip;
                    this.y_velocity = this.max_y_velocity * this.flip;
                  }
                }
              }
            ]
          ]
        }
      ]
    };
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
    get_entities = function (map_id) {
      map_id = map_id || current_map_id;
      return maps[map_id].layers;
    },
    get_current_map_id = function () {
      return current_map_id;
    },
    get_map = function (map_id) {
      map_id = map_id || current_map_id;
      return maps[map_id];
    },
    change_maps = function (map_id) {
      current_map_id = map_id;
    },
    init = function (config) {
      maps = config.get_maps();
      current_map_id = config.get_config()['initial_map_id'];
    };

  return function (_config) {
    init(_config);
    console.log("MapManager init.");

    return {
      get_entities: get_entities,
      get_map: get_map,
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
          "x_position": player.x_position,
          "y_position": player.y_position,
          "x_scale": player.x_scale,
          "y_scale": player.y_scale,
      };
    },
    update = function (delta) {
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

      //console.log("player's x velocity:");
      //console.log(player.x_velocity);
      player.x_position += delta * player.x_velocity;
      player.y_position += delta * player.y_velocity;

      // todo: the map should probably clamp max/min positions
      if (player.x_position > player.max_x_position) {
        player.x_position = player.max_x_position;
      } else if (player.x_position < player.min_x_position) {
        player.x_position = player.min_x_position;
      }
      if (player.y_position > player.max_y_position) {
        player.y_position = player.max_y_position;
      } else if (player.y_position < player.min_y_position) {
        player.y_position = player.min_y_position;
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
      update: update
    };
  };
})();

let EntityManager = (function () {
  let entities = null,
    player = null,
    controls = null,
    maps = null,
    current_map_id = null,
    stale_entities = function () {
      return current_map_id != maps.get_current_map_id();
    },
    get_entities = function () {
      return entities;
    },
    setup_entities = function () {
      let current_map = maps.get_map(),
        layers = current_map.layers;

      current_map_id = current_map.id;
      entities = [];

      // paste the player layer into the correct spot
      layers.splice(current_map.player_layer, 0, [player.get_tile()]);

      // build entities by iterating over layers
      for (i in layers) {
        for (j in layers[i]) {
          entities.push(layers[i][j]);
        }
      }

      // pull player tile in its layer back out of stored map data
      layers.splice(current_map.player_layer, 1);
    },
    update = function (delta) {
      if (stale_entities()) {
        setup_entities();
      }

      for (i in entities) {
        if (entities[i].update) {
          entities[i].update(delta);
        }
      }

      player.update(delta);
    },
    init = function (_controls, _player, _maps) {
      controls = _controls;
      player = _player;
      maps = _maps;
      setup_entities();
    };

  return function (_controls, _player, _maps) {
    init(_controls, _player, _maps);
    console.log("EntityManager init.");

    return {
      get_entities: get_entities,
      stale_entities: stale_entities,
      setup_entities: setup_entities,
      update: update
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
      if (resource) {
        context.drawImage(
          resource.img,
          resource.source_x, resource.source_y,
          resource.source_width, resource.source_height,
          tile.x_position, tile.y_position,
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

    start_game = function () {
      console.log("the loop would now begin.");
      render_manager.next_frame();
    },
    init = function (config_url) {
      config_manager = ConfigManager(config_url),

      control_manager = ControlManager();
      player_manager = PlayerManager(config_manager, control_manager),
      map_manager = MapManager(config_manager),
      entity_manager = EntityManager(
        control_manager,
        player_manager,
        map_manager
      ),

      context_manager = ContextManager(config_manager),
      resource_manager = ResourceManager(config_manager),
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
