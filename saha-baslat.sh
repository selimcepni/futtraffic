#!/usr/bin/env bash
# Run in Linux or WSL2 from a checkout of this fork.
set -eu
cd "$(dirname "$0")"
venv="${XDG_DATA_HOME:-$HOME/.local/share}/futtraffic-studio/venv"
if [ ! -x "$venv/bin/python" ]; then
  python3 -m venv "$venv"
fi
"$venv/bin/python" -m pip install -r app/server/requirements.txt rfdetr
echo 'Maç stüdyosu: http://127.0.0.1:8000/studyo/'
exec "$venv/bin/python" app/server/app.py
