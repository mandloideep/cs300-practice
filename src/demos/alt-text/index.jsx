import { Caption, Chip, CodeView, Panel } from "../kit.jsx";
import "./styles.css";

export const id = "alt-text";

export const defaults = {
  src: "images/logo.svg",
  alt: "The study group logo: a blue circle on a light blue square",
};

function settings(props) {
  const src =
    typeof props.src === "string" && /^[\w./-]{1,60}$/.test(props.src) && /\w/.test(props.src)
      ? props.src
      : defaults.src;
  const alt =
    typeof props.alt === "string" && props.alt.trim() !== "" && props.alt.length <= 140
      ? props.alt.trim().replace(/"/g, "'")
      : defaults.alt;
  const file = src.split("/").filter(Boolean).pop() || src;
  return { src, alt, file };
}

const VERSIONS = ["none", "text", "empty"];

function stages({ alt, file }) {
  return [
    {
      broken: false,
      heard: 0,
      caption:
        "Three ways to write the same image. When the file loads they look identical: alt changes nothing you can see.",
    },
    {
      broken: true,
      heard: 0,
      caption:
        'Now the file fails to load. Without alt, Chrome draws a broken-image icon and nothing else. With alt text, the browser shows the text where the picture was; with alt="", it shows nothing at all.',
    },
    {
      broken: true,
      heard: 1,
      caption: `With no alt, a screen reader has no text to read, and many fall back to the file name: "${file}, image". The file name was never written for a listener.`,
    },
    {
      broken: true,
      heard: 2,
      caption: `With alt text, the screen reader reads "${alt}, image". It reads the same words whether the picture loaded or not.`,
    },
    {
      broken: true,
      heard: 3,
      caption:
        'With alt="", the image is marked as decorative and screen readers skip it in silence. That is right for a flourish, and wrong for a logo that names the page.',
    },
    {
      broken: false,
      heard: 3,
      caption:
        'Give every <img> an alt. Describe what the picture shows, not the word "image", since the reader already says that, and use alt="" only for pictures that add nothing.',
    },
  ];
}

export function stepCount(props) {
  return stages(settings(props)).length;
}

function Picture() {
  return (
    <span className="alt-text__picture" aria-hidden="true">
      <span className="alt-text__dot" />
    </span>
  );
}

function Broken({ version, alt }) {
  if (version === "none") {
    return (
      <span className="alt-text__broken">
        <span className="alt-text__icon" aria-hidden="true">
          ✕
        </span>
        <span className="meta">broken-image icon</span>
      </span>
    );
  }
  if (version === "text") return <span className="alt-text__shown">{alt}</span>;
  return <span className="meta alt-text__nothing">(nothing drawn)</span>;
}

function Heard({ version, alt, file }) {
  if (version === "none")
    return <span className="alt-text__speech">&quot;{file}, image&quot;</span>;
  if (version === "text") return <span className="alt-text__speech">&quot;{alt}, image&quot;</span>;
  return <Chip tone="muted">skipped, nothing said</Chip>;
}

export default function AltText({ props, step }) {
  const setup = settings(props);
  const all = stages(setup);
  const stage = all[Math.max(0, Math.min(all.length - 1, step))];
  const code = {
    none: `<img src="${setup.src}" />`,
    text: `<img src="${setup.src}" alt="${setup.alt}" />`,
    empty: `<img src="${setup.src}" alt="" />`,
  };
  const titles = { none: "No alt", text: "alt with text", empty: 'alt=""' };

  return (
    <div className="alt-text">
      <p className="alt-text__status">
        <Chip tone={stage.broken ? "danger" : "success"}>
          {stage.broken ? `✗ ${setup.file} failed to load` : `✓ ${setup.file} loaded`}
        </Chip>
      </p>
      <div className="alt-text__code">
        <CodeView
          lines={VERSIONS.map((version) => code[version])}
          active={step < all.length - 1 ? stage.heard - 1 : -1}
          label="The three versions"
        />
      </div>
      <div className="alt-text__versions">
        {VERSIONS.map((version, index) => {
          const current = stage.heard === index + 1 && step < all.length - 1;
          return (
            <Panel
              key={version}
              title={titles[version]}
              className={current ? "alt-text__version is-current" : "alt-text__version"}
            >
              <div className="alt-text__view">
                {stage.broken ? <Broken version={version} alt={setup.alt} /> : <Picture />}
              </div>
              <div className="alt-text__reader">
                <span className="meta">A screen reader says</span>
                {stage.heard > index ? (
                  <Heard version={version} alt={setup.alt} file={setup.file} />
                ) : (
                  <span className="meta">…</span>
                )}
              </div>
            </Panel>
          );
        })}
      </div>
      <Caption>{stage.caption}</Caption>
    </div>
  );
}
