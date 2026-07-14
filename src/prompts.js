/**
 * Minimal interactive prompts (↑↓ + Enter). No npm dependencies.
 */

import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

/**
 * @template T
 * @param {{
 *   message: string;
 *   options: { value: T; label: string; hint?: string }[];
 *   initialValue?: T;
 * }} opts
 * @returns {Promise<T>}
 */
export function select(opts) {
  const { message, options, initialValue } = opts;
  if (!options.length) throw new Error("select: no options");

  let index = options.findIndex((o) => o.value === initialValue);
  if (index < 0) index = 0;

  if (!input.isTTY) {
    return Promise.resolve(options[index].value);
  }

  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({ input, output });
    readline.emitKeypressEvents(input, rl);
    input.setRawMode(true);

    const lineCount = options.length + 1; // message + options

    const draw = (first) => {
      if (!first) {
        output.write(`\x1b[${lineCount}A`);
      }
      output.write(`\x1b[2K\r? ${message}\n`);
      options.forEach((opt, i) => {
        const mark = i === index ? "›" : " ";
        const hint = opt.hint ? `  \x1b[2m${opt.hint}\x1b[0m` : "";
        const label =
          i === index ? `\x1b[36m${opt.label}\x1b[0m` : opt.label;
        output.write(`\x1b[2K\r  ${mark} ${label}${hint}\n`);
      });
    };

    draw(true);

    const done = (fn) => {
      input.off("keypress", onKey);
      input.setRawMode(false);
      rl.close();
      fn();
    };

    const onKey = (_str, key) => {
      if (!key) return;
      if (key.ctrl && key.name === "c") {
        done(() => {
          output.write("\n");
          reject(new Error("Cancelled"));
        });
        return;
      }
      if (key.name === "up" || key.name === "k") {
        index = (index - 1 + options.length) % options.length;
        draw(false);
      } else if (key.name === "down" || key.name === "j") {
        index = (index + 1) % options.length;
        draw(false);
      } else if (key.name === "return") {
        done(() => {
          output.write(`✔ ${message} · ${options[index].label}\n`);
          resolve(options[index].value);
        });
      }
    };

    input.on("keypress", onKey);
  });
}

/**
 * @param {{ message: string; placeholder?: string; defaultValue?: string }} opts
 * @returns {Promise<string>}
 */
export function text(opts) {
  const { message, placeholder, defaultValue = "" } = opts;
  if (!input.isTTY) return Promise.resolve(defaultValue);

  const rl = readline.createInterface({ input, output });
  const hint = placeholder || defaultValue;
  return new Promise((resolve) => {
    rl.question(`? ${message}${hint ? ` (${hint})` : ""}: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

/**
 * @param {{ message: string; initialValue?: boolean }} opts
 * @returns {Promise<boolean>}
 */
export function confirm(opts) {
  const { message, initialValue = true } = opts;
  return select({
    message,
    initialValue: initialValue ? "yes" : "no",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  }).then((v) => v === "yes");
}
