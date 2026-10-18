1. Your repository must contain a production Dockerfile at its root. Launchdeck preserves existing application files and never guesses or overwrites your Dockerfile. For Next.js use output: "standalone" and a multi-stage Dockerfile. For npm repositories with package-lock.json, the generated workflow installs dependencies and runs any lint, typecheck and test scripts before building. Configure equivalent required checks for other package managers.

2. The first deployment runs an idempotent host bootstrap over SSH. It supports Ubuntu, Debian, Amazon Linux 2 and Amazon Linux 2023; it installs Docker Engine, Compose v2, Bash, curl and flock, enables Docker, and creates the project directory. The SSH user must have passwordless sudo for first-time setup. The bootstrap adds the user to the docker group; Docker group membership grants root-equivalent access. Match the image architecture to the EC2 processor.

3. On EC2 create $HOME/.launchdeck/7eceb670-c7af-45ec-baf3-6a672f18eca6/.env.production with runtime secrets before the first deploy (chmod 600). Deployment preserves this file. Your app must listen on 0.0.0.0:3000 and return HTTP 2xx or 3xx from /.

4. Reserve host port 3000 for this project and configure Caddy or Nginx with HTTPS to proxy your domain to 127.0.0.1:3000. Add a domain in project settings to have Launchdeck configure Caddy automatically.

5. Provide the dedicated SSH private key and verified known_hosts entry. Verify the host fingerprint through a trusted channel; do not blindly trust ssh-keyscan output. Allow SSH from GitHub-hosted runners, or use a self-hosted runner inside your network.

6. Installation creates a reviewable pull request and writes project-specific encrypted Actions secrets. Token permissions: Contents, Workflows, Pull requests and Secrets write; Actions read/write. A classic token needs repo and workflow scopes. GHCR publishing uses the workflow GITHUB_TOKEN.

7. Review and merge the setup PR into main. GitHub workflow_dispatch also requires this workflow to exist on the repository default branch; if different, merge the workflow there as well. Pushes to the selected branch trigger deployment.

8. Public Next.js build variables are baked into the image. Add needed build arguments to your Dockerfile and generated build step before merging. Do not include runtime secrets in the build context; maintain .dockerignore.

9. Health failure restores the prior successful image when available. Rollback accepts a full commit SHA already published by this project. Keep old GHCR images available. A single container replacement can briefly interrupt service.

10. Docs: https://docs.github.com/en/rest/actions/secrets and https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow
