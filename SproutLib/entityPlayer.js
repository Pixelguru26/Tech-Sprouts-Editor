SproutCore.registerLib("entityPlayer", ["entity", "utilTimer"], (game) => {
  game.entity.player = class Player extends game.entity.livingEntity {
    constructor() {
      super();
      this.team = "player";
      this.clamp = true; // Causes the game to clamp this player to the screen bounds
      this.setCollision("circle", 0, 0, 100);
      this.r = 30;
      this.scale = 2;
      this.angle = 270;
      this.sprite = new game.asset.assetImage("core//assets/image/player/player_red.png");
      this.weapons = [];
      this.weaponKeybinds = {};
      this.speed = 450;
      this.reset();
    }

    /**
     * Attempts to reset all sensible attributes of the player.
     * If a table is provided, its values are used as the defaults.
     * @param {*?} data
     */
    reset(data = null) {
      this.alive = true;
      this.age = data?.age ?? 0;
      // this.__max_health = data?.__max_health ?? 100;
      this.health = data?.health ?? this.__max_health;
      this.__health.smoothed = this.health;
      this.x = data?.x ?? ((game?.cullbox?.w ?? 900) / 2);
      this.y = data?.y ?? ((game?.cullbox?.h ?? 600) / 2);
      // this.speed = data?.speed ?? 450;
      this.score = data?.score ?? 0;
      this.weaponKeybinds = {};
      if (data?.weapons) {
        this.weapons = data.weapons;
      } else {
        this.weapons.clear();
        // Main weapon, fires basic bullets
        this.addWeapon(" ", new Player.weapon(
          1000, 10, true, [[-16, 0], [16, 0]], "base"
        ));
        // Secondary weapon, fires something more interesting.
        this.addWeapon("shift", new Player.weapon(
          20, 1, false, [[-24, -6], [24, -6]], "lance"
        ));
      }
    }

    /** @type {string|function} Primary weapon fire function */
    get prmWep() { return this.weapons[0]?.fire_fn; }
    /** @type {string|function} Primary weapon fire function */
    set prmWep(v) {
      if (this.weapons[0]) this.weapons[0].fire_fn = v;
    }

    /** @type {string|function} Secondary weapon fire function */
    get altWep() { return this.weapons[1]?.fire_fn; }
    /** @type {string|function} Secondary weapon fire function */
    set altWep(v) {
      if (this.weapons[1]) this.weapons[1].fire_fn = v;
    }

    /**
     * Adds a new weapon to the weapon list and registers its keybind
     * @param {string} keybind 
     * @param {Player.weapon} weapon 
     */
    addWeapon(keybind, weapon) {
      weapon.owner = this;
      this.weaponKeybinds[keybind] = this.weapons.length;
      this.weapons.push(weapon);
    }

    update(dt) {
      super.update(dt);
      // Player controls
      if (game.keystates["w"] || game.keystates["ArrowUp"]) this.forward((this.speed ?? 100) * dt);
      if (game.keystates["a"] || game.keystates["ArrowLeft"]) this.left((this.speed ?? 100) * dt);
      if (game.keystates["s"] || game.keystates["ArrowDown"]) this.backward((this.speed ?? 100) * dt);
      if (game.keystates["d"] || game.keystates["ArrowRight"]) this.right((this.speed ?? 100) * dt);
      // Keep player on screen
      if (this.clamp) {
        this.x = game.util.clamp(this.x, game.cullbox.x, game.cullbox.x + game.cullbox.w);
        this.y = game.util.clamp(this.y, game.cullbox.y, game.cullbox.y + game.cullbox.h);
      }
      // Inefficient, but it gets the job done.
      for (const key in this.weaponKeybinds) {
        const id = this.weaponKeybinds[key];
        if (game.keystates[key]) this.weapons[id]?.sustain?.();
      }
    }

    keydown(key) {
      // Inefficient, but it gets the job done.
      for (const keybind in this.weaponKeybinds) {
        const id = this.weaponKeybinds[keybind];
        if (key == keybind) this.weapons[id].beginFire();
      }
    }

    /**
     * Almost completely self-contained system sufficient for
     * automatic and semi-automatic conventional guns.
     */
    static weapon = class PlayerWeapon {
      /**
       * 
       * @param {number?} ammo Initial ammunition count
       * @param {number?} rate Number of times this weapon can fire in a second
       * @param {boolean?} auto If true, holding input will repeat fire as rapidly as possible.
       * @param {Array<[number, number]>?} offsets A list of offset vectors. The weapon fires from each offset in order and repeats.
       * @param {string|((timer: game.timer, time: number, lag: number, offset: [number, number]) => game.entity.bullet)?} fire If a string, attempts to spawn the bullet type registered to that id. If a function, calls that function each time this weapon fires.
       * @param {game.entity?} owner Weapon must be registered to an owner entity to work. Defaults to the current player.
       */
      constructor(ammo = 10, rate = 10, auto = false, offsets = [[-10, 0], [10, 0]], fire = "base", owner = null) {
        /** @type {number} Remaining ammunition */
        this.ammo = ammo;
        /** @type {Array<[number, number]>} List of firing location offset vectors. Cycles through the list as the weapon is fired. */
        this.offsets = offsets;
        /** @type {number} Current firing location offset index */
        this.barrel = 0;
        /** @type {string|((timer: game.timer, time: number, lag: number, offset: [number, number]) => game.entity.bullet)} String indicates bullet type to fire with default function, function is called whenever this weapon fires. */
        this.fireFn = fire;
        /** @type {boolean} If true, weapon will fire repeatedly as long as it is engaged. */
        this.auto = auto;
        /** @type {game.timer} Core of all functionality. Don't touch this. */
        this.timer = new game.timer(1 / rate, (timer, time, lag) => {
          this.tick(timer, time, lag);
        });
        /** @type {game.entity} Entity this weapon is attached to. For player weapons, this should obviously always be a player. */
        this.owner = owner ?? game.player;
        this.timer.owner = this;
        /** @type {boolean} If true, bullets are updated after firing with the remaining frame duration passed as delta time. */
        this.compensate_lag = true;
        /** @type {number} Amount of ammunition consumed per shot */
        this.consume_ammo = 1;
      }

      /** @type {number} Rate of fire in shots/second */
      set rate(v) { this.timer.interval = 1 / v; }
      /** @type {number} Rate of fire in shots/second */
      get rate() { return 1/this.timer.interval; }

      /**
       * Firing function which handles everything automatically.\
       * Use is as simple as calling this once a frame as long as the trigger is held.\
       * Initiating, terminating, and everything else handled by the timer.
       */
      sustain() {
        if (this.auto) {
          this.timer.sustain();
        }
      }

      /**
       * Fires once and begins the timer if `this.auto` is `true`.
       */
      beginFire() {
        this.fire(this.timer);
      }

      /**
       * Default firing callback, executes `shoot()` on the owner entity.
       * @param {game.timer} timer 
       * @param {number} time 
       * @param {number} lag 
       * @param {[number, number]} offset 
       * @returns {game.entity.bullet}
       */
      defaultFire(timer, time, lag, offset) {
        return timer?.owner?.owner?.shoot?.(this.fireFn, offset[0], offset[1], offset[2]);
      }

      /**
       * Fire handler function. Should be called but not replaced.
       * `lag` is used as delta time in the lag compensation function to ensure
       * bullets appear with the velocity they're supposed to, instead of
       * being stacked in the same place at the same time during lag spikes.
       * @param {game.timer?} timer Uses `this.timer` by default.
       * @param {number?} time Time since the clock began in seconds when this is fired.
       * @param {number?} lag Remaining time in the frame when this is called. Parity with the parameter from a `game.timer`.
       */
      fire(timer = null, time = 0, lag = 0) {
        timer ??= this.timer;
        // Ammo consumption accounts for negative ammo values
        // and potentially negative ammo consumption values.
        // Regardless, stops and clamps ammo count to 0
        // when ammo count crosses 0.
        if (this.consume_ammo) {
          if (this.ammo == 0) {
            return;
          } else {
            let prev = this.ammo;
            this.ammo -= this.consume_ammo;
            if (prev * this.ammo < 0) {
              this.ammo = 0;
            }
          }
        }
        // Construct and fire bullet
        let bullet;
        if (JSLib2.isString(this.fireFn)) {
          // Set to a default bullet type
          bullet = this.defaultFire(timer, time, lag, this.offsets[this.barrel]);
        } else {
          // Custom fire function
          bullet = this.fireFn(timer, time, lag, this.offsets[this.barrel]);
        }
        // Cycle offsets
        this.barrel = (this.barrel + 1) % (this.offsets.length);
        // Advances a bullet by the appropriate amount if it was fired during a frame
        if (bullet instanceof game.entity && this.compensate_lag && lag) {
          bullet.update(lag);
        }
      }

      /**
       * Callback for the `game.timer` instance controlling this weapon.
       * Should not need manual use.
       * @param {game.timer} timer 
       * @param {number} time 
       * @param {number} lag 
       */
      tick(timer, time, lag) {
        this.fire(timer, time, lag);
        this.timer.interval = 1 / this.rate;
      }
    }
  }
  game.player = new game.entity.player();
});