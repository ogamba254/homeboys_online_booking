# Ngrok — Always-on dev exposure

1. Install ngrok and ensure it's on your PATH: https://ngrok.com/download
2. (Optional) Create a free ngrok account and get your authtoken.
3. Set your authtoken one of these ways:
   - Run: `ngrok authtoken <YOUR_TOKEN>`
   - Or set `NGROK_AUTH_TOKEN` in `.env` or `.env.ngrok`.
4. To start the server with ngrok (Windows PowerShell):

```powershell
npm run start:ngrok
```

Notes:
- The provided `ngrok.yml` defines a tunnel to `localhost:3000`.
- By default ngrok will create a random public URL each run. To reserve a stable subdomain you must
  use a paid ngrok plan and set `NGROK_SUBDOMAIN` to your reserved name; then uncomment `subdomain:` in `ngrok.yml`.
- The script `scripts/start-with-ngrok.ps1` loads variables from `.env` before launching ngrok and the server.
