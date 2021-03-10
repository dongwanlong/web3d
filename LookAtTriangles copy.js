// LookAtTriangles.js (c) 2012 matsuda
// Vertex shader program
var eyeX = 0, eyeY = 0, eyeZ = 0;


var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_ViewMatrix * a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n' +
  '}\n';

function main() {
  var canvas = document.getElementById('webgl');

  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Set the vertex coordinates and color (the blue triangle is in the front)
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  // Specify the color for clearing <canvas>
  gl.clearColor(0, 0, 0, 1);

  // Get the storage location of u_ViewMatrix
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) { 
    console.log('Failed to get the storage locations of u_ViewMatrix');
    return;
  }

  // Set the matrix to be used for to set the camera view
  var viewMatrix = new Matrix4();
  //viewMatrix.setLookAt(0, 0, 0, 0, 0, -1, 0, 1, 0);
  viewMatrix.setLookAt(eyeX, eyeY, eyeZ, 0, 0, -1, 0, 1, 0);
  // Set the view matrix
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw the rectangle
  // gl.drawArrays(gl.TRIANGLES, 0, n);
  // gl.drawArrays(gl.LINE_LOOP, 0, n);
  // gl.drawArrays(gl.LINES, 0, n);
  // gl.drawArrays(gl.POINTS, 0, n);
   gl.drawArrays(gl.LINE_STRIP, 0, n);
  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}

function paint(gl){
  gl.clearColor(0, 0, 0, 1);

  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) { 
    console.log('Failed to get the storage locations of u_ViewMatrix');
    return;
  }

  var viewMatrix = new Matrix4();
  viewMatrix.setLookAt(eyeX, eyeY, eyeZ, 0, 0, -1, 0, 1, 0);

  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.LINE_STRIP, 0, n);
}


function getCircle(n, r, z){
  let buffer = [];
  let angle = Math.PI*2/n;

  for(let i=0;i<n;++i){
    let x = Math.cos(angle*i)*r;
    let y = Math.sin(angle*i)*r;
    buffer.push([x, y, z]);
  }

  return buffer;
}

function getBall(nh, n, r){
  let buffer = [];
  let points = [];
  let h = r*2;

  for(let i=0;i<nh;++i){
    let z = -h/2+(h/nh)*i;
    let rCircle = r;
    points.push(getCircle(n, rCircle, z));
  }
  

  for(let i=0;i<points.length-1;++i){
    for(let j=0;j<points[i].length;++j){
      buffer = buffer.concat(points[i][j]);//v0
      buffer = buffer.concat(points[i+1][j]);//v1
    }

    buffer = buffer.concat(points[i+1][points[i].length-1]);
    buffer = buffer.concat(points[i+1][points[i].length-1]);
  }

  return {
    buffer,
    n:buffer.length,
  }

  // let buffer = [];
  // let h = r*2;
  // for(let i=0;i<nh;++i){
  //   let z = -h/2+(h/nh)*i;
  //   let rCircle = r;//Math.sqrt(r*r-z*z);
  //   buffer = buffer.concat(getCircle(n, rCircle, z));
  // }
  // return {
  //   buffer,
  //   n:nh*n,
  // }
}

function initVertexBuffers(gl) {
  let { n, buffer } = getBall(18, 18, 0.5);
  
  var verticesColors =  new Float32Array(n*3);
  verticesColors.set(buffer,0);

  // Create a buffer object
  var vertexColorbuffer = gl.createBuffer();  
  if (!vertexColorbuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Write the vertex coordinates and color to the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.DYNAMIC_DRAW);

  var FSIZE = verticesColors.BYTES_PER_ELEMENT;
  // Assign the buffer object to a_Position and enable the assignment
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if(a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return -1;
  }
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 3, 0);
  gl.enableVertexAttribArray(a_Position);

  // Unbind the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n;
}

window.onload = function(){
  document.addEventListener('keydown', e=>{
    console.log(111, e.key);
    if(e.key=="w"){
      eyeY += 0.01;
    }else if(e.key=="s"){
      eyeY -= 0.01;
    }
  })

  main();
}
