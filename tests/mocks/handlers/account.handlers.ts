import { http } from "msw"
import { apiBase, rateLimitedRes } from "./generic.handlers"

const baseUrl = `${apiBase}/accounts`

export const accountHandlers = {
  list: {
    rateLimited: http.get(`${baseUrl}`, () => rateLimitedRes),
  },
}
