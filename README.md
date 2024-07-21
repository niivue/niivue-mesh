### NiiVue voxels to mesh

A basic example of converting a voxel-based image to a simplified mesh.

### Usage

 - Open the [live demo](https://niivue.github.io/niivue-mesh/).


### For Developers

You can serve a hot-reloadable web page that allows you to interactively modify the source code.

```bash
git clone https://github.com/niivue/niivue-mesh
cd niivue-mesh
npm install
npm run dev
```

### Links

 - [Will Usher](https://github.com/Twinklebear/webgl-marching-cubes) ported [Marching Cubes](https://paulbourke.net/geometry/polygonise/) to JavaScript.
 - This project includes a pure JavaScript port of Sven Forstmann's [Fast Quadric Mesh Simplification](https://github.com/sp4cerat/Fast-Quadric-Mesh-Simplification)
 - [Tim Knip](https://github.com/timknip/mesh-decimate/tree/master) provides a ThreeJS project that provides both WASM and native JavaScript mesh decimation. Try the [live demo](https://neurolabusc.github.io/simplifyjs/).