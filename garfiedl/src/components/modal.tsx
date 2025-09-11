import { ReactNode } from "react";
import { useClearAlert } from "./alerts/alert_hooks";

export function Modal(props: {
  title: string;
  children: React.ReactNode;
  uncloseable?: boolean;
  width?: number;
  flexibleHeight?: boolean;
  height?: number;
  dontGetTooBig?: boolean;
  onClose?: () => void;
}) {
  const clearAlert = useClearAlert();
  const closeFunc = props.uncloseable
    ? () => {}
    : props.onClose ?? (() => clearAlert());
  return (
    <div className="modal" onClick={closeFunc}>
      <div
        className="modal-body shadow hide-scrollbar"
        style={{
          width: `${props.width}px`,
          maxWidth: `min(calc(100vw - 12px), ${props.width}px)`,
          height: props.flexibleHeight
            ? "fit-content"
            : props.height
            ? `${props.height}px`
            : undefined,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div className="modal-head-content">{props.title}</div>
          {props.uncloseable ? null : (
            <div className="modal-head-close" onClick={closeFunc}>
              <img src="/icons/x.svg" width="25" height="25" />
            </div>
          )}
        </div>
        <div className="modal-content">{props.children}</div>
      </div>
    </div>
  );
}
