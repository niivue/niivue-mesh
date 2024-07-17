import { Niivue, NVMeshUtilities } from '@niivue/niivue';
import { createMZ3 } from './marching-cubes.js';

// Dynamically load the worker module
async function createWorker() {
  if (window.Worker) {
    const { default: MeshWorker } = await import('./meshWorker?worker');
    return new MeshWorker();
  }
  throw new Error('Web Workers are not supported in this environment.');
}

async function main() {
  const worker = await createWorker();
  const loadingCircle = document.getElementById('loadingCircle');

  worker.onmessage = async function (e) {
    const { vertices, triangles } = e.data;
    
    const verticesArray = new Float32Array(vertices);
    const trianglesArray = new Uint32Array(triangles);
    
    const meshBuffer = createMZ3(verticesArray, trianglesArray, false);
    await nv1.loadFromArrayBuffer(meshBuffer, 'test.mz3');
    loadingCircle.classList.add('hidden');
  };

  saveBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      window.alert("No mesh open for saving. Use 'Create Mesh'.");
    } else {
      saveDialog.show();
    }
  };

  applySaveBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      return;
    }
    let format = 'obj'
    let isCompressed = false;
    if (formatSelect.selectedIndex == 0) {
      format = 'mz3';
      isCompressed = true;
    }
    if (formatSelect.selectedIndex == 1) {
      format = 'obj';
    }
    if (formatSelect.selectedIndex == 2) {
      format = 'stl';
    }
    NVMeshUtilities.saveMesh(nv1.meshes[0].pts, nv1.meshes[0].tris, `simplified_mesh.${format}`, isCompressed);
  };

  remeshBtn.onclick = function () {
    remeshDialog.show();
  };

  applyBtn.onclick = async function () {
    if (nv1.meshes.length > 0) {
      nv1.removeMesh(nv1.meshes[0]);
    }
    const img = new Uint8ClampedArray(nv1.volumes[0].img);
    const dims = [
      nv1.volumes[0].hdr.dims[1],
      nv1.volumes[0].hdr.dims[2],
      nv1.volumes[0].hdr.dims[3]
    ];
    const isoValue = isoSlide.value;
    const largestCheckValue = largestCheck.checked;
    const bubbleCheckValue = bubbleCheck.checked;
    const affine = nv1.volumes[0].hdr.affine;
    const shrinkValue = shrinkSlide.value / shrinkSlide.max;

    loadingCircle.classList.remove('hidden');

    worker.postMessage({
      img: img.buffer,
      dims,
      isoValue,
      largestCheck: largestCheckValue,
      bubbleCheck: bubbleCheckValue,
      affine,
      shrinkValue
    }, [img.buffer]);
  };

  aboutBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      window.alert("No mesh open for saving. Use 'Create Mesh'.");
    } else {
      window.alert(
        `Mesh has ${nv1.meshes[0].pts.length / 3} vertices and ${nv1.meshes[0].tris.length / 3} triangles`
      );
    }
  };

  visibleCheck.onchange = function () {
    nv1.setMeshProperty(nv1.meshes[0].id, 'visible', this.checked);
  };

  function handleLocationChange(data) {
    document.getElementById('location').innerHTML = '&nbsp;&nbsp;' + data.string;
  }

  const defaults = {
    onLocationChange: handleLocationChange,
    show3Dcrosshair: true
  };
  const nv1 = new Niivue(defaults);
  nv1.attachToCanvas(gl1);
  nv1.setClipPlane([0.2, 0, 120]);
  nv1.opts.dragMode = nv1.dragModes.pan;
  nv1.setRenderAzimuthElevation(245, 15);
  nv1.opts.multiplanarForceRender = true;
  nv1.opts.yoke3Dto2DZoom = true;
  nv1.opts.crosshairGap = 11;
  nv1.setInterpolation(true);
  await nv1.loadVolumes([{ url: './bet.nii.gz' }]);
  applyBtn.onclick();
}

main();
