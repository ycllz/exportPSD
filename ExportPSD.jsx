
/**
    Author:ycllz
    code time:2019 year/8 month/12 day  
*/


/***************************************** 配置 可以修改配置*******************************************************/
/**
        
    图片默认png格式，命名的时候加上jpg就会导出jpg : ui_xxx_yyy_zzz_jpg   ;要导出的文本命名需要加 txt，特定组件的用特定组件名称
    */


/**导出图片的质量，80是 80%*/
var imageQuality = 80;

/**是否保存导出图片，只有图片图层命名带有下划线 _  的图层才会导出 **/
var saveImages = true;
/** 是否导出exml 配置文件，这个文件给前端用的 **/
var saveExmlFiles = true;
/** 工作的根目录，不填的话，默认是 psd 文件的目录，导出的 图片 exml 文件都在 psd 文件目录下 */
var rootPath = "E:/microtrunk/resource/总美术上传文件/ui/";//""//

var imagePath = rootPath + "assets/";

/************************************************ 通用组件，需要加的时候让前端加 **************************************/

/** componentList（自定义的） 跟 egretComponents（egret的组件） 两个就已经包括了所有组件，
//还有一种是图片对应的自定义组件 image2ComponentMap

//componentListMap
//egretComponentsMap
//image2ComponentMap
*/

/**
 * 
 * 使用的是固定皮肤 componentListMap
 * 
 * 这些全部搞到一张图片那里给美术对照着，也搞个文本文件给美术，容易复制名称，不然美术敲错咋办
 * （后期抽出来做成配置来填）
 */
var componentSkinList = ["CommonBtn1_1Skin", "CommonBtn1_2Skin", "CommonBtn1_3Skin", "CommonBtn1_4Skin",
"CommonBtn2_1Skin", "CommonBtn2_2Skin", "CommonBtn2_3Skin", "CommonBtn2_4Skin",
"bar1Skin", "bar1Skin_1", "bar21Skin", "bar20Skin", "bar19Skin", "bar18Skin", "bar17Skin", "bar16Skin", "bar15Skin",
"CheckBox0", "CheckBox2", "CheckBox3", "CheckBox4",
 "ItemBaseSkin", "ItemIconSkin", "PriceIconSkin", "PriceIconSkin2", "PowerLabelSkin"];

 var componentListClass = ["Button", "Button", "Button", "Button",
 "Button", "Button", "Button", "Button",
 "ProgressBar", "ProgressBar", "ProgressBar", "ProgressBar", "ProgressBar", "ProgressBar", "ProgressBar", "ProgressBar", "ProgressBar",
 "CheckBox", "CheckBox", "CheckBox", "CheckBox",
 "ItemIconIR", "ItemIcon", "PriceIcon", "PowerLabel"
]

/** 
 *  <e:ProgressBar id="bar0" x="120" y="181" anchorOffsetX="0" width="485" skinName="bar21Skin"/>
    <ns1:PowerLabel id="totalPower" text="战 123456789" y="109" anchorOffsetX="0" horizontalCenter="0"/>
 *  Button :e
 *  ItemIconIR :ns1
 * 
*/
var defTypeMap = {}
defTypeMap["Button"] = "e";
defTypeMap["ProgressBar"] = "e";
defTypeMap["CheckBox"] = "e";
defTypeMap["Label"] = "e";
defTypeMap["ItemIconIR"] = "ns1";
defTypeMap["ItemIcon"] = "ns1";
defTypeMap["PriceIcon"] = "ns1";
defTypeMap["PowerLabel"] = "ns1";
defTypeMap["list"] = "e";
defTypeMap["btn"] = "e";

/**
 * egretComponentsMap
 * 
 * @list list_v_x：x列纵向滚动，行是无限的  ；list_h_y：y行横向滚动，列是无限的 ； list_t_x :x列纵向滚动，行是无限的
 */
var egretComponents = ["list", "item", "txt"];

/**
 * 这个先不管，已经跟通用的自定义组件重合了
 * 
*/
var commonComponents = [ "checkbox", "btn", "bar", "power", "price"];

var exportTypes = ["btn", "txt", "list", "item", "checkbox", "bar", "power", "price"]
var exportTypesSkin = ["CommonBtn1_1Skin", "Label", "list", "item", "checkbox", "bar", "power", "price"]
var exportTypeMap = {}


/******************************************* 程序 不能改 **********************************************************/

var image2ComponentMap;//图片对应的组件 BG 这类背景图组件

/**
 * key：组件皮肤名 value：组件皮肤名 ，为了直接判断是否存在组件，不用遍历
 * componentList
 * 如果该图层是已经制作出来的组件，直接skinname直接就是这个组件
 */
var componentSkinListMap;
/** key：组件皮肤名 value：类名 */
var componentListClassMap;
/**
 * commonComponents
 * 默认通用的组件 btn 命名的psd图层使用 CommonBtn1_1Skin 等默认
 */
var commonComponentMap;
/**
 * egretComponents
 */
var egretComponentsMap;

var BGLen = 50;
var scaleImage = 1;

var slantingBar = "/";
//linebreaks
var LB = "\n"
var tabsDeep = ["","\t", "\t\t", "\t\t\t", "\t\t\t\t", "\t\t\t\t\t", "\t\t\t\t\t\t", "\t\t\t\t\t\t\t", "\t\t\t\t\t\t\t\t"]
var deepIndex = 1;

