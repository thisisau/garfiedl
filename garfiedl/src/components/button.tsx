import { MouseEventHandler } from "react";
import { ClassArray, RecursiveArray } from "../functions/types";
import { concatClasses } from "../functions/functions";

export default function Button(props: {
    children: string | RecursiveArray<String>;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    className?: string | ClassArray;
    type?: "button" | "submit" | "reset"
    id?: string

}) {
    return <button type={props.type} id={props.id} className={concatClasses("button-component", props.className)} onClick={props.onClick}>{props.children}</button>
}