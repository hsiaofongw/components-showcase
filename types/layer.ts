
/** 图层选项 */
export type LayerOption<T> = { data: T; svgElement: SVGElement };

/** 图层 */
export interface Layer<T> {
  /** 图层第一次绘制 */
  init(option: LayerOption<T>): void;

  /** 图层更新 */
  patch?(option: LayerOption<T>): void;

  /** 图层销毁 */
  destroy(): void;
}

