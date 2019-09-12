#target photoshop

if (app.preferences.rulerUnits !== Units.PIXELS) {
  // 采用像素单位进行计算
  app.preferences.rulerUnits = Units.PIXELS;
}

// 当前文档引用
var docRef = app.activeDocument;

// 文档宽度
var docWidth = docRef.width;
// 文档高度
var docHeight = docRef.height;

// 细分次数(默认 3 x 3，即九宫格切分)
var divides = 3;

// 宫格间隙(默认无间隙)
var gutter = 0;

// 每宫格宽度
var slotWidth = Math.floor(docWidth / divides);
// 每宫格高度
var slotHeight = Math.floor(docHeight / divides);

// 保存当前图层(即整图)引用
var layerRef = docRef.activeLayer;

var x, y;

// 遍历行
for (y = docWidth; y > 0; y -= slotHeight) {
  // 遍历列
  for (x = docHeight; x > 0; x -= slotWidth) {
    // 重置当前图片为原图层(即整图)
    docRef.activeLayer = layerRef;

    // 从右往左、从下往上设置选区
    docRef.selection.select([
      [x - slotWidth, y - slotHeight], // 左
      [x, y - slotHeight],  // 上
      [x, y], // 右
      [x - slotWidth, y] // 下
    ], SelectionType.REPLACE, 0, false);

    // layer via copy ^-^
    docRef.selection.copy();
    docRef.artLayers.add();
    docRef.paste();

    // 水平轴向间隙偏移
    x -= gutter;
  }
  // 垂直轴向间隙偏移
  y -= gutter;
}

// 删除原图层(即整图)
layerRef.remove();