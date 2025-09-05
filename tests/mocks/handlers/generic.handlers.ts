import { HttpResponse } from "msw"

export const apiBase = "https://api2.frontapp.com"

export const unauthenticatedRes = HttpResponse.json(
  {
    _error: {
      status: 401,
      title: "Unauthenticated",
      message: "invalid signature",
    },
  },
  { status: 401 },
)

export const rateLimitedRes = HttpResponse.json(
  {
    _error: {
      status: 429,
      title: "Rate Limit Exceeded",
      message: "You have exceeded the rate limit",
      details: ["Rate limit exceeded"],
    },
  },
  { status: 429 },
)
