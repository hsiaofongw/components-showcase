import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import { select, arc, scaleLinear, path } from "d3";
import { startOfToday, endOfToday } from "date-fns";

type Rect = {
  id: string;
  xOffset: number;
  yOffset: number;
  width: number;
  height: number;
  rotateDegree: number;
};

type Pointer = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotateDegree: number;
};

type Arc = {
  id: string;
  pathData: string;
};

class ClockPointerHelper {
  /** 获取当前时刻的时针、分针和秒针的弧度位置 */
  public static getCurrentPointerRadians(): {
    hoursRadian: number;
    minutesRadian: number;
    secondsRadian: number;
  } {
    const now = new Date();
    const dayStart = startOfToday();
    const dayEnd = endOfToday();
    const todayPassedRatio =
      (now.valueOf() - dayStart.valueOf()) /
      (dayEnd.valueOf() - dayStart.valueOf());

    const hoursPerDay = 24; // 每天有这么多小时
    const minutesPerDay = 24 * 60; // 每天有这么多分钟

    const hoursTotalCircles = 2; // 时针每天转 2 圈
    const hoursTotalRadians = hoursTotalCircles * 2 * Math.PI; // 时针每天转这么多弧度
    const minutesTotalCircles = hoursPerDay; // 分针每天转这么多圈
    const minutesTotalRadians = minutesTotalCircles * 2 * Math.PI; // 分针每天转这么多弧度
    const secondsTotalCircles = minutesPerDay; // 秒针每天转这么多圈
    const secondsTotalRadians = secondsTotalCircles * 2 * Math.PI; // 秒针每天总共转这么多弧度

    const currentHoursRadian = hoursTotalRadians * todayPassedRatio; // 当前时针位置（用弧度表示）
    const currentMinutesRadian = minutesTotalRadians * todayPassedRatio; // 当前分针位置（用弧度表示）
    const currentSecondsRadian = secondsTotalRadians * todayPassedRatio; // 当前秒针位置（用弧度表示）

    return {
      hoursRadian: currentHoursRadian,
      minutesRadian: currentMinutesRadian,
      secondsRadian: currentSecondsRadian,
    };
  }
}

function HomePage() {
  const svgRef = useRef(null);

  useEffect(() => {
    const paintClock = () => {
      const arcGenerator = arc();
      const svgElement = svgRef.current as any as SVGElement;
      const box = svgElement.getBoundingClientRect();
      const x = scaleLinear().domain([0, 1]).range([0, box.width]);
      const y = scaleLinear().domain([0, 1]).range([0, box.height]);
      const thickness = 0.025;
      const arcPathData = arcGenerator({
        innerRadius: x(0.5 - thickness),
        outerRadius: x(0.5),
        startAngle: 0,
        endAngle: 2 * Math.PI,
      });

      const arcs: Arc[] = [
        {
          id: 'mainArc',
          pathData: arcPathData ?? '',
        },
      ];

      select(svgElement)
        .selectAll('path.arc')
        .data(arcs, function (datum: any) { return datum.id; })
        .join(
          enter => {
            return enter.append('path').classed('arc', true).attr("d", d => d.pathData)
            .attr("fill", "#000000")
            .style("transform", `translate(${x(0.5)}px, ${y(0.5)}px)`);
          },
          update => {
            return update.attr("d", d => d.pathData);
          },
          exit => exit.remove(),
        );

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

      select(svgElement)
        .selectAll("rect.label-tick")
        .data(rects, function (datum: any) { return datum.id; })
        .join(
          enter => {
            return enter.append('rect').classed("label-tick", true)
            .attr("x", (d) => x(d.xOffset))
            .attr("y", (d) => x(d.yOffset))
            .attr("width", (d) => x(d.width))
            .attr("height", (d) => x(d.height))
            .style("transform-origin", "center center")
            .style("transform", (d) => `rotate(${d.rotateDegree}deg)`)
            .attr("stroke", "none")
            .attr("fill", "#000000");
          },
          update => {
            return update.attr("x", (d) => x(d.xOffset))
            .attr("y", (d) => x(d.yOffset))
            .attr("width", (d) => x(d.width))
            .attr("height", (d) => x(d.height))
            .style("transform", (d) => `rotate(${d.rotateDegree}deg)`);
          },
          exit => exit.remove(),
        );
        

      const { hoursRadian, minutesRadian, secondsRadian } =
        ClockPointerHelper.getCurrentPointerRadians();

      const currentHourDegree = radianToDegree(hoursRadian); // 当前时针位置（用角度表示）
      const currentMinutsDegree = radianToDegree(minutesRadian); // 当前分针位置（用角度表示）
      const currentSecondsDegree = radianToDegree(secondsRadian); // 当前秒针位置（用角度表示）

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
      select(svgElement)
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
    };

    const startPaintClock = () => {
      window.requestAnimationFrame(() => {
        paintClock();
        startPaintClock();
      });
    };

    startPaintClock();
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
