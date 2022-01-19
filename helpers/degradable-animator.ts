export type AnimatorInitializingOption = {
  animationProcess: () => void;     // 动画函数
  windowLengthMs: number;  // 窗口长度，单位 ms, 可以为浮点数
}

export class DegradableAnimator {

  /** 动画函数 */
  private _animationProcess = () => {};

  /** 窗口长度 */
  public windowLengthMs = 1;

  constructor(opt: AnimatorInitializingOption) {
    this._animationProcess = opt.animationProcess;
    this.windowLengthMs = opt.windowLengthMs;
  }

  public start(): void {
    const animator = this;
    let lastPaintWindowId: number | undefined = undefined;
    const startedAt = new Date().valueOf();
    const _startAnimate = () => {
      window.requestAnimationFrame(() => {
        const now = new Date().valueOf();
        const windowId = Math.floor((now - startedAt)/animator.windowLengthMs);
        // console.debug(`windowId: ${windowId}, lastWindowId: ${lastPaintWindowId}, windowLen: ${animator.windowLengthMs}`);
        if (windowId !== lastPaintWindowId) {
          animator._animationProcess();
          // console.debug('paint');
        }

        lastPaintWindowId = windowId;
        _startAnimate();
      });
    };

    _startAnimate();
  }

}
