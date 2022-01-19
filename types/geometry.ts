
export type Rect = {
  id: string;
  xOffset: number;
  yOffset: number;
  width: number;
  height: number;
  rotateDegree: number;
};

export type Pointer = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotateDegree: number;
};

export type Arc = {
  id: string;
  pathData: string;
};
