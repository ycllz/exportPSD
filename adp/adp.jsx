

/**<ns1:GuildADialog id="dialog" skinName="GuildADialogSkin" anchorOffsetY="0" 
 * height="591.51" y="288.37" anchorOffsetX="0" horizontalCenter="-2"/>
 **/

 /**
  * psd 中导出类型分3种：1、图片ui_ 命名。2、文本 txt 命名。3、组件 用皮肤名命名，图层组命名: 皮肤名_id。
  */

var rootPath = "";
var exmlPath = "";

var componentSkinList = [
    "BG1", "BG2", "BG3", "BG4", "BG5", "BG6", "BG7", "BG8", "BG9", "BG10",
    "BG11", "BG12", "BG13", "BG14", "BG15", "BG16", "BG17", "BG18", "BG19",
    "CommonBtn1_1Skin", "CommonBtn1_2Skin",
    "CommonBtn2Skin", "CommonBtn3Skin", "CommonBtn4Skin",
    "ProgressBar1Skin", "ProgressBar2Skin", "ProgressBar3Skin", "ProgressBar4Skin", "ProgressBar5Skin",
    "ProgressBar6Skin", "ProgressBar7Skin", "ProgressBar8Skin", "ProgressBar9Skin", "ProgressBar10Skin",
    "ThumbBarSkin",
    "CheckBox0",
    "ItemBaseSkin", "ItemIconSkin", "PriceIconSkin", "PriceIconSkin2", "PowerLabelSkin",
    "ShopBtnSkin", "GuildADialogSkin", "GuildLabelSkin", "ShopCostItemSkin",
    "tab", "tabbar", "bar",
    "CommonWin2Skin", "CommonWinSkin", "CommonWinFrameSkin", "CommonWinFrame2Skin", "CommonWinFrame3Skin", "CommonWin"
];

var componentListClass = [
   "Component", "Component", "Component", "Component", "Component", "Component", "Component", "Component", "Component", "Component",
   "Component", "Component", "Component", "Component", "Component", "Component", "Component", "Component", "Component",
   "Button", "Button",
   "Button", "Button", "Button",
   "ProgressBar", "ProgressBar", "ProgressBar", "ProgressBar", "ProgressBar",
   "ProgressBar", "ProgressBar", "ProgressBar", "ProgressBar", "ProgressBar",
   "ProgressBar",
   "CheckBox",
   "ItemBase", "ItemIcon", "PriceIcon", "PriceIcon", "PowerLabel",
   "Button", "GuildADialog", "GuildLabel", "ShopCostItem",
   "TabBar", "TabBar", "TabBar",
   "CommonWinFrame", "CommonWinFrame", "CommonWinFrame", "CommonWinFrame", "CommonWinFrame", "CommonWinFrame"
];
var skin2Class = {};
var componentSkin = {};

var compSourceNeed = {}
compSourceNeed["CommonBtn2Skin"] = "icon";
compSourceNeed["ShopBtnSkin"] = "icon";

// var shortClass = {};
//  shortClass["btn1"] = "CommonBtn1_1Skin"
//  shortClass["btn1_1"] = "CommonBtn1_1Skin"
//  shortClass["btn1_2"] = "CommonBtn1_2Skin"
//  shortClass["btn2"] = "CommonBtn2Skin"
//  shortClass["btn3"] = "CommonBtn3Skin"
//  shortClass["btn4"] = "CommonBtn4Skin"

var defTypeMap = {}
defTypeMap["Component"] = "e";
defTypeMap["Image"] = "e";
defTypeMap["Button"] = "e";
defTypeMap["ProgressBar"] = "e";
defTypeMap["CheckBox"] = "e";
defTypeMap["Label"] = "e";
defTypeMap["List"] = "e";
defTypeMap["btn"] = "e";

defTypeMap["ItemBase"] = "ns1";
defTypeMap["ItemIcon"] = "ns1";
defTypeMap["PriceIcon"] = "ns1";
defTypeMap["PowerLabel"] = "ns1";
defTypeMap["GuildADialog"] = "ns1";
defTypeMap["GuildLabelSkin"] = "ns1";


var slantingBar = "/";
//linebreaks
var LB = "\n"
var tabsDeep = ["", "\t", "\t\t", "\t\t\t", "\t\t\t\t", "\t\t\t\t\t", "\t\t\t\t\t\t", "\t\t\t\t\t\t\t", "\t\t\t\t\t\t\t\t"]
var deepIndex = 1;

var exmlContents = "";
var psdFileName = ""

//定义一个变量[doc]，表示当前文档。

var doc = app.activeDocument;
var dupDoc

var logStr = ""


initData();
parsePSDFile();

function initData() {
   var skinLen = componentSkinList.length;
   var classLen = componentListClass.length;
   for (var i = 0; i < skinLen; i++) {
      var skinName = componentSkinList[i];
      var className = componentListClass[i];
      skin2Class[skinName] = className;
      componentSkin[skinName] = true;
   }
}

