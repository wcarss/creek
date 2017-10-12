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
      "resource_url": "resources.json",
      "controls": null,
      "base_url": "",
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
                  //console.log("coin x position:" + this.x_position);
                }
              }
            ],
            [
              {
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
    };

  //config = load(config_spec);
  config = config_spec;

  return function () {
    return {
      get_config: get,
      set_config: set,
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
    init = function (id) {
      console.log(id);
      let el = document.getElementById(id);
    //  debugger;
      console.log(el);
      set_canvas(el);
    };

  return function (_id) {
    init(_id);

    return {
      get_context: get_context,
      get_canvas: get_canvas,
      set_context: set_context,
      set_canvas: set_canvas,
    };
  };
})()

let ResourceManager = (function () {
  let config = null,
    resources = {
      'image': {},
      'sound': {},
    },
    parse = function (in_file) {
      return JSON.parse(in_file);
    },
    load = function (list) {
      console.log("resources here is");
      console.log(resources);
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
            url = resource.url;
            if (config.get_config().image_base_url) {
              url = config.get_config().image_base_url;
            }
            img.src = url;
            return promise;
          };

          if (resource.type === 'image') {
            resource = load_image(resource);
          } else {
            console.log("attempted to load unsupported resource type: " + resource.type);
          }

          return resource;
        };

      //console.log(parse(list));
      parsed_resources = parse(list)['resources'];
      for (parsed_index in parsed_resources) {
        resource = parsed_resources[parsed_index];
        console.log(resource);
        promises.push(load_resource(resource));
      }

      Promise.all(promises).then(
        function (loaded) {
          console.log("resources loaded.");
          for (resource_index in loaded) {
            resource = loaded[resource_index];
            console.log("loaded this resource:");
            console.log(resource);
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
      //debugger;
      return resources['image'][name];
    },
    init = function (_config) {
      config = _config;
      // TODO: use url to get list
      // TODO: before even that, get *any image* here
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


  return function (_config) {
    init(_config);
    //debugger;

    console.log("resource manager init'd");
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
    console.log("control manager init.");

    return {
      get_controls: get_controls
    };
  };
})();

let MapManager = (function () {
  let maps = null,
    current_map_id = null,
    get_current_map = function () {
      return maps[current_map_id];
    },
    get_player = function () {
      let current_map = maps[current_map_id],
        player_layer = current_map.player_layer;
      return current_map[player_layer][0];
    },
    get_entities = function (map_id) {
      map_id = map_id || current_map_id;
      return maps[current_map_id].layers;
    },
    get_map = function (map_id) {
      map_id = map_id || current_map_id;
      return maps[map_id];
    },
    init = function (_maps) {
      //spec = load_spec(map_url)['maps'][0];
      maps = _maps;//build_map(spec.id, spec.layers, spec.player_layer);
    };

  return function (_maps) {
    init(_maps);

    console.log("Map manager init.");
    return {
      get_map: get_map,
    };
  };
})();

let PlayerManager = (function () {
  let player = null,
    config = null,
    controls = null,
    get_player = function () {
      return player;
    },
    update = function (delta) {
      //console.log("updating the player by " + delta);
      keys = controls.get_controls();
      //console.log("keys is:");
      //console.log(keys);

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
    init = function (_config, _controls) {
      config = _config;
      player = config.maps[0]['layers'][_config.maps[0]['player_layer']][0];
      controls = _controls;
    };

  return function (_config, _controls) {
    init(_config, _controls);
    console.log("Player manager init.");

    return {
      get_player: get_player,
      update: update
    };
  };
})();

let EntityManager = (function () {
  let entities = null,
    config = null,
    context = null,
    resources = null,
    controls = null,
    maps = null,
    player = null,
    get_entities = function () {
      return entities;
    },
    get_draw_list = function () {
      let _map = entities,
        start_layer = 0,
        end_layer = _map.layers.length;
        draw_list = [];

      for (layer_index = start_layer; layer_index < end_layer; layer_index++) {
        for (tile_index = 0; tile_index < _map.layers[layer_index].length; tile_index++) {
          tile = _map.layers[layer_index][tile_index];
          //console.log("tile is" + tile);
          resource = resources.get_image(tile.img);
          //console.log("LOOK HERE >>>>>>>>>>>");
          //console.log(tile.img);
          draw_list.push(tile);
        }
      }
      return draw_list;
    },
    get_entity = function (id) {
      return entity[id];
    },
    update = function (delta) {
      let e = get_draw_list();
      //debugger;
      for (i in e) {
        if (e[i].update) {
          e[i].update(delta);
        }
      }
    },
    init = function (_config, _context, _resources, _controls, _maps, _player) {
      let updateable_entity = {
        x: 10,
        y: 10,
        x_vel: 0.1,
        y_vel: 0.1,
        id: "test",
        image: _resources.get_image('player'),
        update: function (delta, maps) {
          x += x_vel * delta;
          y += y_vel * delta;
          e = maps.get_entity('test');
          e.x = x;
          e.y = y;
        }
      };
      entities = _config.maps[0];
      config = _config;
      context = _context;
      resources = _resources;
      controls = _controls;
      maps = _maps;
      player = _player;
    };

  return function (_config, _context, _resources, _controls, _maps, _player) {
    init(_config, _context, _resources, _controls, _maps, _player);
    console.log("Entity manager init.");

    return {
      get_entities: get_entities,
      get_draw_list: get_draw_list,
      update: update
    };
  };
})();

let RenderManager = (function () {
  let context = null,
    context_manager = null,
    last_time = performance.now(),
    current_time = performance.now(),
    config = null,
    controls = null,
    player = null,
    entities = null,
    render = null,
    resources = null;

    set_context = function (passed_context) {
      context_manager = passed_context;
      context = passed_context.get_context();
    },
    draw = function (tile, context, delta) {
      resource = resources.get_image(tile.img);
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
      delta = (current_time - last_time)/1000;
      delta *= 40;
      last_time = current_time;
      //console.log("frame out! delta " + delta);
      //console.log("control state: ");
      //if (controls.get_controls()) {
        //console.log(controls.get_controls());
      //}

      draw_list = entities.get_draw_list();
      for (i in draw_list) {
        draw(draw_list[i], context, delta);
      }
      player.update(delta);
      entities.update(delta);

      requestAnimationFrame(next_frame);
    },
    init = function (_config, global_context, _resources, _controls, _player, _entities) {
      console.log("init running.");
      set_context(global_context);
      config = _config;
      spec = _config['maps'][0];
      resources = _resources;
      controls = _controls;
      player = _player;
      entities = _entities;
    };

  return function (_config, global_context, _resources, _controls, _player, _entities) {
    init(_config, global_context, _resources, _controls, _player, _entities);
    console.log("Render manager init.");

    return {
      next_frame: next_frame,
      set_context: set_context,
    };
  }
})();

let GameManager = (function () {
  //console.log("trying to manage the game, here...");
  let config_manager = null,
    config = null,
    context_manager = null,
    resource_manager = null,
    control_manager = null,
    map_manager = null,
    player_manager = null,
    entity_manager = null,
    start = function () {
      console.log("the loop would now begin.");
      render_manager.next_frame();
      /* probably the contents of next_frame:
        control_manager.update_controls();
        dt = self.track_time();
        entity_manager.update(dt);
        player_manager.update(dt);
        map_manager.draw();
        requestAnimationFrame();
      */
    },
    init = function (_config_url) {
      config_manager = ConfigManager(_config_url),
      config = config_manager.get_config(),
      context_manager = ContextManager(config.canvas_id),
      resource_manager = ResourceManager(config_manager),
      control_manager = ControlManager(config.controls);
      map_manager = MapManager(config.maps),
      player_manager = PlayerManager(config, control_manager),
      entity_manager = EntityManager(
        config,
        context_manager,
        resource_manager,
        control_manager,
        map_manager,
        player_manager,
      ),
      render_manager = RenderManager(
        config,
        context_manager,
        resource_manager,
        control_manager,
        player_manager,
        entity_manager,
      );
    };

  return function (_config_url) {
    init(_config_url);
    console.log("Game manager init.");

    return {
      start_game: start
    };
  };
})();
