import { Niivue, NVMeshUtilities } from '@niivue/niivue'
// Dynamically load the worker modules
async function createVoxelWorker() {
  if (window.Worker) {
    const { default: VoxelWorker } = await import('./voxelWorker?worker')
    return new VoxelWorker()
  }
  throw new Error('Web Workers are not supported in this environment.')
}

async function createMeshWorker() {
  if (window.Worker) {
    const { default: MeshWorker } = await import('./meshWorker?worker')
    return new MeshWorker()
  }
  throw new Error('Web Workers are not supported in this environment.')
}

function formatNumber(value) {
  if (Math.abs(value) >= 1) {
    // For numbers >= 1, use up to 1 decimal place
    return value.toFixed(1)
  } else {
    // For numbers < 1, use up to 3 significant digits
    return value.toPrecision(3)
  }
}
async function main() {
  const MeshWorker = await createMeshWorker()
  const VoxelWorker = await createVoxelWorker()
  const Nii2meshWorker = new Worker('./nii2meshWorker.js?rnd=' + Math.random())
  const loadingCircle = document.getElementById('loadingCircle')
  let startTime = Date.now()
  function meshStatus(isTimed = true) {
    let str = `Mesh has ${nv1.meshes[0].pts.length / 3} vertices and ${nv1.meshes[0].tris.length / 3} triangles`
    if (isTimed)
      str += ` ${Date.now() - startTime}ms`
    document.getElementById('location').innerHTML = str
    console.log(str)
    shaderSelect.onchange()
  }
  async function loadMz3(meshBuffer) {
    if (nv1.meshes.length > 0) {
      nv1.removeMesh(nv1.meshes[0])
    }
    await nv1.loadFromArrayBuffer(meshBuffer, 'test.mz3')
    loadingCircle.classList.add('hidden')
    meshStatus()
  }
  async function loadMesh(vertices, triangles) {
    const verticesArray = new Float32Array(vertices)
    const trianglesArray = new Uint32Array(triangles)
    const meshBuffer = NVMeshUtilities.createMZ3(verticesArray, trianglesArray, false)
    await loadMz3(meshBuffer)
  }
  MeshWorker.onmessage = async function (e) {
    const { vertices, triangles } = e.data
    await loadMesh(vertices, triangles)
  }
  VoxelWorker.onmessage = async function (e) {
    const { vertices, triangles } = e.data
    await loadMesh(vertices, triangles)
  }
  Nii2meshWorker.onmessage = async function (e) {
    if (e.data.blob instanceof Blob) {
        var reader = new FileReader()
        reader.onload = () => {
            loadMz3(reader.result)
        }
        reader.readAsArrayBuffer(e.data.blob)
    }
  }
  saveBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      window.alert("No mesh open for saving. Use 'Create Mesh'.")
    } else {
      saveDialog.show()
    }
  }
  volumeSelect.onchange = function () {
    const selectedOption = volumeSelect.options[volumeSelect.selectedIndex]
    const txt = selectedOption.text
    let fnm = './' + txt
    if (volumeSelect.selectedIndex > 4) {
      fnm = 'https://niivue.github.io/niivue/images/' + txt
    } else if (volumeSelect.selectedIndex > 1) {
      fnm = 'https://niivue.github.io/niivue-demo-images/' + txt
    }
    if (nv1.meshes.length > 0) {
      nv1.removeMesh(nv1.meshes[0])
    }
    if (nv1.volumes.length > 0) {
      nv1.removeVolumeByIndex(0)
    }
    if (volumeSelect.selectedIndex > 5) {
      nv1.loadMeshes([{ url: fnm }])
    } else {
      if (!fnm.endsWith('.mgz')) {
        fnm += '.nii.gz'
      }
      nv1.loadVolumes([{ url: fnm }])
    }
  }
  applySaveBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      return
    }
    let format = 'obj'
    if (formatSelect.selectedIndex === 0) {
      format = 'mz3'
    }
    if (formatSelect.selectedIndex === 2) {
      format = 'stl'
    }
    NVMeshUtilities.saveMesh(nv1.meshes[0].pts, nv1.meshes[0].tris, `mesh.${format}`, true)
  }
  remeshBtn.onclick = function () {
    if (nv1.volumes.length < 1) {
      window.alert('No voxel-based image open for meshing. Drag and drop an image.')
    } else {
      remeshDialog.show()
    }
  }
  simplifyBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      window.alert('No mesh open to simplify. Drag and drop a mesh or create a mesh from a voxel based image.')
    } else {
      simplifyDialog.show()
    }
  }
  applySimpleBtn.onclick = async function () {
    if (nv1.meshes.length < 1) {
      console.log('No mesh open to simplify.')
      return
    }
    startTime = Date.now()
    const shrinkValue = Math.min(Math.max(Number(shrinkSimplePct.value) / 100, 0.01), 1)
    if (shrinkValue >= 1)
      return
    const verts = nv1.meshes[0].pts.slice()
    const tris = nv1.meshes[0].tris.slice()
    loadingCircle.classList.remove('hidden')
    if (simpleWasmCheck.checked) {
        const meshBuffer = NVMeshUtilities.createMZ3(verts, tris, false)
        let mz3 = new Blob([meshBuffer], {
            type: 'application/octet-stream'
        })
        let inName = `em${Math.round(Math.random() * 0xffffff)}.mz3`
        let fileMZ3 = new File([mz3], inName)
        let outName = `em${Math.round(Math.random() * 0xffffff)}.mz3`
          Nii2meshWorker.postMessage({
              blob: fileMZ3,
              percentage: shrinkValue,
              simplify_name: outName,
          })
    } else {
    MeshWorker.postMessage({
      verts,
      tris,
      shrinkValue
    })
    }
  }
  applyBtn.onclick = async function () {
    if (nv1.volumes.length < 1) {
      console.log('No volume open to meshify.')
      return
    }
    startTime = Date.now()
    const isoValue = Number(isoNumber.value)
    const largestCheckValue = largestCheck.checked
    const bubbleCheckValue = bubbleCheck.checked
    const shrinkValue = Math.min(Math.max(Number(shrinkPct.value) / 100, 0.01), 1)
    const smoothValue = smoothSlide.value
    loadingCircle.classList.remove('hidden')
    if (wasmCheck.checked) {
      //const meshBuffer = NVMeshUtilities.createMZ3(verts, tris, false)
      const niiBuffer = await nv1.saveImage().buffer
      console.log('WASM nii2mesh', niiBuffer)
      let nii = new Blob([niiBuffer], {
        type: 'application/octet-stream'
      })
      let inName = `em${Math.round(Math.random() * 0xffffff)}.nii`
      let fileNii = new File([nii], inName)
      let outName = `em${Math.round(Math.random() * 0xffffff)}.mz3`
      Nii2meshWorker.postMessage({
          blob: fileNii,
          percentage: shrinkValue,
          simplify_name: outName,
          isoValue: isoValue,
          onlyLargest: largestCheckValue,
          fillBubbles: bubbleCheckValue,
          postSmooth: smoothValue
      })
      return
    }
    let img = new Float32Array(nv1.volumes[0].img)
    const scl_slope = nv1.volumes[0].hdr.scl_slope
    const scl_inter = nv1.volumes[0].hdr.scl_inter
    if (scl_slope !== 1.0 || scl_inter !== 0) {
      img = new Float32Array(img)
      for (let i = 0; i < img.length; i++) {
        img[i] = img[i] * scl_slope + scl_inter
      }
    }
    const dims = [nv1.volumes[0].hdr.dims[1], nv1.volumes[0].hdr.dims[2], nv1.volumes[0].hdr.dims[3]]
    const affine = nv1.volumes[0].hdr.affine
    VoxelWorker.postMessage(
      {
        img,
        dims,
        isoValue,
        largestCheck: largestCheckValue,
        bubbleCheck: bubbleCheckValue,
        smoothValue,
        affine,
        shrinkValue
      },
      [img.buffer]
    )
  }
  visibleCheck.onchange = function () {
    nv1.setMeshProperty(nv1.meshes[0].id, 'visible', this.checked)
  }
  function handleLocationChange(data) {
    document.getElementById('location').innerHTML = '&nbsp;&nbsp;' + data.string
  }
  shaderSelect.onchange = function () {
    nv1.setMeshShader(nv1.meshes[0].id, this.value)
  }
  function handleMeshLoaded() {
    meshStatus(false)
  }
  const defaults = {
    onMeshLoaded: handleMeshLoaded,
    onLocationChange: handleLocationChange,
    backColor: [0.2, 0.2, 0.3, 1],
    show3Dcrosshair: true
  }
  const nv1 = new Niivue(defaults)
  nv1.attachToCanvas(gl1)
  nv1.isAlphaClipDark = true
  function imageStatus() {
    const otsu = nv1.findOtsu(3)
    isoLabel.textContent =
      'Isosurface Threshold (' +
      formatNumber(nv1.volumes[0].cal_min) +
      '...' +
      formatNumber(nv1.volumes[0].cal_max) +
      ')'
    isoNumber.value = formatNumber(otsu[1])
    const str = `Image has ${nv1.volumes[0].dims[1]}×${nv1.volumes[0].dims[2]}×${nv1.volumes[0].dims[3]} voxels`
    document.getElementById('location').innerHTML = str
    nv1.setSliceType(nv1.sliceTypeMultiplanar)
  }
  nv1.onImageLoaded = () => {
    imageStatus()
  }
  nv1.setClipPlane([0.2, 0, 120])
  nv1.opts.dragMode = nv1.dragModes.pan
  nv1.setRenderAzimuthElevation(245, 15)
  nv1.opts.multiplanarForceRender = true
  nv1.opts.yoke3Dto2DZoom = true
  nv1.setInterpolation(true)
  //await nv1.loadVolumes([{ url: './bet.nii.gz' }])
  await nv1.loadVolumes([{ url: './tinyT1.nii.gz' }])
  imageStatus()
  applyBtn.onclick()
}

main()
