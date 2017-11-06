let GameManager = (function () {
  let config_manager = null,
    control_manager = null,
    ui_manager = null,
    player_manager = null,
    map_manager = null,
    entity_manager = null,
    context_manager = null,
    resource_manager = null,
    render_manager = null,
    physics_manager= null,

    start_game = function () {
      game_state.init(
        entity_manager,
        control_manager,
        ui_manager,
        map_manager,
        player_manager
      );
      render_manager.next_frame();
    },
    init = function () {
      config_manager = ConfigManager();
      game_state = config_manager.get_game_state();

      physics_manager = PhysicsManager();
      control_manager = ControlManager();
      ui_manager = UIManager(config_manager, control_manager);
      context_manager = ContextManager(config_manager);

      map_manager = MapManager(config_manager);
      player_manager = PlayerManager(config_manager, control_manager, map_manager);
      camera_manager = CameraManager(config_manager, context_manager, map_manager);
      entity_manager = EntityManager(
        control_manager,
        player_manager,
        camera_manager,
        map_manager,
        physics_manager,
        game_state,
      );

      resource_manager = ResourceManager(config_manager);
      render_manager = RenderManager(
        config_manager,
        context_manager,
        resource_manager,
        entity_manager,
      );
    };

  return function () {
    init();
    console.log("GameManager init.");

    return {
      start_game: start_game,
    };
  };
})();



