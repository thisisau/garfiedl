import { MutableRefObject, useEffect, useRef } from "react";
import {
  Characters,
  Comic,
  drawOnCanvas,
  numColumns,
  numRows,
  spriteCache,
  spritesList,
} from "../types/sprites";
import { concatClasses } from "../functions/functions";
import { toRadians } from "../functions/math_functions";

export default function ComicViewer(props: {
  comic: Comic;
  style?: React.CSSProperties;
  className?: string;
  htmlRef?: MutableRefObject<HTMLCanvasElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (props.htmlRef && "current" in props.htmlRef)
      props.htmlRef.current = canvasRef.current;
  }, [canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.reset();
    (async () => {
      for (let i = 0; i < Math.min(props.comic.panels.length, 18); i++) {
        const panel = props.comic.panels[i];
        if (panel.background !== undefined) {
          let image;
          const spriteID: `${Characters}-${number}` = `${panel.background.character}-${panel.background.index}`;

          if (Object.keys(spriteCache).includes(spriteID)) {
            image = spriteCache[spriteID].image;
          } else {
            image = await createImageAndWaitForLoad(
              `/sprites/custom/${panel.background.character}/${
                panel.background.index
              }.${spritesList.sprites[panel.background.character].extension}`
            );
            spriteCache[spriteID] = { image };
          }
          drawOnCanvas("image", ctx, image, {
            sourceX: 0,
            sourceY: 0,
            destX:
              (i % numColumns(props.comic)) *
              (props.comic.info.panelWidth + props.comic.info.frameMargins.x),
            destY:
              Math.floor(i / numColumns(props.comic)) *
              (props.comic.info.panelHeight + props.comic.info.frameMargins.y),
            destWidth: props.comic.info.panelWidth,
            destHeight: props.comic.info.panelHeight,
          });
        }

        for (let j = 0; j < Math.min(panel.sprites.length, 100); j++) {
          // set max number of sprites to 100 so that web browser doesn't crash
          const sprite = panel.sprites[panel.sprites.length - j - 1];
          let image;
          const spriteID: `${Characters}-${number}` = `${sprite.character}-${sprite.index}`;
          if (Object.keys(spriteCache).includes(spriteID)) {
            image = spriteCache[spriteID].image;
          } else {
            image = await createImageAndWaitForLoad(
              `/sprites/custom/${sprite.character}/${sprite.index}.${
                spritesList.sprites[sprite.character].extension
              }`
            );
            spriteCache[spriteID] = { image };
          }
          drawOnCanvas(
            "image",
            ctx,
            image,
            {
              destX:
                (i % numColumns(props.comic)) *
                (props.comic.info.panelWidth + props.comic.info.frameMargins.x),
              destY:
                Math.floor(i / numColumns(props.comic)) *
                (props.comic.info.panelHeight +
                  props.comic.info.frameMargins.y),
            },
            { ...sprite.transformations }
          );
          if (sprite.type === "text") {
            const lines = sprite.textContent.split("\n");
            lines.splice(20);
            const lineHeight = 40;
            lines.forEach((line, lineIndex, lineArray) => {
              const metrics = calculateTextSize(ctx, line, 32, "Comic Sans MS");
              line = line.substring(0, 1000);
              const lineDistanceFromCenter =
                (lineArray.length / 2 - (lineIndex + 0.5)) * lineHeight;
              drawOnCanvas(
                "textFill",
                ctx,
                line,
                {
                  destX:
                    (i % numColumns(props.comic)) *
                      (props.comic.info.panelWidth +
                        props.comic.info.frameMargins.x) +
                    lineDistanceFromCenter *
                      Math.sin(toRadians(sprite.transformations.rotation)),
                  destY:
                    Math.floor(i / numColumns(props.comic)) *
                      (props.comic.info.panelHeight +
                        props.comic.info.frameMargins.y) -
                    lineDistanceFromCenter *
                      Math.cos(toRadians(sprite.transformations.rotation)),
                  fontSize: 32,
                  fontFamily: "Comic Sans MS",
                  color: "black",
                },
                {
                  ...sprite.transformations,
                  dx:
                    sprite.transformations.dx +
                    (spritesList.sprites.bubbles.centers[sprite.index].x *
                      sprite.transformations.xScale -
                      metrics.width / 2),
                  dy:
                    sprite.transformations.dy +
                    (spritesList.sprites.bubbles.centers[sprite.index].y *
                      sprite.transformations.yScale -
                      (metrics.actualBoundingBoxAscent +
                        metrics.actualBoundingBoxDescent) /
                        2),
                  flipped: false,
                }
              );
            });
          }
        }
      }
    })();
  }, [props.comic]);

  return (
    <canvas
      className={concatClasses(`garfield-image`, props.className)}
      height={
        props.comic.info.panelHeight * numRows(props.comic) +
        props.comic.info.frameMargins.y * (numRows(props.comic) - 1)
      }
      width={
        props.comic.info.panelWidth * numColumns(props.comic) +
        props.comic.info.frameMargins.x * (numColumns(props.comic) - 1)
      }
      ref={canvasRef}
      style={props.style}
    />
  );
}

export function createImageAndWaitForLoad(
  src: string,
  width?: number,
  height?: number
) {
  return new Promise<HTMLImageElement>((res) => {
    const image = new Image(width, height);
    image.src = src;
    if (image.complete) res(image);
    image.onload = () => res(image);
  });
}

function calculateTextSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontSize: number,
  fontFamily: string
) {
  ctx.save();
  ctx.font = `${fontSize}px '${fontFamily}'`;
  const metrics = ctx.measureText(text);
  ctx.restore();
  return metrics;
}
