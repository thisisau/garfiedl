import { ReactEventHandler } from "react";
import { concatClasses } from "../functions/functions";
import { Property } from "csstype"

export function FlexSeparator(
  props: {
    flexGrow?: number;
    flexShrink?: number;
    flexBasis?: string | number;
    hideOnSmallView?: boolean;
  }
) {
  return (
    <div
      style={{
        flexGrow: props.flexGrow ?? 1,
        flexShrink: props.flexShrink ?? 0,
        flexBasis: props.flexBasis,
      }}
      className={concatClasses(props.hideOnSmallView && "hide-on-small-view")}
    ></div>
  );
}

export function HorizontalLineSeparator(
  props: {
    width?: number
  }
) {
  return <hr style={{width: `${props.width || 384}px`}} />
}

export function Background(props: {
  color: Property.BackgroundColor;
  onClick?: ReactEventHandler<HTMLDivElement>
}) {
  return <div className="background-element" style={{"--background-element-background": props.color} as React.CSSProperties} onClick={props.onClick} />
}