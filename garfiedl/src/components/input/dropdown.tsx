import {
  CSSProperties,
  MouseEventHandler,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { concatClasses } from "../../functions/functions";

export function Dropdown(props: {
  header: ReactNode;
  children: ReactNode;
  containerClass?: string;
  containerStyle?: CSSProperties;
  generateHeader?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownBodyRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (isOpen) {
      if (!dropdownBodyRef.current || !dropdownRef.current) return;
      const bounds = dropdownBodyRef.current.getBoundingClientRect();
      const transformations = [];
      if (window.innerHeight - bounds.bottom < 20) {
        transformations.push(
          `translateY(calc(-100% - ${
            (dropdownRef.current.querySelector(".dropdown-head")
              ?.clientHeight ?? 0) + 8
          }px))`
        );
      } else {
        transformations.push("translateY(8px)");
      }
      if (bounds.left < 8) {
        transformations.push(`translateX(${8 - bounds.left}px)`);
      } else if (window.innerWidth - bounds.right < 8) {
        transformations.push(
          `translateX(${8 - (window.innerWidth - bounds.right)}px)`
        );
      }
      dropdownBodyRef.current.style.transform = transformations.join(" ");
    }
  }, [isOpen]);

  return (
    <div
      className={concatClasses(
        "dropdown",
        isOpen && "open",
        props.containerClass
      )}
      ref={dropdownRef}
      style={props.containerStyle}
      onClick={props.onClick}
      onBlur={()=>{
        setTimeout(() => {
          if (!dropdownRef.current?.contains(document.activeElement)) setIsOpen(false)
        })
      }}
    >
      {props.generateHeader ? (
        <div className="dropdown-head">
          <button
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            <span>{props.header}</span>
            <img src={"/icons/arrowhead-right.svg"} />
          </button>
        </div>
      ) : (
        <div
          className="dropdown-head"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
          onKeyDown={(e) => {
            if ([" ", "Enter"].includes(e.key)) {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          role="button"
          tabIndex={0}
        >
          {props.header}
        </div>
      )}

      {isOpen && (
        <div className="dropdown-body" ref={dropdownBodyRef}>
          {props.children}
        </div>
      )}
    </div>
  );
}
