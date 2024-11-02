import { DetailedHTMLProps, InputHTMLAttributes, useState } from "react";
import { concatClasses } from "../functions/functions";

export function TextInput(props: {
  className?: string;
  placeholder?: string;
  onUpdate?: (text: string, event: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  textAlign?:
    | "start"
    | "end"
    | "left"
    | "right"
    | "center"
    | "justify"
    | "match-parent"
    | "inherit"
    | "unset";
  defaultValue?: string;
  type?: "text" | "password" | "email"
}) {
  const [content, setContent] = useState(props.defaultValue || "");

  return (
    <input
      type={props.type || "text"}
      onChange={(e) => {
        const newValue = e.target.value.substring(0, props.maxLength);
        setContent(newValue);
        props.onUpdate && props.onUpdate(newValue, e);
      }}
      placeholder={props.placeholder}
      className={concatClasses(
        "text-input-component",
        "section",
        props.className
      )}
      style={{ textAlign: props.textAlign }}
      value={content}
    />
  );
}
