#!/usr/bin/env bash
# LittleWiki — build de production, identique en local et en CI.
#
# Usage : scripts/build.sh [options]
#   -u, --base-url URL   URL publique du site (défaut : $SITE_URL, sinon baseURL de hugo.toml)
#   -d, --dest DIR       dossier de sortie (défaut : public)
#   -i, --install        télécharge Hugo Extended $HUGO_VERSION si la version installée diffère
#                        (automatique quand CI=true)
#   -l, --lint           vérifie aussi le Markdown (markdownlint-cli2) et les liens (lychee)
#   -h, --help           affiche cette aide
#
# Variables : HUGO_VERSION (version figée), SITE_URL, HUGO_CACHE_DIR, CI.

set -euo pipefail

HUGO_VERSION="${HUGO_VERSION:-0.167.0}"
HUGO_MIN_VERSION="0.146.0"   # cf. module.hugoVersion dans hugo.toml

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BASE_URL="${SITE_URL:-}"
DEST="public"
INSTALL="false"
LINT="false"
[[ "${CI:-false}" == "true" ]] && INSTALL="true"

# Couleurs uniquement en terminal ou en CI (les logs de CI interprètent l'ANSI)
if [[ -t 2 || "${CI:-false}" == "true" ]]; then
  C_INFO=$'\033[36m' C_WARN=$'\033[33m' C_ERR=$'\033[31m' C_OFF=$'\033[0m'
else
  C_INFO="" C_WARN="" C_ERR="" C_OFF=""
fi
log()  { printf '%s==>%s %s\n' "$C_INFO" "$C_OFF" "$*" >&2; }
warn() { printf '%sAttention :%s %s\n' "$C_WARN" "$C_OFF" "$*" >&2; }
die()  { printf '%sErreur :%s %s\n' "$C_ERR" "$C_OFF" "$*" >&2; exit 1; }
usage() { sed -n '2,13p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    -u|--base-url) BASE_URL="${2:?URL manquante}"; shift 2 ;;
    -d|--dest)     DEST="${2:?dossier manquant}"; shift 2 ;;
    -i|--install)  INSTALL="true"; shift ;;
    -l|--lint)     LINT="true"; shift ;;
    -h|--help)     usage 0 ;;
    *)             warn "option inconnue : $1"; usage 1 ;;
  esac
done

cd "$ROOT"

# ---------------------------------------------------------------- Hugo

version_of() { "$1" version 2>/dev/null | sed -nE 's/^hugo v([0-9]+\.[0-9]+\.[0-9]+).*/\1/p'; }
is_extended() { "$1" version 2>/dev/null | grep -q '+extended'; }
version_ge() { [[ "$(printf '%s\n%s\n' "$2" "$1" | sort -V | head -n1)" == "$2" ]]; }

install_hugo() {
  local os arch archive url dir
  case "$(uname -s)" in
    Linux)  os="linux" ;;
    Darwin) os="darwin" ;;
    *)      die "système non pris en charge : $(uname -s)" ;;
  esac
  case "$(uname -m)" in
    x86_64|amd64)  arch="amd64" ;;
    aarch64|arm64) arch="arm64" ;;
    *)             die "architecture non prise en charge : $(uname -m)" ;;
  esac
  [[ "$os" == "darwin" ]] && arch="universal"

  dir="${HUGO_CACHE_DIR:-$ROOT/.cache/hugo/$HUGO_VERSION}"
  if [[ -x "$dir/hugo" ]]; then
    HUGO="$dir/hugo"
    return
  fi

  archive="hugo_extended_${HUGO_VERSION}_${os}-${arch}.tar.gz"
  url="https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}"
  log "Téléchargement de Hugo Extended ${HUGO_VERSION} (${os}-${arch})"
  mkdir -p "$dir"
  curl -fsSL --retry 3 -o "$dir/$archive" "$url/$archive"
  curl -fsSL --retry 3 -o "$dir/checksums.txt" "$url/hugo_${HUGO_VERSION}_checksums.txt"

  log "Vérification de la somme SHA-256"
  local expected actual
  expected="$(awk -v f="$archive" '$2 == f { print $1 }' "$dir/checksums.txt")"
  [[ -n "$expected" ]] || die "somme de contrôle introuvable pour $archive"
  if command -v sha256sum >/dev/null; then
    actual="$(sha256sum "$dir/$archive" | awk '{ print $1 }')"
  else
    actual="$(shasum -a 256 "$dir/$archive" | awk '{ print $1 }')"
  fi
  [[ "$expected" == "$actual" ]] || { rm -f "$dir/$archive"; die "somme SHA-256 invalide pour $archive"; }

  tar -xzf "$dir/$archive" -C "$dir" hugo
  rm -f "$dir/$archive" "$dir/checksums.txt"
  HUGO="$dir/hugo"
}

