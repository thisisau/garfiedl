import {
  useState,
  ReactElement,
  cloneElement,
  DetailedHTMLProps,
  ImgHTMLAttributes,
  MouseEventHandler,
  HTMLAttributeAnchorTarget,
} from "react";
import { Link, To } from "react-router-dom";
import { Tooltip } from "react-tooltip";

export function LinkIconWithTooltip(props: {
  className?: string;
  to?: To;
  src: string;
  tooltip?: string;
  draggable?: boolean;
  imageProps?: DetailedHTMLProps<
    ImgHTMLAttributes<HTMLImageElement>,
    HTMLImageElement
  >;
  linkProps?: Omit<Parameters<typeof Link>[0], "to">;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  target?: HTMLAttributeAnchorTarget;
}) {
  const [uuid] = useState(window.crypto.randomUUID());

  return props.to === undefined ? (
    <a
      {...props.linkProps}
      target={props.target}
      className={props.className}
      onClick={props.onClick}
      data-tooltip-id={`tooltip-${uuid}`}
      data-tooltip-content={props.tooltip}
      draggable={props.draggable ?? false}
      aria-label={props.tooltip}
      tabIndex={0}
    >
      <img
        {...props.imageProps}
        src={props.src}
        alt={props.tooltip}
        draggable={props.draggable ?? false}
      />
      <Tooltip id={`tooltip-${uuid}`} />
    </a>
  ) : (
    <Link
      {...props.linkProps}
      target={props.target}
      to={props.to}
      className={props.className}
      onClick={props.onClick}
      data-tooltip-id={`tooltip-${uuid}`}
      data-tooltip-content={props.tooltip}
      draggable={props.draggable ?? false}
      aria-label={props.tooltip}
    >
      <img
        {...props.imageProps}
        src={props.src}
        alt={props.tooltip}
        draggable={props.draggable ?? false}
      />
      <Tooltip id={`tooltip-${uuid}`} />
    </Link>
  );
}

export function ElementWithTooltip(
  props: {
    tooltip?: string;
    children: ReactElement;
  } & {
    isOpen?: boolean;
  }
) {
  const [uuid] = useState(window.crypto.randomUUID());

  return (
    <>
      {cloneElement(props.children, {
        "data-tooltip-id": `tooltip-${uuid}`,
        "data-tooltip-content": props.tooltip,
        "aria-label": props.tooltip,
      })}
      <Tooltip {...props} id={`tooltip-${uuid}`} />
    </>
  );
}
