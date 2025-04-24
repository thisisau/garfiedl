import Button from "../components/input/button";
import MainHeader from "../components/header";
import { TextInput } from "../components/input/input";
import { useStateObj } from "../functions/hooks";
import { Characters, Comic } from "../types/sprites";
import ComicViewer from "../components/comic_viewer";
import ComicEditor from "../components/comic_editor";
import supabase from "../supabase/client";

export default function TestStuff() {
  return (
    <div id="page-container">
      <MainHeader />
      <div className="comic-editor-container">
        <ComicEditor
          onSave={async (e) => {
            const { data: locator, error } = await supabase.rpc("upload_comic");
            if (error) {
              return;
            }
            const resp = await supabase.storage
              .from("default")
              .upload(`comic_uploads/comic-${locator}.garf`, JSON.stringify(e));
          }}
          initialComic={{
            info: {
              panelHeight: 360,
              panelWidth: 480,
              maxColumns: 3,
              frameMargins: {
                x: 2,
                y: 2,
              },
            },
            panels: [
              {
                background: {
                  character: "backgrounds",
                  index: 0,
                },
                sprites: [],
              },
            ],
          }}
        />
      </div>
    </div>
  );
}

/*export default function TestStuff() {
  const addAlert = useAddAlert();
  const [scope, animate] = useAnimate();

  return (
    <div id="page-container">
      <MainHeader />
      Page not foundddd
      <Button
        onClick={() => {

            let clearAlertF: () => void;
          addAlert(clearAlert => {
            clearAlertF=clearAlert;
            return <Modal title="Hi">I am a Modal #{Math.random().toString()}</Modal>
          }
          );
          setTimeout(()=>
            addAlert(
              <Modal title="Hi">I am a Modal #{Math.random().toString()}<Button onClick={clearAlertF}>Clear other alert</Button></Modal>
            ),1000

          )
        }}
      >
        Click me
      </Button>
      <Button onClick={() => {
        animate(scope.current, {x: 100}, {duration: 2})
      }}>Clickme2</Button>
      <div ref={scope}>Animated div</div>
    </div>
  );
}*/

