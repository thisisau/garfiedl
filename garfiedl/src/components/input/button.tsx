import { KeyboardEventHandler, MouseEventHandler, ReactNode } from "react";
import { concatClasses } from "../../functions/functions";
import { RecursiveArray, ClassArray } from "../../functions/types";

export default function Button(props: {
  children: string | RecursiveArray<String> | ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onKeyUp?: KeyboardEventHandler<HTMLButtonElement>;
  className?: string | ClassArray;
  type?: "button" | "submit" | "reset";
  id?: string;
  color?: "pink" | "dark";
}) {
  return (
    <button
      type={props.type}
      id={props.id}
      className={concatClasses(
        "button-component",
        props.color && props.color !== "pink" && props.color,
        props.className
      )}
      onClick={props.onClick} onKeyUp={props.onKeyUp}
    >
      {props.children}
    </button>
  );
}
