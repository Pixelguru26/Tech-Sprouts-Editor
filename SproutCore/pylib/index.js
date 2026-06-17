import autoutil from "./autoutil.py.js";
import bullets from "./bullets.py.js";
import turtle from "./turtle.py.js";
import entity from "./entity.py.js";
import uientity from "./uientity.py.js";
import game from "./game.py.js";
import html from "./html.py.js";
import shared from "./shared.py.js";
import state from "./state.py.js";

import ShooterGame from "./games/shooter.py.js";

export default {
  shared: shared,
  autoutil: autoutil,
  bullets: bullets,
  turtle: turtle,
  entity: entity,
  uientity: uientity,
  game: game,
  html: html,
  state: state,
  games: {
    shooter: ShooterGame
  }
};