import { simplifyJS } from './simplify.js'

self.onmessage = function (e) {
  const { verts, tris, shrinkValue, verbose = true } = e.data
  const startTime = new Date()
  const mesh = simplifyJS(verts, tris, shrinkValue)
  if (verbose) {
    console.log(new Date() - startTime + 'ms elapsed')
  }
  postMessage({
    vertices: mesh.vertices,
    triangles: mesh.triangles
  })
}
