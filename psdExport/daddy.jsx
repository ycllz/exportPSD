﻿

// var rootPath = "E:/new game/art/ui/assets";
// var exmlPath = "E:/new game/art/ui";

//目录请配置在config.txt 文件中

var rootPath = ""//"E:/stoneage/art/ui/assets";
var exmlPath = ""//"E:/stoneage/art/ui";


var imageQuality = 85;//导出图片质量
var usePNG8 = false;//是否使用png8 导出图片
var isCoverCommonImage = false;//是否重新导出通用组件，命名带 cm 的
var isCoverNonCommonImage = true;//是否重新导出非通用组件 命名不带 cm 的


var exmlContents="";
var slantingBar = "/";
var LB = "\n"
var tabsDeep = ["","\t", "\t\t", "\t\t\t", "\t\t\t\t", "\t\t\t\t\t", "\t\t\t\t\t\t", "\t\t\t\t\t\t\t", "\t\t\t\t\t\t\t\t"]
var deepIndex = 1;

var scaleImage = 1

var dupDoc;
var imageExportPathMap = {}
var exportLayers = []
var spaceNameLayer = []

//定义一个变量[doc]，表示当前文档。
var doc = app.activeDocument;

var rootDir
var exmlDir
var psdFileName

var pngSaveOptions
var jpgSaveOptions

var pathExist = true
initData();
if(pathExist){
    parsePSDFile();
}

function initData(){
    // var pathArr = $.fileName.split("/");
    // //盘符
    // var confPath = pathArr[1] + ":/";

    // var pathLen = pathArr.length - 1;
    // var rootPathLen = (pathArr.length>3) ? pathArr.length - 3 : pathArr.length - 1;

    // for(var i= 2; i<pathLen; i++){
    //     confPath = confPath + pathArr[i] + "/"
    // }

    // confPath = confPath + "config.txt"
    // var configFile = new File(confPath)
    // configFile.open("r")
    // var fileStrMap = {}
    // while(!configFile.eof){
    //     var str = configFile.readln();
    //     if(str.indexOf("#")==0){
    //         continue
    //     }
    //     var strArr = str.split("=");
    //     fileStrMap[strArr[0]] = strArr[1];
    // }

    // rootPath = fileStrMap["rootPath"] + "/"
    // exmlPath = fileStrMap["exmlPath"] + "/psdExport/"

    // imageQuality = parseInt(fileStrMap["imageQuality"]);
    
    //增加功能：删除所有空图层
    
    //脚本运行路径 $.fileName
    var pathArr = $.fileName.split("/");
    //盘符
    var confPath = pathArr[1] + ":/";
    //rootPath = confPath;
    scriptPath = confPath;

    var pathLen = pathArr.length - 1;
    var rootPathLen = (pathArr.length>3) ? pathArr.length - 3 : pathArr.length - 1;

    for(var i= 2; i<pathLen; i++){
        confPath = confPath + pathArr[i] + "/"
        if(i<rootPathLen){
            rootPath = rootPath + pathArr[i] + "/"
        }
    }
    scriptPath = confPath;
    //rootPath = rootPath + "总美术上传文件/ui/";
    
    confPath = confPath + "config.txt"
    var configFile = new File(confPath)
    configFile.open("r")
    var fileStrMap = {}
    while(!configFile.eof){
        var str = configFile.readln();
        if(str.indexOf("#")==0){
            continue
        }
        var strArr = str.split("=");
        fileStrMap[strArr[0]] = strArr[1];
    }
    
    rootPath = fileStrMap["rootPath"]
    exmlPath = fileStrMap["exmlPath"]

    rootPath = rootPath + "/"
    exmlPath = exmlPath + "/psdExport/"
    
    pngSaveOptions = new PNGSaveOptions();
    pngSaveOptions.compression = 0
    pngSaveOptions.interlaced = false

    jpgSaveOptions = new JPEGSaveOptions();
    jpgSaveOptions.embedColorProfile = true;
    jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
    jpgSaveOptions.matte = MatteType.NONE;
    jpgSaveOptions.quality = 10
    
    jpgSaveOptions.quality = 10
    pngSaveOptions.compression = 0;

    try {
        var folder = new Folder(rootPath)
        if(folder.exists){
            pathExist = true
        }else{
            pathExist = false
        }
    } catch (error) {
        pathExist = false
    }
    if(!pathExist){
        alert("目录不存在 -> " + rootPath)
    }
    
}

