export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response && response.status !== 404) {
      return response;
    }

    return new Response("Not Found", { status: 404 });
  },
};

