import { voxels2mesh } from './marching-cubes.js';
import { simplifyJS } from './simplify.js';

self.onmessage = function (e) {
  const { img, dims, isoValue, largestCheck, bubbleCheck, smoothValue, affine, shrinkValue, verbose = true} = e.data;
  const imgArray = new Float32Array(img);
  let startTime = new Date();
  let mesh = voxels2mesh(imgArray, dims, isoValue, largestCheck, bubbleCheck, smoothValue, affine, verbose);
  if (shrinkValue < 1.0) {
    mesh = simplifyJS(mesh.vertices, mesh.triangles, shrinkValue);
  }
  if (verbose) {
    console.log( new Date() - startTime + "ms elapsed");
  }
  postMessage({
    vertices: mesh.vertices,
    triangles: mesh.triangles
  });
};
