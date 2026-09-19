// PM2 — processo do Next em produção na VPS.
// Uso: pm2 start ecosystem.config.cjs  /  pm2 reload turismo
module.exports = {
  apps: [
    {
      name: "turismo",
      cwd: "/var/www/turismo",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // O Next lê o .env do cwd sozinho — DATABASE_URL e as NEXT_PUBLIC_* ficam lá.
      out_file: "/var/log/turismo/out.log",
      error_file: "/var/log/turismo/error.log",
      merge_logs: true,
      time: true,
    },
  ],
};
