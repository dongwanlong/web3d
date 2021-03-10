// LookAtTriangles.js (c) 2012 matsuda
// Vertex shader program
var eyeX = 0, eyeY = 0, eyeZ = 0;
var gAngle = 0;
var gl, n;

var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'uniform mat4 u_ViewMatrix;\n' +
  'uniform mat4 u_TransformMatrix;\n' +
  
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_Position = u_ViewMatrix * u_TransformMatrix  * a_Position;\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'void main() {\n' +
  '  gl_FragColor = texture2D(u_Sampler, v_TexCoord);\n' +
  '}\n';

function main() {
  var canvas = document.getElementById('webgl');

  gl = getWebGLContext(canvas);
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
  n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the vertex information');
    return;
  }

  initTextures(gl)

}

function paint(currentAngle){
  var canvas = document.getElementById("webgl");
  gl.clearColor(0, 0, 0, 1);

  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) { 
    console.log('Failed to get the storage locations of u_ViewMatrix');
    return;
  }

  var viewMatrix = new Matrix4();
  // viewMatrix.setLookAt(eyeX, eyeY, eyeZ, 0, 0, -1, 0, 1, 0);
  viewMatrix.setPerspective(30.0, canvas.width / canvas.height, 1.0, 100.0);
  viewMatrix.setLookAt(3.0, 3.0, 7.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  var u_RoateMatrix = gl.getUniformLocation(gl.program, 'u_RoateMatrix');
  if (!u_RoateMatrix) { 
    console.log('Failed to get the storage locations of u_RoateMatrix');
    return;
  }

  var roateMatrix = new Matrix4();
  roateMatrix.rotate(currentAngle[0], 1.0, 0.0, 0.0); // Rotation around x-axis
  roateMatrix.rotate(currentAngle[1], 0.0, 1.0, 0.0); // Rotation around y-axis
  gl.uniformMatrix4fv(u_RoateMatrix, false, roateMatrix.elements);
  

  // var u_projMatrix = gl.getUniformLocation(gl.program, 'u_projMatrix');
  // if (!u_projMatrix) { 
  //   console.log('Failed to get the storage locations of u_projMatrix');
  //   return;
  // }

  // var projMatrix = new Matrix4();
  // projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, 1.0, -1.0);
  // gl.uniformMatrix4fv(u_projMatrix, false, projMatrix.elements);


  // gl.frontFace(gl.CCW);
  // gl.enable(gl.CULL_FACE);
  //gl.cullFace(gl.BACK);
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFR_BIT);

  //gl.drawArrays(gl.LINES, 0, n);
  // gl.drawArrays(gl.LINE_STRIP, 0, n);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}


function getCircle(n, r, z, t){
  let buffer = [];
  let angle = Math.PI*2/n;

  for(let i=0;i<n;++i){
    let x = Math.cos(angle*i)*r;
    let y = Math.sin(angle*i)*r;
    buffer.push([x, y, z, i/n, t]);
  }

  let lastPoint = buffer[buffer.length-1];
  let fristPoint = buffer[0];
  //buffer.push([lastPoint[0], lastPoint[1], lastPoint[2],0, t]);
  buffer.push([fristPoint[0], fristPoint[1], fristPoint[2], 1, t]);


  return buffer;
}

function getBall(nh, n, r){
  let buffer = [];
  let points = [];
  let h = r*2;

  for(let i=0;i<=nh;++i){
    let z = -h/2+(h/nh)*i;
    let rCircle = Math.sqrt(r*r-z*z);
    points.push(getCircle(n, rCircle, z, i/nh));
  }

  for(let i=0;i<points.length-1;++i){
    for(let j=0;j<points[i].length;++j){
      buffer = buffer.concat(points[i][j]);//v0
      buffer = buffer.concat(points[i+1][j]);//v1
    }

    buffer = buffer.concat(points[i+1][points[i].length-1]);
    buffer = buffer.concat(points[i+1][0]);
  }

  return {
    buffer,
    n:parseInt(buffer.length/5),
  }
}

function initVertexBuffers(gl) {
  let { n, buffer } = getBall(40, 40, 0.7);

  var verticesColors =  new Float32Array(buffer);

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
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0);
  gl.enableVertexAttribArray(a_Position);

  // Unbind the buffer object
  // gl.bindBuffer(gl.ARRAY_BUFFER, null);


  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) {
    console.log('Failed to get the storage location of a_TexCoord');
    return -1;
  }
  // Assign the buffer object to a_TexCoord variable
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3);
  gl.enableVertexAttribArray(a_TexCoord);  // Enable the assignment of the buffer object


  return n;
}

window.onload = function(){
  // document.addEventListener('keydown', e=>{
  //   // if(e.key=="w"){
  //   //   eyeY += 0.01;
  //   // }else if(e.key=="s"){
  //   //   eyeY -= 0.01;
  //   // }else if(e.key=="a"){
  //   //   eyeX += 0.01;
  //   // }else if(e.key=="d"){
  //   //   eyeX -= 0.01;
  //   // }
  //   if(e.key=="w"){
  //     gAngle+=2;
  //   }else if(e.key=="s"){
  //     gAngle-=2;
  //   }

  //   // gAngle = Math.max(0, gAngle);
  //   // gAngle = Math.min(360, gAngle)
  //   console.log("角度", gAngle);
  //   paint();
  // })
  let dom = document.getElementById("webgl");
  var currentAngle = [0.0, 0.0];

  initEventHandlers(dom, currentAngle);


  main();

  var tick = function() {   // Start drawing
    paint(currentAngle);
    requestAnimationFrame(tick);
  };
  tick();
}

function initEventHandlers(canvas, currentAngle) {
  var dragging = false;         // Dragging or not
  var lastX = -1, lastY = -1;   // Last position of the mouse

  canvas.onmousedown = function(ev) {   // Mouse is pressed
    var x = ev.clientX, y = ev.clientY;
    // Start dragging if a moue is in <canvas>
    var rect = ev.target.getBoundingClientRect();
    if (rect.left <= x && x < rect.right && rect.top <= y && y < rect.bottom) {
      lastX = x; lastY = y;
      dragging = true;
    }
  };

  canvas.onmouseup = function(ev) { dragging = false;  }; // Mouse is released

  canvas.onmousemove = function(ev) { // Mouse is moved
    var x = ev.clientX, y = ev.clientY;
    if (dragging) {
      var factor = 100/canvas.height; // The rotation ratio
      var dx = factor * (x - lastX);
      var dy = factor * (y - lastY);
      // Limit x-axis rotation angle to -90 to 90 degrees
      currentAngle[0] = Math.max(Math.min(currentAngle[0] + dy, 90.0), -90.0);
      currentAngle[1] = currentAngle[1] + dx;
    }
    lastX = x, lastY = y;
  };
}

function initTextures() {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  // Get the storage location of u_Sampler
  var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (!u_Sampler) {
    console.log('Failed to get the storage location of u_Sampler');
    return false;
  }
  var image = new Image();  // Create the image object
  if (!image) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image.onload = function(){ loadTexture(gl, texture, u_Sampler, image); };
  // Tell the browser to load an image
  image.src = './a.jpg';

  return true;
}

function loadTexture(gl, texture, u_Sampler, image) {
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler, 0);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  // paint();
  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
}
