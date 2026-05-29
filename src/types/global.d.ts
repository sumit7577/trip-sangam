// Side-effect CSS imports from node_modules (e.g. `import
// "maplibre-gl/dist/maplibre-gl.css"`) need a wildcard module
// declaration. Next.js handles the actual bundling at build time;
// this just keeps TypeScript happy under `moduleResolution: "bundler"`.
declare module "*.css";
