"use strict";

let config_spec = {
  "game": {
    "init": function (manager) {
    },
    "update": function (delta, manager) {
      let control_manager = entity_manager.get_control_manager(),
        map_manager = entity_manager.get_map_manager(),
        player_manager = entity_manager.get_player_manager(),
        keys = control_manager.get_controls();

        // use managers and keys[] dictionaries for global game controls that
        // don't necessarily interact with the player or the map
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
    "width": 640,
    "height": 480,
    "left_margin": 100,
    "right_margin": 100,
    "top_margin": 100,
    "bottom_margin": 100,
  },
  "initial_map_id": "intro",
  "maps": {
    "intro": {
      "height": 2000,
      "width": 600,
      "id": "intro",
      "player_layer": 2,
      "init": function (manager) {
        console.log("map " + this.id + ": initialized");
      },
      "deinit": function (manager) {
        console.log("map " + this.id + ": de-initialized");
      },
      "update": function (manager) {
        // code that's particular to this map that should happen
        // continuously should go here; use managet.get('manager name')
        // to get access to the other managers
      },
      "layers": [
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
        ]
      ]
    },
    "game": {
      "height": 2000,
      "width": 600,
      "id": "game",
      "player_layer": 2,
      "init": function (manager) {
        console.log("map " + this.id + ": initialized");
      },
      "deinit": function (manager) {
        console.log("map " + this.id + ": de-initialized");
      },
      "update": function (manager) {
      },
      "layers": [
        []
      ]
    }
  },  // maps object
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
      "url": "resources/images/tileset.png",
      "id": "tileset",
      "source_x": 0,
      "source_y": 0,
      "source_width": 480,
      "source_height": 256,
    },
  ],          // resources array
};            // config object
