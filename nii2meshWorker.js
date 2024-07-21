self.addEventListener('message', function(e) {
    const file = e.data.blob
    const percentage = e.data.percentage  || 0.5
    const simplify_name = e.data.simplify_name
    const isoValue = e.data.isoValue  || NaN
    onlyLargest = e.data.onlyLargest || false
    fillBubbles = e.data.fillBubbles || false
    postSmooth = e.data.postSmooth || 0
    verbose = e.data.berbose || true
    prepare_and_simplify(file, percentage, simplify_name, isoValue, onlyLargest, fillBubbles, postSmooth, verbose)
}, false)

var Module = {
    'print': function(text) {
        console.log(text)
        self.postMessage({"log":text})
    }
}

self.importScripts("nii2mesh.js?rnd="+Math.random())

let last_file_name = undefined

function prepare_and_simplify(file, percentage, simplify_name, isoValue = 1, onlyLargest = false, fillBubbles = false , postSmooth = 0, verbose = true) {
    var filename = file.name
    // if simplify on the same file, don't even read the file
    if (filename === last_file_name) {
        console.log("skipping load and create data file")
        simplify(filename, percentage, simplify_name, isoValue, onlyLargest, fillBubbles, postSmooth, verbose)
        return
    } else { // remove last file in memory
        if (last_file_name !== undefined)
            Module.FS_unlink(last_file_name)
    }
    last_file_name = filename
    var fr = new FileReader()
    fr.readAsArrayBuffer(file)
    fr. onloadend = function (e) {
        var data = new Uint8Array(fr.result)
        Module.FS_createDataFile(".", filename, data, true, true)
        simplify(filename, percentage, simplify_name, isoValue, onlyLargest, fillBubbles, postSmooth, verbose)
    }
}

function simplify(filename, percentage, simplify_name, isoValue = 1, onlyLargest = false, fillBubbles = false , postSmooth = 0, verbose = true) {
    Module.ccall("simplify", // c function name
        undefined, // return
        ["string", "number", "string", "number","boolean","boolean","number","boolean"], // param
        [filename, percentage, simplify_name, isoValue, onlyLargest, fillBubbles,postSmooth, verbose]
    )
    let out_bin = Module.FS_readFile(simplify_name)
    // sla should work for binary mz3
    let file = new Blob([out_bin], {type: 'application/sla'})
    self.postMessage({"blob":file})
}
