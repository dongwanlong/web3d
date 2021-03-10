import './lib/webgl-utils.js'
import './lib/webgl-debug.js'
import './lib/cuon-utils.js'
import './lib/cuon-matrix.js'

//顶点着色器
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '}\n';

//片原着色器
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';

export default class World{
    constructor(id){
        this.shapes = [];
        let canvas = document.getElementById(id);
        let gl = getWebGLContext(canvas);
        if(!gl)throw new Error("webgl实例创建失败");
        this.gl = gl;

        if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)){
            throw new Error("着色器初始化失败");
        }
    }
    render(){
        let { gl, shapes } = this;
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFR_BIT);

        for(let shape of shapes){
            let vertices =  new Float32Array(shape.vertices);
            let n = this.bindAttribVal('a_Position', vertices);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
        }
    }
    addShape(shape){
        this.shapes.push(shape);
        this.render();
    }
    bindAttribVal(key, data){
        let { gl } = this;
        let buffer = gl.createBuffer();
        if (!buffer) {
            return false;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        let attribute = gl.getAttribLocation(gl.program, key);
        if (attribute < 0) {
            return false;
        }

        gl.vertexAttribPointer(attribute, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attribute);

        return true;  
    }
    bindUniformVal(key, data){
        
    }
}