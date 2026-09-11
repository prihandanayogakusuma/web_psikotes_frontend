module.exports = {
  apps: [
    {
      name: "career-frontend",
      cwd: "/var/www/career-frontend",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
