export default {
  async fetch(request, env, ctx) {
    const response = await env.ASSETS.fetch(request);
    if (response && response.status !== 404) {
      return response;
    }

    return new Response("Not Found", { status: 404 });
  },
};

export class RateLimiterDurableObject {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const cfRay = request.headers.get("cf-ray") || "";
    return new Response(
      JSON.stringify({
        allowed: true,
        ray: cfRay,
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
        },
      },
    );
  }
}

