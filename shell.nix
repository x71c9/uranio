{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
  packages = [
    pkgs.nodejs_24
    pkgs.typescript
    pkgs.typescript-language-server
  ];
  shellHook = ''
    export NODE_ENV=development
    echo "node: $(node -v) | npm: $(npm -v) | typescript: $(tsc -v)"
  '';
}

