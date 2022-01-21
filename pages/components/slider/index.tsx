import { useEffect, useRef, useState } from "react";
import { from, fromEvent } from "rxjs";
import styles from "./SliderComponent.module.css";

function SliderComponent() {
  const [ isMouseDown,       setIsMouseDown       ] = useState(false);  // 记录鼠标是否按下
  const [ buttonOffsetX,     setButtonOffsetX     ] = useState(0);      // 按钮当前的 offsetX
  const [ buttonDownOffsetX, setButtonDownOffsetX ] = useState(0);      // 按钮按下时的 offsetX
  const [ mouseDownX,        setMouseDownX        ] = useState(0);      // 鼠标按下时的 offsetX
  const [ mouseCurrentX,     setMouseCurrentX     ] = useState(0);      // 鼠标按下并移动时的 offsetX
  const [ mouseDeltaX,       setMouseDeltaX       ] = useState(0);      // 鼠标移动时的 delta OffsetX
  const [ maximumButtonX,    setMaximumButtonX    ] = useState(0);      // 最大允许的 buttonOffsetX

  // 尝试获取 container 的宽, 设定 button 的允许移动范围
  const containerRef = useRef(null);
  const buttonRef    = useRef(null);

  useEffect(() => {
    if ((containerRef?.current !== null) && (buttonRef?.current !== null)) {
      const containerElement = containerRef.current as HTMLElement;
      const buttonElement = buttonRef.current as HTMLElement;
      const buttonBox = buttonElement.getBoundingClientRect();
      const maximumAllowButtonX = containerElement.clientWidth - buttonBox.width
      // console.log({ set: maximumAllowButtonX });
      setMaximumButtonX(maximumAllowButtonX);
    }
  }, [containerRef, buttonRef, maximumButtonX])

  function onMouseDown(mouseEvent: MouseEvent) {
    setIsMouseDown(true);
    setMouseDownX(mouseEvent.clientX);    // 记录按下按钮时鼠标的位置
    setButtonDownOffsetX(buttonOffsetX);  // 记录按下按钮时按钮的位置
  }

  // 这个 effect 做的主要是注册 mouseMove 事件处理例程序
  useEffect(() => {
    function onMouseMove(mouseEvent: MouseEvent) {
      if (!isMouseDown) {
        return;
      }

      const currentMouseX = mouseEvent.clientX;
      setMouseCurrentX(currentMouseX);
      const mouseDeltaX = currentMouseX - mouseDownX;
      setMouseDeltaX(mouseDeltaX);

      /**
       * 移动时，更新 button 位置，更新法则为：
       * buttonOffsetX <- max(buttonDownOffsetX + mouseDeltaX, 0), min
       */

      const _buttonOffsetX0 = buttonDownOffsetX+mouseDeltaX;

      setButtonOffsetX(Math.min(Math.max(0, _buttonOffsetX0), maximumButtonX));  
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
  }, [isMouseDown, mouseDownX, buttonDownOffsetX, maximumButtonX]);

  // 这个 effect 做的主要是注册 mouseUp 事件处理例程
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

  // return 定义了视图模板
  return (
    <div>

      {/* 按钮容器 */}
      <div className={styles.buttonContainer} ref={containerRef}>
        <div
          ref={buttonRef}
          onMouseDown={(event) => onMouseDown(event as any)}
          className={styles.sliderButton}
          style={{position:'relative',left:`${buttonOffsetX}px`}}
        ></div>
      </div>

      {/* 统计信息容器 */}
      <div>
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

    </div>
  );
}

export default SliderComponent;
