import { toRadians } from "../functions/math_functions";

export type Sprites = {
  sprites: {
    [items in Characters]: {
      displayName: string;
      length: number;
    };
  } & {
    bubbles: {
      centers: Array<{ x: number; y: number }>;
    };
  };
};

export type Characters =
  | "animals"
  | "arlene"
  | "backgrounds"
  | "bubbles"
  | "garfield"
  | "irma"
  | "jon"
  | "liz"
  | "nermal"
  | "odie"
  | "props"
  | "squeak"
  | "text";

export type ImageSprite = {
  character: Characters;
  index: number;
};

export type TextSprite = ImageSprite & {
  textContent: string;
};

export type Sprite = BaseSpriteProperties & (
  | ({ type: "image" } & ImageSprite)
  | ({ type: "text" } & TextSprite));

  export type BaseSpriteProperties = {
    uuid: ReturnType<typeof window.crypto.randomUUID>
  }

export type SpriteTransformations = {
  dx: number;
  dy: number;
  xScale: number;
  yScale: number;
  rotation: number;
  flipped: boolean;
};

export type SpriteAndTransformations = Sprite & {
  transformations: SpriteTransformations;
};

export type Comic = {
  panels: Array<{
    background?: ImageSprite;
    sprites: Array<SpriteAndTransformations>;
  }>;
  info: {
    panelWidth: number;
    panelHeight: number;
    maxColumns: number;
    frameMargins: {
      x: number;
      y: number;
    };
  };
};

export function numRows(comic: Comic) {
  return Math.ceil(comic.panels.length / comic.info.maxColumns);
}

export function numColumns(comic: Comic) {
  return Math.min(comic.info.maxColumns, comic.panels.length);
}

export function drawOnCanvas(
  type: "image",
  ctx: CanvasRenderingContext2D,
  item_info: string | HTMLImageElement,
  options: {
    sourceX?: number;
    sourceY?: number;
    sourceWidth?: number;
    sourceHeight?: number;
    destX: number;
    destY: number;
    destWidth?: number;
    destHeight?: number;
  },
  transformations?: SpriteTransformations
): void;
export function drawOnCanvas(
  type: "textFill",
  ctx: CanvasRenderingContext2D,
  item_info: string,
  options: {
    sourceX?: number;
    sourceY?: number;
    sourceWidth?: number;
    sourceHeight?: number;
    destX: number;
    destY: number;
    destWidth?: number;
    destHeight?: number;
    fontSize: number;
    fontFamily: string;
    color: string;
  },
  transformations?: SpriteTransformations
): void;
export function drawOnCanvas(
  type: "image" | "textFill",
  ctx: CanvasRenderingContext2D,
  itemInfo: string | HTMLImageElement,
  options: {
    sourceX?: number;
    sourceY?: number;
    sourceWidth?: number;
    sourceHeight?: number;
    destX: number;
    destY: number;
    destWidth?: number;
    destHeight?: number;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
  },
  transformations?: SpriteTransformations
) {
  let image: HTMLImageElement | undefined;
  ctx.save();
  ctx.font = `${options.fontSize}px ${options.fontFamily}`;
  ctx.fillStyle = options.color!;
  const containsScaleOrRotate = transformations !== undefined;
    // transformations !== undefined &&
    // (transformations?.flip === true || transformations.rotation % 360 !== 0);
  const drawImage = () => {
    const textMetrics =
      typeof itemInfo === "string"
        ? ctx.measureText(itemInfo)
        : ctx.measureText("");
    const newOptions = {
      sourceX: options.sourceX ?? 0,
      sourceY: options.sourceY ?? 0,
      sourceWidth: options.sourceWidth ?? image?.width ?? textMetrics.width,
      sourceHeight:
        options.sourceHeight ??
        image?.height ??
        textMetrics.actualBoundingBoxAscent +
          textMetrics.actualBoundingBoxDescent,
      destX: options.destX,
      destY:
        type === "image"
          ? options.destY
          : options.destY +
            textMetrics.actualBoundingBoxAscent +
            textMetrics.actualBoundingBoxDescent,
      destWidth: options.destWidth ?? image?.width ?? textMetrics.width,
      destHeight:
        options.destHeight ??
        image?.height ??
        textMetrics.actualBoundingBoxAscent +
          textMetrics.actualBoundingBoxDescent,
    };
    if (transformations) {
      newOptions.destX += transformations.dx
      newOptions.destY += transformations.dy
      newOptions.destWidth *= transformations.xScale;
      newOptions.destHeight *= transformations.yScale;
    }
    if (containsScaleOrRotate) {
      /* This code was stolen from https://stackoverflow.com/a/11985464 */
      // Store the current context state (i.e. rotation, translation etc..)
      //Convert degrees to radian
      //Set the origin to the center of the image
      ctx.translate(
        newOptions.destX + newOptions.destWidth / 2,
        newOptions.destY + newOptions.destHeight / 2
      );

      //Scale the image
        // ctx.scale(transformations.xScale, transformations.yScale);
      
      //Rotate the canvas around the origin
      ctx.rotate(toRadians(transformations.rotation));
      if (transformations.flipped && type != "textFill")
      ctx.scale(-1, 1);
      
// I don't know what this code does
      newOptions.destX = (newOptions.destWidth / 2) * -1;
      newOptions.destY = (newOptions.destHeight / 2) * -1;
    }

    // draw the image!!1!11!1

    if (type === "image" && image !== undefined)
      ctx.drawImage(
        image,
        newOptions.sourceX,
        newOptions.sourceY,
        newOptions.sourceWidth,
        newOptions.sourceHeight,
        newOptions.destX,
        newOptions.destY,
        newOptions.destWidth,
        newOptions.destHeight
      );
    else if (type === "textFill" && typeof itemInfo === "string") {
      ctx.fillText(itemInfo, newOptions.destX, newOptions.destY);
    }

    ctx.restore();
  };
  if (typeof itemInfo === "string" && type === "image") {
    image = new Image();
    image.src = itemInfo;
    image.onload = drawImage;
  } else if (typeof itemInfo !== "string" && type === "image") {
    image = itemInfo;
    if (image.complete) drawImage();
    else image.onload = drawImage;
  } else {
    // is supposed to draw text then hopefully

    drawImage();
  }
}

export const spritesList: Sprites = await (
  await fetch("/sprites/copyright_issue/sprites.json")
).json();

export const spriteCache: {
  [i in `${Characters}-${number}`]: {
    image: HTMLImageElement;
  };
} = {};