var exmlContents = "";
var psdFileName = ""

//定义一个变量[doc]，表示当前文档。
var doc = app.activeDocument;
var dupDoc

initData();
parsePSDFile();

//将Photoshop的当前文档，重置为网页设计稿文档。
app.activeDocument = doc;

/******************************************* run ************************************************/

function initData(){
    image2ComponentMap = {}//如果图片名称是这些的，就用这些组件
    image2ComponentMap["ui_cm_p_0@2_0_2_0_png"] = "BG";
    image2ComponentMap["ui_cm_p@215_36_215_20_png"] = "BG2";
    image2ComponentMap["ui_cm_34@65_0_65_0_png"] = "BG16";
    image2ComponentMap["ui_cm_19@62_51_62_51_png"] = "BG17";
    
    commonComponentMap = {}
    commonComponentMap["checkbox"] = "CheckBox0";
    commonComponentMap["btn"] = "CommonBtn1_1Skin";
    commonComponentMap["bar"] = "bar21Skin";
    commonComponentMap["power"] = "PowerLabelSkin";
    commonComponentMap["price"] = "PriceIconSkin";
    
    //如果该图层是已经制作出来的组件，直接skinname直接就是这个组件
    componentSkinListMap = {}
    componentListClassMap = {}
    
    componentSkinListMap["BG"] = "BG";
    for(var i=2; i<=BGLen; i++){
        componentSkinListMap["BG"+i] = "BG"+i;
        componentListClassMap["BG"+i] = "Component"
    }
    for(var i=0; i<componentSkinList.length; i++){
        componentSkinListMap[componentSkinList[i]] = componentSkinList[i];
        componentListClassMap[componentSkinList[i]] = componentListClass[i]
    }


    egretComponentsMap = {};
    var comLen = egretComponents.length;
    for(var i=0; i<comLen; i++){
        egretComponentsMap[egretComponents[i]] = egretComponents[i];
    }

    for(var i=0; i<exportTypes.length; i++){
        exportTypeMap[exportTypes[i]] = exportTypes[i];
    }

}


function parsePSDFile(){
    
    var stageWidth = app.activeDocument.width.as("px") * scaleImage;
    var stageHeight = app.activeDocument.height.as("px") * scaleImage;
    
    /**保存需要导出的那些图层，先处理文本再统一导出，需要先保存起来*/
    var exportLayers = []
    
    if(rootPath==""){
        rootPath = app.activeDocument.path + "/export/"
    }else{
        rootPath = rootPath + "export/"
    }
    //保存exml文件的文件名
    var name = decodeURI(app.activeDocument.name);
	psdFileName = name.substring(0, name.indexOf("."));
    if(psdFileName==""){
        psdFileName = name;
    }
	var dir = rootPath + psdFileName + slantingBar;//app.activeDocument.path + 

    new Folder( dir ).create();
    
    dupDoc = app.activeDocument.duplicate()
    
    //new Folder( imagePath ).create();
    var layers = app.activeDocument.layers
    var len = layers.length;
    for(var i=len-1; i>=0; i--){
        var layer = layers[i];
        //bounds UnitValue 数组
        //图层区域。只读。[0,1,2,3] 分别是 0:左侧左边距 ，1:顶侧顶边距 ，2:右侧左边距 ，3:底侧顶边距。
        
        //$.writeln( layer.name +" , " + layer.typename + " , " + layer.kind + " , " + ( layer.bounds[1].as("px") ) )//LayerKind
        //if(layers[i].typename == "LayerSet")//判断是否是图层组
        //LayerKind.NORMAL
        if(layer.visible){
            if(isExportLayer (layer) && (!layer.isBackgroundLayer)){//这个图层需要导出
                exportLayers.push(layer);
            }
        }
    }
    
    /**
     * 皮肤格式
        
        <?xml version="1.0" encoding="utf-8"?>
        <e:Skin class="CommonDialog7Skin" width="720" height="1280" xmlns:e="http://ns.egret.com/eui" xmlns:w="http://ns.egret.com/wing" >
    
        <e:Component skinName="BG13" y="214" anchorOffsetX="0" width="552" anchorOffsetY="0" height="658"   x="84"/>

        <e:Component anchorOffsetX="0" anchorOffsetY="0" touchEnabled="false" horizontalCenter="0" width="552" height="241" y="372" skinName="BG13"/>
        <e:Button id="dialogCloseBtn" icon="ui_common_gb02_btn_n" x="609" y="305" skinName="CloseBtn">
        </e:Button>
        <e:Image source="ui_cm_p@0_bthb_png" y="284" horizontalCenter="0"/>

        <e:Image x="210" y="391" width="318" height="40" source="ui_cm_04_1@58_2_58_2_png" scale9Grid="58,1,2,2"/>
        <e:Label text="关卡奖励" y="310" style="title" horizontalCenter="0"/>
        
        <ns1:PetSkillItem id="skillItem" x="479" y="278" skinName="Pet_SkillItemSkin"/>
        <ns1:PetSkillItem id="skillItem" x="479" y="278" skinName="Pet_SkillItemSkin"/>
        
        <e:Button id="btn_active" label="Button" x="32" y="328" skinName="CommonBtnSkin1" icon="ui_kfhd_icon_tsyl_png" anchorOffsetY="0" height="93" anchorOffsetX="0" width="99"/>
        
        <e:CheckBox id="cb_noAnimation" label="跳过动画" x="39" y="276" skinName="CheckBox0" scaleX="1" scaleY="1"/>
        
        <e:Button id="btn_findOne" label="购买1个" x="145" y="962" skinName="CommonBtn1_1Skin"/>
        
        <e:Image source="ui_cwxb_zi_tsscbcczyscw_png" y="646" horizontalCenter="0"/>
        
        <e:Scroller id="sl_scroller" width="647" height="186" y="703" anchorOffsetX="0" anchorOffsetY="0" scaleX="1" scaleY="1" bounces="false" x="40">
			<e:List id="ls_logs" anchorOffsetY="0" useVirtualLayout="true">
			<e:layout>
				<e:VerticalLayout gap="10"/>
			</e:layout>
			</e:List>
		</e:Scroller>
        
        <e:ProgressBar id="bar0" x="120" y="181" anchorOffsetX="0" width="485" skinName="bar21Skin"/>
        
        <ns1:PowerLabel id="totalPower" text="战 123456789" y="109" anchorOffsetX="0" horizontalCenter="0"/>

        <e:Label id="nameLab" text="[1234]玩家昵称" x="163" y="29" size="25" anchorOffsetX="0" width="261" anchorOffsetY="0" height="29" multiline="true" wordWrap="true" lineSpacing="7" verticalAlign="top" textColor="0xda6d02" fontFamily="SimHei"/>
        
        </e:Skin>
        
    */
    /**
        //bounds UnitValue 数组
        //图层区域。只读。[0,1,2,3] 分别是 0:左侧左边距 ，1:顶侧顶边距 ，2:右侧左边距 ，3:底侧顶边距。
     **/
        
    exmlContents = ""
    deepIndex = 1;
    var exLen = exportLayers.length;
    for(var i=0; i<exLen; i++){
        app.activeDocument = dupDoc;
        var layer = exportLayers[i];
        exmlContents = concatString(exmlContents, parseLayer(layer, deepIndex))
    }
    
    $.writeln ("本次导出的文件都在目录：" + dir)
    alert("本次导出的文件都在目录：" + dir)

    var className = psdFileName

    exmlContents =
    '<?xml version="1.0" encoding="utf-8"?>'+LB
    +'<e:Skin class="' + className + 'Skin" width="720" height="1280" xmlns:e="http://ns.egret.com/eui" xmlns:w="http://ns.egret.com/wing" >'+LB
    +exmlContents+LB
    +'</e:Skin>'
    
    saveEXML(dir, psdFileName, exmlContents)

    activeDocument.close(SaveOptions.DONOTSAVECHANGES);
    
    $.gc();
}