function parsePSDFile() {
   var savedRulerUnits = app.preferences.rulerUnits;
   var savedTypeUnits = app.preferences.typeUnits;
   app.preferences.rulerUnits = Units.PIXELS;
   app.preferences.typeUnits = TypeUnits.PIXELS;

   var stageWidth = app.activeDocument.width.as("px") * scaleImage;
   var stageHeight = app.activeDocument.height.as("px") * scaleImage;

   //保存exml文件的文件名
   var name = decodeURI(app.activeDocument.name);
   var psdFileName = name.substring(0, name.indexOf("."));
   if (psdFileName == "") {
      psdFileName = name;
   }

   if (exmlPath == "") {
      // rootPath = app.activeDocument.path + "/" + getImageSubDir()
      exmlPath = app.activeDocument.path + "/exml/"
   } else {
      // rootPath = rootPath + getImageSubDir()
      exmlPath = exmlPath + "/exml/"
   }

//    var dir = rootPath;//app.activeDocument.path + 
    var exmlDir = exmlPath + psdFileName + slantingBar;
    // new Folder( dir ).create();
    new Folder( exmlDir ).create();
    
    var dupDoc = app.activeDocument.duplicate();

    app.activeDocument = dupDoc;
    
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
    var exmlContents = ""
    var deepIndex = 1;
    var exLen = exportLayers.length;
    for(var i=0; i<exLen; i++){
        app.activeDocument = dupDoc;
        var layer = exportLayers[i];
        exmlContents = concatString(exmlContents, parseLayer(layer, deepIndex))
    }

    var className = psdFileName;
    /** exml 文件输出 */
    exmlContents =
    '<?xml version="1.0" encoding="utf-8"?>'+LB
    +'<e:Skin class="' + className + 'Skin" width="720" height="1280" xmlns:e="http://ns.egret.com/eui" xmlns:w="http://ns.egret.com/wing" >'+LB
    +exmlContents+LB
    +'</e:Skin>'
    
    saveEXML(exmlDir, psdFileName, exmlContents);

    activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    saveLog();
    var picPath = ""
    for(var key in imageExportPathMap){
        picPath = picPath + imageExportPathMap[key] + "\n"
    }
    var strEnd = "\n\n请记得也把导出exml文件提交svn\n\n图片该怎么处理就怎么处理";
    var alertStr = "本次导出的图片文件都在目录：\n" + picPath + "\n本次导出的exml文件都在目录：\n" + exmlDir + strEnd;
    alert(alertStr)
    $.gc();

}

function parseLayer(layer, deepIndex) {
    var exmlContents = ""
    if(layer && isCustomComponent(layer)){
        // exmlContents = concatString(exmlContents, getCustomComponentString(layer, deepIndex))
        exmlContents = getCustomComponentString(layer, deepIndex)
    }
    else if(layer && isUILayerSet(layer)){
        //图层组，需要合并导出的图层组，开头以 ui_ 命名
        exmlContents = exportUILayerSet(layer, deepIndex)
    }
    else if(layer && isListComponent (layer.name)){//列表，特殊的图层组
        // exmlContents = concatString(exmlContents, exportList(layer, deepIndex))
        exmlContents = exportList(layer, deepIndex)
    }
    else if(layer && layer.typename == "LayerSet"){//判断是否是图层组，可能存在图层组是为了psd的管理方便而存在，不是组件
        // exmlContents = concatString(exmlContents, exportLayerSet( layer, deepIndex))
        exmlContents = exportLayerSet(layer, deepIndex)
    }
    else if(layer){//图层，每个模块自己的图片 文本
        // exmlContents = concatString(exmlContents, exportArtlayer( layer, deepIndex))
        exmlContents = exportArtlayer(layer, deepIndex)
    }
    return exmlContents;
}

