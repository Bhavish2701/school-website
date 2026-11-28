const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    const requestId = req.id || '-';
    const timestamp = new Date().toISOString();

    const color =
      statusCode >= 500
        ? '\x1b[31m'
        : statusCode >= 400
        ? '\x1b[33m'
        : statusCode >= 300
        ? '\x1b[36m'
        : '\x1b[32m';
    const reset = '\x1b[0m';

    console.log(
      `[${timestamp}] [${requestId}] ${method} ${originalUrl} -> ${color}${statusCode}${reset} (${duration}ms) [${ip}]`
    );
  });

  next();
};

module.exports = loggerMiddleware;
