import { Fragment, useEffect, useId, useState } from "react";
import { answerKey, revealAnswer, setAnswerPick, useProgress } from "../progress/store.js";

// Text with `code` spans, as content authors write options and explanations.
export function InlineCode({ text }) {
  return text
    .split(/(`[^`]+`)/)
    .map((part, index) =>
      part.startsWith("`") && part.endsWith("`") && part.length > 1 ? (
        <code key={index}>{part.slice(1, -1)}</code>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      ),
    );
}

// One predict or quiz block from the compiled step's questions (docs/CONTRACTS.md section 7.2),
// as a radio group. A quiz reveals its answer on the first pick. A predict keeps the pick and
// reveals it when a run that the student starts after picking reaches ready, so that the console
// confirms or corrects the guess; on a step with no runner it reveals on pick like a quiz.
// `readyRunId` is the id of the run that has reached ready, or null while none has.
export default function Question({ topicId, n, question, readyRunId, hasRunner }) {
  const progress = useProgress();
  const key = answerKey(topicId, n, question.id);
  const record = progress.answers[key] ?? null;
  const pick = record?.pick ?? null;
  const revealed = Boolean(record?.revealedAt);
  const [pickedDuring, setPickedDuring] = useState(undefined);
  const name = useId();
  const legendId = useId();
  const waitsForRun = question.kind === "predict" && hasRunner;

  useEffect(() => {
    if (!waitsForRun || revealed || pick === null) return;
    if (readyRunId !== null && readyRunId !== pickedDuring) revealAnswer(key);
  }, [waitsForRun, revealed, pick, readyRunId, pickedDuring, key]);

  function choose(index) {
    if (revealed) return;
    setPickedDuring(readyRunId);
    setAnswerPick(key, index, { reveal: !waitsForRun });
  }

  let status = null;
  if (revealed && pick === question.answer) {
    status = "Right.";
  } else if (revealed) {
    status = (
      <>
        Not quite. The answer is <InlineCode text={question.options[question.answer]} />.
      </>
    );
  } else if (pick !== null && waitsForRun) {
    status = "Run the code, then compare the console with your pick.";
  }

  return (
    <fieldset
      className={`question question--${question.kind}`}
      aria-describedby={`${legendId}-status`}
    >
      <legend id={legendId}>
        <span className="question__kind">{question.kind === "predict" ? "Predict" : "Quiz"}</span>
        <InlineCode text={question.question} />
      </legend>
      <ul className="question__options">
        {question.options.map((option, index) => {
          const isAnswer = revealed && index === question.answer;
          const isWrongPick = revealed && index === pick && pick !== question.answer;
          return (
            <li
              key={index}
              className={
                isAnswer
                  ? "is-answer"
                  : isWrongPick
                    ? "is-wrong"
                    : pick === index
                      ? "is-picked"
                      : undefined
              }
            >
              <label>
                <input
                  type="radio"
                  name={name}
                  checked={pick === index}
                  disabled={revealed && pick !== index}
                  onChange={() => choose(index)}
                />
                <span>
                  <InlineCode text={option} />
                </span>
                {isAnswer && <span className="question__tag">Answer</span>}
                {isWrongPick && <span className="question__tag">Your pick</span>}
              </label>
            </li>
          );
        })}
      </ul>
      <p id={`${legendId}-status`} className="question__status" role="status">
        {status}
        {revealed && question.explanation && (
          <>
            {" "}
            <InlineCode text={question.explanation} />
          </>
        )}
      </p>
    </fieldset>
  );
}
