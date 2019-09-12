//target photoshop

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

var savedRulerUnits = app.preferences.rulerUnits;
    var savedTypeUnits = app.preferences.typeUnits;
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;
    
app.activeDocument.duplicate ()

//定义一个变量[document]，用来表示Photoshop的当前文档。
var document = app.activeDocument;

//定义一个变量[bounds]，用来表示文档需要裁切的区域，即裁切从坐标[0,0]至[140,104]的区域。
//注意Photoshop坐标原点在左上角。
var bounds = [300, 140, 700, 280];

//定义一个变量[angle]，用来设置裁切的旋转角度为0。
var angle = 0;

//调用[document]对象的[crop]方法，来裁切当前文档。
document.crop(bounds, angle);

app.activeDocument.layers[0].copy ()

document.close (SaveOptions.DONOTSAVECHANGES)

app.activeDocument.paste ()
var arr = app.activeDocument.layers[0].bounds
//bounds UnitValue 数组
var dx = new UnitValue("0 px")
var dy = new UnitValue("0 px")
dx = dx - arr[0]
dy = dy - arr[1]
app.activeDocument.layers[0].translate(dx, dy)//相对现在的坐标的移动
// ———————————————— 
//版权声明：本文为CSDN博主「李发展」的原创文章，遵循CC 4.0 by-sa版权协议，转载请附上原文出处链接及本声明。
//原文链接：https://blog.csdn.net/fzhlee/article/details/41254819
