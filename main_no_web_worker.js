import { Niivue } from '@niivue/niivue'
import { voxels2mesh, createMZ3, downloadMesh } from './marching-cubes.js'
import { simplifyJS } from './simplify.js'

async function main() {
  saveBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      window.alert("No mesh open for saving. Use 'Create Mesh'.")
    } else {
      // downloadArrayBuffer(meshBuffer, 'simplified_mesh.mz3')
      saveDialog.show()
    }
  }
  applySaveBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      return
    }
    if (formatSelect.selectedIndex == 0) {
      downloadMesh(nv1.meshes[0].pts, nv1.meshes[0].tris, 'simplified_mesh.mz3', true)
    }
    if (formatSelect.selectedIndex == 1) {
      downloadMesh(nv1.meshes[0].pts, nv1.meshes[0].tris, 'simplified_mesh.obj')
    }
    if (formatSelect.selectedIndex == 2) {
      downloadMesh(nv1.meshes[0].pts, nv1.meshes[0].tris, 'simplified_mesh.stl')
    }
  }
  remeshBtn.onclick = function () {
    remeshDialog.show()
  }
  applyBtn.onclick = async function () {
    if (nv1.meshes.length > 0) {
      nv1.removeMesh(nv1.meshes[0])
    }
    console.log(nv1.volumes[0])
    const img = new Uint8ClampedArray(nv1.volumes[0].img)
    const dims = [nv1.volumes[0].hdr.dims[1], nv1.volumes[0].hdr.dims[2], nv1.volumes[0].hdr.dims[3]]
    let mesh = voxels2mesh(
      img,
      dims,
      isoSlide.value,
      largestCheck.checked,
      bubbleCheck.checked,
      nv1.volumes[0].hdr.affine
    )
    mesh = simplifyJS(mesh.vertices, mesh.triangles, shrinkSlide.value / shrinkSlide.max)
    // let meshBuffer = createMZ3(mesh.vertices, mesh.triangles, false)
    const meshBuffer = downloadMesh(mesh.vertices, mesh.triangles, '.mz3')
    await nv1.loadFromArrayBuffer(meshBuffer, 'test.mz3')
    // nv1.setMeshShader(nv1.meshes[0].id, "Edge")
  }
  aboutBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      window.alert("No mesh open for saving. Use 'Create Mesh'.")
    } else {
      window.alert(`Mesh has ${nv1.meshes[0].pts.length / 3} vertices and ${nv1.meshes[0].tris.length / 3} triangles`)
    }
  }
  visibleCheck.onchange = function () {
    nv1.setMeshProperty(nv1.meshes[0].id, 'visible', this.checked)
  }
  function handleLocationChange(data) {
    document.getElementById('location').innerHTML = '&nbsp;&nbsp;' + data.string
  }
  const defaults = {
    onLocationChange: handleLocationChange,
    show3Dcrosshair: true
  }
  const nv1 = new Niivue(defaults)
  nv1.attachToCanvas(gl1)
  nv1.setClipPlane([0.2, 0, 120])
  nv1.opts.dragMode = nv1.dragModes.pan
  nv1.setRenderAzimuthElevation(245, 15)
  nv1.opts.multiplanarForceRender = true
  nv1.opts.yoke3Dto2DZoom = true
  nv1.opts.crosshairGap = 11
  nv1.setInterpolation(true)
  await nv1.loadVolumes([{ url: './bet.nii.gz' }])
  applyBtn.onclick()
}

main()
