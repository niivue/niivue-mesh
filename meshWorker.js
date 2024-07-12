import { voxels2mesh, createMZ3, downloadMesh } from './marching-cubes.js';
import { simplifyJS } from './simplify.js';

self.onmessage = function (e) {
  const { img, dims, isoValue, largestCheck, bubbleCheck, affine, shrinkValue } = e.data;
  const imgArray = new Uint8ClampedArray(img);
  
  let mesh = voxels2mesh(imgArray, dims, isoValue, largestCheck, bubbleCheck, affine);
  mesh = simplifyJS(mesh.vertices, mesh.triangles, shrinkValue);

  postMessage({
    vertices: mesh.vertices,
    triangles: mesh.triangles
  });
};