function savePNG(path, fileName, content) {
    app.activeDocument
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

/** return [x, y, width, height] */
function getXYWH(layer) {
    // var bounds = layer.bounds;
    // if(layer.bounds){
    //     bounds = layer.bounds;
    // }
    // else if(layer.position){
    //     bounds = layer.position;
    // }
    //获得当前图层的尺寸大小。这个尺寸排除了图层特效如阴影、外发光等产生的范围。
    // var bounds = layer.boundsNoEffects;
    var bounds = layer.bounds;
    var xcoord = Math.floor(bounds[0].as("px"));
    var ycoord = Math.floor(bounds[1].as("px"));
    //计算当前图层的宽度，为范围数组变量的第三个值与第一个值的差。
    var layerRealWidth = Math.floor(bounds[2].as("px") - bounds[0].as("px"));
    //计算当前图层的高度，为范围数组变量的第四个值与第二个值的差。
    var layerRealHeight = Math.floor(bounds[3].as("px") - bounds[1].as("px"));
    return [xcoord, ycoord, layerRealWidth, layerRealHeight];
}

function parseLayer(layer, deepIndex) {
    exmlContents = ""
    if(layer && isImageComponent(layer)){//一般是通用底图
        // exmlContents = concatString(exmlContents, getImageComponentString(layer, deepIndex))
        exmlContents = getImageComponentString(layer, deepIndex)
    }
    if(layer && isCustomComponent(layer)){
        // exmlContents = concatString(exmlContents, getCustomComponentString(layer, deepIndex))
        exmlContents = getCustomComponentString(layer, deepIndex)
    }
    else if(layer && isListComponent (layer.name)){//列表，特殊的图层组
        // exmlContents = concatString(exmlContents, exportList(layer, deepIndex))
        exmlContents = exportList(layer, deepIndex)
    }
    else if(layer && layer.typename == "LayerSet"){//判断是否是图层组
        // exmlContents = concatString(exmlContents, exportLayerSet( layer, deepIndex))
        exmlContents = exportLayerSet( layer, deepIndex)
    }
    else if(layer){//图层，每个模块自己的图片 文本
        // exmlContents = concatString(exmlContents, exportArtlayer( layer, deepIndex))
        exmlContents = exportArtlayer( layer, deepIndex)
    }
    return exmlContents;
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
    
    saveEXML(rootPath + className + slantingBar, className, exmlContents)
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
            
            parseLayer( layerSet[i].layers, deepIndex+1 );//递归
        }
        else{
            //一般图层
            layerSetString = concatString(layerSetString, exportArtlayer( layerSet[i], deepIndex ))
        }
    }
    return layerSetString;
}

