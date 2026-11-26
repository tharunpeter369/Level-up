# Sourced by lefthook before every hook command (see `rc:` in lefthook.yml).
# Git runs hooks in a minimal shell (also from VS Code's commit button), where nvm isn't
# loaded and the default Node may be too old for this project. Switch to the .nvmrc version.
# Does nothing where nvm isn't installed (e.g. CI, or machines using another version manager).
if [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
  . "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  nvm use --silent >/dev/null 2>&1 || true
fi
