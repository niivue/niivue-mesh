import { Niivue, NVMeshUtilities } from '@niivue/niivue'

function formatNumber(value) {
  if (Math.abs(value) >= 1) {
    // For numbers >= 1, use up to 1 decimal place
    return value.toFixed(1)
  } else {
    // For numbers < 1, use up to 3 significant digits
    return value.toPrecision(3)
  }
}

class NiiMathWrapper {
  constructor(workerScript) {
    this.worker = new Worker(workerScript)
  }
  static async load(workerScript = './niimathWorker.js') {
    return new NiiMathWrapper(workerScript)
  }
  niimath(niiBuffer, operationsText) {
    return new Promise((resolve, reject) => {
      const niiBlob = new Blob([niiBuffer], { type: 'application/octet-stream' })
      let inName = 'input.nii' // or derive from context
      const isMZFormat = niiBuffer.byteLength >= 2 && new Uint8Array(niiBuffer)[0] === 77 && new Uint8Array(niiBuffer)[1] === 90
      if (isMZFormat) {
        inName = 'input.mz3'
      }
      let outName = inName
      if ((isMZFormat) || (operationsText.includes("-mesh"))) {
        outName = 'output.mz3' // or derive from context
      }
      const args = operationsText.trim().split(/\s+/)
      args.unshift(inName)
      args.push(outName)
      const file = new File([niiBlob], inName)
      this.worker.onmessage = (e) => {
        if (e.data.blob instanceof Blob) {
          const reader = new FileReader()
          reader.onload = () => {
            resolve(reader.result) // return ArrayBuffer
          }
          reader.onerror = () => {
            reject(new Error('Failed to read the Blob as an ArrayBuffer'))
          }
          reader.readAsArrayBuffer(e.data.blob)
        } else {
          reject(new Error('Expected Blob from worker'))
        }
      }
      this.worker.onerror = (e) => {
        reject(new Error(e.message))
      }
      this.worker.postMessage({ blob: file, cmd: args, outName: outName })
    })
  }
  terminate() {
    this.worker.terminate()
  }
}

async function main() {
  const wrapper = await NiiMathWrapper.load()
  const loadingCircle = document.getElementById('loadingCircle')
  let startTime = null
  saveBtn.onclick = function () {
    if (nv1.meshes.length < 1) {
      window.alert("No mesh open for saving. Use 'Create Mesh'.")
    } else {
      saveDialog.show()
    }
  }
  aboutBtn.onclick = function () {
    window.open("https://github.com/niivue/niivue-mesh", "_blank")
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
    const pts = nv1.meshes[0].pts.slice()
    for (let i = 0; i < pts.length; i++)
      pts[i] *= 0.5
    NVMeshUtilities.saveMesh(pts, nv1.meshes[0].tris, `mesh.${format}`, true)
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
    let reduce = Math.min(Math.max(Number(shrinkSimplePct.value) / 100, 0.01), 1)
    if ((reduce <= 0.0) || (reduce >= 1))
      return
    const verts = nv1.meshes[0].pts.slice()
    const tris = nv1.meshes[0].tris.slice()
    const meshBuffer = NVMeshUtilities.createMZ3(verts, tris, false)
    loadingCircle.classList.remove('hidden')
    let ops = " -r " + reduce.toString()
    console.log('niimath operation', ops)
    const arrayBuffer = await wrapper.niimath(meshBuffer, ops )
    loadingCircle.classList.add('hidden')
    if (nv1.meshes.length > 0)
      nv1.removeMesh(nv1.meshes[0])
    await nv1.loadFromArrayBuffer(arrayBuffer, 'test.mz3')
  }
  applyBtn.onclick = async function () {
    startTime = Date.now()
    const niiBuffer = await nv1.saveImage({volumeByIndex: nv1.volumes.length - 1}).buffer
    loadingCircle.classList.remove('hidden')
    //mesh with specified isosurface
    const isoValue = Number(isoNumber.value)
    let ops = "-mesh -i " + isoValue
    //const largestCheckValue = largestCheck.checked
    if (!largestCheck.checked)
      ops += " -l 0"
    let reduce = Math.min(Math.max(Number(shrinkPct.value) / 100, 0.01), 1)
    ops += " -r " + reduce.toString()
    if (bubbleCheck.checked)
      ops += " -b 1" //fill bubbles
    let hollowSz = Number(hollowSelect.value )
    let closeSz = Number(closeMM.value)
    const pixDim = Math.min(Math.min(nv1.volumes[0].hdr.pixDims[1],nv1.volumes[0].hdr.pixDims[2]), nv1.volumes[0].hdr.pixDims[3])
    if ((pixDim < 0.2) && ((hollowSz !== 0) || (closeSz !== 0))) {
      hollowSz *= pixDim
      closeSz *= pixDim
      console.log('Very small pixels, scaling hollow and close values by ', pixDim)
    }
    if (hollowSz < 0)
      ops = " -hollow 0.5 "+hollowSz + ' '+ ops
    if ((isFinite(closeSz)) && (closeSz > 0)){
      ops = " -close " + isoValue + " "+closeSz + ' ' + 2 * closeSz + ' '+ ops
    }
    console.log('niimath operation', ops)
    const arrayBuffer = await wrapper.niimath(niiBuffer, ops )
    loadingCircle.classList.add('hidden')
    if (nv1.meshes.length > 0)
      nv1.removeMesh(nv1.meshes[0])
    await nv1.loadFromArrayBuffer(arrayBuffer, 'test.mz3')
    //nv1.reverseFaces(0)
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
    let str = `Mesh has ${nv1.meshes[0].pts.length / 3} vertices and ${nv1.meshes[0].tris.length / 3} triangles`
    if (startTime)
      str += ` ${Date.now() - startTime}ms`
    document.getElementById('location').innerHTML = str
    console.log(str)
    shaderSelect.onchange()
    startTime = null
  }
  const defaults = {
    onMeshLoaded: handleMeshLoaded,
    onLocationChange: handleLocationChange,
    backColor: [1, 1, 1, 1],
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
  nv1.setClipPlane([0.1, 0, 120])
  nv1.opts.dragMode = nv1.dragModes.pan
  nv1.setRenderAzimuthElevation(245, 15)
  nv1.opts.multiplanarForceRender = true
  nv1.opts.yoke3Dto2DZoom = true
  nv1.setInterpolation(true)
  await nv1.loadVolumes([{ url: './tinyT1.nii.gz' }])
  imageStatus()
  await applyBtn.onclick()
}

main()