function parsePSDFile(){
    var savedRulerUnits = app.preferences.rulerUnits;
    var savedTypeUnits = app.preferences.typeUnits;
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;

    var stageWidth = app.activeDocument.width.as("px") * scaleImage;
    var stageHeight = app.activeDocument.height.as("px") * scaleImage;
    
    //保存exml文件的文件名
    var name = decodeURI(app.activeDocument.name);
	psdFileName = name.substring(0, name.indexOf("."));
    if(psdFileName==""){
        psdFileName = name;
    }
	rootDir = rootPath;//app.activeDocument.path + 
    exmlDir = exmlPath + psdFileName + "/";
    new Folder( rootDir ).create();
    new Folder( exmlDir ).create();
    
    dupDoc = app.activeDocument.duplicate()
    
    /**　检出需要导出图层 */
    var layers = app.activeDocument.layers
    var len = layers.length;
    for(var i=len-1; i>=0; i--){
        var layer = layers[i];
        //bounds UnitValue 数组
        //图层区域。只读。[0,1,2,3] 分别是 0:左侧左边距 ，1:顶侧顶边距 ，2:右侧左边距 ，3:底侧顶边距。
        if(layer.visible){
            if(isExportLayer(layer) && (!layer.isBackgroundLayer)){//这个图层需要导出
                exportLayers.push(layer);
            }
        }
    }
    
    /** 开始处理需要导出图层 */
    exmlContents = ""
    deepIndex = 1;
    var exLen = exportLayers.length;
    for(var i=0; i<exLen; i++){
        app.activeDocument = dupDoc;
        var layer = exportLayers[i];
        if(layer.visible){
            app.activeDocument.activeLayer = layer;
            exmlContents = concatString(exmlContents, parseLayer(layer, deepIndex))
        }
        
    }
    

    var className = psdFileName
    /** exml 文件输出 */
    exmlContents =
    '<?xml version="1.0" encoding="utf-8"?>'+LB
    +'<e:Skin class="' + className + 'Skin" width="720" height="1280" xmlns:e="http://ns.egret.com/eui" xmlns:w="http://ns.egret.com/wing" >'+LB
    +exmlContents+LB
    +'</e:Skin>'
    
    saveEXML(exmlDir, psdFileName, exmlContents)
    exportDocument(dupDoc)

    activeDocument.close(SaveOptions.DONOTSAVECHANGES);

    var picPath = ""
    for(var key in imageExportPathMap){
        picPath = picPath + imageExportPathMap[key] + "\n"
    }
    var spaceNameStr = "\n\n名字包含空格图层：\n"
    for(var key in spaceNameLayer){
        spaceNameStr = spaceNameStr + spaceNameLayer[key] + "\n"
    }
    spaceNameStr = spaceNameStr + "\n";
    
    var strEnd = "\n\n请记得也把导出exml文件提交svn\n\n图片该怎么处理就怎么处理";
    var alertStr = "本次导出的图片文件都在目录：\n" + picPath + "\n本次导出的exml文件都在目录：\n" + exmlDir + spaceNameStr + strEnd;
    alert(alertStr)
    $.gc();
}


function saveEXML(path, fileName, contents) {
    var file = new File(path + fileName + ".exml");
    file.remove();
    file.open("a");
    file.lineFeed = "\n";
    file.encoding="utf-8";
    file.write(contents);
    file.close();
}

function parseLayer(layer, deepIndex) {
    exmlContents = ""
    if(layer && layer.visible && isListComponent (layer.name)){//列表，特殊的图层组
        //exmlContents = concatString(exmlContents, exportList(layer, deepIndex))
        exmlContents = exportList(layer, deepIndex)
    }
    else if(layer && layer.visible && isBtn(layer)){
        //exmlContents = concatString(exmlContents, exportBtn(layer, deepIndex))
        exmlContents = exportBtn(layer, deepIndex);
    }
    else if(layer && layer.typename == "LayerSet"){//判断是否是图层组
        // exmlContents = concatString(exmlContents, exportLayerSet( layer, deepIndex))
        exmlContents = exportLayerSet(layer, deepIndex);
    }
    else if(layer){//图层，每个模块自己的图片 文本
        // exmlContents = concatString(exmlContents, exportArtlayer( layer, deepIndex))
        exmlContents = exportArtlayer(layer, deepIndex);
    }
    return exmlContents;
}

