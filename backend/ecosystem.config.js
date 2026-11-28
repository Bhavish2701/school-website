module.exports = {
  apps: [
    {
      name: 'srividya-api',
      script: 'src/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '800M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      autorestart: true,
      exp_backoff_restart_delay: 100,
      max_restarts: 10,
      listen_timeout: 8000,
      kill_timeout: 5000,
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
