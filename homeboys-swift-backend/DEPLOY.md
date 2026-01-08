Deployment guide — Make your backend public (24/7)

Recommended: Deploy to Render (easy, supports Docker). Steps:

1) Push your repo to GitHub
   - Create a new GitHub repo and push the `homeboys-swift-backend` folder.

2) Create a MongoDB Atlas cluster (or provide a production MongoDB) and get the connection string.

3) On Render.com:
   - Sign up / Log in.
   - Choose "New +" → "Web Service" → Connect a GitHub repo.
   - Select your repo and choose "Docker" as the environment.
   - Render will detect `render.yaml` and create the service.
   - In service settings add environment variables (MONGODB_URI, JWT_SECRET, SESSION_SECRET).

4) Start the service. Render will build the Docker image from your `Dockerfile` and expose a public URL (e.g. https://homeboys-swift-backend.onrender.com).

Notes and alternatives:
- If you prefer Railway, Fly.io, or a VPS, the same Dockerfile works — they accept Docker deployments.
- Using ngrok reserved domain is possible (paid ngrok) but for 24/7 availability a cloud host is recommended.

Commands to push repo (example):

```bash
cd homeboys-swift-backend
git init
git add .
git commit -m "prepare for deployment"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo>.git
git push -u origin main
```

If you want, I can:
- prepare a GitHub Actions workflow to build and push a Docker image to GitHub Container Registry (GHCR) and optionally trigger a Render deploy (see `.github/workflows/ci-deploy.yml` included).
- help you step-by-step with the Render setup (I can produce the exact env values to set from `.env`).

Repository secrets required for automatic deploy (if you want the Render trigger):
- `RENDER_API_KEY` — your Render API key (service deploy permission)
- `RENDER_SERVICE_ID` — the Render service id for your web service

Notes on GHCR: the workflow builds and pushes the image to `ghcr.io/<your-org>/homeboys-swift-backend:latest`. No extra secrets are required for GHCR push when using the default `GITHUB_TOKEN`.

Tell me which option you want me to continue with.