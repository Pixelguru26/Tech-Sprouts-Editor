export default `
import random

class AutoUpdateUtil:
  """
  Root class which allows independent subscription to
  the game's core update function.
  """
  __reg__ = []
  __regids__ = []

  def __init__(this, attach = True):
    """
    Args:
      attach (bool, optional): If True, registers this instance to be automatically updated. Defaults to True.
    """
    if attach: this.attach()
  
  def attach(this):
    """
    Registers this instance to be automatically updated.
    """
    if not (this in AutoUpdateUtil.__reg__):
      AutoUpdateUtil.__reg__.append(this)
  
  def detach(this):
    """
    Unregisters this instance from automatic updates.
    """
    AutoUpdateUtil.__reg__.remove(this)

  def update(this, dt):
    """
    Called each frame to update this instance.
    By default, timestep is not fixed.
    Args:
      dt (float): Time elapsed since last update in seconds.
    """
    pass
  
  @staticmethod
  def updateAll(dt):
    """
    Calls update(dt) on all registered instances.
    Args:
      dt (float): Time elapsed since last update in seconds.
    """
    for item in AutoUpdateUtil.__reg__:
      if item != None:
        item.update(dt)
  
  # =========================

class SmoothUtil(AutoUpdateUtil):
  """
  Extension of AutoUpdateUtil which provides
  smoothed value transitions.
  """
  def __init__(this, val, min, max, time = 1, attach = True):
    super().__init__(attach)
    this.val = val
    this.smoothed = val
    this.prevSmoothed = val
    this.prev = val
    this.min = min
    this.max = max
    this.time = time
    this.clamp = True
  
  def update(this, dt):
    # Clamping
    if this.clamp:
      this.val = max(this.min, min(this.max, this.val))
    
    this.prevSmoothed = this.smoothed
    # Decreasing value
    if this.val < this.smoothed:
      this.smoothed -= dt * (this.max - this.min) / this.time
      # All caught up
      if this.val > this.smoothed:
        this.smoothed = this.val
    
    # Increasing value
    elif this.val > this.smoothed:
      this.smoothed += dt * (this.max - this.min) / this.time
      # All caught up
      if this.val < this.smoothed:
        this.smoothed = this.val
    
    this.prev = this.val
AutoUpdateUtil.SmoothUtil = SmoothUtil

class VerletUtil(AutoUpdateUtil):
  """
  An attempt to abstract away physics integration properly.
  Handles integration of one independent axis.\\n
  To apply force on this axis, set the instance accel value
  to the appropriate acceleration.
  In the next update step, this.accel will be applied.\\n
  Additionally, this.vel exposes the velocity of this value,
  which can be set to apply a velocity instantaneously
  (equivalent to infinite acceleration) or read as a simulation output.
  """

  def __init__(this, val, attach = True):
    super().__init__(attach)
    this.val = val
    this.accel = 0
    this.vel = 0
  
  def update(this, dt):
    this.val += (this.vel + 0.5 * this.accel * dt) * dt
    this.vel += this.accel * dt
AutoUpdateUtil.VerletUtil = VerletUtil

class TimerUtil(AutoUpdateUtil):
  """
  A scheduling system based on in-game time.
  Includes lag compensation and sustain mode.

  Attributes:
    interval (float): Time in seconds between timer ticks.
    internal_clock (float): Internal clock tracking elapsed time.
    internal_last (float): Time of the last tick.
    running (bool): Whether the timer is currently running.
    repeats (bool): Whether the timer should repeat after ticking.
    sustain_mode (bool): If True, timer will shut off  at the end of the tick.
    internal_sustained (bool): Whether the timer has been sustained this tick.
    resultQue (list): Queue of results from callback invocations.
    keepResults (bool): If True, keeps results from callback invocations.
    callWhenStopped (bool): If True, calls the callback one last time when the timer is stopped.
    callback (function): Function to call when timer interval elapses.
  """

  def __init__(this, callback, interval = 1, attach = True, keepResults = False, callWhenStopped = False, repeats = True, sustain_mode = False):
    """
    Args:
      callback (function): Function to call when timer interval elapses.
      interval (float, optional): Time in seconds between timer ticks. Defaults to 1.
      attach (bool, optional): If True, registers this instance to be automatically updated. Defaults to True.
    """
    super().__init__(attach)
    this.alive = False
    this.interval = interval
    this.internal_clock = 0
    this.internal_last = 0
    this.running = False
    this.repeats = repeats
    this.sustain_mode = sustain_mode
    this.internal_sustained = False
    this.resultQue = []
    this.keepResults = keepResults
    this.callWhenStopped = callWhenStopped
    this.callback = callback
  
  def hasResults(this, count = 1):
    """
    Checks if there are at least 'count' results in the result queue.
    Args:
      count (int, optional): Number of results to check for. Defaults to 1.
    Returns:
      bool: True if there are at least 'count' results, False otherwise.
    """
    return len(this.resultQue) >= count
  
  def popResult(this):
    """
    Pops and returns the oldest result from the result queue.
    Returns:
      Any: The oldest result from the result queue.
    """
    if len(this.resultQue) > 0:
      return this.resultQue.pop(0)
    return None
  
  def pushResult(this, time, lag, values):
    """
    Pushes a result onto the result queue.
    Args:
      time (float): The clock time of the result.
      lag (float): The remaining delta time of the result tick.
      values (list): The values of the result.
    """
    this.resultQue.append([time, lag, values])
  
  def internal_tick(this, time, lag):
    """
    Invokes the callback with the given time and lag.
    Stores returned results if keepResults is True.
    Args:
        time (float): The clock time of the result.
        lag (float): The remaining delta time of the result tick.
    Returns:
        Any: The result returned by the callback.
    """
    ret = this.callback(this, time, lag)
    if this.keepResults:
      this.pushResult(time, lag, ret)
    return ret
  
  def update(this, dt):
    """
    Updates the timer appropriately for this frame,
    including sustain mode functionality.
    Args:
        dt (number): Time elapsed since last update in seconds.
    Returns:
        Any: The result returned by the callback.
    """
    if this.sustain_mode:
      if this.internal_sustained:
        # Sustained this tick, turn off
        this.internal_sustained = False
      else:
        # Not sustained, exit sustain mode
        this.sustain_mode = False
        return this.stop(this.internal_clock + dt, 0)
    if this.running:
      this.internal_clock += dt
      while (this.internal_clock - this.internal_last >= this.interval):
        this.internal_last += this.interval
        lag = this.internal_clock - this.internal_last
        this.internal_tick(this.internal_last, lag)
        if not this.repeats: return this.stop(this.internal_last, lag)
  
  def stop(this, time = 0, lag = 0):
    """
    Stops the timer, respecting both callWhenStopped and keepResults.
    Args:
      time (float, optional): The clock time of the current tick. Defaults to 0.
      lag (float, optional): The remaining delta time of the stop tick. Defaults to 0.
    Returns:
      Any: The result returned by the callback if callWhenStopped is True, otherwise None.
    """
    if this.running:
      ret = None
      if this.callWhenStopped:
        ret = this.internal_tick(time, lag)
      this.detach()
      this.running = False
      return ret
  
  def reset(this):
    """
    Resets the timer's internal clock, last tick time, and sustain mode.
    """
    this.internal_clock = 0
    this.internal_last = 0
    this.sustain_mode = False
    this.internal_sustained = False
  
  def resume(this, call = False, time = 0, lag = 0):
    """
    Resumes the timer from a stopped state.
    Args:
      call (bool, optional): If True, invokes the callback immediately upon resuming. Defaults to False.
      time (float, optional): The clock time of the current tick. Defaults to 0.
      lag (float, optional): The remaining delta time of the resume tick. Defaults to 0.
    Returns:
      Any: The result returned by the callback if call is True, otherwise None.
    """
    if not this.running:
      this.attach()
      this.running = True
      if call:
        return this.internal_tick(time, lag)
  
  def start(this, call = False, time = 0, lag = 0):
    """
    Starts the timer, resetting its internal state.
    Args:
      call (bool, optional): If True, invokes the callback immediately upon starting. Defaults to False.
      time (float, optional): The clock time of the current tick. Defaults to 0.
      lag (float, optional): The remaining delta time of the start tick. Defaults to 0.
    Returns:
      Any: The result returned by the callback if call is True, otherwise None.
    """
    this.reset()
    return this.resume(call, time, lag)
  
  def sustain(this, call = False, time = 0, lag = 0):
    """
    Sustains the timer for the current tick.
    Args:
      call (bool, optional): If True, invokes the callback if this is also the first contiguous sustain. Defaults to False.
      time (float, optional): The clock time of the current tick. Defaults to 0.
      lag (float, optional): The remaining delta time of the current tick. Defaults to 0.
    Returns:
      Any: The result returned by the callback if call is True, otherwise None.
    """
    ret = None
    if not this.sustain_mode:
      if not this.running:
        ret = this.start(call, time, lag)
      this.sustain_mode = True
    this.internal_sustained = True
    return ret
AutoUpdateUtil.TimerUtil = TimerUtil

class RandTimerUtil(TimerUtil):
    """
    Extension of TimerUtil which randomizes the timer interval
    on each tick within a specified range.
    """

    def __init__(
        this, callback,
        minInterval, maxInterval,
        attach = True, keepResults = False,
        callWhenStopped = False,
        repeats = True, sustain_mode = False
      ):
      """
      Args:
        callback (function): Function to call when timer interval elapses.
        minInterval (float): Minimum time in seconds between timer ticks.
        maxInterval (float): Maximum time in seconds between timer ticks.
        attach (bool, optional): If True, registers this instance to be automatically updated. Defaults to True.

      """
      super().__init__(
        callback,
        random.uniform(minInterval, maxInterval),
        attach, keepResults,
        callWhenStopped, repeats, sustain_mode
      )
      this.minInterval = minInterval
      this.maxInterval = maxInterval
    
    def internal_tick(this, time, lag):
      import random
      this.interval = random.uniform(this.minInterval, this.maxInterval)
      return super().internal_tick(time, lag)
AutoUpdateUtil.RandTimerUtil = RandTimerUtil

`;