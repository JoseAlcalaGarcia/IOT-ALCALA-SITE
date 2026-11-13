import { request } from "./http.client.js";
import { ENDPOINTS } from "../config/endpoints.js";

export const historyApi = {
  state: () => request(ENDPOINTS.state),
  history: () => request(ENDPOINTS.history)
};
