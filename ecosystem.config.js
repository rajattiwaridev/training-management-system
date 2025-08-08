module.exports = {
  apps: [
    {
      name: 'my-react-app',
      script: 'npm.cmd',           // 👈 Windows .cmd version of npm
      args: 'run start',           // 👈 Executes: npm run start
      interpreter: 'cmd.exe',      // 👈 Run via Windows shell
      env: {
        PORT: 5000,                // 👈 Your custom port here
        NODE_ENV: 'development',  // Or 'production' if needed
      },
    },
  ],
};
