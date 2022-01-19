export type AnimatorInitializingOption = {
  animationProcess: () => void;     // 动画函数
  windowLengthMs: number;  // 窗口长度，单位 ms, 可以为浮点数
}

export class DegradableAnimator {

  /** 动画函数 */
  private _animationProcess = () => {};

  /** 窗口长度 */
  public windowLengthMs = 1;

  /** 人为设定的理论帧率上限, 单位 fps */
  public get theoreticalFramerateUpperBoundBySetting(): number {
    return 1000 / this.windowLengthMs;
  }

  /** 系统帧 ID */
  private _systemFrameId = 0;
  public get systemFrameId(): number {
    return this._systemFrameId;
  }

  /** 实际帧 ID */
  private _actualFrameId = 0;
  public get actualFrameId(): number {
    return this._actualFrameId;
  }

  constructor(opt: AnimatorInitializingOption) {
    this._animationProcess = opt.animationProcess;
    this.windowLengthMs = opt.windowLengthMs;
  }

  public start(): void {

    let lastPaintWindowId: number | undefined = undefined;
    const startedAt = new Date().valueOf();
    const _startAnimate = () => {
      window.requestAnimationFrame(() => {
        this._statSystemFrame();

        const now = new Date().valueOf();
        const windowId = Math.floor((now - startedAt)/this.windowLengthMs);
        if (windowId !== lastPaintWindowId) {
          this._animationProcess();

          this._statActualFrame();
        }

        lastPaintWindowId = windowId;
        _startAnimate();
      });
    };

    _startAnimate();
  }

  private _statActualFrame(): void {
    this._actualFrameId = this._actualFrameId + 1;
  }

  private _statSystemFrame(): void {
    this._systemFrameId = this._systemFrameId + 1;
  }

}
