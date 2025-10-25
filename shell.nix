{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  packages = [
    pkgs.nodejs_24
    pkgs.nodePackages_latest.yarn
  ];
  shellHook = ''
    export NODE_ENV=development
    echo "node: $(node -v) | npm: $(npm -v) | yarn: $(yarn -v 2>/dev/null || true)"
  '';
}

