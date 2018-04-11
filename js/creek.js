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
    physics_manager = null,
    request_maanger = null,

    start_game = function () {
      game_state.init(
        entity_manager,
        control_manager,
        ui_manager,
        map_manager,
        player_manager,
        request_manager
      );
      render_manager.next_frame();
    },
    init = function () {
      config_manager = ConfigManager();
      game_state = config_manager.get_game_state();

      physics_manager = PhysicsManager();
      control_manager = ControlManager();
      request_manager = RequestManager();
      ui_manager = UIManager(config_manager, control_manager);
      context_manager = ContextManager(config_manager);
      cookie_manager = CookieManager(config_manager);

      map_manager = MapManager(config_manager);
      player_manager = PlayerManager(config_manager, control_manager, map_manager);
      camera_manager = CameraManager(config_manager, context_manager, map_manager);

      resource_manager = ResourceManager(config_manager);
      audio_manager = AudioManager(config_manager, resource_manager);
      entity_manager = EntityManager(
        control_manager,
        player_manager,
        camera_manager,
        map_manager,
        physics_manager,
        game_state,
        request_manager,
        ui_manager,
        cookie_manager,
        audio_manager
      );
      render_manager = RenderManager(
        config_manager,
        context_manager,
        resource_manager,
        entity_manager,
      );
      audio_manager.load_clips(resource_manager.get_resources()['sound']);
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
      let map = null,
        id = null,
        loading = [];
        defined = { ... config.maps };

      if (defined.to_load) {
        for (i in defined.to_load) {
          map = defined.to_load[i];
          id = request_manager.get("resources/maps/" + map + ".json", map);
          loading.push(id);
        }
        delete defined.to_load;
      }

      return {defined: defined, loading: loading};
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
    };

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



