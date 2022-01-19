export type AnimatorInitializingOption = {
  animationProcess: () => void;     // 动画函数
  totalPerformanceLevel: number;    // 正数
  defaultPerformanceLevel: number;  // 在 0 到 totalPerformanceLevel - 1 之间（包括）的整数
}

export class DegradableAnimator {

  /** 动画函数 */
  private _animationProcess = () => {};

  /** 总性能等级数 */
  public totalPerformanceLevel = 0;

  /** 当前性能等级 */
  public currentPerformanceLevel = 0;

  constructor(opt: AnimatorInitializingOption) {
    this._animationProcess = opt.animationProcess;
    this.totalPerformanceLevel = opt.totalPerformanceLevel;
    this.currentPerformanceLevel = opt.defaultPerformanceLevel;
  }

  public start(): void {
    const animator = this;
    let frameId = 0;
    const _startAnimate = () => {
      window.requestAnimationFrame(() => {
        // console.debug(`frameId: ${frameId}`);

        const gap = (animator.totalPerformanceLevel-1) - animator.currentPerformanceLevel;
        const mod = gap + 1;

        if (frameId === 0) {
          // console.debug('re-paint');
          animator._animationProcess();
        }

        frameId = (frameId + 1) % mod;
        _startAnimate();
      });
    };

    _startAnimate();
  }

}