HUGO="$(command -v hugo || true)"
if [[ -n "$HUGO" && "$(version_of "$HUGO")" == "$HUGO_VERSION" ]] && is_extended "$HUGO"; then
  :  # version figée déjà installée
elif [[ "$INSTALL" == "true" ]]; then
  install_hugo
elif [[ -n "$HUGO" ]]; then
  current="$(version_of "$HUGO")"
  is_extended "$HUGO" || die "Hugo $current n'est pas Extended (relancer avec --install)"
  version_ge "$current" "$HUGO_MIN_VERSION" || die "Hugo $current < $HUGO_MIN_VERSION (relancer avec --install)"
  warn "Hugo $current installé, version figée $HUGO_VERSION (--install pour l'utiliser)"
else
  die "Hugo introuvable (relancer avec --install)"
fi
log "$("$HUGO" version)"

# ---------------------------------------------------------------- Lint (optionnel)

if [[ "$LINT" == "true" ]]; then
  command -v markdownlint-cli2 >/dev/null || die "--lint : markdownlint-cli2 introuvable (npm i -g markdownlint-cli2)"
  log "Vérification du Markdown"
  markdownlint-cli2 "content/**/*.md"
fi

# ---------------------------------------------------------------- Build

args=(--gc --minify --panicOnWarning --cleanDestinationDir --destination "$DEST")
[[ -n "$BASE_URL" ]] && args+=(--baseURL "$BASE_URL")

log "Build : hugo ${args[*]}"
"$HUGO" "${args[@]}"

# ---------------------------------------------------------------- Contrôles du site généré

log "Contrôles du site généré"
[[ -s "$DEST/index.html" ]] || die "$DEST/index.html absent ou vide"
[[ -s "$DEST/index.json" ]] || die "index de recherche $DEST/index.json absent"

if command -v jq >/dev/null; then
  jq -e 'type == "array" and length > 0' "$DEST/index.json" >/dev/null || die "index de recherche invalide ou vide"
elif command -v python3 >/dev/null; then
  python3 -c 'import json,sys; d=json.load(open(sys.argv[1])); sys.exit(0 if isinstance(d,list) and d else 1)' "$DEST/index.json" \
    || die "index de recherche invalide ou vide"
fi

# Aucun fichier privé ne doit se retrouver dans le site publié
leaks="$(find "$DEST" \( -iname 'CLAUDE*.md' -o -name '.env*' -o -name '.claude' \) -print)"
[[ -z "$leaks" ]] || die "fichiers privés dans $DEST : $leaks"

if [[ "$LINT" == "true" ]]; then
  command -v lychee >/dev/null || die "--lint : lychee introuvable (https://lychee.cli.rs)"
  log "Vérification des liens"
  lychee --no-progress --offline --root-dir "$ROOT/$DEST" "$DEST"
fi

pages="$(find "$DEST" -name '*.html' | wc -l | tr -d ' ')"
size="$(du -sh "$DEST" | cut -f1)"
log "Terminé : $pages pages HTML, $size dans $DEST/"