/** 图层组*/
function exportLayerSet( layerSet, deepIndex ){
    var layerSetString = "";
    for (var i =0; i<layerSet.layers.length; i++){
        var layer = layerSet.layers[i];
        if(layer && layer.visible && isListComponent (layer.name)){//列表，特殊的图层组
            layerSetString = concatString(layerSetString, exportList(layer, deepIndex))
            // exmlContents = exportList(layer, deepIndex)
        }
        else if(layer && layer.visible && isBtn(layer)){
            layerSetString = concatString(layerSetString, exportBtn(layer, deepIndex))
            // exmlContents = exportBtn(layer, deepIndex);
        }
        else if(layer && layer.visible && layerSet.layers[i].typename == "LayerSet"){//是否是图层组
            //layerSetString = layerSetString + getLayerSetString( layerSet[i], deepIndex );
            //exportLayerSet( layerSet.layers[i], deepIndex+1 );//递归
            layerSetString = concatString(layerSetString, exportLayerSet( layerSet.layers[i], deepIndex+1 ) );//递归
        }
        else if(layer && layer.visible){
            //一般图层
            layerSetString = concatString(layerSetString, exportArtlayer( layerSet.layers[i], deepIndex ))
        }
    }
    // $.writeln (layerSet.name)
    // $.writeln (layerSetString)
    return layerSetString;
}
/**一般图层*/
function exportArtlayer( layer, deepIndex ){
    //9宫的才需要在程序中设定宽高，其他的不用
    if(isSpaceNameLayer (layer)){
        //return ""
    }
    if(isCopyLayer(layer)){
        return "";
    }
    else if(layer.visible &&  isScaleImage (layer) ){
        var constr = getScaleImageString(layer, deepIndex);
        return constr
    }
    else if(layer.visible &&  isUIPicture(layer) ){
        return getImageString(layer, deepIndex)
    }
    else if(layer.visible &&  isTxt(layer) ){
        return getTxtString(layer, deepIndex)
    }
}

/** 列表*/
function exportList( layer, deepIndex ){
    var coords = getXYWH(layer);

    var layout = ""
    if(layer.name.indexOf("h")>=0 || layer.name.indexOf("H")>=0){
        layout = '<e:HorizontalLayout gap="5"/>'
    }else if(layer.name.indexOf("v")>=0 || layer.name.indexOf("V")>=0){
        layout = '<e:VerticalLayout gap="5"/>'
    }else{
        // list_t_x :x列纵向滚动，行是无限的
        var arr = layer.name.split("_")
        var requestedColumnCount = arr[2]
        if(requestedColumnCount == undefined){
            requestedColumnCount = 1
        }
        layout = '<e:TileLayout horizontalGap="5" verticalGap="5" requestedColumnCount="'+ requestedColumnCount +'"/>'
    }
    
    var str = ""
    str = str + tabsDeep[deepIndex] + '<e:Scroller id="scroller'+ layer.itemIndex +'" x="'+ coords[0] +'" y="'+ coords[1] +'" width="' + coords[2] + '" height="' + coords[3] + '" >'
    str = str + LB + tabsDeep[deepIndex+1] + '<e:List id="' + layer.name + layer.itemIndex  + '" >'
    str = str + LB + tabsDeep[deepIndex+1] + '<e:layout>'
    str = str + LB + tabsDeep[deepIndex+1] + layout
    str = str + LB + tabsDeep[deepIndex+1] + '</e:layout>'
    str = str + LB + tabsDeep[deepIndex+1] + '</e:List>'
    str = str + LB + tabsDeep[deepIndex] + '</e:Scroller>'
    
    parseItem(layer)
    
    return str;
}

function parseItem(layer) {
    var itemstring = exportListItem(layer);
    var coords = getXYWH(layer)
    
    var className = psdFileName + "Item"
    exmlContents =
    '<?xml version="1.0" encoding="utf-8"?>'+LB
    +'<e:Skin class="' + className + 'Skin" width="'+coords[2]+'" height="'+coords[3]+'" xmlns:e="http://ns.egret.com/eui" xmlns:w="http://ns.egret.com/wing" >'+LB
    +itemstring+LB
    +'</e:Skin>'
    
    saveEXML(exmlPath + psdFileName + slantingBar, className, exmlContents)
}

