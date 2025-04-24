import { ChangeEventHandler, useRef, useState } from "react";
import { TextInput } from "./input";

export function Slider(props: {
  min: number;
  max: number;
  defaultValue?: number;
  step?: number;
  onUpdate?: (value: number) => void;
  label?: string;
}) {
  const min = props.min;
  const max = props.max;
  const step = props.step ?? 1;

  const [input, setInput] = useState(props.defaultValue ?? min);

  const id = useRef(window.crypto.randomUUID());

  const slide: (
    event: Parameters<ChangeEventHandler<HTMLInputElement>>[0]
  ) => void = (e) => {
    updateInput(e.currentTarget.valueAsNumber)
  }

  const updateInput: (
    numValue: number
  ) => void = (numValue) => {
    let value = Math.round(numValue / step) * step;
    if (value < min) value = min;
    else if (value > max) value = max;
    value = Number(value.toFixed(Math.ceil(-Math.log10(step)) + 1));
    setInput(value);

    if (props.onUpdate) props.onUpdate(value)
  };

  const valueAsPercent = (input - min) / (max - min) * 100;

  return (
    <div className="slider-input">
      {props.label && (
        <div className="slider-input-label">
          <label htmlFor={`slider-${id.current}`}>
            {props.label}
          </label>
        </div>
      )}
      <div className="slider-content">
        <div
          className="slider-track"
          style={{
            background: `linear-gradient(90deg, var(--garf-color) 0%, var(--garf-color) ${valueAsPercent}%, var(--section-border) ${valueAsPercent}%, var(--section-border) 100%)`
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percent = x / rect.width;
            updateInput((percent * (max - min) + min))
          }}
        />
        <input
          type="range"
          min={props.min}
          max={props.max}
          value={input}
          onChange={slide}
          id={`slider-${id.current}`}
          step={props.step}
        />
      </div>
    </div>
  );
}