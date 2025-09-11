import { DetailedHTMLProps, HTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes, useEffect, useRef, useState } from "react";
import { concatClasses } from "../../functions/functions";

export type InputComponentCallback<T> = (
  text: string,
  updateText: (newText: string) => void,
  event: T
) => void;

export function TextInput(
  props: {
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
    placeholder?: string;
    className?: string;
    id?: string;
    "data-tooltip-id"?: string;
    "data-tooltip-content"?: string;
  } & (
    | {
        type?: "text" | "password" | "number" | "search" | "email";
        textArea?: false;
        onUpdate?: InputComponentCallback<
          React.ChangeEvent<HTMLInputElement> | undefined
        >;
        onKeyDown?: InputComponentCallback<
          React.KeyboardEvent<HTMLInputElement>
        >;
        onBlur?: InputComponentCallback<React.FocusEvent<HTMLDivElement>>;
        inputProps?: DetailedHTMLProps<
          InputHTMLAttributes<HTMLInputElement>,
          HTMLInputElement
        >;
        autocomplete?: (e: string) => Array<string> | Promise<Array<string>>;
        containerProps?: DetailedHTMLProps<
          HTMLAttributes<HTMLDivElement>,
          HTMLDivElement
        >;
      }
    | {
        textArea: true;
        nonResizable?: boolean;
        onUpdate?: InputComponentCallback<
          React.ChangeEvent<HTMLTextAreaElement>
        >;
        onKeyDown?: InputComponentCallback<
          React.KeyboardEvent<HTMLTextAreaElement>
        >;
        onBlur?: InputComponentCallback<React.FocusEvent<HTMLTextAreaElement>>;
        textAreaProps?: DetailedHTMLProps<
          TextareaHTMLAttributes<HTMLTextAreaElement>,
          HTMLTextAreaElement
        >;
      }
  )
) {
  const [content, setContent] = useState(props.defaultValue ?? "");
  useEffect(() => {
    setContent(props.defaultValue ?? "");
  }, [props.defaultValue]);

  const [autoCompleteResults, setAutoCompleteResults] = useState<Array<string>>(
    []
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const updateAutoComplete = async () => {
    if ("autocomplete" in props && props.autocomplete !== undefined) {
      const autoCompletion = await props.autocomplete(content);
      setAutoCompleteResults(autoCompletion);
    }
  };

  useEffect(() => {
    updateAutoComplete();
  }, [content]);


  useEffect(() => {
    if (autoCompleteResults.length > 0) {
      if (
        inputRef.current !== null &&
        inputRef.current !== document.activeElement
      ) {
        setAutoCompleteResults([]);
      }
    }
  }, [autoCompleteResults]);


  if (!props.textArea)
    return (
      <div
        {...props.containerProps}
        className={concatClasses("text-input-container", props.containerProps?.className)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            props.onBlur && props.onBlur(content, setContent, e);
            setAutoCompleteResults([]);
          }
        }}
        onFocus={() => updateAutoComplete()}
      >
        <input
          {...props.inputProps}
          data-tooltip-content={props["data-tooltip-content"]}
          data-tooltip-id={props["data-tooltip-id"]}
          type={props.type ?? "text"}
          onChange={(e) => {
            const newValue = e.target.value.substring(0, props.maxLength);
            setContent(newValue);
            props.onUpdate && props.onUpdate(newValue, setContent, e);
          }}
          placeholder={props.placeholder}
          className={concatClasses(
            "text-input-component",
            "section",
            props.className
          )}
          style={{ textAlign: props.textAlign }}
          value={content}
          id={props.id}
          onKeyDown={(e) => {
            props.onKeyDown && props.onKeyDown(content, setContent, e);
          }}
          ref={inputRef}
        />
        {autoCompleteResults.length > 0 && (
          <div
            className="input-autocomplete-results"
            key={`autocomplete-result-${content}`}
          >
            {autoCompleteResults.map((e, i) => (
              <button
                tabIndex={0}
                key={i}
                onClick={(ev) => {
                  ev.preventDefault();
                  setContent(e);
                  props.onUpdate && props.onUpdate(e, setContent, undefined);
                  setAutoCompleteResults([]);
                  inputRef.current?.focus();
                }}
              >
                <span>{e}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );

  return (
    <textarea
      {...props.textAreaProps}
      data-tooltip-content={props["data-tooltip-content"]}
      data-tooltip-id={props["data-tooltip-id"]}
      onChange={(e) => {
        const newValue = e.target.value.substring(0, props.maxLength);
        setContent(newValue);
        props.onUpdate && props.onUpdate(newValue, setContent, e);
      }}
      placeholder={props.placeholder}
      className={concatClasses(
        "text-input-component",
        "section",
        props.className
      )}
      style={{
        ...props.textAreaProps?.style,
        textAlign: props.textAlign,
        resize: props.nonResizable ? "none" : undefined,
      }}
      value={content}
      id={props.id}
      onKeyDown={(e) => {
        props.onKeyDown && props.onKeyDown(content, setContent, e);
      }}
      onBlur={(e) => {
        props.onBlur && props.onBlur(content, setContent, e);
      }}
    />
  );
}


export function DropdownInput(props: {
  options: Array<ReactNode>;
  onUpdate?: (value: number) => void;
  defaultOption?: number;
}) {
  const [value, setValue] = useState(props.defaultOption ?? 0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [lastEvent, setLastEvent] = useState<{
    value: number;
    event: React.MouseEvent<HTMLButtonElement>;
  } | null>(null);

  useEffect(() => {
    if (lastEvent !== null) if (props.onUpdate) props.onUpdate(lastEvent.value);
  }, [lastEvent]);

  useEffect(() => {
    const listener: (this: Document, ev: MouseEvent) => any = (e) => {
      if (
        dropdownRef.current !== null &&
        e.target instanceof Node &&
        !dropdownRef.current.contains(e.target)
      )
        setIsOpen(false);
    };

    document.addEventListener("click", listener);

    return () => document.removeEventListener("click", listener);
  }, []);

  return (
    <div
      className={concatClasses("dropdown", isOpen && "open")}
      ref={dropdownRef}
    >
      <div className="dropdown-head">
        <button
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <span>{props.options[value]}</span>
          <img src={"/icons/arrowhead-right.svg"} />
        </button>
      </div>
      {isOpen && (
        <div className="dropdown-body">
          {props.options.map((e, i) => (
            <button
              className={concatClasses(i === value && "active")}
              key={i}
              onClick={(ev) => {
                setValue(i);
                setIsOpen(false);
                setLastEvent({
                  event: ev,
                  value: i,
                });
              }}
            >
              <span>{e}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
