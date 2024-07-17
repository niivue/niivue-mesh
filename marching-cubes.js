import { BWLabeler } from './bwlabels.js'

// https://raw.githubusercontent.com/Twinklebear/webgl-marching-cubes/master/js/marching-cubes.js
// The MIT License (MIT)
// Copyright (c) 2018 Will Usher

// Edge and triangle tables for the cases of marching cubes
// From http://paulbourke.net/geometry/polygonise/ and
// https://graphics.stanford.edu/~mdfisher/MarchingCubes.html
const triTable = [
  [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 8, 3, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 9, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [8, 1, 9, 8, 3, 1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 10, 1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 8, 3, 1, 2, 10, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 2, 10, 9, 0, 2, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 2, 10, 3, 10, 8, 8, 10, 9, -1, 0, 0, 0, 0, 0, 0],
  [2, 3, 11, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [11, 0, 8, 11, 2, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 9, 0, 2, 3, 11, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 1, 9, 2, 9, 11, 11, 9, 8, -1, 0, 0, 0, 0, 0, 0],
  [3, 10, 1, 3, 11, 10, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 8, 1, 8, 10, 10, 8, 11, -1, 0, 0, 0, 0, 0, 0],
  [0, 3, 11, 0, 11, 9, 9, 11, 10, -1, 0, 0, 0, 0, 0, 0],
  [11, 10, 9, 11, 9, 8, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 7, 8, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 4, 7, 3, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 7, 8, 9, 0, 1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 4, 7, 9, 7, 1, 1, 7, 3, -1, 0, 0, 0, 0, 0, 0],
  [4, 7, 8, 1, 2, 10, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 3, 0, 4, 7, 3, 2, 10, 1, -1, 0, 0, 0, 0, 0, 0],
  [2, 9, 0, 2, 10, 9, 4, 7, 8, -1, 0, 0, 0, 0, 0, 0],
  [3, 2, 7, 7, 9, 4, 7, 2, 9, 9, 2, 10, -1, 0, 0, 0],
  [8, 4, 7, 3, 11, 2, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [7, 11, 2, 7, 2, 4, 4, 2, 0, -1, 0, 0, 0, 0, 0, 0],
  [2, 3, 11, 1, 9, 0, 8, 4, 7, -1, 0, 0, 0, 0, 0, 0],
  [2, 1, 9, 2, 9, 4, 2, 4, 11, 11, 4, 7, -1, 0, 0, 0],
  [10, 3, 11, 10, 1, 3, 8, 4, 7, -1, 0, 0, 0, 0, 0, 0],
  [4, 7, 0, 0, 10, 1, 7, 10, 0, 7, 11, 10, -1, 0, 0, 0],
  [8, 4, 7, 0, 3, 11, 0, 11, 9, 9, 11, 10, -1, 0, 0, 0],
  [7, 9, 4, 7, 11, 9, 9, 11, 10, -1, 0, 0, 0, 0, 0, 0],
  [4, 9, 5, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [8, 3, 0, 4, 9, 5, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 5, 4, 0, 1, 5, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 8, 3, 4, 3, 5, 5, 3, 1, -1, 0, 0, 0, 0, 0, 0],
  [1, 2, 10, 9, 5, 4, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 9, 5, 8, 3, 0, 1, 2, 10, -1, 0, 0, 0, 0, 0, 0],
  [10, 5, 4, 10, 4, 2, 2, 4, 0, -1, 0, 0, 0, 0, 0, 0],
  [4, 8, 3, 4, 3, 2, 4, 2, 5, 5, 2, 10, -1, 0, 0, 0],
  [2, 3, 11, 5, 4, 9, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [11, 0, 8, 11, 2, 0, 9, 5, 4, -1, 0, 0, 0, 0, 0, 0],
  [5, 0, 1, 5, 4, 0, 3, 11, 2, -1, 0, 0, 0, 0, 0, 0],
  [11, 2, 8, 8, 5, 4, 2, 5, 8, 2, 1, 5, -1, 0, 0, 0],
  [3, 10, 1, 3, 11, 10, 5, 4, 9, -1, 0, 0, 0, 0, 0, 0],
  [9, 5, 4, 1, 0, 8, 1, 8, 10, 10, 8, 11, -1, 0, 0, 0],
  [10, 5, 11, 11, 0, 3, 11, 5, 0, 0, 5, 4, -1, 0, 0, 0],
  [4, 10, 5, 4, 8, 10, 10, 8, 11, -1, 0, 0, 0, 0, 0, 0],
  [7, 9, 5, 7, 8, 9, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 9, 5, 0, 5, 3, 3, 5, 7, -1, 0, 0, 0, 0, 0, 0],
  [8, 0, 1, 8, 1, 7, 7, 1, 5, -1, 0, 0, 0, 0, 0, 0],
  [3, 1, 5, 3, 5, 7, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [7, 9, 5, 7, 8, 9, 1, 2, 10, -1, 0, 0, 0, 0, 0, 0],
  [1, 2, 10, 0, 9, 5, 0, 5, 3, 3, 5, 7, -1, 0, 0, 0],
  [7, 8, 5, 5, 2, 10, 8, 2, 5, 8, 0, 2, -1, 0, 0, 0],
  [10, 3, 2, 10, 5, 3, 3, 5, 7, -1, 0, 0, 0, 0, 0, 0],
  [9, 7, 8, 9, 5, 7, 11, 2, 3, -1, 0, 0, 0, 0, 0, 0],
  [0, 9, 2, 2, 7, 11, 2, 9, 7, 7, 9, 5, -1, 0, 0, 0],
  [3, 11, 2, 8, 0, 1, 8, 1, 7, 7, 1, 5, -1, 0, 0, 0],
  [2, 7, 11, 2, 1, 7, 7, 1, 5, -1, 0, 0, 0, 0, 0, 0],
  [11, 1, 3, 11, 10, 1, 7, 8, 9, 7, 9, 5, -1, 0, 0, 0],
  [11, 10, 1, 11, 1, 7, 7, 1, 0, 7, 0, 9, 7, 9, 5, -1],
  [5, 7, 8, 5, 8, 10, 10, 8, 0, 10, 0, 3, 10, 3, 11, -1],
  [11, 10, 5, 11, 5, 7, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [10, 6, 5, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 8, 3, 10, 6, 5, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 0, 1, 5, 10, 6, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [8, 1, 9, 8, 3, 1, 10, 6, 5, -1, 0, 0, 0, 0, 0, 0],
  [6, 1, 2, 6, 5, 1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [6, 1, 2, 6, 5, 1, 0, 8, 3, -1, 0, 0, 0, 0, 0, 0],
  [5, 9, 0, 5, 0, 6, 6, 0, 2, -1, 0, 0, 0, 0, 0, 0],
  [6, 5, 2, 2, 8, 3, 5, 8, 2, 5, 9, 8, -1, 0, 0, 0],
  [2, 3, 11, 10, 6, 5, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 11, 2, 0, 8, 11, 6, 5, 10, -1, 0, 0, 0, 0, 0, 0],
  [0, 1, 9, 3, 11, 2, 10, 6, 5, -1, 0, 0, 0, 0, 0, 0],
  [10, 6, 5, 2, 1, 9, 2, 9, 11, 11, 9, 8, -1, 0, 0, 0],
  [11, 6, 5, 11, 5, 3, 3, 5, 1, -1, 0, 0, 0, 0, 0, 0],
  [11, 6, 8, 8, 1, 0, 8, 6, 1, 1, 6, 5, -1, 0, 0, 0],
  [0, 3, 11, 0, 11, 6, 0, 6, 9, 9, 6, 5, -1, 0, 0, 0],
  [5, 11, 6, 5, 9, 11, 11, 9, 8, -1, 0, 0, 0, 0, 0, 0],
  [7, 8, 4, 6, 5, 10, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 4, 7, 3, 0, 4, 5, 10, 6, -1, 0, 0, 0, 0, 0, 0],
  [6, 5, 10, 7, 8, 4, 9, 0, 1, -1, 0, 0, 0, 0, 0, 0],
  [5, 10, 6, 9, 4, 7, 9, 7, 1, 1, 7, 3, -1, 0, 0, 0],
  [1, 6, 5, 1, 2, 6, 7, 8, 4, -1, 0, 0, 0, 0, 0, 0],
  [7, 0, 4, 7, 3, 0, 6, 5, 1, 6, 1, 2, -1, 0, 0, 0],
  [4, 7, 8, 5, 9, 0, 5, 0, 6, 6, 0, 2, -1, 0, 0, 0],
  [2, 6, 5, 2, 5, 3, 3, 5, 9, 3, 9, 4, 3, 4, 7, -1],
  [4, 7, 8, 5, 10, 6, 11, 2, 3, -1, 0, 0, 0, 0, 0, 0],
  [6, 5, 10, 7, 11, 2, 7, 2, 4, 4, 2, 0, -1, 0, 0, 0],
  [4, 7, 8, 9, 0, 1, 6, 5, 10, 3, 11, 2, -1, 0, 0, 0],
  [6, 5, 10, 11, 4, 7, 11, 2, 4, 4, 2, 9, 9, 2, 1, -1],
  [7, 8, 4, 11, 6, 5, 11, 5, 3, 3, 5, 1, -1, 0, 0, 0],
  [0, 4, 7, 0, 7, 1, 1, 7, 11, 1, 11, 6, 1, 6, 5, -1],
  [4, 7, 8, 9, 6, 5, 9, 0, 6, 6, 0, 11, 11, 0, 3, -1],
  [7, 11, 4, 11, 9, 4, 11, 5, 9, 11, 6, 5, -1, 0, 0, 0],
  [10, 4, 9, 10, 6, 4, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [10, 4, 9, 10, 6, 4, 8, 3, 0, -1, 0, 0, 0, 0, 0, 0],
  [1, 10, 6, 1, 6, 0, 0, 6, 4, -1, 0, 0, 0, 0, 0, 0],
  [4, 8, 6, 6, 1, 10, 6, 8, 1, 1, 8, 3, -1, 0, 0, 0],
  [9, 1, 2, 9, 2, 4, 4, 2, 6, -1, 0, 0, 0, 0, 0, 0],
  [0, 8, 3, 9, 1, 2, 9, 2, 4, 4, 2, 6, -1, 0, 0, 0],
  [0, 2, 6, 0, 6, 4, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 4, 8, 3, 2, 4, 4, 2, 6, -1, 0, 0, 0, 0, 0, 0],
  [4, 10, 6, 4, 9, 10, 2, 3, 11, -1, 0, 0, 0, 0, 0, 0],
  [8, 2, 0, 8, 11, 2, 4, 9, 10, 4, 10, 6, -1, 0, 0, 0],
  [2, 3, 11, 1, 10, 6, 1, 6, 0, 0, 6, 4, -1, 0, 0, 0],
  [8, 11, 2, 8, 2, 4, 4, 2, 1, 4, 1, 10, 4, 10, 6, -1],
  [3, 11, 1, 1, 4, 9, 11, 4, 1, 11, 6, 4, -1, 0, 0, 0],
  [6, 4, 9, 6, 9, 11, 11, 9, 1, 11, 1, 0, 11, 0, 8, -1],
  [11, 0, 3, 11, 6, 0, 0, 6, 4, -1, 0, 0, 0, 0, 0, 0],
  [8, 11, 6, 8, 6, 4, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [6, 7, 8, 6, 8, 10, 10, 8, 9, -1, 0, 0, 0, 0, 0, 0],
  [3, 0, 7, 7, 10, 6, 0, 10, 7, 0, 9, 10, -1, 0, 0, 0],
  [1, 10, 6, 1, 6, 7, 1, 7, 0, 0, 7, 8, -1, 0, 0, 0],
  [6, 1, 10, 6, 7, 1, 1, 7, 3, -1, 0, 0, 0, 0, 0, 0],
  [9, 1, 8, 8, 6, 7, 8, 1, 6, 6, 1, 2, -1, 0, 0, 0],
  [7, 3, 0, 7, 0, 6, 6, 0, 9, 6, 9, 1, 6, 1, 2, -1],
  [8, 6, 7, 8, 0, 6, 6, 0, 2, -1, 0, 0, 0, 0, 0, 0],
  [2, 6, 7, 2, 7, 3, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [11, 2, 3, 6, 7, 8, 6, 8, 10, 10, 8, 9, -1, 0, 0, 0],
  [9, 10, 6, 9, 6, 0, 0, 6, 7, 0, 7, 11, 0, 11, 2, -1],
  [3, 11, 2, 0, 7, 8, 0, 1, 7, 7, 1, 6, 6, 1, 10, -1],
  [6, 7, 10, 7, 1, 10, 7, 2, 1, 7, 11, 2, -1, 0, 0, 0],
  [1, 3, 11, 1, 11, 9, 9, 11, 6, 9, 6, 7, 9, 7, 8, -1],
  [6, 7, 11, 9, 1, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [8, 0, 7, 0, 6, 7, 0, 11, 6, 0, 3, 11, -1, 0, 0, 0],
  [6, 7, 11, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [6, 11, 7, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 8, 11, 7, 6, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [6, 11, 7, 9, 0, 1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 8, 3, 1, 9, 8, 7, 6, 11, -1, 0, 0, 0, 0, 0, 0],
  [11, 7, 6, 2, 10, 1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 2, 10, 0, 8, 3, 11, 7, 6, -1, 0, 0, 0, 0, 0, 0],
  [9, 2, 10, 9, 0, 2, 11, 7, 6, -1, 0, 0, 0, 0, 0, 0],
  [11, 7, 6, 3, 2, 10, 3, 10, 8, 8, 10, 9, -1, 0, 0, 0],
  [2, 7, 6, 2, 3, 7, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [8, 7, 6, 8, 6, 0, 0, 6, 2, -1, 0, 0, 0, 0, 0, 0],
  [7, 2, 3, 7, 6, 2, 1, 9, 0, -1, 0, 0, 0, 0, 0, 0],
  [8, 7, 9, 9, 2, 1, 9, 7, 2, 2, 7, 6, -1, 0, 0, 0],
  [6, 10, 1, 6, 1, 7, 7, 1, 3, -1, 0, 0, 0, 0, 0, 0],
  [6, 10, 1, 6, 1, 0, 6, 0, 7, 7, 0, 8, -1, 0, 0, 0],
  [7, 6, 3, 3, 9, 0, 6, 9, 3, 6, 10, 9, -1, 0, 0, 0],
  [6, 8, 7, 6, 10, 8, 8, 10, 9, -1, 0, 0, 0, 0, 0, 0],
  [8, 6, 11, 8, 4, 6, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [11, 3, 0, 11, 0, 6, 6, 0, 4, -1, 0, 0, 0, 0, 0, 0],
  [6, 8, 4, 6, 11, 8, 0, 1, 9, -1, 0, 0, 0, 0, 0, 0],
  [1, 9, 3, 3, 6, 11, 9, 6, 3, 9, 4, 6, -1, 0, 0, 0],
  [8, 6, 11, 8, 4, 6, 10, 1, 2, -1, 0, 0, 0, 0, 0, 0],
  [2, 10, 1, 11, 3, 0, 11, 0, 6, 6, 0, 4, -1, 0, 0, 0],
  [11, 4, 6, 11, 8, 4, 2, 10, 9, 2, 9, 0, -1, 0, 0, 0],
  [4, 6, 11, 4, 11, 9, 9, 11, 3, 9, 3, 2, 9, 2, 10, -1],
  [3, 8, 4, 3, 4, 2, 2, 4, 6, -1, 0, 0, 0, 0, 0, 0],
  [2, 0, 4, 2, 4, 6, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 1, 9, 3, 8, 4, 3, 4, 2, 2, 4, 6, -1, 0, 0, 0],
  [9, 2, 1, 9, 4, 2, 2, 4, 6, -1, 0, 0, 0, 0, 0, 0],
  [6, 10, 4, 4, 3, 8, 4, 10, 3, 3, 10, 1, -1, 0, 0, 0],
  [1, 6, 10, 1, 0, 6, 6, 0, 4, -1, 0, 0, 0, 0, 0, 0],
  [10, 9, 0, 10, 0, 6, 6, 0, 3, 6, 3, 8, 6, 8, 4, -1],
  [10, 9, 4, 10, 4, 6, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [6, 11, 7, 5, 4, 9, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 8, 3, 9, 5, 4, 7, 6, 11, -1, 0, 0, 0, 0, 0, 0],
  [0, 5, 4, 0, 1, 5, 6, 11, 7, -1, 0, 0, 0, 0, 0, 0],
  [7, 6, 11, 4, 8, 3, 4, 3, 5, 5, 3, 1, -1, 0, 0, 0],
  [2, 10, 1, 11, 7, 6, 5, 4, 9, -1, 0, 0, 0, 0, 0, 0],
  [0, 8, 3, 1, 2, 10, 4, 9, 5, 11, 7, 6, -1, 0, 0, 0],
  [6, 11, 7, 10, 5, 4, 10, 4, 2, 2, 4, 0, -1, 0, 0, 0],
  [6, 11, 7, 5, 2, 10, 5, 4, 2, 2, 4, 3, 3, 4, 8, -1],
  [2, 7, 6, 2, 3, 7, 4, 9, 5, -1, 0, 0, 0, 0, 0, 0],
  [4, 9, 5, 8, 7, 6, 8, 6, 0, 0, 6, 2, -1, 0, 0, 0],
  [3, 6, 2, 3, 7, 6, 0, 1, 5, 0, 5, 4, -1, 0, 0, 0],
  [1, 5, 4, 1, 4, 2, 2, 4, 8, 2, 8, 7, 2, 7, 6, -1],
  [5, 4, 9, 6, 10, 1, 6, 1, 7, 7, 1, 3, -1, 0, 0, 0],
  [4, 9, 5, 7, 0, 8, 7, 6, 0, 0, 6, 1, 1, 6, 10, -1],
  [3, 7, 6, 3, 6, 0, 0, 6, 10, 0, 10, 5, 0, 5, 4, -1],
  [4, 8, 5, 8, 10, 5, 8, 6, 10, 8, 7, 6, -1, 0, 0, 0],
  [5, 6, 11, 5, 11, 9, 9, 11, 8, -1, 0, 0, 0, 0, 0, 0],
  [0, 9, 5, 0, 5, 6, 0, 6, 3, 3, 6, 11, -1, 0, 0, 0],
  [8, 0, 11, 11, 5, 6, 11, 0, 5, 5, 0, 1, -1, 0, 0, 0],
  [11, 5, 6, 11, 3, 5, 5, 3, 1, -1, 0, 0, 0, 0, 0, 0],
  [10, 1, 2, 5, 6, 11, 5, 11, 9, 9, 11, 8, -1, 0, 0, 0],
  [2, 10, 1, 3, 6, 11, 3, 0, 6, 6, 0, 5, 5, 0, 9, -1],
  [0, 2, 10, 0, 10, 8, 8, 10, 5, 8, 5, 6, 8, 6, 11, -1],
  [11, 3, 6, 3, 5, 6, 3, 10, 5, 3, 2, 10, -1, 0, 0, 0],
  [2, 3, 6, 6, 9, 5, 3, 9, 6, 3, 8, 9, -1, 0, 0, 0],
  [5, 0, 9, 5, 6, 0, 0, 6, 2, -1, 0, 0, 0, 0, 0, 0],
  [6, 2, 3, 6, 3, 5, 5, 3, 8, 5, 8, 0, 5, 0, 1, -1],
  [6, 2, 1, 6, 1, 5, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [8, 9, 5, 8, 5, 3, 3, 5, 6, 3, 6, 10, 3, 10, 1, -1],
  [1, 0, 10, 0, 6, 10, 0, 5, 6, 0, 9, 5, -1, 0, 0, 0],
  [0, 3, 8, 10, 5, 6, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [10, 5, 6, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [11, 5, 10, 11, 7, 5, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [5, 11, 7, 5, 10, 11, 3, 0, 8, -1, 0, 0, 0, 0, 0, 0],
  [11, 5, 10, 11, 7, 5, 9, 0, 1, -1, 0, 0, 0, 0, 0, 0],
  [9, 3, 1, 9, 8, 3, 5, 10, 11, 5, 11, 7, -1, 0, 0, 0],
  [2, 11, 7, 2, 7, 1, 1, 7, 5, -1, 0, 0, 0, 0, 0, 0],
  [3, 0, 8, 2, 11, 7, 2, 7, 1, 1, 7, 5, -1, 0, 0, 0],
  [2, 11, 0, 0, 5, 9, 0, 11, 5, 5, 11, 7, -1, 0, 0, 0],
  [9, 8, 3, 9, 3, 5, 5, 3, 2, 5, 2, 11, 5, 11, 7, -1],
  [10, 2, 3, 10, 3, 5, 5, 3, 7, -1, 0, 0, 0, 0, 0, 0],
  [5, 10, 7, 7, 0, 8, 10, 0, 7, 10, 2, 0, -1, 0, 0, 0],
  [1, 9, 0, 10, 2, 3, 10, 3, 5, 5, 3, 7, -1, 0, 0, 0],
  [7, 5, 10, 7, 10, 8, 8, 10, 2, 8, 2, 1, 8, 1, 9, -1],
  [7, 5, 1, 7, 1, 3, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [8, 1, 0, 8, 7, 1, 1, 7, 5, -1, 0, 0, 0, 0, 0, 0],
  [0, 5, 9, 0, 3, 5, 5, 3, 7, -1, 0, 0, 0, 0, 0, 0],
  [7, 5, 9, 7, 9, 8, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 5, 10, 4, 10, 8, 8, 10, 11, -1, 0, 0, 0, 0, 0, 0],
  [11, 3, 10, 10, 4, 5, 10, 3, 4, 4, 3, 0, -1, 0, 0, 0],
  [9, 0, 1, 4, 5, 10, 4, 10, 8, 8, 10, 11, -1, 0, 0, 0],
  [3, 1, 9, 3, 9, 11, 11, 9, 4, 11, 4, 5, 11, 5, 10, -1],
  [8, 4, 11, 11, 1, 2, 4, 1, 11, 4, 5, 1, -1, 0, 0, 0],
  [5, 1, 2, 5, 2, 4, 4, 2, 11, 4, 11, 3, 4, 3, 0, -1],
  [11, 8, 4, 11, 4, 2, 2, 4, 5, 2, 5, 9, 2, 9, 0, -1],
  [2, 11, 3, 5, 9, 4, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 5, 10, 4, 10, 2, 4, 2, 8, 8, 2, 3, -1, 0, 0, 0],
  [10, 4, 5, 10, 2, 4, 4, 2, 0, -1, 0, 0, 0, 0, 0, 0],
  [0, 1, 9, 8, 2, 3, 8, 4, 2, 2, 4, 10, 10, 4, 5, -1],
  [10, 2, 5, 2, 4, 5, 2, 9, 4, 2, 1, 9, -1, 0, 0, 0],
  [4, 3, 8, 4, 5, 3, 3, 5, 1, -1, 0, 0, 0, 0, 0, 0],
  [0, 4, 5, 0, 5, 1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 3, 9, 3, 5, 9, 3, 4, 5, 3, 8, 4, -1, 0, 0, 0],
  [4, 5, 9, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [7, 4, 9, 7, 9, 11, 11, 9, 10, -1, 0, 0, 0, 0, 0, 0],
  [8, 3, 0, 7, 4, 9, 7, 9, 11, 11, 9, 10, -1, 0, 0, 0],
  [0, 1, 4, 4, 11, 7, 1, 11, 4, 1, 10, 11, -1, 0, 0, 0],
  [10, 11, 7, 10, 7, 1, 1, 7, 4, 1, 4, 8, 1, 8, 3, -1],
  [2, 11, 7, 2, 7, 4, 2, 4, 1, 1, 4, 9, -1, 0, 0, 0],
  [0, 8, 3, 1, 4, 9, 1, 2, 4, 4, 2, 7, 7, 2, 11, -1],
  [7, 2, 11, 7, 4, 2, 2, 4, 0, -1, 0, 0, 0, 0, 0, 0],
  [7, 4, 11, 4, 2, 11, 4, 3, 2, 4, 8, 3, -1, 0, 0, 0],
  [7, 4, 3, 3, 10, 2, 3, 4, 10, 10, 4, 9, -1, 0, 0, 0],
  [2, 0, 8, 2, 8, 10, 10, 8, 7, 10, 7, 4, 10, 4, 9, -1],
  [4, 0, 1, 4, 1, 7, 7, 1, 10, 7, 10, 2, 7, 2, 3, -1],
  [4, 8, 7, 1, 10, 2, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [9, 7, 4, 9, 1, 7, 7, 1, 3, -1, 0, 0, 0, 0, 0, 0],
  [8, 7, 0, 7, 1, 0, 7, 9, 1, 7, 4, 9, -1, 0, 0, 0],
  [4, 0, 3, 4, 3, 7, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [4, 8, 7, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [8, 9, 10, 8, 10, 11, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 11, 3, 0, 9, 11, 11, 9, 10, -1, 0, 0, 0, 0, 0, 0],
  [1, 8, 0, 1, 10, 8, 8, 10, 11, -1, 0, 0, 0, 0, 0, 0],
  [3, 1, 10, 3, 10, 11, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 9, 1, 2, 11, 9, 9, 11, 8, -1, 0, 0, 0, 0, 0, 0],
  [0, 9, 3, 9, 11, 3, 9, 2, 11, 9, 1, 2, -1, 0, 0, 0],
  [11, 8, 0, 11, 0, 2, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 11, 3, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 10, 2, 3, 8, 10, 10, 8, 9, -1, 0, 0, 0, 0, 0, 0],
  [9, 10, 2, 9, 2, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [3, 8, 2, 8, 10, 2, 8, 1, 10, 8, 0, 1, -1, 0, 0, 0],
  [2, 1, 10, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [8, 9, 1, 8, 1, 3, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 9, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 3, 8, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [-1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
]

const edge_vertices = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 0],
  [4, 5],
  [6, 5],
  [6, 7],
  [7, 4],
  [0, 4],
  [1, 5],
  [2, 6],
  [3, 7]
]

const index_to_vertex = [
  [0, 0, 0],
  [1, 0, 0],
  [1, 1, 0],
  [0, 1, 0],
  [0, 0, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 1, 1]
]

// Compute the vertex values of the cell given the ID of its bottom vertex
const computeVertexValues = function (volume, dims, cell, values) {
  for (let i = 0; i < index_to_vertex.length; ++i) {
    const v = index_to_vertex[i]
    // We want to swap the order we go when on the top of the cube,
    // due to how the indices are labeled in the paper.
    const voxel = ((cell[2] + v[2]) * dims[1] + cell[1] + v[1]) * dims[0] + cell[0] + v[0]
    values[i] = volume[voxel]
  }
}

const lerpVerts = function (va, vb, fa, fb, isoval, vert) {
  let t = 0
  if (Math.abs(fa - fb) < 0.0001) {
    t = 0.0
  } else {
    t = (isoval - fa) / (fb - fa)
  }
  vert[0] = va[0] + t * (vb[0] - va[0])
  vert[1] = va[1] + t * (vb[1] - va[1])
  vert[2] = va[2] + t * (vb[2] - va[2])
}

class CustomBuffer {
  constructor(capacity, dtype) {
    this.len = 0
    this.capacity = capacity
    if (dtype === 'uint8') {
      this.buffer = new Uint8Array(capacity)
    } else if (dtype === 'int8') {
      this.buffer = new Int8Array(capacity)
    } else if (dtype === 'uint16') {
      this.buffer = new Uint16Array(capacity)
    } else if (dtype === 'int16') {
      this.buffer = new Int16Array(capacity)
    } else if (dtype === 'uint32') {
      this.buffer = new Uint32Array(capacity)
    } else if (dtype === 'int32') {
      this.buffer = new Int32Array(capacity)
    } else if (dtype === 'float32') {
      this.buffer = new Float32Array(capacity)
    } else if (dtype === 'float64') {
      this.buffer = new Float64Array(capacity)
    } else {
      console.log('ERROR: unsupported type ' + dtype)
    }
  }

  append(buf) {
    if (this.len + buf.length >= this.capacity) {
      const newCap = Math.floor(this.capacity * 1.5)
      const tmp = new this.buffer.constructor(newCap)
      tmp.set(this.buffer)

      this.capacity = newCap
      this.buffer = tmp
    }
    this.buffer.set(buf, this.len)
    this.len += buf.length
  }

  clear() {
    this.len = 0
  }

  stride() {
    return this.buffer.BYTES_PER_ELEMENT
  }

  view(offset, length) {
    return new this.buffer.constructor(this.buffer.buffer, offset, length)
  }
}

// Run the Marching Cubes algorithm on the volume to compute
// the isosurface at the desired value. The volume is assumed
// to be a Uint8Array, with one uint8 per-voxel.
// Dims should give the [x, y, z] dimensions of the volume
function marchingCubesJS(volume, dims, isovalue) {
  // var marchingCubesJS = async function(volume, dims, isovalue) {
  // More similar to the WebASM version: keep the triangle buffer alive and re-use
  // the memory each time we change it to reduce allocation cost
  const triangles = new CustomBuffer(3, 'float32')

  triangles.clear()
  const vertexValues = [0, 0, 0, 0, 0, 0, 0, 0]
  const vert = [0, 0, 0]
  for (let k = 0; k < dims[2] - 1; ++k) {
    for (let j = 0; j < dims[1] - 1; ++j) {
      for (let i = 0; i < dims[0] - 1; ++i) {
        computeVertexValues(volume, dims, [i, j, k], vertexValues)
        let index = 0
        for (let v = 0; v < 8; ++v) {
          if (vertexValues[v] <= isovalue) {
            index |= 1 << v
          }
        }

        /* The cube vertex and edge indices for base rotation:
         *
         *      v7------e6------v6
         *     / |              /|
         *   e11 |            e10|
         *   /   e7           /  |
         *  /    |           /   e5
         *  v3------e2-------v2  |
         *  |    |           |   |
         *  |   v4------e4---|---v5
         *  e3  /           e1   /
         *  |  e8            |  e9
         *  | /              | /    y z
         *  |/               |/     |/
         *  v0------e0-------v1     O--x
         */

        // The triangle table gives us the mapping from index to actual
        // triangles to return for this configuration
        for (let t = 0; triTable[index][t] !== -1; ++t) {
          const v0 = edge_vertices[triTable[index][t]][0]
          const v1 = edge_vertices[triTable[index][t]][1]

          lerpVerts(index_to_vertex[v0], index_to_vertex[v1], vertexValues[v0], vertexValues[v1], isovalue, vert)

          // Note: The vertex positions need to be placed on the dual grid,
          // since that's where the isosurface is computed and defined.
          vert[0] += i + 0.5
          vert[1] += j + 0.5
          vert[2] += k + 0.5
          triangles.append(vert)
        }
      }
    }
  }
  return triangles.view(0, triangles.len)
}

function sortVerticesByDistance(vertices) {
  // Extract the first vertex
  const firstVertex = [vertices[0], vertices[1], vertices[2]]
  // Compute the Euclidean distances from the first vertex
  const distances = []
  for (let i = 0; i < vertices.length; i += 3) {
    const vertex = [vertices[i], vertices[i + 1], vertices[i + 2]]
    const distance = Math.sqrt(
      Math.pow(vertex[0] - firstVertex[0], 2) +
        Math.pow(vertex[1] - firstVertex[1], 2) +
        Math.pow(vertex[2] - firstVertex[2], 2)
    )
    distances.push({ vertex, distance })
  }
  // Sort the vertices by their distances
  distances.sort((a, b) => a.distance - b.distance)
  return distances
}

function unifyVertices(vertices, triangles, isVerbose = false) {
  // Extract the first vertex
  const nVtx = vertices.length / 3
  const xyz0 = [vertices[0], vertices[1], vertices[2]]
  // Compute the Euclidean distances from the first vertex
  const vtxs = []
  let v = 0
  for (let i = 0; i < vertices.length; i += 3) {
    const xyz = [vertices[i], vertices[i + 1], vertices[i + 2]]
    const inIndex = v++
    const outIndex = -1
    const distance = Math.sqrt(
      Math.pow(xyz[0] - xyz0[0], 2) + Math.pow(xyz[1] - xyz0[1], 2) + Math.pow(xyz[2] - xyz0[2], 2)
    )
    vtxs.push({ inIndex, distance, xyz, outIndex })
  }
  // Sort the vertices by their distances
  vtxs.sort((a, b) => a.distance - b.distance)
  // identify unique vertices
  const tol = 0.00001
  let nVtxUnique = 0
  const vtxRemaps = new Int32Array(nVtx).fill(-1)
  const triRemaps = new Int32Array(nVtx).fill(-1)
  for (let i = 0; i < nVtx; i++) {
    const vtx = vtxs[i]
    if (vtx.outIndex >= 0) {
      continue
    } // already re-mapped
    let j = i
    while (j < nVtx && vtxs[j].distance - vtx.distance < tol) {
      // similar scalar distance from first voxel is necessary but not sufficient
      const distance = Math.sqrt(
        Math.pow(vtx.xyz[0] - vtxs[j].xyz[0], 2) +
          Math.pow(vtx.xyz[1] - vtxs[j].xyz[1], 2) +
          Math.pow(vtx.xyz[2] - vtxs[j].xyz[2], 2)
      )
      if (distance < tol) {
        vtxs[j].outIndex = nVtxUnique
        triRemaps[vtxs[j].inIndex] = nVtxUnique
      }
      j++
    }
    vtxRemaps[nVtxUnique] = i
    nVtxUnique++
  }
  if (nVtx === nVtxUnique) {
    if (isVerbose) {
      console.log('Unify vertices found no shared vertices')
    }
    return { vertices, triangles }
  }
  // remap new vertices:
  const newVertices = new Float32Array(nVtxUnique * 3)
  v = 0
  for (let i = 0; i < nVtxUnique; i++) {
    const j = vtxRemaps[i]
    newVertices[v++] = vtxs[j].xyz[0]
    newVertices[v++] = vtxs[j].xyz[1]
    newVertices[v++] = vtxs[j].xyz[2]
  }
  // remap faces
  for (let i = 0; i < triangles.length; i++) {
    triangles[i] = triRemaps[triangles[i]]
  }
  if (isVerbose) {
    console.log(`Vertex welding ${nVtx} -> ${nVtxUnique}`)
  }
  return { vertices: newVertices, triangles }
}

function isPositiveDeterminant(matrix) {
  // Calculate the determinant of the 3x3 matrix
  const det =
    matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
    matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
    matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0])

  // Return true if the determinant is positive, otherwise false
  return det > 0
}

function reverseMeshFaces(tris) {
  for (let i = 0; i < tris.length; i += 3) {
    // Swap the second and third elements of each triangle
    const temp = tris[i + 1]
    tris[i + 1] = tris[i + 2]
    tris[i + 2] = temp
  }
  return tris
}

function verticesVox2mm(mesh, affine) {
  const vertices = mesh.vertices
  for (let i = 0; i < vertices.length; i += 3) {
    const xyz = [vertices[i], vertices[i + 1], vertices[i + 2]]
    // translate 0.5 voxels: NIfTI SForm from voxel centers
    xyz[0] -= 0.5
    xyz[1] -= 0.5
    xyz[2] -= 0.5
    vertices[i + 0] = xyz[0] * affine[0][0] + xyz[1] * affine[0][1] + xyz[2] * affine[0][2] + affine[0][3]
    vertices[i + 1] = xyz[0] * affine[1][0] + xyz[1] * affine[1][1] + xyz[2] * affine[1][2] + affine[1][3]
    vertices[i + 2] = xyz[0] * affine[2][0] + xyz[1] * affine[2][1] + xyz[2] * affine[2][2] + affine[2][3]
  }
  const isPos = isPositiveDeterminant(affine)
  if (!isPos) {
    mesh.triangles = reverseMeshFaces(mesh.triangles)
  }
  return mesh
}

function cullDegenerateTriangles(triangles, isVerbose = true) {
  let tris = triangles
  const nTri = tris.length / 3
  let nOK = 0
  for (let i = 0; i < tris.length; i += 3) {
    if (tris[i] === tris[i + 1] || tris[i] === tris[i + 2] || tris[i + 1] === tris[i + 2]) {
      continue
    }
    nOK++
  }
  if (nOK === nTri) {
    return triangles
  }
  if (nOK === 0) {
    throw new Error('invalid mesh: no valid triangles')
  }
  if (isVerbose) {
    console.log(`${nTri - nOK} of the ${nTri} triangles are degenerate`)
  }
  tris = triangles.slice()
  triangles = new Uint32Array(nOK * 3)
  let j = 0
  for (let i = 0; i < tris.length; i += 3) {
    if (tris[i] === tris[i + 1] || tris[i] === tris[i + 2] || tris[i + 1] === tris[i + 2]) {
      continue
    }
    triangles[j++] = tris[i]
    triangles[j++] = tris[i + 1]
    triangles[j++] = tris[i + 2]
  }
  return triangles
}

function fillh(imgBin, dim, is26 = true) {
  // aka nifti_fillh
  // All given binary image, interior 0 voxels set to 1
  const nx = dim[0]
  const ny = dim[1]
  const nz = dim[2]
  if (nx < 3 || ny < 3 || nz < 3) {
    return
  }
  const nvox = nx * ny * nz

  // Set up kernel to search for neighbors
  let numk = 6
  if (is26) {
    numk = 26
  }
  const k = new Int32Array(numk)
  if (is26) {
    let j = 0
    for (let z = -1; z <= 1; z++) {
      for (let y = -1; y <= 1; y++) {
        for (let x = -1; x <= 1; x++) {
          if (x === 0 && y === 0 && z === 0) {
            continue
          }
          k[j] = x + y * nx + z * nx * ny
          j++
        }
      }
    }
  } else {
    // if 26 neighbors else 6..
    k[0] = nx * ny // up
    k[1] = -k[0] // down
    k[2] = nx // anterior
    k[3] = -k[2] // posterior
    k[4] = 1 // left
    k[5] = -1 // right
  }

  // Flood fill algorithm
  const q = new Int32Array(nvox) // queue with untested seed
  const vxs = new Uint8Array(nvox)
  for (let i = 0; i < nvox; i++) {
    vxs[i] = imgBin[i] > 0 ? 1 : 0
  }
  let qlo = 0
  let qhi = -1 // ints always signed in C!

  // Load edges
  let i = 0
  for (let z = 0; z < nz; z++) {
    const zedge = z === 0 || z === nz - 1 ? 1 : 0
    for (let y = 0; y < ny; y++) {
      const yedge = y === 0 || y === ny - 1 ? 1 : 0
      for (let x = 0; x < nx; x++) {
        if (vxs[i] === 0 && (zedge || yedge || x === 0 || x === nx - 1)) {
          // found new seed
          vxs[i] = 1 // do not find again
          qhi++
          q[qhi] = i
        }
        i++
      }
    }
  }
  // Run a 'first in, first out' queue
  while (qhi >= qlo) {
    // Retire one seed, add 0..6 new ones (fillh) or 0..26 new ones (fillh26)
    for (let j = 0; j < numk; j++) {
      const jj = q[qlo] + k[j]
      if (jj < 0 || jj >= nvox) {
        continue
      }
      if (vxs[jj] !== 0) {
        continue
      }
      // Add new seed
      vxs[jj] = 1
      qhi++
      q[qhi] = jj
    }
    qlo++
  }
  for (let i = 0; i < nvox; i++) {
    if (vxs[i] === 0) {
      imgBin[i] = 1
    } // hidden internal voxel not found from the fill
  }
  return imgBin
}

function fillBubbles(img, dims, isovalue = 1, isVerbose = false) {
  // TODO check with binary input: isovalue might be off by 1
  let img01 = img.map((value) => (value >= isovalue ? 1 : 0))
  const countNonZero = img01.reduce((count, value) => count + (value !== 0 ? 1 : 0), 0)
  img01 = fillh(img01, dims)
  const countFilledNonZero = img01.reduce((count, value) => count + (value !== 0 ? 1 : 0), 0)
  if (countNonZero === countFilledNonZero) {
    return img
  }
  if (isVerbose) {
    console.log(`${countFilledNonZero - countNonZero} voxels were bubbles`)
  }
  const isovalue1 = isovalue + 1
  for (let i = 0; i < img.length; i++) {
    if (img01[i] === 0) {
      continue
    }
    img[i] = Math.max(img[i], isovalue1)
  }
  return img
}

function largestClusterOnly(img, dims, isovalue = 1) {
  const BWInstance = new BWLabeler()
  const conn = 26 // Example connectivity
  const binarize = true
  const onlyLargestClusterPerClass = true
  const img01 = img.slice().fill(0)
  for (let i = 0; i < img.length; i++) {
    if (img[i] >= isovalue) {
      img01[i] = 1
    }
  }
  const [_labelCount, labeledImage] = BWInstance.bwlabel(img01, dims, conn, binarize, onlyLargestClusterPerClass)
  for (let i = 0; i < img.length; i++) {
    img[i] *= labeledImage[i]
  }
  return img
}

function zeroVolumeEdges(img, dims) {
  const [x, y, z] = dims
  const xy = x * y
  // zero left and right sides
  // let offset = (z - 1) * xy
  let offset = x - 1
  for (let zi = 0; zi < z; zi++) {
    const zOffset = zi * xy
    for (let yi = 0; yi < y; yi++) {
      const yOffset = yi * x
      img[zOffset + yOffset] = 0
      img[zOffset + yOffset + offset] = 0
    }
  }
  // zero anterior and posterior
  offset = (y - 1) * x
  for (let zi = 0; zi < z; zi++) {
    const zOffset = zi * xy
    for (let xi = 0; xi < x; xi++) {
      img[zOffset + xi] = 0
      img[zOffset + xi + offset] = 0
    }
  }
  // zero top and bottom slice
  offset = (z - 1) * xy
  for (let i = 0; i < xy; i++) {
    img[i] = 0
    img[i + offset] = 0
  }
  return img
}

function laplacian_smooth(verts, tris) {
  const nvert = verts.length / 3
  const ntri = tris.length / 3
  const sum = new Float64Array(nvert * 3).fill(0)
  const num = new Float64Array(nvert).fill(0)

  for (let i = 0; i < ntri; i++) {
    // Each point of a triangle has two neighbors:
    const p0 = tris[i * 3]
    const p1 = tris[i * 3 + 1]
    const p2 = tris[i * 3 + 2]

    num[p0] += 2
    sum[p0 * 3] += verts[p1 * 3] + verts[p2 * 3]
    sum[p0 * 3 + 1] += verts[p1 * 3 + 1] + verts[p2 * 3 + 1]
    sum[p0 * 3 + 2] += verts[p1 * 3 + 2] + verts[p2 * 3 + 2]

    num[p1] += 2
    sum[p1 * 3] += verts[p0 * 3] + verts[p2 * 3]
    sum[p1 * 3 + 1] += verts[p0 * 3 + 1] + verts[p2 * 3 + 1]
    sum[p1 * 3 + 2] += verts[p0 * 3 + 2] + verts[p2 * 3 + 2]

    num[p2] += 2
    sum[p2 * 3] += verts[p0 * 3] + verts[p1 * 3]
    sum[p2 * 3 + 1] += verts[p0 * 3 + 1] + verts[p1 * 3 + 1]
    sum[p2 * 3 + 2] += verts[p0 * 3 + 2] + verts[p1 * 3 + 2]
  }

  for (let i = 0; i < nvert; i++) {
    if (num[i] <= 0) {
      continue
    }
    verts[i * 3] = sum[i * 3] / num[i]
    verts[i * 3 + 1] = sum[i * 3 + 1] / num[i]
    verts[i * 3 + 2] = sum[i * 3 + 2] / num[i]
  }
}

function laplacian_smoothHC(verts, tris, iter = 100, alpha = 0.1, beta = 0.5, lockEdges = true) {
  if (iter < 1) {
    return
  }
  const nvert = verts.length / 3
  const ntri = tris.length / 3
  const alpha1 = 1.0 - alpha
  const beta1 = 1.0 - beta

  // let p = new Array(nvert * 3).fill(0);
  const q = new Float32Array(nvert * 3).fill(0)
  const b = new Array(nvert * 3).fill(0)
  // Copy verts to p
  // p.set(verts);
  const p = new Float32Array(verts)

  for (let j = 0; j < iter; j++) {
    // Copy p to q
    q.set(p)

    // Laplacian smooth on p
    laplacian_smooth(p, tris)

    for (let i = 0; i < nvert; i++) {
      const pi = i * 3
      const vi = i * 3

      b[pi] = p[pi] - (alpha * verts[vi] + alpha1 * q[pi])
      b[pi + 1] = p[pi + 1] - (alpha * verts[vi + 1] + alpha1 * q[pi + 1])
      b[pi + 2] = p[pi + 2] - (alpha * verts[vi + 2] + alpha1 * q[pi + 2])
    }

    // Copy b to q
    q.set(b)

    // Laplacian smooth on q
    laplacian_smooth(q, tris)

    for (let i = 0; i < nvert; i++) {
      const pi = i * 3

      p[pi] = p[pi] - (beta * b[pi] + beta1 * q[pi])
      p[pi + 1] = p[pi + 1] - (beta * b[pi + 1] + beta1 * q[pi + 1])
      p[pi + 2] = p[pi + 2] - (beta * b[pi + 2] + beta1 * q[pi + 2])
    }
  }

  if (!lockEdges) {
    verts.set(p)
    return
  }

  // Find border edges and only update non-border vertices
  const vertices = new Array(nvert).fill(null).map(() => ({ border: false, p: [0, 0, 0] }))
  for (let i = 0; i < nvert; i++) {
    vertices[i].p = [verts[i * 3], verts[i * 3 + 1], verts[i * 3 + 2]]
  }

  const triangles = new Array(ntri).fill(null).map(() => ({ deleted: 0, v: [0, 0, 0] }))
  for (let i = 0; i < ntri; i++) {
    triangles[i].v[0] = tris[i * 3]
    triangles[i].v[1] = tris[i * 3 + 1]
    triangles[i].v[2] = tris[i * 3 + 2]
  }

  // Placeholder functions for mesh update logic
  function update_mesh() {
    // Implement mesh update logic
  }

  update_mesh(0, triangles, vertices, [], 0, ntri, nvert)

  for (let i = 0; i < nvert; i++) {
    if (vertices[i].border) {
      continue
    }
    verts[i * 3] = p[i * 3]
    verts[i * 3 + 1] = p[i * 3 + 1]
    verts[i * 3 + 2] = p[i * 3 + 2]
  }
}

export function voxels2mesh(
  img,
  dims,
  isovalue,
  isLargestClusterOnly = false,
  isFillBubbles = false,
  smoothIterations = 5,
  affine = [],
  isVerbose = true
) {
  if (dims[0] < 3 || dims[1] < 3 || dims[2] < 3) {
    throw new Error('volume too small for meshification')
  }
  if (isovalue < 0) {
    // marching cubes implementation assumes positive values
    let mn = img[0]
    for (let i = 0; i < img.length; i++) {
      mn = Math.min(img[i], mn)
    }
    if (mn < 0) {
      for (let i = 0; i < img.length; i++) {
        img[i] = img[i] - mn
      }
      isovalue = isovalue - mn
    }
  }
  img = zeroVolumeEdges(img, dims)
  if (isLargestClusterOnly) {
    img = largestClusterOnly(img, dims, isovalue)
  }
  if (isFillBubbles) {
    img = fillBubbles(img, dims, isovalue, isVerbose)
  }
  let mesh = []
  mesh.vertices = marchingCubesJS(img, dims, isovalue)
  if (mesh.vertices.length < 3) {
    throw new Error('No voxels survive isovalue threshold')
  }
  const ntri = mesh.vertices.length / (3 * 3) // each triangle has 3 vertices, each vertex has 3 components (x,yz,)
  mesh.triangles = new Uint32Array(ntri * 3)
  for (let i = 0; i < mesh.triangles.length; i++) {
    mesh.triangles[i] = i
  }
  mesh = unifyVertices(mesh.vertices, mesh.triangles, isVerbose)
  if (isVerbose) {
    console.log(`Vertices ${mesh.vertices.length / 3} Triangles ${mesh.triangles.length / 3}`)
  }
  // these algoritms should never yield degenerate triangles, but lets check
  mesh.triangles = cullDegenerateTriangles(mesh.triangles, isVerbose)
  laplacian_smoothHC(mesh.vertices, mesh.triangles, smoothIterations)
  // optional affine is a 4x4 spatial transformation matrix
  if (affine.length === 4) {
    mesh = verticesVox2mm(mesh, affine)
  }
  return { vertices: mesh.vertices, triangles: mesh.triangles }
}
