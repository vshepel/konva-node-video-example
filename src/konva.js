import Konva from 'konva';
import canvas from 'canvas'

    Konva.Util.createCanvasElement = () => {
    const node = new canvas.Canvas();
    node.style = {};
    return node;
};

Konva.Util.createImageElement = () => {
    const node = new canvas.Image();
    node.style = {};
    return node;
};

export default Konva