function exportListItem( layerSet ){
    var itemLayer = layerSet;
    if(layerSet.typename == "LayerSet"){
        for (var i =0; i<layerSet.layers.length; i++){
            var layer = layerSet.layers[i];
            if(layer.visible && isItemComponent(layer.name)){
                item = layerSet.layers[i];
                itemLayer = item;
                break;
            }
        }
    }
    
    /** itemIndex
        
        <?xml version="1.0" encoding="utf-8"?>
        <e:Skin class="ChildEquipItemSkin" width="130" height="175" xmlns:e="http://ns.egret.com/eui" xmlns:w="http://ns.egret.com/wing" >
        
        </e:Skin>
    */
    var componentString = "";
    if(itemLayer){
        if(itemLayer.typename == "LayerSet"){//是否是图层组
            componentString= concatString(componentString, exportLayerSet(itemLayer, 1))
        }
        else{
            //一般图层
            componentString = concatString(componentString, exportArtlayer( layerSet[i]))
        }
    }
    return componentString;
}

function exportBtn(layerSet, deepIndex) {
    //<e:Button id="buy10" x="368" y="0" label="" icon="ui_cz_gm10g" skinName="Btn8Skin"/>
    var layerSetString = "";
    var layername = ""
    var txt = ""
    var coords = getXYWH(layerSet)
    for (var i =0; i<layerSet.layers.length; i++){
        var layer = layerSet.layers[i];
        if(layer.visible && isUIPicture(layer)){
            layername = getImageName(layer)
            // layerSetString = concatString(layerSetString, exportArtlayer( layer, deepIndex ))
        }else if(layer.visible && isTxt(layer)){
            txt = layer.textItem.contents
            // layerSetString + concatString(layerSetString, exportArtlayer( layer, deepIndex ))
        }
    }
    return LB + tabsDeep[deepIndex]+'<e:Button id="btn'+layerSet.itemIndex+'" x="'+coords[0]+'" y="'+coords[1]+'" label="'+txt+'" icon="'+layername+'" skinName="CommonBtn2Skin"/>';
}

function getTxtString(layer, deepIndex) {
    if(layer.kind == LayerKind.TEXT){
        var coords = getXYWH(layer)
        var color = layer.textItem.color.rgb.hexValue;
        var dir = layer.textItem.direction
        if(color == undefined){
            color = 0x60402f
        }else{
            color = '0x' + color;
        }
        var size = layer.textItem.size
        if(size == undefined){
            size = 25
        }
        size = Math.floor (size)
        var txtid = layer.name.replace ("拷贝", "Copy");
        txtid = txtid.replace(/\s+/g,"")
        return LB + tabsDeep[deepIndex]+'<e:Label id="'+txtid+layer.itemIndex+'" text="'+layer.textItem.contents  +'" x="'+coords[0]+'" y="'+coords[1]+'" multiline="true" wordWrap="true" textColor="'+color+'" />';
    }
}

function getScaleImageString(layer, deepIndex) {
    var coords = getXYWH(layer)
    //导出图片
    // var arr = layer.name.split("@")
    // var grids = arr[1].split("_")//第五个的xy宽高
    var layernameAndPercent = trimPercent(layer)
    var layername = layernameAndPercent[0]
    var percent = layernameAndPercent[1]
    var percentString = ''
    if(percent==undefined || percent==""){
        
    }else{
        percentString = '<!--'+ percent + '-->'
    }

    var grids = saveScalePiture(layer);
    var gridStr = grids[0] + "," + grids[1] + "," + grids[2] + "," + grids[3];
    var scaleStr = LB + tabsDeep[deepIndex+1] +'<e:Image x="'+coords[0]+'" y="'+coords[1]+'" width="'+coords[2]+'" height="'+coords[3]+'" source="'+getImageName(layer)+'" scale9Grid="'+gridStr+'"/>' + percentString;
    return scaleStr;
}

function getImageString(layer, deepIndex) {
    var coords = getXYWH(layer);
    var layernameAndPercent = trimPercent(layer)
    var layername = layernameAndPercent[0]
    var percent = layernameAndPercent[1]
    var percentString = ''
    if(percent==undefined || percent==""){
        
    }else{
        percentString = '<!--'+ percent + '-->'
    }

    //导出图片
    savePicture(layer);
    return LB + tabsDeep[deepIndex+1] +'<e:Image x="'+coords[0]+'" y="'+coords[1]+'" width="'+coords[2]+'" height="'+coords[3]+'" source="'+getImageName(layer)+'" />' + percentString
}

