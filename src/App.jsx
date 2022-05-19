import { useReducer } from "react";
import { Views } from "./views/index.jsx";
import AppContext from "./store/AppState";
import { initialState } from "./store/initialState.js";
import { reducer } from "./store/reducer.js";

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      <Views />
    </AppContext.Provider>
  );
};

export default App;
