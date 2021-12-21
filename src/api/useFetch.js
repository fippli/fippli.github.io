const validateResponse = (response) => {
  if (response.ok) {
    return response;
  }

  throw new Error("Failed to fetch");
};

const deserializeResponse = (response) => response.json();

const handleError = (error) => {
  console.error(error);
  return null;
};

export const useFetch = (endpoint) => (options) =>
  fetch(endpoint, options)
    .then(validateResponse)
    .then(deserializeResponse)
    .catch(handleError);
