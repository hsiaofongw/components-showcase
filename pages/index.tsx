import { useEffect, useRef } from "react";
import styles from "../styles/Home.module.css";
import { select, arc, scaleLinear, Selection } from "d3";

import { Arc, Pointer, Rect } from "../types/geometry";
import { ClockPointerHelper } from "../helpers/clock-pointer";
import { Layer, LayerOption } from "../types/layer";
import { DegradableAnimator } from "../helpers/degradable-animator";
import { interval } from "rxjs";

type AestheticOption = {
  thickness: number;
};

type ClockPositionOption = {
  hoursRadian: number;
  minutesRadian: number;
  secondsRadian: number;
};

type ClockLayerOption = {
  aesthetic: AestheticOption;

  position: ClockPositionOption;
};

/** 表框图层 */
class ClockBasicLayer implements Layer<AestheticOption> {
  private _selection?: Selection<any, any, any, any>;

  public init(opt: LayerOption<AestheticOption>): void {
    const svgElement = opt.svgElement;
    const arcGenerator = arc();
    const box = svgElement.getBoundingClientRect();
    const x = scaleLinear().domain([0, 1]).range([0, box.width]);
    const y = scaleLinear().domain([0, 1]).range([0, box.height]);
    const thickness = opt.data.thickness;

    const arcPathData = arcGenerator({
      innerRadius: x(0.5 - thickness),
      outerRadius: x(0.5),
      startAngle: 0,
      endAngle: 2 * Math.PI,
    });

    const arcs: Arc[] = [
      {
        id: "mainArc",
        pathData: arcPathData ?? "",
      },
    ];

    this._selection = select(svgElement)
      .selectAll("path.arc")
      .data(arcs, function (datum: any) {
        return datum.id;
      })
      .join(
        (enter) => {
          return enter
            .append("path")
            .classed("arc", true)
            .attr("d", (d) => d.pathData)
            .attr("fill", "#000000")
            .style("transform", `translate(${x(0.5)}px, ${y(0.5)}px)`);
        },
        (update) => {
          return update.attr("d", (d) => d.pathData);
        },
        (exit) => exit.remove()
      );
  }

  public destroy(): void {
    this._selection?.remove();
  }
}

/** 表盘刻度图层 */
class ClockTickLayer implements Layer<AestheticOption> {
  private _selection?: Selection<any, any, any, any>;

  public init(opt: LayerOption<AestheticOption>): void {
    const svgElement = opt.svgElement;
    const box = svgElement.getBoundingClientRect();
    const x = scaleLinear().domain([0, 1]).range([0, box.width]);
    const thickness = opt.data.thickness;

    const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const angles = hours.map(
      (hour) => hour * ((2 * Math.PI) / 12) + Math.PI / 2
    );
    const rectWidth = thickness;
    const rectHeight = 3 * thickness;
    const rectRightMargin = rectHeight;
    const radianToDegree = scaleLinear()
      .domain([0, 2 * Math.PI])
      .range([-90, 270]);

    const rects: Rect[] = [];
    for (let i = 0; i < hours.length; i++) {
      const id = i.toString();
      const pointerLength = 0.5 - thickness - rectRightMargin - rectWidth;
      const pointerX = 0.5 + pointerLength * Math.cos(angles[0]);
      const pointerY = 0.5 + pointerLength * Math.sin(angles[0]);
      const rectX = pointerX - 0.5 * rectWidth;
      const rectY = pointerY - 0.5 * rectHeight;
      const rotateDegree = radianToDegree(angles[i]) % 360;
      const width = rectWidth;
      const height = rectHeight;

      const rect: Rect = {
        id,
        rotateDegree,
        xOffset: rectX,
        yOffset: rectY,
        width,
        height,
      };

      rects.push(rect);
    }

    this._selection = select(svgElement)
      .selectAll("rect.label-tick")
      .data(rects, function (datum: any) {
        return datum.id;
      })
      .join(
        (enter) => {
          return enter
            .append("rect")
            .classed("label-tick", true)
            .attr("x", (d) => x(d.xOffset))
            .attr("y", (d) => x(d.yOffset))
            .attr("width", (d) => x(d.width))
            .attr("height", (d) => x(d.height))
            .style("transform-origin", "center center")
            .style("transform", (d) => `rotate(${d.rotateDegree}deg)`)
            .attr("stroke", "none")
            .attr("fill", "#000000");
        },
        (update) => {
          return update
            .attr("x", (d) => x(d.xOffset))
            .attr("y", (d) => x(d.yOffset))
            .attr("width", (d) => x(d.width))
            .attr("height", (d) => x(d.height))
            .style("transform", (d) => `rotate(${d.rotateDegree}deg)`);
        },
        (exit) => exit.remove()
      );
  }

  public destroy(): void {
    this._selection?.remove();
  }
}

/** 指针图层 */
class ClockPointerLayer implements Layer<ClockLayerOption> {
  private _selection?: Selection<any, any, any, any>;

