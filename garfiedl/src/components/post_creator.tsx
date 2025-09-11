import { useStateObj } from "../functions/hooks";
import { TextInput } from "./input/input";
import { LinkIconWithTooltip } from "./tooltip";
import ComicEditor from "./comic_editor";
import { Comic } from "../types/sprites";
import ComicViewer from "./comic_viewer";
import { concatClasses, toTitle } from "../functions/functions";
import { useAddAlert, useClearAlertID } from "./alerts/alert_hooks";
import { Modal } from "./modal";
import supabase from "../supabase/client";
import Button from "./input/button";
import { useNavigate } from "react-router-dom";

export const DEFAULT_COMIC: Comic = {
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
    {
      background: {
        character: "backgrounds",
        index: 0,
      },
      sprites: [],
    },
    {
      background: {
        character: "backgrounds",
        index: 0,
      },
      sprites: [],
    },
  ],
};

export default function PostCreator(props: {
  onPost: (post: { link?: string; comic?: string; body: string }) => void;
  placeholder?: string;
}) {
  const [post, updatePost] = useStateObj<{
    body: string;
    comic?: Comic;
    link?: string;
  }>({
    body: "",
  });

  type ViewType = "none" | "editor" | "preview";
  const [view, updateView] = useStateObj({
    comic: "none" as ViewType,
    link: "none" as ViewType,
  });

  const addAlert = useAddAlert();

  return (
    <div className="post-creator">
      <div className="main-input">
        <TextInput
          textArea
          defaultValue={post.body}
          onUpdate={(val) => updatePost((post) => (post.body = val))}
          maxLength={360}
          placeholder={props.placeholder ?? "Type some text here…"}
        />
      </div>
      <div
        className={concatClasses(
          "attachments",
          view.link !== "editor" && "no-link"
        )}
      >
        <LinkIconWithTooltip
          className={concatClasses(
            "icon-container",
            view.comic !== "none" && "no-access"
          )}
          src="/icons/add-comic.svg"
          tooltip="Add comic"
          onClick={() => {
            updatePost((post) => (post.comic = structuredClone(DEFAULT_COMIC)));
            updateView((view) => (view.comic = "preview"));
          }}
        />

        {view.link === "editor" ? (
          <>
            <LinkIconWithTooltip
              className="icon-container"
              tooltip="Delete link"
              src="/icons/trash.svg"
              onClick={() => {
                updatePost((post) => delete post.link);
                updateView((view) => (view.link = "none"));
              }}
            />
            <div className="username-editor">
              <span className="section text-input-component">
                {window.location.protocol}//
              </span>
              <TextInput
                placeholder={`${window.location.host}/example-url/`}
                containerProps={{ className: "link-input" }}
                defaultValue={post.link}
                onUpdate={(link) => updatePost((post) => (post.link = link))}
              />
            </div>
            <LinkIconWithTooltip
              className={concatClasses(
                "icon-container test-link",
                !post.link && "no-access"
              )}
              tooltip="Test link"
              src="/icons/external.svg"
              target="_blank"
              onClick={() => {
                if (post.link)
                  window
                    .open(
                      /^https?:\/\//.test(post.link)
                        ? post.link
                        : `https://${post.link}`,
                      "_blank"
                    )
                    ?.focus();
              }}
            />
          </>
        ) : (
          <LinkIconWithTooltip
            className={"icon-container"}
            src="/icons/link.svg"
            tooltip="Add link"
            onClick={() => updateView((view) => (view.link = "editor"))}
          />
        )}
        <LinkIconWithTooltip
          className="icon-container"
          src="/icons/send.svg"
          tooltip="Post!"
          linkProps={{ style: { marginLeft: view.link === "none" && "auto" } }}
          onClick={async () => {
            if (view.comic === "editor") {
              addAlert(
                <Modal title="Unsaved Comic">
                  Your comic has unsaved changes. Please save them before
                  posting.
                </Modal>
              );
              return;
            }
            const link =
              post.link === undefined
                ? undefined
                : /^https?:\/\//.test(post.link)
                ? post.link
                : `https://${post.link}`;
            const { body, comic } = post;
            let locator: string | undefined;

            if (view.comic === "preview" && comic) {
              const { data, error: locatorError } = await supabase.rpc(
                "upload_comic"
              );

              if (locatorError) {
                addAlert(
                  <Modal title="Error">
                    A server error occured (1). {locatorError.code}{" "}
                    {locatorError.details} {locatorError.hint}{" "}
                    {locatorError.message}
                  </Modal>
                );
                return;
              }

              const { error: uploadError } = await supabase.storage
                .from("default")
                .upload(
                  `comic_uploads/comic-${data}.garf`,
                  JSON.stringify(comic)
                );

              if (uploadError) {
                addAlert(
                  <Modal title="Error">
                    A server error occured (2). {uploadError.message}{" "}
                    {uploadError.name} {uploadError.stack}
                  </Modal>
                );
                return;
              }

              locator = data;
            }
            props.onPost({
              link,
              body,
              comic: locator,
            });
          }}
        />
      </div>
      {view.comic === "editor" && (
        <ComicEditor
          initialComic={post.comic ?? DEFAULT_COMIC}
          onSave={(comic) => {
            updatePost((post) => (post.comic = comic));
            updateView((view) => (view.comic = "preview"));
          }}
        />
      )}
      {view.comic === "preview" && post.comic !== undefined && (
        <div className="comic-preview-container">
          <ComicViewer className="comic-preview" comic={post.comic} />
          <div className="controls">
            <LinkIconWithTooltip
              className="icon-container"
              tooltip="Open in new tab"
              src="/icons/external.svg"
              onClick={() => {
                const preview: HTMLCanvasElement | null =
                  document.querySelector("canvas.comic-preview");
                if (preview) {
                  window.open(preview.toDataURL());
                }
              }}
            />
            <LinkIconWithTooltip
              className="icon-container"
              tooltip="Edit comic"
              src="/icons/pencil.svg"
              onClick={() => updateView((view) => (view.comic = "editor"))}
            />
            <LinkIconWithTooltip
              className="icon-container"
              tooltip="Delete comic"
              src="/icons/trash.svg"
              onClick={() => {
                updatePost((post) => delete post.comic);
                updateView((view) => (view.comic = "none"));
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function useOpenPostDraft() {
  const addAlert = useAddAlert();
  const clearAlert = useClearAlertID();
  const navigate = useNavigate();

  return (
    props:
      | {
          mode: "post";
        }
      | {
          mode: "reply" | "repost" | "quote";
          reference: number;
        }
  ) => {
    const editorOpenedTimestamp = new Date().getTime();
    const alert = addAlert(
      <Modal
        title={toTitle(props.mode)}
        width={720}
        flexibleHeight
        onClose={() => {
          // Don't prompt if the editor has been open for less than ten seconds
          if (new Date().getTime() - editorOpenedTimestamp <= 10 * 1000) {
            clearAlert(alert);
            return;
          }
          const alertConfirmation = addAlert(() => (
            <Modal title="Exit Draft">
              <div>
                <div>
                  Are you sure you would like to exit? This draft will not be
                  saved.
                </div>
                <p />
                <div>
                  <Button onClick={() => clearAlert(alertConfirmation)}>
                    No, Cancel
                  </Button>{" "}
                  <Button
                    onClick={() => {
                      clearAlert(alertConfirmation);
                      clearAlert(alert);
                    }}
                  >
                    Yes, Exit
                  </Button>
                </div>
              </div>
            </Modal>
          ));
        }}
      >
        <PostCreator
          onPost={async (post) => {
            const { data, error } =
              props.mode === "post"
                ? await supabase
                    .from("posts")
                    .insert({
                      ...post,
                      type: props.mode,
                    })
                    .select("id")
                : await supabase.from("posts").insert({
                    ...post,
                    type: props.mode,
                    reference: props.reference,
                  }).select("id");

              console.log("data is", data)

            if (error) {
              addAlert(
                <Modal title="Error">
                  A server error occured (3). Code {error.code}
                </Modal>
              );
              return;
            }

            if (data && data.length) navigate(`/post/${data[0].id}`);
            clearAlert(alert)
          }}
          placeholder={
            props.mode === "post"
              ? "What's up?"
              : props.mode === "reply"
              ? "Add a reply…"
              : props.mode === "quote"
              ? "Add some groundbreaking commentary…"
              : ""
          }
        />
      </Modal>
    );
  };
}