function savePicture(layer){
    // var bounds = layer.boundsNoEffects;
	//  //计算当前图层的宽度，为范围数组变量的第三个值与第一个值的差。
	// var width = bounds[2] - bounds[0];
	//  //计算当前图层的高度，为范围数组变量的第四个值与第二个值的差。
	// var height = bounds[3] - bounds[1];
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;
    var coords = getXYWH (layer)
    
    //var arr = layer.name.split("@")
    //var grids = arr[1].split("_")
    //var nameStr = arr[0].split("_")

    var layernameAndPercent = trimPercent(layer)
    var layername = layernameAndPercent[0]
    var percent = layernameAndPercent[1]
    
    var nameStr = layername.split("_");
    var picName = "";
    var len = nameStr.length;
    if(!isScaleImage(layer) && isJPG(layer)){
        len = nameStr.length - 1;
    }
    for(var i=0; i<len; i++){
        var tmp = nameStr[i]
        tmp = tmp.toLowerCase()
        if(tmp=="png" || tmp=="jpg"){
            break
        }
        if(i==0){
            picName = nameStr[i]
        }else{
            picName = picName + "_" + nameStr[i]
        }
    }
    //blur number 模糊图像，默认 0.0 不模糊
    //定义一个变量[option]，表示图片的输出格式。
    var option = new ExportOptionsSaveForWeb();
    //设置图片输出时支持透明度。
    option.transparency = true;
    //设置图片输出的色彩范围为256色。
    option.colors = 256;
    option.format = SaveDocumentType.PNG;
    option.PNG8 = usePNG8;
    option.quality = imageQuality;//品质 。（0~100）。
    option.transparency = true;
    
    var pictureType = "png"
    if(!isScaleImage(layer) && isJPG(layer)){
        pictureType = "jpg"
        //设置图片输出的格式为GIF格式。
        option.format = SaveDocumentType.JPEG;
        option.optimized = true;
    }
    var path = rootPath + nameStr[1] + slantingBar
    new Folder(path).create();
    var fileName = path + picName + "."+pictureType
    //定义一个变量[file]，作为图层输出的路径。
    var file = new File(fileName);
    
    if(!needExportImage(file, layer, fileName)){
        return
    }
    imageExportPathMap[path] = path;
    layer.rasterize (RasterizeType.SHAPE)
    
    layer.copy();
    //创建一个新文档，新文档的尺寸为拷贝到内存中图层的尺寸一致。
    //宽带, 高度, 分辨率resolution, 名称, 文档颜色模式, 背景内容, 像素长宽比, 颜色位数, 色彩管理 
    var pxWidth = new UnitValue( coords[2] + " px");
    var pxHeight = new UnitValue( coords[3] + " px");
	app.documents.add(pxWidth, pxHeight, doc.resolution, picName, NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
    var curdoc = app.documents.getByName (picName)
    //将内存中的图层，复制到新文档。
    var pasteLayer = app.activeDocument.paste();
    pasteLayer.opacity = layer.opacity;
    //调用[activeDocument]对象的[exportDocument]方法，将新文档导出为SaveDocumentType图片。
    curdoc.exportDocument(file, ExportType.SAVEFORWEB, option);
    
    file.close();
    
    //调用[activeDocument]对象的[close]方法，关闭新文档。[close]方法内的参数，表示关闭新文档时，不再存储新文档。
    curdoc.close(SaveOptions.DONOTSAVECHANGES);
    //将Photoshop的当前文档，重置为网页设计稿文档。
    //app.activeDocument = doc;
    $.gc()
}

function validateScaleImage(layer, layerw, layerh, slicePaddingArr){
    if( (slicePaddingArr[0] + slicePaddingArr[2] - 4) > layerw ){
        //$.writeln("九宫图像图层【" + layer.name +  "】九宫图片宽度 大于 图片宽度值了！");
    }
    if( (slicePaddingArr[1] + slicePaddingArr[3] - 4) > layerh ){
        //$.writeln("九宫图像图层【" + layer.name +  "】九宫图片高度 大于 图片高度值了！");
    }
}

function needExportImage(file, layer, fileName) {
    if(file.exists){
        if(!isCoverCommonImage){
            file.close()
            // writeLog("文件已经存在--> " + fileName)
            return false;
        }
        if(!isCoverNonCommonImage){
            file.close()
            // writeLog("文件已经存在--> " + fileName)
            return false;
        }
    }
    return true;
}

function saveScalePiture(layer){
    
    var layerXYWh = getXYWH (layer)

    var layernameAndPercent = trimPercent(layer)
    var layername = layernameAndPercent[0]
    var percent = layernameAndPercent[1]
    
    var arr = layername.split("@")
    var nameStr = arr[0].split("_")
    var middleXYWH = arr[1].split("_")//中间矩形的xy宽高
    
    
    var layerX = Number(layerXYWh[0])
    var layerY = Number(layerXYWh[1])
    var layerW = Number(layerXYWh[2])
    var layerH = Number(layerXYWh[3])

    var middleX = Number(middleXYWH[0])
    var middleY = Number(middleXYWH[1])
    var middleW = Number(middleXYWH[2])
    var middleH = Number(middleXYWH[3])
    // var nameStr = layer.name.split("_")
    
    var slicePaddingArr = []//第一个与第四个的宽高 Result: 300,140,280,160
    var sliceArr = []
    if(arr.length==3){//第三个是切psd中的大图的，然后合成小图
        sliceArr = arr[2].split("_")//用来切psd中大图
        //9宫图上下左右不对称的
        var middleSliceX = Number(sliceArr[0])
        var middleSliceY = Number(sliceArr[1])
        var middleSliceW = Number(sliceArr[2])
        var middleSliceH = Number(sliceArr[3])

        slicePaddingArr[0] = Math.floor(middleSliceX + (middleSliceW>>1))
        slicePaddingArr[1] = Math.floor(middleSliceY + (middleSliceH>>1))
        slicePaddingArr[2] = Math.floor(middleSliceX + (middleSliceW>>1))
        slicePaddingArr[3] = Math.floor(middleSliceY + (middleSliceH>>1))
    }
    else{
        //9宫图是左右上下一样的，对称的
        slicePaddingArr[0] = Math.floor(middleX + (middleW>>1))
        slicePaddingArr[1] = Math.floor(middleY + (middleH>>1))
        slicePaddingArr[2] = Math.floor(middleX + (middleW>>1))
        slicePaddingArr[3] = Math.floor(middleY + (middleH>>1))
    }
    

    var picName = "";
    var nameLen = nameStr.length;
    
    for(var i=0; i<nameLen; i++){
        if(picName == ""){
            picName = nameStr[i]
        }else{
            picName = picName + "_" + nameStr[i]
        }
    }
    picName = picName + "@" + middleXYWH[0] + "_" + middleXYWH[1] + "_" + middleXYWH[2] + "_" + middleXYWH[3];

    var scaleDocName = "scaleDoc"  
    
    //blur number 模糊图像，默认 0.0 不模糊
    //定义一个变量[option]，表示图片的输出格式。
    var option = new ExportOptionsSaveForWeb();
    //设置图片输出时支持透明度。
    option.transparency = true;
    //设置图片输出的色彩范围为256色。
    option.colors = 256;
    option.format = SaveDocumentType.PNG;
    option.PNG8 = usePNG8;
    option.quality = imageQuality;//品质 。（0~100）。
    option.transparency = true;
    
    var pictureType = "png"
    if(!isScaleImage(layer) && isJPG(layer)){
        pictureType = "jpg"
        //设置图片输出的格式为GIF格式。
        option.format = SaveDocumentType.JPEG;
        option.optimized = true;
    }
    var path = rootPath + nameStr[1] + slantingBar
    new Folder(path).create();
    var scaleDocName = path + picName + "."+pictureType
    //定义一个变量[file]，作为图层输出的路径。
    var file = new File(scaleDocName);
    if(!needExportImage(file, layer, scaleDocName)){
        return middleXYWH
    }

    layer.copy();
    
    imageExportPathMap[path] = path;
    
    var pxWidth = new UnitValue( (layerW) + " px");
    var pxHeight = new UnitValue( (layerH) + " px");

    //宽带, 高度, 分辨率resolution, 名称, 文档颜色模式, 背景内容, 像素长宽比, 颜色位数, 色彩管理
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;
    //创建一个新文档，新文档的尺寸为裁切后4个区域拼起来的尺寸,保存裁切后的图片，拼起来
    app.documents.add(pxWidth, pxHeight, dupDoc.resolution, picName, NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
    var pasteLayer = app.activeDocument.paste();
    pasteLayer.opacity = layer.opacity;

    var doc4Scale = app.documents.getByName (picName)
    
    var width = doc4Scale.width;
    var height = doc4Scale.height;
    if(width == undefined){
        $.writeln ("undefinded");
    }

    validateScaleImage(layer, layerW, layerH, slicePaddingArr);

    var originLayer = doc4Scale.activeLayer//临时保存用来选区的图层
    //左下左上，右上右下
    var selRegion = Array(
        Array(Array(0,slicePaddingArr[1]),Array(0, 0),Array(slicePaddingArr[0] , 0),Array(slicePaddingArr[0], slicePaddingArr[1])),
        Array(Array(width-slicePaddingArr[2],slicePaddingArr[1]),Array(width-slicePaddingArr[2], 0),Array(width , 0),Array(width, slicePaddingArr[1])),
        Array(Array(0,height),Array(0, height-slicePaddingArr[3]),Array(slicePaddingArr[0] , height-slicePaddingArr[3]),Array(slicePaddingArr[0], height)),
        Array(Array(width-slicePaddingArr[2],height),Array(width-slicePaddingArr[2], height-slicePaddingArr[3]),Array(width , height-slicePaddingArr[3]),Array(width, height)),
        );
    for (var i = 0;i<selRegion.length;i++)
    {
        doc4Scale.activeLayer = originLayer;
        doc4Scale.selection.select(selRegion[i]);
        doc4Scale.selection.copy();
        var newStem = doc4Scale.paste();
        newStem.name = picName + "_" + i;
        var deltaX = 0;
        var deltaY = 0;
        if(selRegion[i][0][0] != 0){
            deltaX = - (width - slicePaddingArr[0]-slicePaddingArr[2]);
        }
        if(selRegion[i][1][1] != 0){
            deltaY = - (height - slicePaddingArr[1]-slicePaddingArr[3]);
        }
        newStem.translate(deltaX,deltaY);
    }
    originLayer.visible = false;
    if(doc4Scale.layers.length>1){
        doc4Scale.mergeVisibleLayers();
    }
    doc4Scale.trim (TrimType.TRANSPARENT, true, true, true, true)

    /******************* 保存图片 *******************/
    
    //调用[activeDocument]对象的[exportDocument]方法，将新文档导出为SaveDocumentType图片。
    doc4Scale.exportDocument(file, ExportType.SAVEFORWEB, option);
    
    file.close();
    
    //调用[activeDocument]对象的[close]方法，关闭新文档。[close]方法内的参数，表示关闭新文档时，不再存储新文档。
    doc4Scale.close(SaveOptions.DONOTSAVECHANGES);
    //将Photoshop的当前文档，重置为网页设计稿文档。
    //app.activeDocument = doc;
    //$.gc()
    return middleXYWH;
}

/** 默认png，返回图片名称，含后缀的，_png _jpg */
function getImageName(layer) {
    var sourceName = ""
    var nameArr = []
    var hasSuffix = false
    if(layer.name.indexOf("@")>0){
        //九宫图
        nameArr = layer.name.split("@");
        var middleXYWH = nameArr[1].split("_");
        var picName = nameArr[0];
        picName = picName + "@" + middleXYWH[0] + "_" + middleXYWH[1] + "_" + middleXYWH[2] + "_" + middleXYWH[3];
        if(!isScaleImage(layer) && isJPG(layer.name)){
            picName = picName + "_jpg";
        }else{
            picName = picName + "_png";
        }
        sourceName = picName;
        hasSuffix = true;
    }else{
        //非九宫图
        nameArr = layer.name.split("_");
        var len = nameArr.length;
        for(var i=0; i<len; i++){
            var tmp = nameArr[i];
            tmp = tmp.toLowerCase()
            if(tmp=="png" || tmp=="jpg"){
                sourceName = sourceName + "_" + tmp;
                hasSuffix = true;
            }else{
                if(sourceName==""){
                    sourceName = nameArr[i];
                }else{
                    sourceName = sourceName + "_" +nameArr[i];
                }
            }
        }
    }

    if(!hasSuffix){
        sourceName = sourceName + "_png";
    }
    return sourceName
}

function getXYWH(layer) {
    //获得当前图层的尺寸大小。这个尺寸排除了图层特效如阴影、外发光等产生的范围。
    // var bounds = layer.boundsNoEffects;
    /**
        crops the document
        the bounds parameter is an array of four coordinates for the region remaining after cropping
        裁剪文档
        bounds参数是裁剪后剩余区域的四个坐标数组。
    */
    var bounds = layer.bounds;
    var xcoord = Math.floor(bounds[0].as("px"));
    var ycoord = Math.floor(bounds[1].as("px"));
    //计算当前图层的宽度，为范围数组变量的第三个值与第一个值的差。
    var layerRealWidth = Math.floor(bounds[2].as("px") - bounds[0].as("px"));
    //计算当前图层的高度，为范围数组变量的第四个值与第二个值的差。
    var layerRealHeight = Math.floor(bounds[3].as("px") - bounds[1].as("px"));
    return [xcoord, ycoord, layerRealWidth, layerRealHeight];
}

/**[trimName, percentStr] */
function trimPercent(layer) {
    var layername = layer.name;
    var trimName = layer.name;
    var percent4Image = ""
    var xiahuaxian = 0
    if(!!layer){
        layername = layer.name + "";
        var baifenbi = layername.indexOf("%");
        if(baifenbi>=0){
            for(var i=baifenbi; i>=0; i--){
                var curChar = layername[i]
                if(curChar == "_"){
                    xiahuaxian = i;
                    break;
                }
            }
            var percentStr = layername.substring(xiahuaxian, baifenbi+1);
            percent4Image = percentStr;
            trimName = layername.replace(percentStr, "")
        }
    }
    return [trimName, percent4Image]
    
}


function concatString(str1, str2) {
    var exchangestr1 = exchangeString(str1)
    var exchangestr2 = exchangeString(str2)
    if(exchangestr2 == ""){
        return exchangestr1
    }
    if(exchangestr1 == ""){
        return exchangestr2
    }
    return exchangestr1 + LB + exchangestr2
}

function exchangeString(str) {
    if(str==undefined || str=="undefined"){
        return ""
    }
    return str;
}

function isExportLayer( layer ){
    if(layer && layer.typename == "LayerSet"){
        return true
    }
    var layername = layer.name
    if(layername.indexOf("ui_")>=0){
        return true;
    }
    if(layername.indexOf("txt")>=0){
        return true
    }
    
    return false;
}

function isTxt( layer ){
    if(layer.kind==LayerKind.TEXT && layer.name.indexOf("txt")>=0){
        return true;
    }
    return false;
}

function isScaleImage( layer ){
    if(layer.name.indexOf("@")>=0){
        return true;
    }
    return false;
}

function isUIPicture( layer ){
    if(layer.name.indexOf("ui_")>=0){
        return true;
    }
}

function isJPG(layer) {
    var imgName = layer.name;
    imgName = imgName.toLowerCase()
    if(imgName.indexOf("_jpg")>=0){
        return true
    }
    return false
}

function isPNG(layer) {
    var imgName = layer.name;
    imgName = imgName.toLowerCase()
    if(imgName.indexOf("_png")>=0){
        return true
    }
    return false
}

function isCopyLayer(layer){
    var layerName = layer.name;
    if(isUIPicture(layer) && layerName.indexOf ("拷贝")>=0){
        //如果是ui 且名字携带拷贝俩字，就不导出了
        return true;
    }
    return false;
}

function isSpaceNameLayer(layer){
    if(isUIPicture(layer) && layer.name.indexOf("图层") >= 0){
        return false;
    }
    if(isUIPicture(layer) && layer.name.indexOf ("layer") >=0 ){
        return false;
    }
    if(isUIPicture(layer) && layer.name.indexOf(" ")>=0){
        spaceNameLayer.push (layer.name)
        return true;
    }
    return false;
}
function isBtn(layer) {
    if(layer && layer.name.indexOf("ui_")<0 && layer.name.indexOf("btn")>=0){
        return true;
    }
    return false;
}

function isListComponent( layername ){
    if(layername.indexOf("list")>=0){
        return true;
    }
    return false;
}
function isItemComponent( layername ){
    if(layername.indexOf("item")>=0){
        return true;
    }
    return false;
}

function exportDocument(doc) {
    var option = new ExportOptionsSaveForWeb();
    //设置图片输出时支持透明度。
    option.transparency = true;
    //设置图片输出的色彩范围为256色。
    option.colors = 256;
    option.format = SaveDocumentType.JPEG;
    option.PNG8 = usePNG8;
    option.quality = imageQuality;//品质 。（0~100）。
    option.transparency = true;
    
    var fileName = exmlDir + psdFileName + ".jpg"
    //定义一个变量[file]，作为图层输出的路径。
    var file = new File(fileName);
    
    //doc.rasterizeAllLayers()
    if(doc.layers.length>1){
        doc.mergeVisibleLayers()
    }
    
    
    //调用[activeDocument]对象的[exportDocument]方法，将新文档导出为SaveDocumentType图片。
    doc.exportDocument(file, ExportType.SAVEFORWEB, option);
    
    file.close();
    $.gc()
}