function exportUILayerSet(layer) {
    if( isScaleImage (layer) ){
        return getScaleImageString(layer, deepIndex)
    }
    else if( isUIPicture(layer) ){
        return getImageString(layer, deepIndex)
    }
    else if( isTxt(layer) ){
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
    
    saveEXML(exmlPath + className + slantingBar, className, exmlContents)
}

function exportListItem( layerSet ){
    var itemLayer;
    for (var i =0; i<layerSet.length; i++){
        if(isItemComponent(layerSet[i].name)){
            item = layerSet[i];
            break;
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

/** 图层组*/
function exportLayerSet( layerSet, deepIndex ){
    var layerSetString = "";
    for (var i =0; i<layerSet.length; i++){
        if(layerSet[i].typename == "LayerSet"){//是否是图层组
            //layerSetString = layerSetString + getLayerSetString( layerSet[i], deepIndex );
            exportLayerSet( layerSet[i].layers, deepIndex+1 );//递归
        }
        else{
            //一般图层
            layerSetString = concatString(layerSetString, exportArtlayer( layerSet[i], deepIndex ))
        }
    }
    return layerSetString;
}


/**一般图层*/
function exportArtlayer( layer, deepIndex ){
    //9宫的才需要在程序中设定宽高，其他的不用
    if( isScaleImage (layer) ){
        return getScaleImageString(layer, deepIndex)
    }
    else if( isUIPicture(layer) ){
        return getImageString(layer, deepIndex)
    }
    else if( isTxt(layer) ){
        return getTxtString(layer, deepIndex)
    }
}

function getCustomComponentString(layer, deepIndex){
    var skinName = layer.name + "";
    var idString = ""
    if((skinName.toString()).indexOf("_")>0){
        var arr = skinName.split("_");
        skinName = arr[0];
        idString = ' id="' + arr[1] + '"';
    }
    var compSourceStr = ""
    if(compSourceNeed[skinName]){
        if(layer.typename=="LayerSet"){
            var layerSet = layer;
            for (var i =0; i<layerSet.length; i++){
                if(isUIPicture(layerSet[i])){
                    compSourceStr = ' icon="'+getImageName(layerSet[i])+'"'
                    break;
                }
            }
        }else{
            compSourceStr = ' icon="'+getImageName(layer)+'"'
        }
        
    }
    var className = skin2Class[skinName]
    var coords = getXYWH(layer)
    var defString = LB + tabsDeep[deepIndex] + '<'+defTypeMap[className]+':'+className+ idString +' skinName="'+skinName+ compSourceStr +'" x="'+coords[0]+'" y="'+coords[1]+'" width="'+coords[2]+'" height="'+coords[3]+'" />'
    return defString;
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
        return LB + tabsDeep[deepIndex]+'<e:Label id="'+layer.name+layer.itemIndex+'" text="'+layer.textItem.contents  +'" x="'+coords[0]+'" y="'+coords[1]+'" width="'+coords[2]+'" height="'+size +'" multiline="true" wordWrap="true" textColor="'+color+'" fontFamily="SimHei"/>';
    }
}

function getPictureLayerString(layer, deepIndex) {
    if(isScaleImage(layer)){
        return getScaleImageString(layer, deepIndex);
    }
    return getImageString(layer, deepIndex);
}

function getScaleImageString(layer, deepIndex) {
    var coords = getXYWH(layer)
    
    var layernameAndPercent = trimPercent(layer)
    var layername = layernameAndPercent[0]
    var percent = layernameAndPercent[1]
    var percentString = ''
    if(percent==undefined || percent==""){
        
    }else{
        percentString = '<!--'+ percent + '-->'
    }
    //第五个的xy宽高
    var grids = get5thImageXYWH(layer);
    var gridStr = grids[0] + "," + grids[1] + "," + grids[2] + "," + grids[3];
    
    return LB + tabsDeep[deepIndex+1] +'<e:Image x="'+coords[0]+'" y="'+coords[1]+'" width="'+coords[2]+'" height="'+coords[3]+'" source="'+getImageName(layer)+'" scale9Grid="'+gridStr+'"/>' + percentString
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
    return LB + tabsDeep[deepIndex+1] +'<e:Image x="'+coords[0]+'" y="'+coords[1]+'" width="'+coords[2]+'" height="'+coords[3]+'" source="'+getImageName(layer)+'" />' + percentString
}

function get5thImageXYWH(layer) {
    var layerXYWh = getXYWH (layer)
    
    var arr = layer.name.split("@")
    var nameStr = arr[0].split("_")
    var middleXYWH = arr[1].split("_")//第五个的xy宽高

    return middleXYWH;
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
/** return [trimName, percentStr] */
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

function exchangeString(str) {
    if(str==undefined || str=="undefined"){
        return ""
    }
    return str;
}

/** return [x, y, width, height] */
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


/**
 * 自定义组件
 * @param {图层 图层组 } layer 
 */
function isCustomComponent(layer) {
    var skinName = layer.name;
    if((skinName.toString()).indexOf("_")>0){
        var arr = skinName.split("_");
        skinName = arr[0];
    }
    if(layer && skin2Class[skinName]){
        return true;
    }
    return false;
}

function isCommonImage(layer){
    if(layer.name.indexOf("_cm")>=0){
        return true;
    }
    return false;
}

function isUIPicture( layer ){
    if(layer.name.indexOf("ui_")>=0){
        return true;
    }
}

function isTxt( layer ){
    if(layer.name.indexOf("txt")>=0){
        return true;
    }
    return false;
}
/**
 * 如果是9宫图，可能存在两组9宫数据，第一组是给游戏用，第二组是用于不规则的9宫，4个角落的图片大小都不一样的，
 * 就需要定义第二组9宫数据
 * @param {图层或者图层组} layer 
 */
function isScaleImage( layer ){
    if(layer.name.indexOf("@")>=0){
        return true;
    }
    return false;
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


function saveLog() {
    writeLog("导出完成\n")
    var logFile = new File(scriptPath + "log.txt")
    logFile.open("w")
    logFile.writeln(logStr);
    logFile.close()
}

function writeLog(str) {
    var date = new Date();
    logStr = date.toLocaleString() + " :    " + str + "\n" + logStr;
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