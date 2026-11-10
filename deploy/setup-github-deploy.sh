#!/usr/bin/env bash
# One-time setup for the GitHub Actions deploy (.github/workflows/deploy.yml). Run from your Mac:
#   bash deploy/setup-github-deploy.sh
#
# 1. Creates a fresh SSH key just for GitHub Actions
# 2. Authorizes it on the VPS, pinned to deploy/deploy.sh (command="..."), so even if the key leaks
#    it can only redeploy the site, not open a shell
# 3. Stores the key, the server address and the server's host fingerprint as GitHub repository secrets
# 4. Deletes the private key from this Mac (GitHub keeps the only copy)
set -euo pipefail

VPS=72.60.205.189
ADMIN_KEY=${ADMIN_KEY:-$HOME/.ssh/hostinger_vps}
COMMENT=dhotels-github-actions
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

ssh-keygen -q -t ed25519 -N "" -C "$COMMENT" -f "$work/key"
pub=$(cat "$work/key.pub")

# Replace any earlier DHotels deploy key, leave every other key alone
ssh -i "$ADMIN_KEY" "root@$VPS" "
  touch ~/.ssh/authorized_keys
  grep -v ' $COMMENT\$' ~/.ssh/authorized_keys > ~/.ssh/authorized_keys.new || true
  echo 'command=\"/root/DHotels/deploy/deploy.sh\",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty $pub' >> ~/.ssh/authorized_keys.new
  chmod 600 ~/.ssh/authorized_keys.new && mv ~/.ssh/authorized_keys.new ~/.ssh/authorized_keys
"

ssh-keyscan -t ed25519 "$VPS" 2>/dev/null > "$work/known_hosts"
[ -s "$work/known_hosts" ] || { echo "Could not read the server's host key"; exit 1; }

gh secret set VPS_HOST --body "$VPS"
gh secret set VPS_SSH_KEY < "$work/key"
gh secret set VPS_KNOWN_HOSTS < "$work/known_hosts"

echo "Done. Every push to main now tests and deploys. To deploy right away: gh workflow run deploy.yml"
