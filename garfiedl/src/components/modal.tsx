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
}) {
    const clearAlert = useClearAlert();
    const closeFunc = props.uncloseable ? () => {} : () => clearAlert();
    return (
        <div className="modal" onClick={closeFunc}>
            <div
                className="modal-body shadow hide-scrollbar"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: `${props.width}px`,
                    maxWidth: `min(80%, ${props.width}px)`,
                    height: props.flexibleHeight
                        ? "fit-content"
                        : props.height
                        ? `${props.height}px`
                        : undefined,
                    maxHeight: "fit-content",
                }}
            >
                <div className="modal-head">
                    <div className="modal-head-content">{props.title}</div>
                    {props.uncloseable ? null : (
                        <div
                            className="modal-head-close"
                            onClick={closeFunc}
                        >
                            <img src="/icons/x.svg" width="25" height="25" />
                        </div>
                    )}
                </div>
                <div className="modal-content">{props.children}</div>
            </div>
        </div>
    );
}