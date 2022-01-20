import { useEffect, useState } from "react";
import { from, fromEvent } from "rxjs";
import styles from "./SliderComponent.module.css";

function SliderComponent() {
  const [isMouseDown, setIsMouseDown] = useState(false);          // 记录鼠标是否按下
  const [buttonOffsetX, setButtonOffsetX] = useState(0);          // 按钮当前的 offsetX
  const [buttonDownOffsetX, setButtonDownOffsetX] = useState(0);  // 按钮按下时的 offsetX
  const [mouseDownX, setMouseDownX] = useState(0);                // 鼠标按下时的 offsetX
  const [mouseCurrentX, setMouseCurrentX] = useState(0);          // 鼠标按下并移动时的 offsetX
  const [mouseDeltaX, setMouseDeltaX] = useState(0);              // 鼠标移动时的 delta OffsetX

  function onMouseDown(mouseEvent: MouseEvent) {
    setIsMouseDown(true);
    setMouseDownX(mouseEvent.clientX);    // 记录按下按钮时鼠标的位置
    setButtonDownOffsetX(buttonOffsetX);  // 记录按下按钮时按钮的位置
  }

  useEffect(() => {
    function onMouseMove(mouseEvent: MouseEvent) {
      if (!isMouseDown) {
        return;
      }

      const currentMouseX = mouseEvent.clientX;
      setMouseCurrentX(currentMouseX);
      const mouseDeltaX = currentMouseX - mouseDownX;
      setMouseDeltaX(mouseDeltaX);
      setButtonOffsetX(buttonDownOffsetX+mouseDeltaX);
    }

    const globalMouseMoveSubscription = fromEvent(
      window.document,
      "mousemove"
    ).subscribe((event) => {
      // console.log({event});
      onMouseMove(event as any);
    });

    return () => {
      globalMouseMoveSubscription.unsubscribe();
    };
  }, [isMouseDown, mouseDownX, buttonDownOffsetX]);

  useEffect(() => {
    const globalMouseUpSubscription = fromEvent(
      window.document,
      "mouseup"
    ).subscribe(() => {
      setIsMouseDown(false);
    });

    return () => {
      globalMouseUpSubscription.unsubscribe();
    };
  }, []);

  return (
    <div>
      <div
        onMouseDown={(event) => onMouseDown(event as any)}
        className={styles.sliderButton}
        style={{position:'relative',left:`${buttonOffsetX}px`}}
      ></div>
      <div>
        <span>mouseDown:</span>
        <span>{isMouseDown.toString()}</span>
      </div>
      <div>
        <span>mouseDownX:</span>
        <span>{mouseDownX.toString()}</span>
      </div>
      <div>
        <span>mouseCurrentX:</span>
        <span>{mouseCurrentX.toString()}</span>
      </div>
      <div>
        <span>mouseDeltaX:</span>
        <span>{mouseDeltaX.toString()}</span>
      </div>
      <div>
        <span>buttonDownX:</span>
        <span>{buttonDownOffsetX}</span>
      </div>
      <div>
        <span>buttonX</span>
        <span>{buttonOffsetX}</span>
      </div>
    </div>
  );
}

export default SliderComponent;
