export const schema = {
  type: "function",
  function: {
    name: "fetchUrl",
    description: "Fetches text or HTML content from a web URL.",
    parameters: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "The URL from which to fetch data",
        },
      },
      required: ["url"],
    },
  },
};

export async function handler({ url }) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.text();
    if (data.length > 8000) {
      return data.slice(0, 8000) + "\n...[truncated]";
    }
    return data;
  } catch (error) {
    return `[NETWORK ERROR] Failed to fetch URL: ${error.message}`;
  }
}