  public init(opt: LayerOption<ClockLayerOption>): void {
    const svgElement = opt.svgElement;
    const box = svgElement.getBoundingClientRect();
    const x = scaleLinear().domain([0, 1]).range([0, box.width]);
    const thickness = opt.data.aesthetic.thickness;

    const radianToDegree = scaleLinear()
      .domain([0, 2 * Math.PI])
      .range([-90, 270]);

    const currentHourDegree = radianToDegree(opt.data.position.hoursRadian); // 当前时针位置（用角度表示）
    const currentMinutsDegree = radianToDegree(opt.data.position.minutesRadian); // 当前分针位置（用角度表示）
    const currentSecondsDegree = radianToDegree(
      opt.data.position.secondsRadian
    ); // 当前秒针位置（用角度表示）

    const pointerThickness = thickness * 2; // 时针、分针的宽度
    const pointerXOffset = pointerThickness; // 时针、分针的正常 x 偏移量
    const pointerYOffset = pointerThickness * 0.5; // 时针、分针的正常 y 偏移量
    const hoursLength = 0.2; // 时针长度
    const minutesLength = 0.28; // 分针长度

    const secondsThickness = thickness * 0.6; // 秒针的宽度
    const secondsXOffset = 2 * secondsThickness; // 秒针的正常 x 偏移量
    const secondsYOffset = secondsThickness * 0.5; // 秒针的正常 y 偏移量
    const secondsLength = 0.36; // 秒针的长度

    const pointers: Pointer[] = [
      {
        id: "hoursPointer",
        x: x(0.5 - pointerXOffset),
        y: x(0.5 - pointerYOffset),
        width: x(hoursLength),
        height: x(pointerThickness),
        rotateDegree: currentHourDegree,
      },
      {
        id: "minutesPointer",
        x: x(0.5 - pointerXOffset),
        y: x(0.5 - pointerYOffset),
        width: x(minutesLength),
        height: x(pointerThickness),
        rotateDegree: currentMinutsDegree,
      },
      {
        id: "secondsPointer",
        x: x(0.5 - secondsXOffset),
        y: x(0.5 - secondsYOffset),
        width: x(secondsLength),
        height: x(secondsThickness),
        rotateDegree: currentSecondsDegree,
      },
    ];

    // 画时针、分针和秒针
    this._selection = select(svgElement)
      .selectAll("rect.pointers")
      .data(pointers, function (datum: any) {
        return datum.id;
      })
      .join(
        (enter) => {
          return enter
            .append("rect")
            .classed("pointers", true)
            .attr("x", (d) => d.x)
            .attr("y", (d) => d.y)
            .attr("width", (d) => d.width)
            .attr("height", (d) => d.height)
            .style("transform-origin", "center center")
            .style("transform", (d) => `rotate(${d.rotateDegree}deg)`);
        },
        (update) => {
          return update
            .attr("x", (d) => d.x)
            .attr("width", (d) => d.width)
            .attr("height", (d) => d.height)
            .attr("y", (d) => d.y)
            .style("transform-origin", "center center")
            .style("transform", (d) => `rotate(${d.rotateDegree}deg)`);
        },
        (exit) => exit.remove()
      );
  }

  public destroy(): void {
    this._selection?.remove();
  }
}

function HomePage() {
  const svgRef = useRef(null);

  const thickness = 0.025;

  const paintClockBorderAndTicks = () => {
    const svgElement = svgRef.current as any as SVGElement;

    const clockBasicLayer = new ClockBasicLayer();
    clockBasicLayer.init({ svgElement, data: { thickness } });

    const clockTickLayer = new ClockTickLayer();
    clockTickLayer.init({ svgElement, data: { thickness } });
  };

  /** 画表盘和刻度 */
  useEffect(() => {
    paintClockBorderAndTicks();
  }, []);

  /** 画指针 */
  useEffect(() => {
    const svgElement = svgRef.current as any as SVGElement;

    const paintClockPointer = () => {
      const position = ClockPointerHelper.getCurrentPointerRadians();
      const clockPointerLayer = new ClockPointerLayer();
      clockPointerLayer.init({
        svgElement,
        data: { aesthetic: { thickness }, position },
      });
    };

    const animator = new DegradableAnimator({
      animationProcess: () => paintClockPointer(),
      windowLengthMs: 1500,
    });

    animator.start();

    const frameRateCalculateIntervalMs = 5000;

    // 上次系统帧读数
    let lastSysFrameId = 0;

    // 上次实际帧度数
    let lastActualFrameId = 0;

    interval(frameRateCalculateIntervalMs).subscribe(() => {
      const systemFrameIdIncreased = animator.systemFrameId - lastSysFrameId;
      lastSysFrameId = animator.systemFrameId;

      const systemFrameRate = (systemFrameIdIncreased / (frameRateCalculateIntervalMs/1000));

      const actualFrameIdIncreased = animator.actualFrameId - lastActualFrameId;
      lastActualFrameId = animator.actualFrameId;

      const actualFrameRate = (actualFrameIdIncreased / (frameRateCalculateIntervalMs/1000));

      const theoreticalUpperBound = animator.theoreticalFramerateUpperBoundBySetting;

      const now = new Date().valueOf();
      console.debug(`时间戳：${now}\n极限帧率：${systemFrameRate.toFixed(0)} fps\n实际帧率：${actualFrameRate.toFixed(0)} fps\n理论帧率上限：${theoreticalUpperBound.toFixed(0)}fps`);
    })
  }, []);

  return (
    <div style={{ width: "200px", height: "200px" }}>
      <div className={styles.svgContainer}>
        <svg ref={svgRef} width="100%" height="100%"></svg>
      </div>
    </div>
  );
}

export default HomePage;