let RequestManager = (function () {
  let data = null,
    _method = null,
    state = null,
    url = null,
    requests = null,
    debug = null,
    get_data = function (id) {
      if (requests[id]) {
        return requests[id].data;
      }
    },
    get_request = function (id) {
      return requests[id];
    },
    remove = function (id) {
      if (requests[id]) {
        delete requests[id];
      }
    },
    get = function (url, id, options) {
      let body = null;
      if (options && options.body) {
        body = options.body;
      }
      return send('get', url, body, id, options);
    },
    post = function (url, body, id, options) {
      return send('post', url, body, id, options);
    },
    put = function (url, body, id, options) {
      return send('put', url, body, id, options);
    },
    _delete = function (url, id, options) {
      return send('delete', url, null, id, options);
    },
    options = function (url, id, options) {
      return send('options', url, null, id, options);
    },
    head = function (url, id, options) {
      return send('head', url, null, id, options);
    },
    send = function (method, url, body, id, options) {
      let _debug = debug;
      if (options && (options.debug === false || options.debug)) {
        _debug = options.debug;
      }

      if (!id) {
        id = timestamp_id();
        console.log("creating an id in " + method + " request for " + url);
      }

      if (requests[id]) {
        delete requests[id];
        console.log("overwriting id " + id + " in " + method + " request for " + url);
      }

      let new_request = {
        xhr: new XMLHttpRequest(),
        id: id,
        method: method,
        url: url,
        body: body,
        options: options,
        data: null,
        state: "initialized",
        initialized_at: performance.now(),
        resolved_at: null,
      };

      requests[id] = new_request;
      new_request.xhr.onload = function (e) {
        if (_debug) {
          console.log("request " + id + " text: " + this.responseText);
        }
        new_request.data = JSON.parse(this.responseText);
        new_request.state = "complete";
        new_request.resolved_at = performance.now();
      };
      new_request.xhr.open(method, url);
      new_request.xhr.send();

      return id;
    },
    init = function (_debug) {
      debug = _debug;
      requests = {};
    };

  return function (_debug) {
    init(_debug);

    return {
      get_data: get_data,
      get_request: get_request,
      get: get,
      post: post,
      put: put,
      'delete': _delete,
      send: send,
      options: options,
      head: head,
    };
  }
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


let CookieManager = (function () {
  let cookies = null,
    last_cookies = null,
    set_cookies = function (cookie_dict) {
      let cookie = null, value = null, output = null;

      for (key in cookie_dict) {
        cookie = cookie_dict[key];
        value = cookie.value;
        output = key + "=" + value;
        if (cookie.path) {
          output += ";path=" + cookie.path;
        }
        if (cookie.max_age) {
          output += ";max-age=" + cookie.max_age;
        }
        if (cookie.expires) {
          output += ";expires=" + cookie.expires;
        }
        if (cookie.domain) {
          output += ";domain=" + cookie.domain;
        }
        if (cookie.secure) {
          output += ";secure";
        }

        document.cookie = output;
      }
      load_cookies();
    },
    load_cookies = function () {
      let cookie_pairs = document.cookie.split("; "),
        cookie_pair = null;

      last_cookies = cookies;
      cookies = {};

      for (index in cookie_pairs) {
        cookie_pair = cookie_pairs[index].split("=");
        cookies[cookie_pair[0]] = cookie_pair[1];
      }

      return cookies;
    },
    get_cookies = function () {
      return cookies;
    },
    init = function (config_manager) {
      cookies = load_cookies();
    };

  return function (config_manager) {
    init(config_manager);
    console.log("CookieManager init.");

    return {
      get_cookies: get_cookies,
      set_cookies: set_cookies
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
    get_sound = function (name) {
      return resources['sound'][name];
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
    load_sound = function (resource) {
      let sound = document.createElement("audio");
      let promise = new Promise(
        function (resolve, reject) {
          sound.addEventListener("loadstart", function () {
            console.log("sound " + resource.url + " began loading.");
            resolve({
              type: resource.type,
              id: resource.id,
              url: resource.url,
              element: sound,
            });
          }, false);
          sound.addEventListener("error", function () {
            console.log("sound " + resource.url + " failed to load.");
            reject();
          }, false);
        }
      );
      sound.preload = "none";
      sound.loop = resource.looping;
      sound.muted = resource.muted;
      sound.volume = resource.volume;
      sound.src = resource.url;
      return promise;
    },
    init = function (config) {
      let parsed_resources = config.get_resources(),
        resource_promise = null,
        resource = null,
        promises = [];

      for (i in parsed_resources) {
        resource = parsed_resources[i];

        if (resource.type === 'image') {
          resource_promise = load_image(resource);
          promises.push(resource_promise);
        } else if (resource.type === 'sound') {
          resource_promise = load_sound(resource);
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
      get_sound: get_sound,
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

      let stage = document.getElementById("stage");
      stage.removeChild(element);

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
    loading = null,
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
    load_if_needed = function () {
      let to_remove = [];

      for (i in loading) {
        data = request_manager.get_data(loading[i]);
        if (data && data.map) {
          maps[data.map.id] = data.map;
          to_remove.push(i);
        }
      }

      for (i in to_remove) {
        loading.splice(to_remove[i], 1);
      }
    },
    is_loading = function () {
      return maps[current_map_id].loading;
    },
    init = function (config_manager) {
      config = config_manager.get_config();
      map_sets = config_manager.get_maps();
      maps = map_sets.defined;
      loading = map_sets.loading;
      for (i in loading) {
        maps[loading[i]] = {
          id: loading[i],
          loading: true,
          layers: [],
        };
      }
      min_change_time = config['min_map_change_time'] || 150;
      current_map_id = config['initial_map_id'];
      last_change_time = 0;
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
      load_if_needed: load_if_needed,
      is_loading: is_loading,
      get_current_map_id: get_current_map_id,
      update: update,
    };
  };
})();



let PlayerManager = (function () {
  let player = null,
    get_player = function () {
      return player;
    },
    modify_player = function (key, value) {
      player[key] = value;
    },
    update = function (delta, entity_manager) {
      player.update(delta, entity_manager);
    },
    init = function (config) {
      player = config.get_player();
    };

  return function (config, _controls, _map_manager) {
    init(config, _controls, _map_manager);
    console.log("PlayerManager init.");

    return {
      get_player: get_player,
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
    request_manager = null,
    cookie_manager = null,
    audio_manager = null,
    controls = null,
    maps = null,
    current_map_id = null,
    physics = null,
    tree = null,
    particle_count = 0,
    last_particle_added = null,
    game_state = null,
    last_loading = null,
    just_loaded = null,
    ui_manager = null,
    stale_entities = function () {
      let debug = true;
      let loading = maps.is_loading();
      let stale = current_map_id !== maps.get_current_map_id();
      if (debug && loading && (!last_loading || performance.now() - last_loading > 300)) {
        last_loading = performance.now();
        console.log("loading...");
      }

      if (!loading && last_loading !== null) {
        last_loading = null;
        stale = true;
        just_loaded = true;
        console.log("forced staleness to help load.");
      }

      if (debug && stale) {
        console.log("found stale entities.");
      }

      return loading || stale;
    },
    get_entity = function (id) {
      for (i in entities) {
        if (entities[i].id === id) {
          return entities[i];
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
    get_request_manager = function () {
      return request_manager;
    },
    get_ui_manager = function () {
      return ui_manager;
    },
    get_cookie_manager = function () {
      return cookie_manager;
    },
    get_audio_manager = function () {
      return audio_manager;
    },
    load_if_needed = function () {
      maps.load_if_needed();
    },
    clear_entities = function () {
      console.log("clearing all entities yo");
    },
    get_entities = function () {
      if (maps.is_loading()) {
        return entities;
      }
      if (stale_entities()) {
        setup_entities();
      }

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
        layers = current_map.layers,
        map_bg = {
          "id": "bg1",
          "img": "bg",
          "x": 0,
          "y": 0,
          "x_scale": 12,
          "y_scale": 12,
          "x_size": current_map.width,
          "y_size": current_map.height,
          "layer": -999999,
        };

      current_map_id = current_map.id;

      if (current_map.loading && !entities) {
        entities = [map_bg];
        tree = null;
        add_text({
          id: "loading",
          text: "loading",
          x: 10,
          y: 10,
          color: "black"
        });
        return;
      }

      if (just_loaded) {
        remove_text("loading");
        just_loaded = false;
      }

      if (current_map.needs_bg) {
        layers.unshift([map_bg]);
      }

      // paste the player layer into the correct spot and update player
      layers.splice(current_map.player_layer, 0, [player.get_player()]);
      player.modify_player('layer', current_map.player_layer);
      tree = maps.get_quadtree(current_map);
      layers.splice(current_map.player_layer, 1);
      entities = get_entities();
    },
    move_entity = function (entity, x, y) {
      if (maps.is_loading()) {
        return;
      }
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
        texts.splice(to_remove, 1);
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
    init = function (_controls, _player, _camera, _maps, _physics, _game, _request, _ui_manager, _cookie_manager, _audio_manager) {
      controls = _controls;
      let tp = player = _player;
      camera_manager = _camera;
      maps = _maps;
      physics = _physics;
      game_state = _game;
      request_manager = _request;
      ui_manager = _ui_manager;
      cookie_manager = _cookie_manager;
      audio_manager = _audio_manager;
      last_particle_added = performance.now();
      texts = [];
      setup_entities();
    };

  return function (_controls, _player, _camera, _maps, _physics, _game, _request, _ui_manager, _cookie_manager, _audio_manager) {
    init(_controls, _player, _camera, _maps, _physics, _game, _request, _ui_manager, _cookie_manager, _audio_manager);
    console.log("EntityManager init.");

    return {
      get_entities: get_entities,
      get_entity: get_entity,
      get_player_manager: get_player_manager,
      get_map_manager: get_map_manager,
      get_control_manager: get_control_manager,
      get_camera_manager: get_camera_manager,
      get_request_manager: get_request_manager,
      get_ui_manager: get_ui_manager,
      get_cookie_manager: get_cookie_manager,
      get_audio_manager: get_audio_manager,
      stale_entities: stale_entities,
      setup_entities: setup_entities,
      update: update,
      collide: collide,
      move_entity: move_entity,
      add_entity: add_entity,
      clear_entities: clear_entities,
      add_text: add_text,
      get_texts: get_texts,
      remove_text: remove_text,
      remove_entity: remove_entity,
      load_if_needed: load_if_needed,
    };
  };
})();



let AudioManager = (function () {
// intended use:
// resource manager creates audio elements from config urls, stores data about audio elements and urls and default state
// setup:
// audio_manager.load(data); -> sets initial state from audio elements of audio system
//
// single track:
//
// audio_manager.play("background_1") // un-pauses background_1
// audio_manager.pause("background_1"); // pause background 1
// audio_manager.stop("background_1"); // pause background_1, reset to 0
// audio_manager.volume("background_1", 0.5); // sets volume of background_1 to 50%
// audio_manager.loop("background_1", true) // set background_1 to loop
// audio_manager.playing("background_1") // -> bool
// audio_manager.get_volume("background_1") -> float 0.0 - 1.0
// audio_manager.paused("background_1") // -> bool
// audio_manager.looping("background_1") // -> bool
//
// all-track:
//
// audio_manager.pause_all(); // pauses all unpaused
// audio_manager.stop_all(); // pauses all, resets all to 0
// audio_manager.volume_all(level) // sets volume for all to level
  let clips = null,
    default_volume = null,
    resource_manager = null,
    currently_paused = null,
    all_muted = null;

  let get_clip = function (clip_id) {
      let sounds = null;
      if (clips === null) {
        sounds = resource_manager.get_resources()['sound'];
        if (!sounds || empty_dict(sounds)) {
          console.log("clips haven't loaded yet!");
          return null;
        } else {
          load_clips(sounds);
        }
      }
      if (!clips[clip_id]) {
        console.log("attempting to get clip: " + clip_id + " that wasn't found in clips");
      }
      return clips[clip_id];
    },
    play = function (clip_id) {
      let clip = get_clip(clip_id);
      clip.play();
    },
    pause = function (clip_id) {
      let clip = get_clip(clip_id);
      clip.pause();
    },
    stop = function (clip_id) {
      let clip = get_clip(clip_id);
      clip.stop();
    },
    volume = function (clip_id, level) {
      let clip = get_clip(clip_id);
      clip.volume(level);
    },
    set_time = function (clip_id, time) {
      let clip = get_clip(clip_id);
      clip.set_time(time);
    },
    mute = function (clip_id) {
      let clip = get_clip(clip_id);
      clip.mute();
    },
    unmute = function (clip_id) {
      let clip = get_clip(clip_id);
      clip.unmute();
    },
    loop = function (clip_id, looping_bool) {
      let clip = get_clip(clip_id);
      clip.loop(looping_bool);
    },
    playing = function (clip_id) {
      let clip = get_clip(clip_id);
      return clip.playing();
    },
    paused = function (clip_id) {
      let clip = get_clip(clip_id);
      return clip.paused();
    },
    get_volume = function (clip_id) {
      let clip = get_clip(clip_id);
      return clip.get_volume();
    },
    get_time = function (clip_id) {
      let clip = get_clip(clip_id);
      return clip.get_time();
    },
    muted = function (clip_id) {
      let clip = get_clip(clip_id);
      return clip.muted();
    },
    looping = function (clip_id) {
      let clip = get_clip(clip_id);
      return clip.looping();
    },
    duration = function (clip_id) {
      let clip = get_clip(clip_id);
      return clip.duration();
    },
    pause_all = function () {
      for (i in clips) {
        if (clips[i].playing()) {
          clips[i].pause();
          currently_paused.push(clips[i].id);
        }
      }
    },
    unpause_all = function () {
      for (i in currently_paused) {
        get_clip(currently_paused[i]).play();
      }
      currently_paused = [];
    },
    stop_all = function () {
      for (i in clips) {
        clips[i].stop();
      }
    },
    volume_all = function (level) {
      for (i in clips) {
        clips[i].volume(level);
      }
    },
    mute_all = function (level) {
      for (i in clips) {
        clips[i].mute();
      }

      all_muted = true;
    },
    unmute_all = function (level) {
      for (i in clips) {
        clips[i].unmute();
      }

      all_muted = false;
    },
    are_all_muted = function () {
      return all_muted;
    };

  let load_clips = function (loaded_clips) {
    let clip = null;

    for (i in loaded_clips) {
      clip_data = loaded_clips[i];
      console.log("loading clip " + clip_data.id);
      clip = {
        url: clip_data.url,
        id: clip_data.id,
        element: clip_data.element,
        play: function () {
          this.element.play();
        },
        pause: function () {
          this.element.pause();
        },
        stop: function () {
          this.element.pause();
          this.element.currentTime = 0;
        },
        volume: function (level) {
          this.element.volume = level;
        },
        set_time: function (time) {
          this.element.currentTime = time;
        },
        mute: function () {
          this.element.muted = true;
        },
        unmute: function () {
          this.element.muted = false;
        },
        loop: function (looping_bool) {
          this.element.loop = looping_bool;
        },
        playing: function () {
          return !this.element.paused;
        },
        paused: function () {
          return this.element.paused;
        },
        get_volume: function () {
          return this.element.volume;
        },
        get_time: function () {
          return this.element.currentTime;
        },
        muted: function () {
          return this.element.muted;
        },
        looping: function () {
          return this.element.looping;
        },
        duration: function () {
          return this.element.duration;
        }
      }

      if (clips && clips[clip.id]) {
        console.log("attempted to load multiple identical clip ids");
        clip.id = clip.id + "_" + timestamp_id();
      }

      if (clips === null) {
        clips = {};
      }
      clips[clip.id] = clip;
    }
  };

  let init = function (config_manager, _resource_manager) {
    default_volume = config_manager.get_config()['default_volume'] || 1;
    currently_paused = [];
    resource_manager = _resource_manager;
  };

  return function (config, _resource_manager) {
    init(config, _resource_manager);

    return {
      get_clip: get_clip,
      play: play,
      pause: pause,
      stop: stop,
      volume: volume,
      set_time: set_time,
      mute: mute,
      unmute: unmute,
      loop: loop,
      playing: playing,
      paused: paused,
      get_volume: get_volume,
      get_time: get_time,
      muted: muted,
      looping: looping,
      duration: duration,
      pause_all: pause_all,
      unpause_all: unpause_all,
      stop_all: stop_all,
      volume_all: volume_all,
      mute_all: mute_all,
      unmute_all: unmute_all,
      are_all_muted: are_all_muted,
      load_clips: load_clips,
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
      entities.load_if_needed();

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
