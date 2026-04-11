/** Human-readable message from RTK Query / fetchBaseQuery error objects. */
export function getFetchErrorMessage(error, fallback = "Something went wrong") {
  if (!error) return fallback;
  const d = error.data;
  if (typeof d === "string") return d;
  if (d && typeof d === "object") {
    if (typeof d.message === "string" && d.message) return d.message;
    if (typeof d.error === "string" && d.error) return d.error;
  }
  if (typeof error.error === "string" && error.error) return error.error;
  if (typeof error.message === "string" && error.message) return error.message;
  return fallback;
}
