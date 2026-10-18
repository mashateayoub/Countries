#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
cd "$HOME/.launchdeck/7eceb670-c7af-45ec-baf3-6a672f18eca6"
mkdir -p .deployment
exec 9>.deployment/lock
flock -w 300 9
sha=$1
staging=$2
[[ $staging =~ ^[0-9]+-[0-9]+$ ]] || exit 2
candidate="$HOME/.launchdeck/7eceb670-c7af-45ec-baf3-6a672f18eca6/.incoming-$staging/compose.yaml"
[[ $sha =~ ^[a-f0-9]{40}$ ]] || exit 2
export IMAGE_REF='launchdeck-7eceb670-c7af-45ec-baf3-6a672f18eca6':"$sha"
touch .env.production
cleanup() { rm -rf "$HOME/.launchdeck/7eceb670-c7af-45ec-baf3-6a672f18eca6/.incoming-$staging"; }
trap cleanup EXIT
compose() { docker compose --file "$candidate" --project-directory "$HOME/.launchdeck/7eceb670-c7af-45ec-baf3-6a672f18eca6" "$@"; }
health_url='http://127.0.0.1:3000/'
previous_health=$health_url
if [[ -f .deployment/health ]]; then previous_health=$(cat .deployment/health); fi
[[ $previous_health == http://127.0.0.1:* ]] || exit 2
previous=''
if [[ -f .deployment/current ]]; then
  previous=$(cat .deployment/current)
  [[ $previous =~ ^launchdeck-7eceb670-c7af-45ec-baf3-6a672f18eca6:[a-f0-9]{40}$ ]] || exit 2
fi
compose config --quiet
docker image inspect "$IMAGE_REF" >/dev/null
healthy() {
  for attempt in {1..30}; do
    if curl --fail --silent --show-error --max-time 5 "$1" >/dev/null; then return 0; fi
    sleep 2
  done
  return 1
}
rollback() {
  trap - ERR INT TERM
  if [[ -n $previous ]]; then
    export IMAGE_REF=$previous
    candidate="$HOME/.launchdeck/7eceb670-c7af-45ec-baf3-6a672f18eca6/compose.yaml"
    if compose up -d --no-deps --pull never app && healthy "$previous_health"; then
      echo 'Previous image restored.' >&2
    else
      echo 'ROLLBACK FAILED: inspect the EC2 container.' >&2
    fi
  else
    compose stop app || true
    echo 'No previous successful image exists.' >&2
  fi
  exit 1
}
trap rollback ERR INT TERM
compose up -d --no-deps --pull never app
healthy "$health_url"

if [[ -n $previous && $previous != "$IMAGE_REF" ]]; then
  printf '%s\n' "$previous" >.deployment/previous.tmp
  mv .deployment/previous.tmp .deployment/previous
fi
printf '%s\n' "$health_url" >.deployment/health.tmp
mv .deployment/health.tmp .deployment/health
cp "$candidate" compose.yaml.tmp
mv compose.yaml.tmp compose.yaml
printf '%s\n' "$IMAGE_REF" >.deployment/current.tmp
mv .deployment/current.tmp .deployment/current
trap - ERR INT TERM
echo "Deployed $IMAGE_REF"
