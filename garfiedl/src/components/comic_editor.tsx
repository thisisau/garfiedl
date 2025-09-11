import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useStateObj } from "../functions/hooks";
import {
  Comic,
  spriteCache,
  spritesList,
} from "../types/sprites";
import ComicViewer, { createImageAndWaitForLoad } from "./comic_viewer";
import { DropdownInput, TextInput } from "./input/input";
import {
  concatClasses,
  pointOperators,
} from "../functions/functions";
import Button from "./input/button";
import { Slider } from "./input/slider";
import { useAddAlert } from "./alerts/alert_hooks";
import { Modal } from "./modal";
import { toDegrees, toRadians } from "../functions/math_functions";

const ComicContext = createContext<ReturnType<
  typeof useStateObj<Comic>
> | null>(null);
const FrameContext = createContext<
  [EditorPage, React.Dispatch<React.SetStateAction<EditorPage>>] | null
>(null);

type EditorPage = number;

export default function ComicEditor(props: {
  initialComic: Comic;
  onSave?: (comic: Comic) => void;
}) {
  const comic = useStateObj(props.initialComic);

  const [frame, setFrame] = useState<EditorPage>(0);

  if (frame >= 0) {
    return (
      <>
        <ComicContext.Provider value={comic}>
          <FrameContext.Provider value={[frame, setFrame]}>
            <FrameEditor onSave={props.onSave ?? (() => {})} />
          </FrameContext.Provider>
        </ComicContext.Provider>
      </>
    );
  }

  return null;
}

