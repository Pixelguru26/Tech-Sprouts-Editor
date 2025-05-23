SproutCore.registerLib("utilTimer", [], (game) => {
  game.timer = class Timer {

    static timers = {};
    static __OPENIDS = [];
    static __IDLAST = -1;

    /**
     * 
     * @param {number} interval 
     * @param {function(Timer, number, number)} fn function(callingTimer, time, lag)
     */
    constructor(interval = 1, fn = null) {
      this.alive = false;

      this.interval = interval
      this.internal_clock = 0;
      this.internal_last = 0;
      this.running = false;
      this.function = fn;
      this.repeats = true;
      this.sustain_mode = false;
      this.internal_sustained = false;
      this.resultQue = [];
      this.keepResults = false;
      this.callWhenStopped = false;
    }

    /**
     * Checks if the queue has function results to pop.
     * Primarily a convenience function for while loops.
     * @param {number?} count [1 by default]
     * @returns {boolean} `true` if the result queue contains at least `count` result instances.
     */
    hasResults(count = 1) {
      return this.resultQue.length >= count;
    }

    /**
     * If `this.keepResults` is set to `true`, return values
     * from the tick function are kept and pushed onto a queue.
     * Retrieves the oldest function call results from the queue.
     * @returns {[time: number, lag: number, value: *]} 
     */
    popResult() {
      return this.resultQue.shift();
    }

    /**
     * Pushes values to the result queue with the appropriate time values.
     * Used internally.
     * @param {number} time 
     * @param {number} lag 
     * @param  {any} value
     */
    pushResult(time, lag, values) {
      this.resultQue.push([time, lag, values]);
      return values;
    }

    /**
     * Default tick function
     * @param {number} time 
     * @param {number} lag 
     */
    internal_function(time, lag) {
      let ret = this.function?.(this, time, lag);
      if (this.keepResults)
        this.pushResult(time, lag, ret);
      return ret;
    }

    /**
     * Updates all timers registered to the class.
     * This should only be called internally from the sproutlib core.
     * @param {number} dt 
     */
    static update(dt) {
      for (const key in this.timers) {
        if (Object.prototype.hasOwnProperty.call(this.timers, key)) {
          const element = this.timers[key];
          if (element != null) {
            element.update(dt);
          }
        }
      }
    }

    /**
     * Individual root update function. Should not really be overloaded.
     * @param {number} dt
     */
    update(dt) {
      // Handles "sustain()" operation mode
      if (this.sustain_mode) {
        if (this.internal_sustained) {
          this.internal_sustained = false;
        } else {
          this.sustain_mode = false;
          if (this.keepResults) {
            return this.pushResult(this.internal_clock + dt, 0, this.stop(this.callWhenStopped, this.internal_clock + dt, 0));
          } else {
            return this.stop(this.callWhenStopped, this.internal_clock + dt, 0);
          }
        }
      }
      // Normal functionality
      if (this.running) {
        this.internal_clock += dt;
        while (this.internal_clock - this.internal_last >= this.interval) {
          this.internal_last += this.interval;
          let lag = this.internal_clock - this.internal_last;
          this.internal_function(this.internal_last, lag);
          if (!this.repeats) {
            if (this.keepResults) {
              return this.pushResult(this.internal_clock + dt, 0, this.stop(this.callWhenStopped, this.internal_clock + dt, 0));
            } else {
              return this.stop(this.callWhenStopped, this.internal_clock + dt, 0);
            }
          }
        }
      }
    }

    /**
     * Stops the timer and calls the appropriate callback\
     * Does not reset
     * @param {boolean} call 
     * @param {number} time 
     * @param {number} lag 
     */
    stop(call = false, time = 0, lag = 0) {
      let ret = null;
      if (this.running) {
        if (call) {
          ret = this.internal_function(time, lag);
        }
        game.timer.timers[this.id] = null;
        game.timer.__OPENIDS.push(this.id);
        this.id = null;
      }
      this.running = false;
      return ret;
    }

    /**
     * Starts and resets the timer
     * @param {boolean} call 
     * @param {number} time 
     * @param {number} lag 
     * @returns 
     */
    start(call = false, time = 0, lag = 0) {
      this.reset();
      return this.resume(call, time, lag);
    }

    /**
     * Resumes or starts the timer without resetting it.
     * @param {boolean} call 
     * @param {number} time 
     * @param {number} lag 
     */
    resume(call = false, time = 0, lag = 0) {
      this.id ??= game.timer.__OPENIDS.shift() ?? (++game.timer.__IDLAST);
      game.timer.timers[this.id] = this;
      this.running = true;
      if (call) {
        return this.internal_function(time, lag);
      }
    }

    /**
     * Resets and stops the timer
     */
    reset() {
      this.internal_clock = 0;
      this.internal_last = 0;
      this.sustain_mode = false;
      this.internal_sustained = false;
    }

    /**
     * Designed for frame-by-frame timers which reset as soon as they are not sustained.
     * Call this every frame to sustain the timer, which will act normally during that time.
     * When sustain is not called in this mode, the timer will automatically stop.
     * When a timer starts/restarts in sustain mode, it is automatically reset.
     * @param {boolean} call 
     * @param {number} time 
     * @param {number} lag 
     */
    sustain(call = false, time = 0, lag = 0) {
      let ret = null;
      if (!this.sustain_mode) {
        if (!this.running)
          ret = this.start(call, time, lag);
        this.sustain_mode = true;
      }
      this.internal_sustained = true;
      return ret;
    }
    /**
     * Specialization of timer which ticks at random intervals.
     * Primarily for use in spawning enemy encounters.
     */
    static randomTimer = class RandomTimer extends Timer {
      constructor(intervalMin = 0, intervalMax = 1, fn = null) {
        super(Math.random() * (intervalMax - intervalMin) + intervalMin, fn);
        this.intervalMin = intervalMin;
        this.intervalMax = intervalMax;
      }
      /**
       * 
       * @param {number} time 
       * @param {number} lag 
       * @returns 
       */
      internal_function(time, lag) {
        this.interval = Math.random() * (this.intervalMax - this.intervalMin) + this.intervalMin;
        return super.internal_function(time, lag);
      }

      reset() {
        this.interval = Math.random() * (this.intervalMax - this.intervalMin) + this.intervalMin;
        return super.reset();
      }
    }
  }
});