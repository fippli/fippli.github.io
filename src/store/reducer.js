export const reducer = (state, action) => {
  switch (action.type) {
    case "SET_SEARCH_INPUT": {
      return { ...state, searchInput: action.payload };
    }

    default: {
      return state;
    }
  }
};
