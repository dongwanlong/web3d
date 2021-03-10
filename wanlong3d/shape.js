export default class Shape{
    constructor(){
        this.vertices = [];
        this.pos = { x:0, y:0, z:0 };
    }
}

export class Cube extends Shape{
    constructor({ lenX, lenY, lenZ, x, y, z }){
        this.shapeOpt = { lenX:0.5, lenY:0.5, lenZ:0.5 };
        if(lenX)this.shapeOpt.lenX = lenX;
        if(lenY)this.shapeOpt.lenY = lenY;
        if(lenZ)this.shapeOpt.lenZ = lenZ;
        if(x)this.pos.x = x;
        if(y)this.pos.y = y;
        if(z)this.pos.z = z;
        this.init();
    }
    init(){
        let { lenX, lenY, lenZ } = this.shapeOpt;
        this.vertices.push({x:0,y:0.5,z:0});
        this.vertices.push({x:-0.5,y:-0.5,z:0});
        this.vertices.push({x:0.5,y:-0.5,z:0});
    }
}