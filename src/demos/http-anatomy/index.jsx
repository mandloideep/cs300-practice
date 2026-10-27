import { Caption, CodeView, Panel, stageAt } from "../kit.jsx";
import "./styles.css";

export const id = "http-anatomy";

export const defaults = { limit: 8 };

function readLimit(props) {
  const limit = Number(props.limit);
  return Number.isInteger(limit) && limit >= 1 && limit <= 30 ? limit : defaults.limit;
}

function parts(limit) {
  const url = `https://dummyjson.com/products?limit=${limit}`;
  return [
    {
      key: "overview",
      side: null,
      code: [`const response = await fetch("${url}");`, "const data = await response.json();"],
      active: 0,
      caption: `One call to fetch is one round trip: a request goes out to dummyjson.com and a response comes back. Select any part of either message, or press Step to walk through them.`,
    },
    {
      key: "method",
      side: "request",
      name: "Method",
      code: [`const response = await fetch("${url}");`],
      active: 0,
      caption:
        'The method says what you want done. GET asks to read and is what fetch sends when you name no method. Saving data would use POST, written fetch(url, { method: "POST" }).',
    },
    {
      key: "url",
      side: "request",
      name: "URL",
      code: [`const response = await fetch("${url}");`],
      active: 0,
      caption: `The URL names the server, dummyjson.com, and the resource, /products. After the ? comes the query string: limit=${limit} asks for ${limit} product${limit === 1 ? "" : "s"}.`,
    },
    {
      key: "request-headers",
      side: "request",
      name: "Headers",
      code: [
        `const response = await fetch("${url}", {`,
        '  headers: { Accept: "application/json" },',
        "});",
      ],
      active: 1,
      caption:
        "Headers are name and value pairs about the message. The browser adds several on its own, such as Accept and the user agent, and you can add more in the headers option.",
    },
    {
      key: "request-body",
      side: "request",
      name: "Body",
      code: [
        'await fetch("https://dummyjson.com/products/add", {',
        '  method: "POST",',
        '  headers: { "Content-Type": "application/json" },',
        '  body: JSON.stringify({ title: "Kiwi" }),',
        "});",
      ],
      active: 3,
      caption:
        "This GET request has no body: it only asks. A POST that sends data carries it here, as text, with a Content-Type header that says it is JSON.",
    },
    {
      key: "status",
      side: "response",
      name: "Status",
      code: [
        `const response = await fetch("${url}");`,
        "console.log(response.status, response.ok);",
      ],
      active: 1,
      caption:
        "The status is a number and a phrase. 200 OK means it worked; 404 means not found and 500 a server error. response.ok is true for any status from 200 to 299.",
    },
    {
      key: "response-headers",
      side: "response",
      name: "Headers",
      code: [
        `const response = await fetch("${url}");`,
        'console.log(response.headers.get("content-type"));',
      ],
      active: 1,
      caption:
        "The response has headers too. content-type says the body is JSON, and DummyJSON reports how many requests you have left in this window.",
    },
    {
      key: "response-body",
      side: "response",
      name: "Body",
      code: [
        `const response = await fetch("${url}");`,
        "const data = await response.json();",
        "console.log(data.products.length, data.total);",
      ],
      active: 1,
      caption: `The body is the data, sent as JSON text. response.json() reads it and parses it, so data.products is an array of ${limit} and data.total is 194.`,
    },
  ];
}

export function stepCount() {
  return 8;
}

function Part({ part, selected, onSelect, children, label }) {
  const isOn = selected === part;
  return (
    <button
      type="button"
      className={isOn ? "http-anatomy__part is-selected" : "http-anatomy__part"}
      aria-pressed={isOn}
      onClick={onSelect}
    >
      <span className="http-anatomy__name">{label}</span>
      <span className="http-anatomy__value">{children}</span>
    </button>
  );
}

export default function HttpAnatomy({ props, step, goTo }) {
  const limit = readLimit(props);
  const all = parts(limit);
  const current = stageAt(all, step);
  const select = (key) => () => goTo(all.findIndex((entry) => entry.key === key));
  const shared = (key) => ({ part: key, selected: current.key, onSelect: select(key) });
  const lines = (items) =>
    items.map((line) => {
      const text = line.trimStart();
      const indent = line.length - text.length;
      return (
        <span key={line} className="http-anatomy__line" style={{ paddingLeft: `${indent + 2}ch` }}>
          {text}
        </span>
      );
    });

  return (
    <div className="http-anatomy">
      <div className="http-anatomy__messages">
        <Panel
          title="Request: browser to server →"
          className={current.side === "request" ? "http-anatomy__msg is-on" : "http-anatomy__msg"}
        >
          <div className="http-anatomy__parts">
            <div className="http-anatomy__start">
              <Part {...shared("method")} label="Method">
                GET
              </Part>
              <Part {...shared("url")} label="URL">
                https://dummyjson.com/products?limit={limit}
              </Part>
            </div>
            <Part {...shared("request-headers")} label="Headers">
              {lines(["Accept: */*", "Accept-Language: en-US", "User-Agent: Mozilla/5.0 …"])}
            </Part>
            <Part {...shared("request-body")} label="Body">
              <span className="http-anatomy__none">none</span>
            </Part>
          </div>
        </Panel>
        <Panel
          title="← Response: server to browser"
          className={current.side === "response" ? "http-anatomy__msg is-on" : "http-anatomy__msg"}
        >
          <div className="http-anatomy__parts">
            <Part {...shared("status")} label="Status">
              200 OK
            </Part>
            <Part {...shared("response-headers")} label="Headers">
              {lines([
                "content-type: application/json; charset=utf-8",
                "x-ratelimit-limit: 100",
                "x-ratelimit-remaining: 99",
              ])}
            </Part>
            <Part {...shared("response-body")} label="Body (shortened)">
              {lines([
                "{",
                '  "products": [',
                '    { "id": 1, "title": "Essence Mascara Lash Princess", "price": 9.99, … },',
                ...(limit > 1 ? [`    … ${limit - 1} more`] : []),
                "  ],",
                '  "total": 194,',
                '  "skip": 0,',
                `  "limit": ${limit}`,
                "}",
              ])}
            </Part>
          </div>
        </Panel>
      </div>
      <Panel
        title={
          current.name
            ? `In your code: ${current.side} ${current.name.toLowerCase()}`
            : "In your code"
        }
      >
        <CodeView lines={current.code} active={current.active} label="app.js" />
      </Panel>
      <Caption>
        {current.name && (
          <strong>
            {current.side === "request" ? "Request" : "Response"} {current.name.toLowerCase()}.{" "}
          </strong>
        )}
        {current.caption}
      </Caption>
    </div>
  );
}
