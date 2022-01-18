import { useEffect, useRef, useState } from "react";
import styles from "../styles/Home.module.css";
import { select, arc, scaleLinear, path } from "d3";
import { startOfToday, endOfToday } from 'date-fns';

type Rect = {
  id: string;
  xOffset: number;
  yOffset: number;
  width: number;
  height: number;
  rotateDegree: number;
};

function HomePage() {
  const svgRef = useRef(null);

  useEffect(() => {
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

    select(svgElement)
      .append("path")
      .attr("d", arcPathData)
      .attr("fill", "#000000")
      .style("transform", `translate(${x(0.5)}px, ${y(0.5)}px)`);

    const hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const angles = hours.map(
      (hour) => hour * ((2 * Math.PI) / 12) + Math.PI / 2
    );
    const rectWidth = thickness;
    const rectHeight = 3 * thickness;
    const rectRightMargin = rectHeight;
    const radianToDegree = scaleLinear().domain([0, 2 * Math.PI]).range([-90, 270]);

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
        height
      };

      rects.push(rect);
    }


    select(svgElement)
      .selectAll("rect.label-tick")
      .data(rects, function getId(datum: any) {
        return datum.id;
      })
      .join('rect')
      .classed("label-tick", true)
      .attr('x', d => x(d.xOffset))
      .attr('y', d => x(d.yOffset))
      .attr('width', d => x(d.width))
      .attr('height', d => x(d.height))
      .style('transform-origin', 'center center')
      .style('transform', d => `rotate(${d.rotateDegree}deg)`)
      .attr('stroke', 'none')
      .attr('fill', '#000000');

      const now = new Date();
      const dayStart = startOfToday();
      const dayEnd = endOfToday();
      const todayPassedRatio = (now.valueOf() - dayStart.valueOf()) / (dayEnd.valueOf() - dayStart.valueOf());

      const hoursPerDay = 24;         // 每天有这么多小时
      const minutesPerDay = 24 * 60;  // 每天有这么多分钟

      const hoursTotalCircles = 2;                                    // 时针每天转 2 圈
      const hoursTotalRadians = hoursTotalCircles * 2 * Math.PI;      // 时针每天转这么多弧度
      const minutesTotalCircles = hoursPerDay;                        // 分针每天转这么多圈
      const minutesTotalRadians = minutesTotalCircles * 2 * Math.PI;  // 分针每天转这么多弧度
      const secondsTotalCircles = minutesPerDay;                      // 秒针每天转这么多圈
      const secondsTotalRadians = secondsTotalCircles * 2 * Math.PI;  // 秒针每天总共转这么多弧度

      const currentHoursRadian = hoursTotalRadians * todayPassedRatio;       // 当前时针位置（用弧度表示）
      const currentMinutesRadian = minutesTotalRadians * todayPassedRatio;   // 当前分针位置（用弧度表示）
      const currentSecondsRadian = secondsTotalRadians * todayPassedRatio;   // 当前秒针位置（用弧度表示）

      const currentHourDegree = radianToDegree(currentHoursRadian);       // 当前时针位置（用角度表示）
      const currentMinutsDegree = radianToDegree(currentMinutesRadian);   // 当前分针位置（用角度表示）
      const currentSecondsDegree = radianToDegree(currentSecondsRadian);  // 当前秒针位置（用角度表示）

      const pointerThickness = thickness * 2;         // 时针、分针的宽度
      const pointerXOffset = pointerThickness;        // 时针、分针的正常 x 偏移量
      const pointerYOffset = pointerThickness * 0.5;  // 时针、分针的正常 y 偏移量
      const hoursLength = 0.2;                        // 时针长度
      const minutesLength = 0.28;                     // 分针长度

      const secondsThickness = thickness * 0.6;       // 秒针的宽度
      const secondsXOffset = 2 * secondsThickness;    // 秒针的正常 x 偏移量
      const secondsYOffset = secondsThickness * 0.5;  // 秒针的正常 y 偏移量
      const secondsLength = 0.36;                     // 秒针的长度

      // 画时针
      select(svgElement).selectAll('rect.hours').remove();
      select(svgElement)
        .append('rect')
        .classed('hours', true)
        .attr('x', x(0.5 - pointerXOffset))
        .attr('y', x(0.5 - pointerYOffset))
        .attr('width', x(hoursLength))
        .attr('height', x(pointerThickness))
        .style('transform-origin', 'center center')
        .style('transform', `rotate(${currentHourDegree}deg)`);

      // 画分针
      select(svgElement).selectAll('rect.minutes').remove();
      select(svgElement)
        .append('rect')
        .classed('minutes', true)
        .attr('x', x(0.5 - pointerXOffset))
        .attr('y', x(0.5 - pointerYOffset))
        .attr('width', x(minutesLength))
        .attr('height', x(pointerThickness))
        .style('transform-origin', 'center center')
        .style('transform', `rotate(${currentMinutsDegree}deg)`);
      
      // 画秒针
      select(svgElement).selectAll('rect.seconds').remove();
      select(svgElement)
        .append('rect')
        .classed('seconds', true)
        .attr('x', x(0.5 - secondsXOffset))
        .attr('y', x(0.5 - secondsYOffset))
        .attr('width', x(secondsLength))
        .attr('height', x(secondsThickness))
        .style('transform-origin', 'center center')
        .style('transform', `rotate(${currentSecondsDegree}deg)`);

  }, []);

  return (
    <div style={{ width: "100px", height: "100px" }}>
      <div className={styles.svgContainer}>
        <svg ref={svgRef} width="100%" height="100%"></svg>
      </div>
    </div>
  );
}

export default HomePage;