function getLayerSetString( layerSet, deepIndex ){
    
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
        return '<e:Label id="'+layer.name+'" text="'+layer.textItem.contents  +'" x="'+coords[0]+'" y="'+coords[1]+'" width="'+coords[2]+'" height="'+size +'" multiline="true" wordWrap="true" textColor="'+color+'" fontFamily="SimHei"/>';
    }
}

function getScaleImageString(layer, deepIndex) {
    var coords = getXYWH(layer)
    
    var arr = layer.name.split("@")
    var grids = arr[1].split("_")
    var gridStr = grids[0] + "," + grids[1] + "," + grids[2] + "," + grids[3]
    
    //导出图片
    saveScalePiture(layer)
    
    return LB + tabsDeep[deepIndex+1] +'<e:Image x="'+coords[0]+'" y="'+coords[1]+'" width="'+coords[2]+'" height="'+coords[3]+'" source="'+getImageName(layer)+'" scale9Grid="'+gridStr+'"/>'
}


function getImageString(layer, deepIndex) {
    var coords = getXYWH(layer)
    
    //导出图片
    savePicture(layer);
    
    return LB + tabsDeep[deepIndex+1] +'<e:Image x="'+coords[0]+'" y="'+coords[1]+'" width="'+coords[2]+'" height="'+coords[3]+'" source="'+getImageName(layer)+'" />'
}

