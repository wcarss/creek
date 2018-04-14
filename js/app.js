let game_manager = null;

window.addEventListener("load", function () {
  game_manager = GameManager();
  game_manager.init();
});
