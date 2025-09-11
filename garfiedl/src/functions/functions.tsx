import { UUID } from "crypto";
import { ClassArray } from "./types";
import { SupabaseAuthClient } from "@supabase/supabase-js/dist/module/lib/SupabaseAuthClient";
import supabase from "../supabase/client";

export function concatClasses(...classes: ClassArray): string {
  return classes
    .filter((e) => e !== undefined && e !== null && e !== false)
    .map<string>((e) => {
      if (typeof e === "object") e = concatClasses(e);
      else e = e.trim();
      return e;
    })
    .join(" ");
}

export function generateUsername(maxLength: number) {
  const name_sections = [
    randomElement(
      "garfield",
      "arbuckle",
      "lasagna",
      "pizza",
      "odie",
      "nermal",
      "arlene",
      "pooky",
      "jon",
      "liz",
      "james",
      "jamesabram",
      "abram",
      "guiteau"
    ),
    randomElement("", "-", "_"),
    randomElement(
      "lover",
      "fan",
      "adorer",
      "enthusiast",
      "addict",
      "maniac",
      "fanatic",
      "aficionado"
    ),
    Math.floor(Math.random() * 998) + 2,
  ];

  const name = name_sections.join("");

  if (name.length > maxLength) return generateUsername(maxLength);
  return name;
}

function randomElement<T>(...array: T[]) {
  return array[Math.floor(Math.random() * array.length)];
}

export function toTitle(text: string): string {
  const words = text.split(" ");
  const titleWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
  );
  return titleWords.join(" ");
}

export function capitalizeFirstLetter(s: string) {
  return s.charAt(0).toUpperCase() + s.substring(1);
}

type Point = { x: number; y: number };
export const pointOperators = {
  add: (p1: Point, p2: Point) => {
    return { x: p1.x + p2.x, y: p1.y + p2.y };
  },
  subtract: (p1: Point, p2: Point) => {
    return { x: p1.x - p2.x, y: p1.y - p2.y };
  },
};
export function formatDate(
  date: Date,
  mode: "short-adapt" | "long" | "very-long"
) {
  const shortMonthKey = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const shortDayKey = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const longMonthKey = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const longDayKey = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const h = date.getHours();
  const m = date.getMinutes();
  const s = date.getSeconds();
  const d = date.getDay();
  const D = date.getDate();
  const M = date.getMonth();
  const Y = date.getFullYear();
  const now = new Date();
  const DAY_IN_MS = 1000 * 60 * 60 * 24;
  const WEEK_IN_MS = DAY_IN_MS * 7;

  switch (mode) {
    case "short-adapt":
      // Date is same day as current time
      if (now.getDate() - DAY_IN_MS < date.getTime() && D === now.getDate()) {
        return `${h % 12 === 0 ? 12 : h % 12}:${m
          .toString()
          .padStart(2, "0")} ${h / 12 < 1 ? "AM" : "PM"}`;
      }

      // Date is within 1 week of current time
      else if (now.getTime() - WEEK_IN_MS < date.getTime()) {
        return shortDayKey[d];
      }

      // Date is same year as current time
      else if (now.getFullYear() === Y) {
        return `${shortMonthKey[M]} ${D}`;
      }

      // Default case
      else {
        return `${Y}-${M}-${D}`;
      }
    case "long":
      return `${longMonthKey[M]} ${D}, ${Y} at ${h % 12 === 0 ? 12 : h % 12}:${m
        .toString()
        .padStart(2, "0")} ${h / 12 < 1 ? "AM" : "PM"}`;
    case "very-long":
      return `${longDayKey[d]}, ${longMonthKey[M]} ${D}, ${Y} at ${
        h % 12 === 0 ? 12 : h % 12
      }:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")} ${
        h / 12 < 1 ? "AM" : "PM"
      }`;
  }
}

export function simpleHash(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

export function plural(
  text: string,
  count: number = 0,
  suffix: string = "s",
  singularSuffix: string = ""
) {
  if (count === 1) return text + singularSuffix;
  return text + suffix;
}
