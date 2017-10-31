window.addEventListener("load", function () {
  game_manager = GameManager("config.json");
  game_manager.start_game();
});



let ConfigManager = (function (url) {
  // TODO: replace spec with ajax call to url
  let map_bg = {
    "id": "bg1",
    "img": "bg",
    "x": -3000,
    "y": -3000,
    "x_scale": 12,
    "y_scale": 12,
    "x_size": 6000,
    "y_size": 6000,
    "layer": -1,
  };

  let config = null,
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
    },
    get_resources = function () {
      return config.resources;
    },
    get_game_state = function () {
      let state = {
        init: function () {},
        update: function () {},
      };

      if (config.game) {
        state.init = config.game.init || state.init;
        state.update = config.game.update || state.update;
      }

      return state;
    }

  // forcing a background into these maps
  // TODO: I'm going to have to find some way to add maps dynamically
  map_test.layers.unshift([map_bg]);
  map_field.layers.unshift([map_bg]);
  config_spec.maps.map_test = map_test;
  config_spec.maps.map_field = map_field;
  config = config_spec;

  return function () {
    return {
      get_config: get,
      set_config: set,
      get_player: get_player,
      get_maps: get_maps,
      get_game_state: get_game_state,
      get_resources: get_resources,
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



let CameraManager = (function () {
  let camera = null,
    get = function () {
      return camera;
    },
    get_offset = function () {
      return {
        x: camera.x,
        y: camera.y,
      };
    },
    center = function (x, y) {
      let offset_x = x - camera.raw_width / 2,
        offset_y = y - camera.raw_height / 2;

      move(offset_x, offset_y);
    },
    move = function (x, y) {
      camera.raw_x = x;
      camera.raw_y = y;
      camera.x = camera.raw_x;
      camera.y = camera.raw_y;
    },
    resize = function (width, height) {
      camera.raw_width = width;
      camera.raw_height = height;
      camera.width = camera.raw_width;
      camera.height = camera.raw_height;
    },
    init = function (config_manager) {
      console.log("CameraManager init.");

      let config = config_manager.get_config(),
        camera_config = config['camera'];

      camera = {
        raw_x: camera_config.x,
        raw_y: camera_config.y,
        raw_width: camera_config.width,
        raw_height: camera_config.height,
        x: camera_config.x,
        y: camera_config.y,
        width: camera_config.width,
        height: camera_config.height,
        top_margin: camera_config.top_margin,
        bottom_margin: camera_config.bottom_margin,
        left_margin: camera_config.left_margin,
        right_margin: camera_config.right_margin,
      };
    };

  return function (config_manager) {
    init(config_manager);

    return {
      get: get,
      get_offset: get_offset,
      move: move,
      resize: resize,
      center: center,
    };
  }
})();



let ResourceManager = (function () {
  let image_base_url = null,
    resources = {
      'image': {},
      'sound': {},
    },
    load = function (parsed_resources) {
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
      load(config.get_resources());
    };

  return function (config_manager) {
    init(config_manager);
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
      return maps[map_id];
    },
    get_maps = function () {
      return maps;
    },
    change_maps = function (map_id, entity_manager) {
      let now = performance.now();

      // only change maps every min_change_time ms
      if (now - last_change_time > min_change_time) {
        // teardown actions in old map (if any)
        if (maps[current_map_id].deinit) {
          maps[current_map_id].deinit(entity_manager);
        }
        current_map_id = map_id;
        // setup actions in new map (if any)
        if (maps[current_map_id].init) {
          maps[current_map_id].init(entity_manager);
        }
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
    update = function (delta, entity_manager) {
      if (maps[current_map_id].update) {
        maps[current_map_id].update(delta, entity_manager);
      }
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
      update: update,
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
      entity_manager.get_camera_manager().center(player.x, player.y);

      if (player.score >= 1) {
        console.log("player wins.");
        player.score = 0;
      }
    },
    init = function (config, _controls) {
      controls = _controls;
      player = config.get_player();
      // TODO: fix this when map-load actions are implemented
      let local_config = config.get_config(),
        initial_map = local_config.initial_map_id,
        player_layer = local_config.maps[initial_map].player_layer;

      player.layer = player_layer;
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

        return hypotenuse;
    },
    collide = function (entity_one, entity_two, debug) {
      let rect_one = to_rect(entity_one),
        rect_two = to_rect(entity_two);
        rect_distance = distance(rect_one, rect_two, debug);

      return (rect_distance <= rect_one.collide_distance+rect_two.collide_distance);
    },
    init = function () {
      console.log("PhysicsManager init.");

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
    camera_manager = null,
    camera = null,
    controls = null,
    maps = null,
    current_map_id = null,
    physics = null,
    tree = null,
    particle_count = 0,
    last_particle_added = null,
    game_state = null,
    stale_entities = function () {
      let debug = true;
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
    get_map_manager = function () {
      return maps;
    },
    get_control_manager = function () {
      return controls;
    },
    get_camera_manager = function () {
      return camera_manager;
    },
    get_entities = function () {
      let x = camera.x-camera.left_margin,
        y = camera.y-camera.top_margin,
        width = camera.width+camera.right_margin,
        height = camera.height+camera.bottom_margin;

      let et = quadtree_get_by_range(tree, x, y, x+width, y+height);

      let background = quadtree_get_by_id(tree, "bg1");
      if (background) {
        et.push(quadtree_get_by_id(tree, "bg1"));
      }

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
      quadtree_insert(tree, entity);
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
      maps.update(delta, this);
      game_state.update(delta, this);
    },
    init = function (_controls, _player, _camera, _maps, _physics, _game) {
      controls = _controls;
      let tp = player = _player;
      camera_manager = _camera;
      camera = _camera.get();
      maps = _maps;
      physics = _physics;
      game_state = _game;
      last_particle_added = performance.now();
      setup_entities();
    };

  return function (_controls, _player, _camera, _maps, _physics, _game) {
    init(_controls, _player, _camera, _maps, _physics, _game);
    console.log("EntityManager init.");

    return {
      get_entities: get_entities,
      get_entity: get_entity,
      get_player_manager: get_player_manager,
      get_map_manager: get_map_manager,
      get_control_manager: get_control_manager,
      get_camera_manager: get_camera_manager,
      stale_entities: stale_entities,
      setup_entities: setup_entities,
      update: update,
      collide: collide,
      move_entity: move_entity,
      add_entity: add_entity,
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
    resources = null,

    set_context = function (passed_context) {
      context_manager = passed_context;
      context = passed_context.get_context();
    },
    draw = function (tile, context, delta, offset) {
      let resource = resources.get_image(tile.img),
        source_x = 0, source_y = 0, source_width = 0, source_height = 0;

      if (resource && tile.active !== false) {
        source_x = tile.source_x || resource.source_x;
        source_y = tile.source_y || resource.source_y;
        source_width = tile.source_width || resource.source_width;
        source_height = tile.source_height || resource.source_height;

        context.drawImage(
          resource.img,
          source_x, source_y,
          source_width, source_height,
          tile.x-offset.x, tile.y-offset.y,
          tile.x_scale * source_width,
          tile.y_scale * source_height
        );
      }
    },
    next_frame = function () {
      current_time = performance.now();
      let delta = ((current_time - last_time)/1000) * frames_per_second;
      last_time = current_time;

      let world_offset = entities.get_camera_manager().get_offset(),
        draw_list = entities.get_entities();
      let canvas = context_manager.get_canvas(),
        render_width = canvas.width,
        render_height = canvas.height,
        context = context_manager.get_context();

      for (i in draw_list) {
        draw(draw_list[i], context, delta, world_offset);
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
      game_state.init(
        entity_manager, control_manager, map_manager, player_manager
      );
      render_manager.next_frame();
    },
    init = function (config_url) {
      config_manager = ConfigManager(config_url);
      game_state = config_manager.get_game_state();

      physics_manager = PhysicsManager();
      control_manager = ControlManager();
      player_manager = PlayerManager(config_manager, control_manager);
      camera_manager = CameraManager(config_manager);
      map_manager = MapManager(config_manager);
      entity_manager = EntityManager(
        control_manager,
        player_manager,
        camera_manager,
        map_manager,
        physics_manager,
        game_state,
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
      start_game: start_game,
    };
  };
})();
