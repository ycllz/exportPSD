
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