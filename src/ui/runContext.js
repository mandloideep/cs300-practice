import { createContext } from "react";

// What the explanation needs from the runner of an edit step: the id of the run that has reached
// ready, or null while none has. A step with no runner has no provider, so the value is null.
export const StepRunContext = createContext(null);
