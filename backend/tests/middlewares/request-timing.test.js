const requestTiming = require("../../src/middlewares/requestTiming");

describe("requestTiming middleware", () => {
  test("deve incluir request-id no log quando LOG_HTTP=true", () => {
    const envOriginal = process.env.LOG_HTTP;
    process.env.LOG_HTTP = "true";

    const req = {
      method: "GET",
      originalUrl: "/status",
      headers: {
        "x-request-id": "req-teste-1",
      },
      requestId: "req-teste-1",
    };

    const listeners = {};
    const res = {
      statusCode: 200,
      on: jest.fn((event, cb) => {
        listeners[event] = cb;
      }),
    };

    const next = jest.fn();
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    requestTiming(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);

    listeners.finish();

    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const mensagemLog = consoleSpy.mock.calls[0][0];
    expect(mensagemLog).toContain("[req:req-teste-1]");
    expect(mensagemLog).toContain("GET /status");

    consoleSpy.mockRestore();
    process.env.LOG_HTTP = envOriginal;
  });
});
