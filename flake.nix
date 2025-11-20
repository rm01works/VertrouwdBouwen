{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    steiger.url = "github:brainhivenl/steiger";
    systems.url = "github:nix-systems/default";
  };

  outputs = {
    nixpkgs,
    systems,
    steiger,
    ...
  }: {
    devShells = nixpkgs.lib.genAttrs (import systems) (
      system: let
        pkgs = import nixpkgs {inherit system;};
      in {
        default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_20
            typescript
            typescript-language-server
            steiger.packages.${system}.default
          ];
        };
      }
    );
  };
}
