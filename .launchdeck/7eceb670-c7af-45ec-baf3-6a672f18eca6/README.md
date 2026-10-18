1. Your repository must contain a production Dockerfile at its root. Launchdeck preserves existing application files and never guesses or overwrites your Dockerfile. For Next.js use output: "standalone" and a multi-stage Dockerfile. For npm repositories with package-lock.json, the Jenkins pipeline installs dependencies and runs any lint, typecheck and test scripts before building. Configure equivalent required checks for other package managers.

2. The first deployment runs an idempotent host bootstrap over SSH. It supports Ubuntu, Debian, Amazon Linux 2 and Amazon Linux 2023; it installs Docker Engine, Compose v2, Bash, curl and flock, enables Docker, and creates the project directory. The SSH user must have passwordless sudo for first-time setup. The bootstrap adds the user to the docker group; Docker group membership grants root-equivalent access. Match the image architecture to the EC2 processor.

3. On EC2 create $HOME/.launchdeck/7eceb670-c7af-45ec-baf3-6a672f18eca6/.env.production with runtime secrets before the first deploy (chmod 600). Deployment preserves this file. Your app must listen on 0.0.0.0:80 inside the container and return HTTP 2xx or 3xx from /.

4. Reserve host port 3000 for this project and configure Caddy or Nginx with HTTPS to proxy your domain to 127.0.0.1:3000. Add a domain in project settings to have Launchdeck configure Caddy automatically.

5. Provide the dedicated SSH private key and verified known_hosts entry. Verify the host fingerprint through a trusted channel; do not blindly trust ssh-keyscan output. Allow SSH from your Jenkins agent network. Jenkins must have a Docker-enabled build agent with the launchdeck-docker label; do not run builds on the Jenkins controller.

6. Launchdeck stores the SSH key and verified known_hosts entry as project-specific Jenkins credentials and configures a Pipeline job to read the Jenkinsfile from the selected GitHub branch. GitHub access is used only to browse the repository and create the reviewed setup pull request.

7. The setup PR removes this project's generated GitHub Actions deployment workflow so only Jenkins deploys it after the merge.

8. Review and merge the setup PR into main. The Jenkins job polls the selected production branch every two minutes.

9. Public Next.js build variables are baked into the image. Add needed build arguments to your Dockerfile and generated build step before merging. Do not include runtime secrets in the build context; maintain .dockerignore.

10. Jenkins builds the Docker image on its agent and transfers it directly to EC2 over the verified SSH connection, so no GitHub Actions runner or container registry is required. The EC2 host retains prior images for rollback. A single container replacement can briefly interrupt service.

11. Jenkins requires the Pipeline, Git, Folders, SSH Credentials, Credentials Binding and Plain Credentials plugins. Configure the controller URL/user/API token in Launchdeck's server environment and keep Jenkins on HTTPS.