function FrameEditor(props: { onSave: (comic: Comic) => void }) {
  const [objects, updateObjects, setObjects] = useStateObj<Array<Shape>>([]);
  const [comic, updateComic] = useContext(ComicContext)!;
  const [frame, setFrame] = useContext(FrameContext)!;

  const addAlert = useAddAlert();

  const thisPanel = comic.panels[frame];

  const comicViewerRef = useRef<HTMLCanvasElement | null>(null);
  const clickPoint = useRef<{ x: number; y: number } | null>(null);

  const selectedItem = useMemo<number>(
    () => objects.findIndex((e) => e.mouseDown),
    [objects]
  );

  useEffect(() => {
    (async () => {
      const objects = await genObjects(comic, frame);
      setObjects(objects);
    })();
  }, [comic, frame]);

  useEffect(() => {
    if (comicViewerRef.current !== null) {
      const comicViewer = comicViewerRef.current;
      const mouseDownCallback = (e: MouseEvent | TouchEvent) => {
        const targetElement = e.target as HTMLCanvasElement;
        const targetBounds = targetElement.getBoundingClientRect();
        console.log(e);
        if (e instanceof MouseEvent)
          clickPoint.current = {
            x: (e.offsetX * targetElement.width) / targetElement.clientWidth,
            y: (e.offsetY * targetElement.height) / targetElement.clientHeight,
          };
        else
          clickPoint.current = {
            x:
              ((e.targetTouches[0].pageX - targetBounds.left) *
                targetElement.width) /
              targetElement.clientWidth,
            y:
              ((e.targetTouches[0].pageY - targetBounds.top) *
                targetElement.height) /
              targetElement.clientHeight,
          };
        const selectedObject = objects.findIndex((e) => {
          const center = { x: e.x + e.width / 2, y: e.y + e.height / 2 };

          // do rotation stuff
          const clickPointOffset = pointOperators.subtract(
            clickPoint.current!,
            center
          );

          const clickAngle = toDegrees(
            Math.atan2(clickPointOffset.y, clickPointOffset.x)
          );
          const clickMagnitude = Math.sqrt(
            clickPointOffset.x ** 2 + clickPointOffset.y ** 2
          );

          const transformedClickAngle = toRadians(clickAngle - e.rotation);

          const transformedClickOffset = {
            x: clickMagnitude * Math.cos(transformedClickAngle),
            y: clickMagnitude * Math.sin(transformedClickAngle),
          };

          const transformedClickPoint = pointOperators.add(
            center,
            transformedClickOffset
          );

          return (
            transformedClickPoint.x >= e.x &&
            transformedClickPoint.x < e.x + e.width &&
            transformedClickPoint.y >= e.y &&
            transformedClickPoint.y < e.y + e.height
          );
        });
        if (selectedObject === -1) return;
        updateObjects((e) =>
          e.forEach((_, i, a) => (a[i].mouseDown = i === selectedObject))
        );
      };
      comicViewer.ontouchstart = mouseDownCallback;
      comicViewer.onmousedown = mouseDownCallback;
      const moveSelectedObject = (e: MouseEvent | TouchEvent) => {
        console.log(e);
        const targetElement = e.target as HTMLCanvasElement;
        const targetBounds = targetElement.getBoundingClientRect();
        const thisClickPoint =
          e instanceof MouseEvent
            ? {
                x:
                  (e.offsetX * targetElement.width) / targetElement.clientWidth,
                y:
                  (e.offsetY * targetElement.height) /
                  targetElement.clientHeight,
              }
            : {
                x:
                  ((e.changedTouches[0].pageX - targetBounds.left) *
                    targetElement.width) /
                  targetElement.clientWidth,
                y:
                  ((e.changedTouches[0].pageY - targetBounds.top) *
                    targetElement.height) /
                  targetElement.clientHeight,
              };

        const selected = objects.findIndex((e) => e.mouseDown);
        const initialClickPoint: { x: number; y: number } /*| null*/ =
          clickPoint.current!;

        if (selected > -1) {
          updateObjects((e2) => {
            e2[selected].x += thisClickPoint.y - initialClickPoint.x;
            e2[selected].y += thisClickPoint.y - initialClickPoint.y;

            e2 = e2.splice(selected, 1).concat(e2);
          });
          updateComic((e2) => {
            const thisSpriteTransformations =
              e2.panels[frame].sprites[selected].transformations;
            thisSpriteTransformations.dx +=
              thisClickPoint.x - initialClickPoint.x;
            thisSpriteTransformations.dy +=
              thisClickPoint.y - initialClickPoint.y;
            const thisPanel = e2.panels[frame];

            thisPanel.sprites = thisPanel.sprites
              .splice(selected, 1)
              .concat(thisPanel.sprites);
          });
        }
      };
      const mouseUpCallback = (e: MouseEvent | TouchEvent) => {
        updateObjects((e2) =>
          e2.forEach((f) => {
            if (f.mouseDown) f.mouseDown = false;
          })
        );
        moveSelectedObject(e);
      };
      comicViewer.onmouseup = mouseUpCallback;
      comicViewer.onmouseleave = mouseUpCallback;
      comicViewer.ontouchcancel = mouseUpCallback;
      comicViewer.ontouchend = mouseUpCallback;
    }
  }, [comicViewerRef, comic, objects]);

  const selectedSprite =
    selectedItem > -1
      ? thisPanel.sprites[selectedItem]
      : thisPanel.sprites.length > 0
      ? thisPanel.sprites[0]
      : null;

  return (
    <div className="comic-editor">
      <ComicViewer
        comic={{
          info: {
            panelWidth: comic.info.panelWidth,
            panelHeight: comic.info.panelHeight,
            maxColumns: 1,
            frameMargins: { x: 0, y: 0 },
          },
          panels: [comic.panels[frame]],
        }}
        htmlRef={comicViewerRef}
      />
      <div className="selected-object">
        <p>
          Frame {frame + 1} of {comic.panels.length}
          <br />
          {selectedSprite
            ? spritesList.sprites[selectedSprite.character].displayName
            : "None"}
        </p>
        {selectedSprite && (
          <img
            src={`/sprites/custom/${selectedSprite.character}/${
              selectedSprite.index
            }.${spritesList.sprites[selectedSprite.character].extension}`}
          />
        )}
      </div>
      {selectedSprite && (
        <div className="transformation-sliders">
          <Slider
            label={`Scale: ${selectedSprite.transformations.xScale}x`}
            min={0}
            max={3}
            step={0.01}
            defaultValue={selectedSprite.transformations.xScale}
            onUpdate={async (val) => {
              const newComic = updateComic((e) => {
                const thisPanel = e.panels[frame];
                const thisSprite = thisPanel.sprites[0];
                thisSprite.transformations.xScale = val;
                thisSprite.transformations.yScale = val;
              });

              setObjects(await genObjects(newComic, frame));
            }}
            key={`scale-${selectedSprite.uuid}`}
          />
          {selectedSprite.type === "text" ? (
            <TextInput
              placeholder="Add some text here…"
              defaultValue={selectedSprite.textContent}
              onUpdate={(val) =>
                updateComic((e) => {
                  const thisSprite = e.panels[frame].sprites[0];
                  if (thisSprite.type === "text") thisSprite.textContent = val;
                })
              }
              textArea
            />
          ) : (
            <Slider
              label={`Rotation: ${selectedSprite.transformations.rotation}°`}
              min={-180}
              max={180}
              step={1}
              defaultValue={selectedSprite.transformations.rotation}
              onUpdate={async (val) => {
                const newComic = updateComic((e) => {
                  e.panels[frame].sprites[0].transformations.rotation = val;
                });

                setObjects(await genObjects(newComic, frame));
              }}
              key={`rotation-${selectedSprite.uuid}`}
            />
          )}
        </div>
      )}
      <div className="editor-buttons">
        <Button
          onClick={() => setFrame(frame - 1)}
          className={concatClasses(frame === 0 && "no-access")}
        >
          Previous Frame
        </Button>
        <Button
          onClick={() => setFrame(frame + 1)}
          className={concatClasses(
            frame === comic.panels.length - 1 && "no-access"
          )}
        >
          Next Frame
        </Button>
        <Button
          onClick={() => {
            addAlert((clear) => (
              <Modal title="Add Character" height={768} width={1024}>
                <CharacterSelector
                  updateComic={updateComic}
                  frame={frame}
                  onSelect={clear}
                />
              </Modal>
            ));
          }}
        >
          Add Character
        </Button>
        {selectedSprite ? (
          <>
            <Button
              onClick={() => {
                updateComic((e) => e.panels[frame].sprites.splice(0, 1));
                updateObjects((e) => e.splice(0, 1));
              }}
            >
              Delete
            </Button>
            <Button
              onClick={() => {
                updateComic(
                  (e) =>
                    (e.panels[frame].sprites[0].transformations.flipped =
                      !e.panels[frame].sprites[0].transformations.flipped)
                );
              }}
            >
              Flip
            </Button>
          </>
        ) : (
          <>
            <Button className={"no-access"}>Delete</Button>
            <Button className={"no-access"}>Flip</Button>
          </>
        )}
        <Button onClick={() => props.onSave(comic)}>Preview</Button>
      </div>
    </div>
  );
}

function CharacterSelector(props: {
  updateComic: (callback: (state: Comic) => void) => Comic;
  frame: number;
  onSelect?: (
    character: keyof typeof spritesList.sprites,
    index: number,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}) {
  const { updateComic, frame } = props;
  const [character, setCharacter] =
    useState<keyof typeof spritesList.sprites>("garfiedl");
  return (
    <div className="character-selector">
      <DropdownInput
        options={Object.values(spritesList.sprites).map((e) => e.displayName)}
        defaultOption={Object.keys(spritesList.sprites).indexOf(character)}
        onUpdate={(e) =>
          setCharacter(
            (
              Object.keys(spritesList.sprites) as Array<
                keyof typeof spritesList.sprites
              >
            )[e]
          )
        }
      />
      <div className="character-list">
        {Array.apply(null, Array(spritesList.sprites[character].length)).map(
          (_, i) => {
            const thisCharacter = spriteCache[`${character}-${i}`];
            let image: HTMLImageElement;
            if (!thisCharacter || !thisCharacter.image) {
              image = new Image();
              image.src = `/sprites/custom/${character}/${i}.${spritesList.sprites[character].extension}`;
              image.onload = () => {
                spriteCache[`${character}-${i}`] = { image };
              };
            }

            return (
              <Button
                color="dark"
                key={i}
                onClick={(ev) => {
                  if (character === "backgrounds")
                    updateComic(
                      (comic) =>
                        (comic.panels[frame].background = {
                          character,
                          index: i,
                        })
                    );
                  else if (character === "bubbles")
                    updateComic((comic) =>
                      comic.panels[frame].sprites.splice(0, 0, {
                        type: "text",
                        character,
                        index: i,
                        transformations: {
                          dx: 0,
                          dy: 0,
                          xScale: 1,
                          yScale: 1,
                          rotation: 0,
                          flipped: false,
                        },
                        textContent: "Garfiedl",
                        uuid: window.crypto.randomUUID(),
                      })
                    );
                  else {
                    updateComic((comic) =>
                      comic.panels[frame].sprites.splice(0, 0, {
                        type: "image",
                        character,
                        index: i,
                        transformations: {
                          dx: 0,
                          dy: 0,
                          xScale: 1,
                          yScale: 1,
                          rotation: 0,
                          flipped: false,
                        },
                        uuid: window.crypto.randomUUID(),
                      })
                    );
                  }

                  if (props.onSelect) props.onSelect(character, i, ev);
                }}
              >
                <img
                  src={`/sprites/custom/${character}/${i}.${spritesList.sprites[character].extension}`}
                />
              </Button>
            );
          }
        )}
      </div>
    </div>
  );
}

function genObjects(comic: Comic, frame: number): Promise<Array<Shape>> {
  const thisPanel = comic.panels[frame];

  const shapes: Array<Promise<Shape>> = thisPanel.sprites.map(async (e) => {
    const t = e.transformations;
    const thisSprite = spriteCache[`${e.character}-${e.index}`];
    let dimensions: { width: number; height: number };
    if (thisSprite !== undefined && thisSprite.image !== undefined) {
      dimensions = thisSprite.image;
    } else {
      const image = await createImageAndWaitForLoad(
        `/sprites/custom/${e.character}/${e.index}.${
          spritesList.sprites[e.character].extension
        }`
      );
      spriteCache[`${e.character}-${e.index}`] = { image };
      dimensions = image;
    }
    return {
      x: t.dx,
      y: t.dy,
      width: t.xScale * dimensions.width,
      height: t.yScale * dimensions.height,
      rotation: t.rotation,
      mouseDown: false,
    };
  });

  return Promise.all(shapes);
}

type Shape = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  mouseDown: boolean;
};