/*export default function TestStuff() {
  const [info, setInfo] = useStateObj<{
    character: Characters;
    index: number;
    background?: number;
    targetFrame: number;
    targetText: string;
  }>({
    character: "garfield",
    index: 0,
    background: 0,
    targetFrame: 0,
    targetText: "Garfiedl.com",
  });

  const [comic, updateComic, setComic] = useStateObj<Comic> /*{
    panels: [],
    info: {
      panelHeight: 215,
      panelWidth: 280,
      maxColumns: 3,
      frameMargins: {
        x: 2,
        y: 2,
      },
    },
  }* /({
    panels: [
      {
        background: {
          index: 0,
          character: "backgrounds",
        },
        sprites: [
          {
            type: "text",
            character: "bubbles",
            index: 0,
            transformations: {
              dx: 0,
              dy: 0,
              xScale: 1,
              yScale: 1,
              rotation: 0,
              flipped: false
            },
            textContent: "Garfiedl.com",
            uuid: "------"
          },
        ],
      },
      {
        background: {
          index: 0,
          character: "backgrounds",
        },
        sprites: [
          {
            type: "text",
            character: "bubbles",
            index: 0,
            transformations: {
              dx: 0,
              dy: 0,
              xScale: 1,
              yScale: 3,
              rotation: 0,
              flipped: false
            },
            textContent: "Garfiedl.com",            uuid: "------"

          },
        ],
      },
      {
        background: {
          index: 0,
          character: "backgrounds",
        },
        sprites: [{
          type: "text",
          character: "bubbles",
          index: 0,
          transformations: {
            dx: -150,
            dy: 0,
            xScale: 3,
            yScale: 1,
            rotation: 0,
            flipped: false
          },
          textContent: "Garfiedl.com",            uuid: "------"

        }],
      },
      {
        background: {
          index: 0,
          character: "backgrounds",
        },
        sprites: [
          {
            type: "text",
            character: "bubbles",
            index: 0,
            transformations: {
              dx: 0,
              dy: 0,
              xScale: 1,
              yScale: 1,
              rotation: 30,
              flipped: false
            },
            textContent: "Garfiedl.com\nGARFIEDL",            uuid: "------"

          },
        ],
      },
      {
        background: {
          index: 0,
          character: "backgrounds",
        },
        sprites: [
          {
            type: "text",
            character: "bubbles",
            index: 0,
            transformations: {
              dx: 0,
              dy: 0,
              xScale: 1,
              yScale: 3,
              rotation: 30,
              flipped: false
            },
            textContent: "Garfiedl.com",            uuid: "------"

          },
        ],
      },
      {
        background: {
          index: 0,
          character: "backgrounds",
        },
        sprites: [{
          type: "text",
          character: "bubbles",
          index: 0,
          transformations: {
            dx: -150,
            dy: 0,
            xScale: 3,
            yScale: 1,
            rotation: 30,
            flipped: false
          },
          textContent: "Garfiedl.com",            uuid: "------"

        }],
      },
      {
        background: {
          index: 0,
          character: "backgrounds",
        },
        sprites: [
          {
            type: "text",
            character: "bubbles",
            index: 0,
            transformations: {
              dx: 0,
              dy: 0,
              xScale: 2,
              yScale: 2,
              rotation: 0,
              flipped: false
            },
            textContent: "Garfiedl.com",            uuid: "------"

          },
        ],
      },
      {
        background: {
          index: 0,
          character: "backgrounds",
        },
        sprites: [
          {
            type: "text",
            character: "bubbles",
            index: 0,
            transformations: {
              dx: 0,
              dy: 0,
              xScale: 2,
              yScale: 2,
              rotation: 30,
              flipped: false
            },
            textContent: "Garfiedl.com",            uuid: "------"

          },
        ],
      },
      {
        background: {
          index: 0,
          character: "backgrounds",
        },
        sprites: [],
      },
    ],
    info: {
      panelHeight: 215,
      panelWidth: 280,
      maxColumns: 3,
      frameMargins: {
        x: 2,
        y: 2,
      },
    },
  });

  return (
    <div id="page-container">
      <MainHeader />
      sdlkfslk
      <TextInput
        defaultValue={info.character}
        onUpdate={(e) => {
          setInfo((info) => (info.character = e as Characters));
        }}
      />
      <TextInput
        defaultValue={"" + info.index}
        onUpdate={(e) => {
          setInfo((info) => (info.index = Number(e)));
        }}
      />
      <TextInput
        defaultValue={"" + info.background}
        onUpdate={(e) => {
          setInfo((info) => (info.background = Number(e)));
        }}
      />
      <TextInput
        defaultValue={"" + info.targetFrame}
        onUpdate={(e) => {
          setInfo((info) => (info.targetFrame = Number(e)));
        }}
      />
      <TextInput
        defaultValue={info.targetText}
        onUpdate={(e) => {
          setInfo((info) => (info.targetText = e));
        }}
      />
      <Button onClick={() => console.log(info)}>print</Button>
      <Button onClick={() => console.log(comic)}>print comic!!!!!!</Button>
      <Button
        onClick={() => {
          updateComic((comic) => {
            comic.panels[info.targetFrame].sprites.push({
              type: "image",
              character: info.character,
              index: info.index,
              transformations: {
                dx: 0,
                dy: 0,
                xScale: 1,
                yScale: 1,
                rotation: 0,
                flipped: false
              },            uuid: "------"

            });
          });
        }}
      >
        add item
      </Button>
      <Button
        onClick={() => {
          updateComic((comic) => {
            comic.panels[info.targetFrame].sprites.push({
              type: "text",
              character: "bubbles",
              index: info.index,
              transformations: {
                dx: 0,
                dy: 0,
                xScale: 2,
                yScale: 2,
                rotation: 30,
                flipped: false
              },
              textContent: info.targetText,            uuid: "------"

            });
          });
        }}
      >
        add text item
      </Button>
      <Button
        onClick={() => {
          updateComic((comic) =>
            comic.panels.push({
              background:
                info.background !== undefined
                  ? {
                      index: info.background,
                      character: "backgrounds",
                    }
                  : undefined,
              sprites: [],
            })
          );
          setTimeout(() => console.log(comic));
        }}
      >
        Add panel
      </Button>
      <div>
        <ComicViewer comic={comic} style={{}} />
      </div>
      <div>
        <ComicEditor onSave={(e) => {setComic(e)}} initialComic={comic}  />
      </div>
    </div>
  );
}*/
