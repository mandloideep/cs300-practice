import { memo, useReducer } from "react";

function reducer(count, action) {
  if (action === "increment") return count + 1;
  return count;
}

const Counter = memo(function Counter() {
  const [count, dispatch] = useReducer(reducer, 0);
  return (
    <button type="button" id="count" onClick={() => dispatch("increment")}>
      Count {count}
    </button>
  );
});

export default Counter;