let ConfigManager = (function () {
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
    },
    map_bg = {
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
    fullscreen = false,
    width = 0,
    height = 0,
    canvas_id = "",
    stage_id = "",
    get_context = function () {
      return context;
    },
    get_canvas = function () {
      return canvas;
    },
    get_width = function () {
      return width;
    },
    get_height = function () {
      return height;
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
    resize = function (event, x_size, y_size) {
      width = x_size || max_width();
      height = y_size || max_height();
      canvas.width = width;
      canvas.height = height;
      set_canvas(canvas);
    },
    make_fullscreen = function () {
      window.addEventListener("resize", resize);
    },
    stop_fullscreen = function () {
      window.removeEventListener("resize", resize);
      resize(null, width, height);
    },
    max_height = function () {
      return document.body.clientHeight;
    },
    max_width = function () {
      return document.body.clientWidth;
    },
    init = function (config_manager) {
      let config = config_manager.get_config();
      canvas_id = config.canvas_id || "canvas";
      stage_id = config.stage_id || "stage";
      width = config.width || max_width();
      height = config.height || max_height();
      fullscreen = config.fullscreen || false;

      stage = document.getElementById("stage");
      canvas = document.createElement("canvas");
      canvas.id = canvas_id;
      canvas.style.display = "block";

      stage.appendChild(canvas);
      resize(null, width, height);
      if (fullscreen === true) {
        make_fullscreen();
      }

      set_canvas(canvas);
    };

  return function (config_manager) {
    init(config_manager);
    console.log("ContextManager init.");

    return {
      get_context: get_context,
      get_canvas: get_canvas,
      set_context: set_context,
      set_canvas: set_canvas,
      get_width: get_width,
      get_height: get_height,
    };
  };
})();



let CameraManager = (function () {
  let camera = null,
    map_manager = null,
    fullscreen = null,
    get_camera = function () {
      return camera;
    },
    get_offset = function () {
      return {
        x: camera.x,
        y: camera.y,
      };
    },
    center = function (center_x, center_y) {
      let new_camera_x = camera.x,
        new_camera_y = camera.y;

      if (center_x > camera.inner_x + camera.inner_width) {
        new_camera_x += (center_x - (camera.inner_x + camera.inner_width));
      } else if (center_x < camera.inner_x) {
        new_camera_x += (center_x - camera.inner_x);
      }

      if (center_y > camera.inner_y + camera.inner_height) {
        new_camera_y += (center_y - (camera.inner_y + camera.inner_height));
      } else if (center_y < camera.inner_y) {
        new_camera_y += (center_y - camera.inner_y);
      }

      move(new_camera_x, new_camera_y);
    },
    move = function (x, y) {
      if (fullscreen && camera.width !== context_manager.get_width()) {
        resize(context_manager.get_width(), context_manager.get_height());
      }

      let bounds = map_manager.get_bounds();
      x = clamp(x, bounds.x, bounds.width);
      y = clamp(y, bounds.y, bounds.height);

      camera.x = x;
      camera.y = y;
      camera.inner_x = camera.x + camera.width / 4;
      camera.inner_y = camera.y + camera.height / 4;
    },
    resize = function (width, height) {
      camera.width = width;
      camera.height = height;
      camera.inner_width = width / 2;
      camera.inner_height = height / 2;
    },
    init = function (config_manager, _context_manager, _map_manager) {
      console.log("CameraManager init.");

      let config = config_manager.get_config(),
        camera_config = config.camera,
        width = camera_config.width,
        height = camera_config.height;

      fullscreen = config.fullscreen || false;

      map_manager = _map_manager;
      context_manager = _context_manager;

      if (fullscreen) {
        width = context_manager.get_width();
        height = context_manager.get_height();
      }

      camera = {
        inner_x: camera_config.x-width/4,
        inner_y: camera_config.y-height/4,
        inner_width: width / 2,
        inner_height: height / 2,
        x: camera_config.x,
        y: camera_config.y,
        width: width,
        height: height,
        top_margin: camera_config.top_margin,
        bottom_margin: camera_config.bottom_margin,
        left_margin: camera_config.left_margin,
        right_margin: camera_config.right_margin,
      };
    };

  return function (config_manager, _context_manager, _map_manager) {
    init(config_manager, _context_manager, _map_manager);

    return {
      get_camera: get_camera,
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
    get_resources = function () {
      return resources;
    },
    get_image = function (name) {
      return resources['image'][name];
    },
    load_image = function (resource) {
      let img = new Image();
      let promise = new Promise(
        function(resolve, reject) {
          img.addEventListener("load", function () {
            console.log("image " + resource.url + " loaded.");
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
            console.log("image " + resource.url + " failed to load.");
            reject();
          }, false);
        }
      );
      img.src = resource.url;
      return promise;
    },
    init = function (config) {
      let parsed_resources = config.get_resources(),
        resource = null,
        promises = [];

      for (i in parsed_resources) {
        resource = parsed_resources[i];

        if (resource.type === 'image') {
          resource_promise = load_image(resource);
          promises.push(resource_promise);
        } else {
          console.log("tried to load unknown resource type: " + resource.type);
        }
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
    };

  return function (config_manager) {
    init(config_manager);
    console.log("ResourceManager init.");

    return {
      get_resources: get_resources,
      get_image: get_image,
    };
  };
})();



let ControlManager = (function () {
  let controls = {
      buttons: {},
      mouse: {
        dragging_at: 0,
        down_at: 0,
      },
    },
    keys = function (id) {
      return controls[id] && controls[id].down;
    },
    buttons = function (id) {
      return controls.buttons[id] && controls.buttons[id].down;
    },
    mouse = function () {
      return contols.mouse.down;
    },
    get_controls = function () {
      return controls;
    },
    add_button = function (button) {
      controls.buttons[button.id] = button;
    },
    remove_button = function (id) {
      let button = controls.buttons[id];

      if (button) {
        delete controls.buttons[id];
      }
    },
    set_button = function (id, key, value) {
      let button = controls.buttons[id];
      if (button) {
        button.key = value;
        if (key === 'hover') {
          if (value === true) {
            button.hover = true;
            button.hover_at = performance.now();
          } else {
            button.hover = false;
            button.hovered_at = performance.now();
          }
        } else if (key === 'down') {
          if (value === true) {
            button.down = true;
            button.down_at = performance.now();
          } else {
            button.down = false;
            button.up_at = performance.now();
          }
        }
      }
    },
    init = function (_config) {
      document.addEventListener("keydown", function (e) {
        if (controls[e.code] === undefined) {
          controls[e.code] = {};
        }
        controls[e.code].event = e;
        controls[e.code].down = true;
        controls[e.code].down_at = performance.now();
      });

      document.addEventListener("keyup", function (e) {
        if (controls[e.code] !== undefined) {
          delete controls[e.code].event;
          controls[e.code].down = false;
          controls[e.code].up_at = performance.now();
        }
      });

      window.addEventListener("mousedown", function (e) {
        controls.mouse.down_event = e;
        controls.mouse.down = true;
        controls.mouse.down_at = performance.now();
      });

      window.addEventListener("mouseup", function (e) {
        delete controls.mouse.down_event;
        controls.mouse.down = false;
        controls.mouse.up_at = performance.now();
        // only set dragging to false if it was true
        if (controls.mouse.dragging === true) {
          controls.mouse.dragging = false;
          controls.mouse.dragged_at = performance.now();
        }
      });

      window.addEventListener("mousemove", function (e) {
        controls.mouse.move_event = e;
        if (controls.mouse.down === true && controls.mouse.dragging !== true) {
          controls.mouse.dragging = true;
          controls.mouse.dragging_at = performance.now();
        }
      });
    };

  return function (_config) {
    init(_config);
    console.log("ControlManager init.");

    return {
      get_controls: get_controls,
      add_button: add_button,
      remove_button: remove_button,
      set_button: set_button,
      keys: keys,
      buttons: buttons,
      mouse: mouse,
    };
  };
})();



let UIManager = (function () {
  let buttons = null,
    control_manager = null,
    add_button = function (button) {
      /* button should be like: {
       *   id: a unique id to refer to this button
       *   x: x-coord from left
       *   y: y-coord from top
       *   width: button-width
       *   height: button-height
       *   text: text for the button to display
       *
       *   background: (optional) background for button
       *   style: (optional) custom-style
       *   update: (optional) update-function taking entity_manager
       * }
       */

      let element = document.createElement("div");
      let style_string = "position: absolute; display: inline-block; ";
      style_string += "left: " + button.x + "px; ";
      style_string += "top: " + button.y + "px; ";
      style_string += "width: " + button.width + "px; ";
      style_string += "height: " + button.height + "px; ";
      style_string += "background: " + button.background + "; ";
      if (button.style) {
        style_string += button.style;
      }
      console.log(button.id + " style is: " + style_string);
      element.style = style_string;
      element.innerHTML = button.text;
      element.id = button.id;
      button.element = element;

      button.hover = false;
      button.down = false;
      button.hover_at = 0;
      button.down_at = 0;

      button.on_enter = function () {
        control_manager.set_button(button.id, 'hover', true);
      };
      button.on_out = function () {
        control_manager.set_button(button.id, 'hover', false);
      };
      button.on_down = function () {
        control_manager.set_button(button.id, 'down', true);
      };
      button.on_up = function () {
        control_manager.set_button(button.id, 'down', false);
      };

      element.addEventListener('mouseenter', button.on_enter);
      element.addEventListener('mouseout', button.on_out);
      element.addEventListener('mousedown', button.on_down);
      element.addEventListener('mouseup', button.on_up);

      let stage = document.getElementById("stage");
      stage.appendChild(element);

      buttons[button.id] = button;
      control_manager.add_button(button);
    },
    remove_button = function (id) {
      let button = buttons[id];

      control_manager.remove_button(id);

      if (!button || !button.element) {
        return null;
      }

      let element = button.element;
      element.removeEventListener('mouseenter', button.on_enter);
      element.removeEventListener('mouseout', button.on_out);
      element.removeEventListener('mousedown', button.on_down);
      element.removeEventListener('mouseup', button.on_up);

      return button;
    },
    get_buttons = function () {
      return buttons;
    },
    init = function (_config_manager, _control_manager) {
      buttons = {};
      control_manager = _control_manager;
      config = _config_manager.get_config()
    };

  return function (config_manager, control_manager) {
    init(config_manager, control_manager);

    return {
      get_buttons: get_buttons,
      add_button: add_button,
      remove_button: remove_button,
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
    get_bounds = function () {
      let map = maps[current_map_id];
      return {
        x: 0,
        y: 0,
        width: map.width,
        height: map.height,
      };
    },
    change_maps = function (map_id, entity_manager) {
      let now = performance.now();

      // only change maps every min_change_time ms
      if (now - last_change_time > min_change_time) {
        // teardown actions in old map (if any)
        if (maps[current_map_id].deinit) {
          maps[current_map_id].deinit(entity_manager);
        }

        // actually change the map
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
      get_bounds: get_bounds,
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
    map_manager = null,
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

      if (controls.keys('KeyW') || controls.keys('ArrowUp')) {
        player.y_velocity -= player.y_acceleration;
      } else if (controls.keys('KeyS') || controls.keys('ArrowDown')) {
        player.y_velocity += player.y_acceleration;
      } else {
        player.y_velocity *= 0.8;
      }

      if (controls.keys('KeyA') || controls.keys('ArrowLeft')) {
        player.x_velocity -= player.x_acceleration;
      } else if (controls.keys('KeyD') || controls.keys('ArrowRight')) {
        player.x_velocity += player.x_acceleration;
      } else {
        player.x_velocity *= 0.8;
      }

      player.x_velocity = clamp(
        player.x_velocity, -player.max_x_velocity, player.max_x_velocity
      );
      player.y_velocity = clamp(
        player.y_velocity, -player.max_y_velocity, player.max_y_velocity
      );

      player.x += delta * player.x_velocity;
      player.y += delta * player.y_velocity;

      let bounds = map_manager.get_bounds();
      player.x = clamp(player.x, bounds.x, bounds.width - player.x_size);
      player.y = clamp(player.y, bounds.y, bounds.height - player.y_size);

      entity_manager.move_entity(player, player.x, player.y);
      entity_manager.get_camera_manager().center(player.x, player.y);

      if (player.score >= 1) {
        console.log("player wins.");
        player.score = 0;
      }
    },
    init = function (config, _controls, _map_manager) {
      controls = _controls;
      map_manager = _map_manager;
      player = config.get_player();
    };

  return function (config, _controls, _map_manager) {
    init(config, _controls, _map_manager);
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
    texts = null,
    player = null,
    camera_manager = null,
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
      let camera = camera_manager.get_camera(),
        x = camera.x-camera.left_margin,
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
    get_texts = function () {
      return texts;
    },
    setup_entities = function () {
      let current_map = maps.get_map(),
        layers = current_map.layers;

      current_map_id = current_map.id;

      // paste the player layer into the correct spot and update player
      layers.splice(current_map.player_layer, 0, [player.get_player()]);
      player.modify_player('layer', current_map.player_layer);
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
    add_text = function (text) {
      text.offset_type = text.offset_type || "camera";
      text.font = text.font || "16px sans";
      text.color = text.color || "black";
      texts.push(text);
    },
    remove_text = function (id) {
      let to_remove = -1;

      for (i in texts) {
        if (texts[i].id === id) {
          to_remove = i;
        }
      }

      if (to_remove !== -1) {
        texts.splice(i, 1);
      }
    }
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

      for (i in texts) {
        if (texts[i].update) {
          texts[i].update(delta, this);
        }
      }
    },
    init = function (_controls, _player, _camera, _maps, _physics, _game) {
      controls = _controls;
      let tp = player = _player;
      camera_manager = _camera;
      maps = _maps;
      physics = _physics;
      game_state = _game;
      last_particle_added = performance.now();
      texts = [];
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
      add_text: add_text,
      get_texts: get_texts,
      remove_text: remove_text,
    };
  };
})();



let RenderManager = (function () {
  let context_manager = null,
    frames_per_second = null,
    last_time = performance.now(),
    current_time = performance.now(),
    entities = null,
    resources = null,
    stored_count = null,

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
    text_draw = function (text, context, delta, offset) {
      let x = text.x,
        y = text.y;

      if (text.offset_type !== "camera") {
        x = x - offset.x;
        y = y - offset.y;
      }

      context.fillStyle = text.color;
      context.font = text.font;
      context.fillText(text.text, x, y);
    },
    next_frame = function () {
      current_time = performance.now();
      let delta = ((current_time - last_time)/1000) * frames_per_second;
      last_time = current_time;

      let world_offset = entities.get_camera_manager().get_offset(),
        draw_list = entities.get_entities(),
        text_list = entities.get_texts(),
        context = context_manager.get_context();

      for (i in draw_list) {
        draw(draw_list[i], context, delta, world_offset);
      }
      for (i in text_list) {
        text_draw(text_list[i], context, delta, world_offset);
      }
      entities.update(delta);

      requestAnimationFrame(next_frame);
    },
    init = function (config_manager, _context_manager, _resources, _entities) {
      frames_per_second = config_manager.get_config()['frames_per_second'];
      context_manager = _context_manager;
      resources = _resources;
      entities = _entities;
    };

  return function (config, global_context, _resources, _entities) {
    init(config, global_context, _resources, _entities);
    console.log("RenderManager init.");

    return {
      next_frame: next_frame,
    };
  }
})();
