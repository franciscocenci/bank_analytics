const requestId = require("../../src/middlewares/requestId");

describe("requestId middleware", () => {
  test("deve reutilizar o X-Request-Id quando já enviado", () => {
    const req = {
      headers: {
        "x-request-id": "req-externo-123",
      },
    };

    const headersDefinidos = {};
    const res = {
      setHeader: jest.fn((name, value) => {
        headersDefinidos[name] = value;
      }),
    };

    const next = jest.fn();

    requestId(req, res, next);

    expect(req.requestId).toBe("req-externo-123");
    expect(req.headers["x-request-id"]).toBe("req-externo-123");
    expect(headersDefinidos["X-Request-Id"]).toBe("req-externo-123");
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("deve gerar X-Request-Id quando não enviado", () => {
    const req = { headers: {} };
    const res = {
      setHeader: jest.fn(),
    };
    const next = jest.fn();

    requestId(req, res, next);

    expect(typeof req.requestId).toBe("string");
    expect(req.requestId.length).toBeGreaterThan(0);
    expect(req.headers["x-request-id"]).toBe(req.requestId);
    expect(res.setHeader).toHaveBeenCalledWith("X-Request-Id", req.requestId);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