function savePicture(layer){
    // var bounds = layer.boundsNoEffects;
	//  //计算当前图层的宽度，为范围数组变量的第三个值与第一个值的差。
	// var width = bounds[2] - bounds[0];
	//  //计算当前图层的高度，为范围数组变量的第四个值与第二个值的差。
	// var height = bounds[3] - bounds[1];
    
    var coords = getXYWH (layer)
    
    //var arr = layer.name.split("@")
    //var grids = arr[1].split("_")
    //var nameStr = arr[0].split("_")
    
    var nameStr = layer.name.split("_");
    var picName = "";
    var len = nameStr.length;
    if(isJPG(layer)){
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
    
    layer.copy();
    //创建一个新文档，新文档的尺寸为拷贝到内存中图层的尺寸一致。
    //宽带, 高度, 分辨率resolution, 名称, 文档颜色模式, 背景内容, 像素长宽比, 颜色位数, 色彩管理 
    var pxWidth = new UnitValue( coords[2] + " px");
    var pxHeight = new UnitValue( coords[3] + " px");
	app.documents.add(pxWidth, pxHeight, doc.resolution, picName, NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
    var curdoc = app.documents.getByName (picName)
    //将内存中的图层，复制到新文档。
    app.activeDocument.paste();
    //blur number 模糊图像，默认 0.0 不模糊
    //定义一个变量[option]，表示图片的输出格式。
    var option = new ExportOptionsSaveForWeb();
    //设置图片输出时支持透明度。
    option.transparency = true;
    //设置图片输出的色彩范围为256色。
    option.colors = 256;
    option.format = SaveDocumentType.PNG;
    option.PNG8 = false;
    option.quality = imageQuality;//品质 。（0~100）。
    
    var pictureType = "png"
    if(isJPG(layer)){
        pictureType = "jpg"
        //设置图片输出的格式为GIF格式。
        option.format = SaveDocumentType.JPEG;
        option.optimized = true;
    }
    var path = rootPath + psdFileName + slantingBar + nameStr[1] + slantingBar
    new Folder(path).create();
    var fileName = path + picName + "."+pictureType
    //定义一个变量[file]，作为图层输出的路径。
    var file = new File(fileName);
    //调用[activeDocument]对象的[exportDocument]方法，将新文档导出为SaveDocumentType图片。
    curdoc.exportDocument(file, ExportType.SAVEFORWEB, option);
    
    file.close();

    //调用[activeDocument]对象的[close]方法，关闭新文档。[close]方法内的参数，表示关闭新文档时，不再存储新文档。
    curdoc.close(SaveOptions.DONOTSAVECHANGES);
    //将Photoshop的当前文档，重置为网页设计稿文档。
    //app.activeDocument = doc;
}

function saveScalePiture(layer){
    // var bounds = layer.boundsNoEffects;
	//  //计算当前图层的宽度，为范围数组变量的第三个值与第一个值的差。
	// var width = bounds[2] - bounds[0];//厘米
	//  //计算当前图层的高度，为范围数组变量的第四个值与第二个值的差。
	// var height = bounds[3] - bounds[1];
    
    var layerXYWh = getXYWH (layer)
    
    var arr = layer.name.split("@")
    var nameStr = arr[0].split("_")
    var middleXYWH = arr[1].split("_")//第五个的xy宽高
    
    var layerX = Number(layerXYWh[0])
    var layerY = Number(layerXYWh[1])
    var layerW = Number(layerXYWh[2])
    var layerH = Number(layerXYWh[3])

    var middleX = Number(middleXYWH[0])
    var middleY = Number(middleXYWH[1])
    var middleW = Number(middleXYWH[2])
    var middleH = Number(middleXYWH[3])
    // var nameStr = layer.name.split("_")
    

    var picName = "";
    var nameLen = nameStr.length;
    
    for(var i=0; i<nameLen; i++){
        if(picName == ""){
            picName = nameStr[i]
        }else{
            picName = picName + "_" + nameStr[i]
        }
    }
    var gridsLen = middleXYWH.length;
    if(isJPG(layer)){
        gridsLen = middleXYWH.length - 1;
    }
    picName = picName + "@"
    for(var i=0; i<gridsLen; i++){
        var tmp = middleXYWH[i]
        tmp = tmp.toLowerCase()
        if(tmp=="png" || tmp=="jpg"){
            break
        }
        if(picName == ""){
            picName = middleXYWH[i]
        }else{
            picName = picName + "_" + middleXYWH[i]
        }
    }

    layer.copy()
    var fileName = "scaleImage"
    
    //layer.copy()
    
    // var wUnit = new UnitValue(layerW);
    // var hUnit = new UnitValue(layerH);

    //左上裁切区域
    var startx1 = 0;//在这个图层中的相对坐标，图层的左上角是0,0
    var starty1 = 0;
    var endx1 = (middleX + ((middleW>>1)>2 ? 2 : 1))
    var endy1 = (middleY + ((middleH>>1)>2 ? 2 : 1))
    var docWidth1 = middleX + ((middleW>>1)>2 ? 2 : 1)
    var docHeight1 = middleY + ((middleH>>1)>2 ? 2 : 1)
    var translate1x = 0
    var translate1y = 0
    //右上裁切区域
    var startx2 = (middleX + middleW - ((middleW>>1)>2 ? 2 : 1))//相对于图层左上角的坐标
    var starty2 = starty1
    var endx2 = layerW
    var endy2 = endy1
    var docWidth2 = layerW - (middleX + middleW - ((middleW>>1)>2 ? 2 : 1))
    var docHeight2 = middleY + ((middleH>>1)>2 ? 2 : 1)
    var translate2x = middleX + ((middleW>>1)>2 ? 2 : 1)
    var translate2y = 0
    //左下裁切区域
    var startx3 = 0
    var starty3 = (middleY + middleH) - ((middleH>>1)>2 ? 2 : 1)
    var endx3 = endx1
    var endy3 = 0
    var docWidth3 = docWidth1
    var docHeight3 = layerH - (middleY + middleH - ((middleH>>1)>2 ? 2 : 1))
    var translate3x = 0
    var translate3y = middleY + ((middleH>>1)>2 ? 2 : 1)
    //右下角裁切区域
    var startx4 = startx2
    var starty4 = starty3
    var endx4 = endx2
    var endy4 = endy3
    var docWidth4 = docWidth2
    var docHeight4 = docHeight3
    var translate4x = middleX + ((middleW>>1)>2 ? 2 : 1)
    var translate4y = middleY + ((middleH>>1)>2 ? 2 : 1)


    var pxWidth = new UnitValue( (docWidth1 + docWidth2) + " px");
    var pxHeight = new UnitValue( (docHeight1 + docHeight3) + " px");

    //宽带, 高度, 分辨率resolution, 名称, 文档颜色模式, 背景内容, 像素长宽比, 颜色位数, 色彩管理
    
    //创建一个新文档，新文档的尺寸为裁切后4个区域拼起来的尺寸
    //第一个文档
    app.documents.add(pxWidth, pxHeight, doc.resolution, fileName, NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
    preferences.rulerUnits = Units.PIXELS;
    var doc4Scale = app.documents.getByName (fileName)

    //第二个文档
    // var picName2 = picName + "_2"
	// app.documents.add(pxWidth, pxHeight, doc.resolution, picName2, NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
    // var picName2Doc = app.documents.getByName (picName2)
    // app.activeDocument = picName2Doc;

    var tmpDocName = fileName+"_tmp1"
    app.documents.add(new UnitValue(layerW+" px"), new UnitValue(layerH+" px"), doc.resolution, tmpDocName, NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
    preferences.rulerUnits = Units.PIXELS;
    
    app.activeDocument = dupDoc;
    
    //将内存中的图层，复制到新文档。
    tmpDocName = fileName+"_tmp1"
    tmpDoc = app.documents.getByName (tmpDocName)
    app.activeDocument = tmpDoc;
    app.activeDocument.paste();

    tmpDocName = fileName+"_tmp2"
    app.documents.add(new UnitValue(layerW+" px"), new UnitValue(layerH+" px"), doc.resolution, tmpDocName, NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
    preferences.rulerUnits = Units.PIXELS;
    //将内存中的图层，复制到新文档。
    app.activeDocument.paste();

    // tmpDocName = fileName+"_tmp3"
    // app.documents.add(layerW, layerH, doc.resolution, tmpDocName, NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
    // preferences.rulerUnits = Units.PIXELS;
    // //将内存中的图层，复制到新文档。
    // app.activeDocument.paste();

    // tmpDocName = fileName+"_tmp4"
    // app.documents.add(layerW, layerH, doc.resolution, tmpDocName, NewDocumentMode.RGB, DocumentFill.TRANSPARENT);
    // preferences.rulerUnits = Units.PIXELS;
    // //将内存中的图层，复制到新文档。
    // app.activeDocument.paste();

    /*************左上 ***********/
    // tmpDocName = fileName+"_tmp1"
    // tmpDoc = app.documents.getByName (tmpDocName)
    // app.activeDocument = tmpDoc;
    
    // preferences.rulerUnits = Units.PIXELS;
    // activeDocument.crop([crop1x, crop1y, area_1_width, area_1_height], 0);
    // tmpDoc.layers[0].copy()

    // app.activeDocument = doc4Scale;
    // app.activeDocument.paste();
    // tmpDoc.close(SaveOptions.DONOTSAVECHANGES);
    // $.gc()
    
    imageCrop(fileName, 2, startx2, starty2, endx2, endy2, docWidth2, docHeight2, translate2x, translate2y)
    imageCrop(fileName, 1, startx1, starty1, endx1, endy1, docWidth1, docHeight1, translate1x, translate1y)
    

    /*************右上 ***********/
    // tmpDocName = fileName+"_tmp2"
    // tmpDoc = app.documents.getByName (tmpDocName)
    // app.activeDocument = tmpDoc;
    
    // preferences.rulerUnits = Units.PIXELS;
    // activeDocument.crop([crop2x, crop2y, area_2_width, area_2_height], 0);
    // tmpDoc.layers[0].copy()

    // app.activeDocument = doc4Scale;
    // app.activeDocument.paste();
    // tmpDoc.close(SaveOptions.DONOTSAVECHANGES);
    // $.gc()

    /************* 左下 ************/
    // tmpDocName = fileName+"_tmp3"
    // tmpDoc = app.documents.getByName (tmpDocName)
    // app.activeDocument = tmpDoc;
    
    // preferences.rulerUnits = Units.PIXELS;
    // activeDocument.crop([crop3x, crop3y, area_3_width, area_3_height], 0);
    // tmpDoc.layers[0].copy()

    // app.activeDocument = doc4Scale;
    // app.activeDocument.paste();
    // tmpDoc.close(SaveOptions.DONOTSAVECHANGES);
    // $.gc()

    /************* 右下角 ************/
    // tmpDocName = fileName+"_tmp4"
    // tmpDoc = app.documents.getByName (tmpDocName)
    // app.activeDocument = tmpDoc;
    
    // preferences.rulerUnits = Units.PIXELS;
    // activeDocument.crop([crop4x, crop4y, area_4_width, area_4_height], 0);
    // tmpDoc.layers[0].copy()

    // app.activeDocument = doc4Scale;
    // app.activeDocument.paste();
    // tmpDoc.close(SaveOptions.DONOTSAVECHANGES);
    // $.gc()

    /******************* 保存图片 *******************/
    //blur number 模糊图像，默认 0.0 不模糊
    //定义一个变量[option]，表示图片的输出格式。
    var option = new ExportOptionsSaveForWeb();
    //设置图片输出时支持透明度。
    option.transparency = true;
    //设置图片输出的色彩范围为256色。
    option.colors = 256;
    option.format = SaveDocumentType.PNG;
    option.PNG8 = false;
    option.quality = imageQuality;//品质 。（0~100）。
    
    var pictureType = "png"
    if(isJPG(layer)){
        pictureType = "jpg"
        //设置图片输出的格式为GIF格式。
        option.format = SaveDocumentType.JPEG;
        option.optimized = true;
    }

    var path = rootPath + psdFileName + slantingBar + nameStr[1] + slantingBar
    new Folder(path).create();
    var fileName = path + picName + "."+pictureType
    //定义一个变量[file]，作为图层输出的路径。
    var file = new File(fileName);
    //调用[activeDocument]对象的[exportDocument]方法，将新文档导出为SaveDocumentType图片。
    doc4Scale.exportDocument(file, ExportType.SAVEFORWEB, option);
    
    file.close();
    
    //调用[activeDocument]对象的[close]方法，关闭新文档。[close]方法内的参数，表示关闭新文档时，不再存储新文档。
    doc4Scale.close(SaveOptions.DONOTSAVECHANGES);
    //将Photoshop的当前文档，重置为网页设计稿文档。
    //app.activeDocument = doc;
}

function imageCrop(fileName, idCrop, startx, starty, endx, endy, docWidth, docHeight, translatex, translatey) {
    tmpDocName = fileName+"_tmp" + idCrop
    tmpDoc = app.documents.getByName (tmpDocName)
    app.activeDocument = tmpDoc;

    preferences.rulerUnits = Units.PIXELS;
    
    var uw = new UnitValue(docWidth + 'px')
    var uh = new UnitValue(docHeight + 'px')
    //切割
    //Photoshop CC JavaScript Reference
    var leftu = new UnitValue(startx + " px")
    var topu = new UnitValue(starty + " px")
    var rightu = new UnitValue(endx + " px")
    var bottomu = new UnitValue(endy + " px")
    //[开始坐标x，开始坐标y，结束坐标x，结束坐标y]
    activeDocument.crop([leftu, topu, rightu, bottomu]);//, 0, uw, uh
    tmpDoc.layers[0].copy()

    //收集切割后的图片到这个文档
    var doc4Scale = app.documents.getByName (fileName)
    app.activeDocument = doc4Scale;
    preferences.rulerUnits = Units.PIXELS;
    app.activeDocument.paste();
    app.activeDocument.width
    app.activeDocument.height
    var pastelayer = app.activeDocument.layers[0]
    var X = UnitValue(translatex+" px")
    var Y = UnitValue(translatey+" px")
    pastelayer.translate(X, Y);
    tmpDoc.close(SaveOptions.DONOTSAVECHANGES);
    //$.gc()
}

function getImageName(layer) {
    var sourceName = ""
    if(isJPG(layer)){
        sourceName = layer.name
    }
    else if(isPNG(layer)){
        sourceName = layer.name
    }
    else{
        sourceName = layer.name + "_png"
    }
    return sourceName
}

/** "txt", "checkbox", "btn", "bar", "price"
    "ItemBaseSkin", "ItemIconSkin", "power"
    
***/
function getExportLayerString( layer, deepIndex ){
    if(isTxt (layer)){
        return getTxtString(layer, deepIndex)
    }
    else if(isScaleImage (layer)){
        return getScaleImageString(layer, deepIndex)
    }
    else if(isUIPicture (layer)){
        return getImageComponentString(layer, deepIndex)
    }
}

/*****************************  获取组件exml文本 ***********************************/

function getImageComponentString(layer, deepIndex) {
    var skinName = image2ComponentMap[layer.name]
    var coords = getXYWH[layer];
    return '<e:Component skinName="'+skinName+'" x="'+coords[0]+'" y="'+coords[1]+'" width="'+coords[2]+'" height="'+coords[3]+'" />'
}

function getCustomComponentString(layer, deepIndex){
    var skinName = layer.name;
    var className = componentListClassMap[skinName]
    var coords = getXYWH[layer];
    var defString = LB + tabsDeep[deepIndex] + '<'+defTypeMap[className]+':'+className+' skinName="'+skinName+'" x="'+coords[0]+'" y="'+coords[1]+'" width="'+coords[2]+'" height="'+coords[3]+'" />'
    return defString;
}


/*****************************  组件判断 ***********************************/

function isImageComponent(layer) {
    if(image2ComponentMap[layer.name]){
        return true;
    }
    return false;
}

function isCustomComponent(layer) {
    if(componentSkinListMap[layer.name]){
        return true;
    }
    // for(var i=0;)
    return false;
}


function isTxt( layer ){
    if(layer.name.indexOf("txt")>=0){
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
    if(layer.name.indexOf("ui")>=0){
        return true;
    }
}

function isJPG(layer) {
    var imgName = layer.name;
    imgName = imgName.toLowerCase()
    if(imgName.indexOf("jpg")>=0){
        return true
    }
    return false
}

function isPNG(layer) {
    var imgName = layer.name;
    imgName = imgName.toLowerCase()
    if(imgName.indexOf("png")>=0){
        return true
    }
    return false
}

function isBtn( layer ){
    if(layer.name.indexOf ("btn")>=0){
        return true;
    }
    return false;
}

function isBar( layer ){
    if(layer.name.indexOf ("bar")>=0){
        return true;
    }
    return false;
}

function isPrice( layer ){
    if(layer.name.indexOf ("price")>=0){
        return true;
    }
    return false;
}

function isPower(layer){
    if(layer.name.indexOf ("power")>=0){
        return true;
    }
    return false;
}

function isItemBaseSkin(layer){
    if(layer.name.indexOf ("ItemBaseSkin")>=0){
        return true;
    }
    return false;
}

function isItemIconSkin(layer){
    if(layer.name.indexOf ("ItemIconSkin")>=0){
        return true;
    }
    return false;
}


/*****************************  组件判断 ***********************************/

function isItemComponent( layername ){
    if(layername.indexOf("item")>=0){
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

function isExportLayer( layer ){
    if(layer && layer.typename == "LayerSet"){
        return true
    }
    var layername = layer.name
    if(layername.indexOf("_")>=0){
        return true;
    }
    for(var i=0; i<exportTypes.length; i++){
        var typeStr = exportTypes[i]
        if(layername.indexOf(typeStr)>=0){
            return true
        }
    }
    
    return false;
}


/***********************************************************************/
/***压缩 （0-9）。
 * 
 * activeDocument.saveAs(file, new PNGSaveOptions(), true, Extension.LOWERCASE);
*/
function SavePNG(fileFullPath, compression){
	pngSaveOptions = new PNGSaveOptions();

	// compression (The compression value)
	// Default: 0
	// Range: [0,9]
	pngSaveOptions.compression = compression
	
	// interlaced (True to interlace rows)
	// Default: false
	pngSaveOptions.interlaced = false
	
	// typename (The class name of the referenced PNGSaveOptions object.)
	// Read only
	//pngSaveOptions.typename
	
	activeDocument.saveAs(new File(fileFullPath), pngSaveOptions, true, Extension.LOWERCASE);
}
/**品质（0~12）。*/
function SaveJPEG(fileFullPath, quality){
	jpgSaveOptions = new JPEGSaveOptions();
	
	// embedColorProfile (True to embed the color profile in the document.)
	jpgSaveOptions.embedColorProfile = true;
	
	// formatOptions (The download format to use.)
	// Default: FormatOptions.STANDARDBASELINE 
	// Range: FormatOptions.STANDARDBASELINE, 
	//			FormatOptions.OPTIMIZEDBASELINE, 
	//			FormatOptions.PROGRESSIVE
	jpgSaveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
	
	// matte (The color to use to fill anti-aliased edges adjacent to transparent areas of the image. 
	//			When transparency is turned off for an image, the matte color is applied to transparent areas.)
	// Default: MatteType.WHITE
	// Range: MatteType.BACKGROUND
	//			MatteType.BLACK
	//			MatteType.FOREGROUND
	//			MatteType.NETSCAPE
	//			MatteType.NONE
	//			MatteType.SEMIGRAY
	//			MatteType.WHITE
	jpgSaveOptions.matte = MatteType.NONE;
	
	// quality (The image quality setting to use; affects file size and compression)
	// Default: 3 
	// Range: [0,12]
	jpgSaveOptions.quality = quality;
	
	// scans (The number of scans to make to incrementally display the image on the page. 
	//			Valid only for when formatOptions = FormatOptions.PROGRESSIVE.)
	// Default: 3
	// Range: [3,5]
	//jpgSaveOptions.scans = 3
	
	// typename (The class name of the referenced JPEGSaveOptions object.)
	// Read only
	//jpgSaveOptions.typename
	
	activeDocument.saveAs(new File(fileFullPath), jpgSaveOptions, true,Extension.LOWERCASE);
}
/**
 * 
 * @param {*} fileFullPath 
 * @param {*} format SaveDocumentType.JPEG, 
	//			SaveDocumentType.PNG-8, 
	//			SaveDocumentType.PNG-24, 
	//			SaveDocumentType.BMP
 * @param {*} quality 
 */
function SaveForWeb(fileFullPath, format, quality){
	
	var webSaveOptions = new ExportOptionsSaveForWeb(); 
	
	// blur (Applies blur to the image to reduce artifacts)
	// Default: 0.0
	webSaveOptions.blur = 0.0; 
	
	// colorReduction (The color reduction algorithm.)
	// Default: ColorReductionType.SELECTIVE 
	// Range: ColorReductionType.PERCEPTUAL, 
	//			ColorReductionType.SELECTIVE, 
	//			ColorReductionType.ADAPTIVE, 
	//			ColorReductionType.RESTRICTIVE, 
	//			ColorReductionType.CUSTOM, 
	//			ColorReductionType.BLACKWHITE
	//			ColorReductionType.GRAYSCALE, 
	//			ColorReductionType.MACINTOSH
	//			ColorReductionType.WINDOWS
	webSaveOptions.colorReduction = ColorReductionType.SELECTIVE 
	
	// colors (The number of colors in the palette.)
	// Default: 256 
	webSaveOptions.colors = 256
	
	// dither (The type of dither)
	// Default: Dither.DIFFUSION
	// Range: Dither.DIFFUSION
	//			Dither.NOISE
	//			Dither.NONE
	//			Dither.PATTERN
	webSaveOptions.dither = Dither.DIFFUSION
	
	// ditherAmount (The amount of dither.Valid only when dither = Dither.DIFFUSION)
	// Default: 100
	webSaveOptions.ditherAmount = 100;
	
	// format (The file format to use)
	// Ddefault: SaveDocumentType.COMPUSERVEGIF
	// Range: SaveDocumentType.COMPUSERVEGIF, 
	//			SaveDocumentType.JPEG, 
	//			SaveDocumentType.PNG-8, 
	//			SaveDocumentType.PNG-24, 
	//			SaveDocumentType.BMP
	webSaveOptions.format = format//SaveDocumentType.JPEG; 
	
	// includeProfile (True to include the document’s embedded color profile)
	// Default: false
	webSaveOptions.includeProfile = false; 
	
	// interlaced (True to download in multiple passes progressive)
	// Default: false
	webSaveOptions.interlaced = false; 
	
	// lossy (The amount of lossiness allowed)
	// Default: 0
	webSaveOptions.lossy = 0;
	
	// matteColor (The colors to blend transparent pixels against.)
	// Type: RGBColor
	//webSaveOptions.matteColor ;
	
	// optimized (True to create smaller but less compatible files. Valid only when format = SaveDocumentType.JPEG.)
	// Default: true
	webSaveOptions.optimized = true; 

	// PNG8 (Indicates the number of bits; true = 8, false = 24. Valid only when format = SaveDocumentType.PNG.)
	// Default: true
	webSaveOptions.PNG8 = true;

	// quality (The quality of the produced image as a percentage)
	// Default: 60
	// Range: [0, 100]
	webSaveOptions.quality = quality;
	
	// transparency (Indication of transparent areas of the image should be included in the saved image)
	// Default: true
	webSaveOptions.transparency = true;
	
	// transparencyAmount (The amont of transparency dither. Valid only if transparency = true.)
	// Default: 100
	webSaveOptions.transparencyAmount = 100;
	
	// transparencyDither (The transparency dither algorithm)
	// Default: Dither.NONE
	// Range: Dither.DIFFUSION
	//			Dither.NOISE
	//			Dither.NONE
	//			Dither.PATTERN
	webSaveOptions.transparencyDither = Dither.NONE
	
	// typename (The class name of the referenced ExportOptionsSaveForWeb object.)
	// Read only
	//webSaveOptions.typename
	
	// webSnap (The tolerance amount within which to snap close colors to web palette colors)
	// Default: 0
	webSaveOptions.webSnap = 0;
	
	activeDocument.exportDocument(new File(fileFullPath), ExportType.SAVEFORWEB, webSaveOptions);
}//https://blog.csdn.net/aa13058219642/article/details/90244352




///////////////////////////////////////////////////////////////////////////////

function checkLayerName(names,layerName)
{
    var i  = 1;
	for(var key in layerName){
        if(layerName[key] == names){
            names = names+"_"+i;
            names = checkLayerName(names,layerName);
        };
    }
    return names
}