
/**
    Author:ycllz
    code time:2019 year/8 month/12 day  
*/


/***************************************** 配置 可以修改配置*******************************************************/
/**
        
    
    */


/**导出图片的质量，80是 80%*/
var imageQuality = 80;

/**是否保存导出图片，只有图片图层命名带有下划线 _  的图层才会导出 **/
var saveImages = true;
/** 是否导出exml 配置文件，这个文件给前端用的 **/
var saveExmlFiles = true;
/** 工作的根目录，不填的话，默认是 psd 文件的目录，导出的 图片 exml 文件都在 psd 文件目录下 */
var rootPath = ""//"E:/microtrunk/resource/总美术上传文件/ui/";

var imagePath = rootPath + "assets/";


/************************************************ 通用组件，需要加的时候让前端加 **************************************/

/** componentList（自定义的） 跟 egretComponents（egret的组件） 两个就已经包括了所有组件，
//还有一种是图片对应的自定义组件 image2ComponentMap

//componentListMap
//egretComponentsMap
//image2ComponentMap
*/

/**
 * 使用的是固定皮肤
 * 
 * 这些全部搞到一张图片那里给美术对照着，也搞个文本文件给美术，容易复制名称，不然美术敲错咋办
 * （后期抽出来做成配置来填）
 */
var componentList = ["CommonBtn1_1Skin", "CommonBtn1_2Skin", "CommonBtn1_3Skin", "CommonBtn1_4Skin",
"CommonBtn2_1Skin", "CommonBtn2_2Skin", "CommonBtn2_3Skin", "CommonBtn2_4Skin",
"bar1Skin", "bar1Skin_1", "bar21Skin", "bar20Skin", "bar19Skin", "bar18Skin", "bar17Skin", "bar16Skin", "bar15Skin",
"CheckBox0", "CheckBox2", "CheckBox3", "CheckBox4",
 "ItemBaseSkin", "ItemIconSkin", "PriceIconSkin", "PowerLabelSkin"];

/**
 * @list list_v_x：x列纵向滚动，行是无限的  ；list_h_y：y行横向滚动，列是无限的
 */
var egretComponents = ["list", "item", "txt"];

/**这个先不管，已经跟通用的自定义组件重合了 */
var commonComponents = [ "checkbox", "btn", "bar", "power", "price"];

/******************************************* 程序 不能改 **********************************************************/

var image2ComponentMap;//图片对应的组件 BG 这类背景图组件

/**
 * componentList
 * 如果该图层是已经制作出来的组件，直接skinname直接就是这个组件
 */
var componentListMap;
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
var lineBreaks = "\n"
var tabsDeep = ["","\t", "\t\t", "\t\t\t", "\t\t\t\t", "\t\t\t\t\t", "\t\t\t\t\t\t", "\t\t\t\t\t\t\t", "\t\t\t\t\t\t\t\t"]
var deepIndex = 1;

var fileBaseName = "";
var exportString = "";

initData();

init();

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
    componentListMap = {}
    componentListMap["BG"] = "BG";
    for(var i=2; i<=BGLen; i++){
        componentListMap["BG"+i] = "BG"+i;
    }
    for(var i=0; i<componentList.length; i++){
        componentListMap[componentList[i]] = componentList[i];
    }

    egretComponentsMap = {};
    var comLen = egretComponents.length;
    for(var i=0; i<comLen; i++){
        egretComponentsMap[egretComponents[i]] = egretComponents[i];
    }

}


function init(){
    var stageWidth = app.activeDocument.width.as("px") * scaleImage;
    var stageHeight = app.activeDocument.height.as("px") * scaleImage;
    
    /**保存需要导出的那些图层，先处理文本再统一导出，需要先保存起来*/
    var exportLayers = []
    
    if(rootPath==""){
        rootPath = app.activeDocument.path
    }
    //保存exml文件的文件名
    var name = decodeURI(app.activeDocument.name);
	exmlFileName = name.substring(0, name.indexOf("."));
    fileBaseName = exmlFileName;
	var dir = rootPath + exmlFileName + slantingBar;//app.activeDocument.path + 

    new Folder( dir ).create();
    
    //new Folder( imagePath ).create();
    var layers = app.activeDocument.layers
    var len = layers.length;
    for(var i=len-1; i>=0; i--){
        var layer = layers[i];
        //bounds UnitValue 数组
        //图层区域。只读。[0,1,2,3] 分别是 0:左侧左边距 ，1:顶侧顶边距 ，2:右侧左边距 ，3:底侧顶边距。
        
        $.writeln( layer.name +" , " + layer.typename + " , " + layer.kind + " , " + ( layer.bounds[1].as("px") ) )//LayerKind
        //if(layers[i].typename == "LayerSet")//判断是否是图层组
        //LayerKind.NORMAL
        if(layer.visible){
            if(isExportLayer (layer.name)){//这个图层需要导出
                exportLayers.push(layer);
            }
        }
    }
    
    /**
     * 皮肤格式
        
        <?xml version="1.0" encoding="utf-8"?>
        <e:Skin class="CommonDialog7Skin" width="720" height="1280" xmlns:e="http://ns.egret.com/eui" xmlns:w="http://ns.egret.com/wing" >
    
    
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
        
        </e:Skin>
        
    */
    /**
        //bounds UnitValue 数组
        //图层区域。只读。[0,1,2,3] 分别是 0:左侧左边距 ，1:顶侧顶边距 ，2:右侧左边距 ，3:底侧顶边距。
     **/
        
    exportString = ""
    deepIndex = 1;
    var exLen = exportLayers.length;
    for(var i=0; i<exLen; i++){
        var layer = exportLayers[i]
        var xcoord = layer.bounds[0].as("px")
        var ycoord = layer.bounds[1].as("px")
        
        var layerRealWidth = layer.bounds[2].as("px") - layer.bounds[0].as("px");
        var layerRealHeight = layer.bounds[3].as("px") - layer.bounds[1].as("px");
        
            
        if(isListComponent (layer.name)){//列表，特殊的图层组
            exportList(layer, 1);
        }
        else if(layer && layer.typename == "LayerSet"){//判断是否是图层组
            exportLayerSet( layer, 1 );
        }
        else{//图层
            exportArtlayer( layer, 1 );
        }
    }
    
}

/** 列表*/
function exportList( layer, deepIndex ){
    var xcoord = layer.bounds[0].as("px")
    var ycoord = layer.bounds[1].as("px")
    var layerRealWidth = layer.bounds[2].as("px") - layer.bounds[0].as("px");
    var layerRealHeight = layer.bounds[3].as("px") - layer.bounds[1].as("px");
    
    var str = ""
    str = str + tabsDeep[deepIndex] + '<e:Scroller id="sl_scroller" x="'+ xcoord +'" y="'+ ycoord +'" width="' + layerRealWidth + '" height="' + layerRealHeight + '" >'
    str = str + lineBreaks + tabsDeep[deepIndex+1] + '<e:List id="' + layer.name + layer.itemIndex  + '" >'
    str = str + lineBreaks + tabsDeep[deepIndex+1] + '<e:layout>'
    str = str + lineBreaks + tabsDeep[deepIndex+1] + '<e:VerticalLayout gap="5"/>'
    str = str + lineBreaks + tabsDeep[deepIndex+1] + '</e:layout>'
    str = str + lineBreaks + tabsDeep[deepIndex+1] + '</e:List>'
    str = str + lineBreaks + tabsDeep[deepIndex] + '</e:Scroller>'
    
    exportListItem(layer);
    
    return str;
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
            
        }
        else{
            //一般图层
            exportArtlayer( layerSet[i])
        }
    }
}

/** 图层组*/
function exportLayerSet( layerSet, deepIndex ){
    
    var layerSetString = "";
    
    for (var i =0; i<layerSet.length; i++){
        if(layerSet[i].typename == "LayerSet"){//是否是图层组
            
            layerSetString = getLayerSetString( layerSet[i], deepIndex );
            
            exportLayerSet( layerSet[i].layers, deepIndex+1 );//递归
        }
        else{
            //一般图层
            exportArtlayer( layerSet[i], deepIndex )
        }
    }
}

function getLayerSetString( layerSet, deepIndex ){
    
}

/**一般图层*/
function exportArtlayer( layer, deepIndex ){
    //9宫的才需要在程序中设定宽高，其他的不用
    if( isScaleImage (layer) ){
        
    }
    else if( isUIPicture(layer) ){
        
    }
    else if( isTxt(layer) ){
        
    }
}



function exportFile(){

}

/** "txt", "checkbox", "btn", "bar", "price"
    "ItemBaseSkin", "ItemIconSkin", "power"
    
***/
function getExportLayerString( layer, deepIndex ){
    if(isTxt (layer)){
        
    }
    else if(isScaleImage (layer)){
        
    }
    else if(isUIPicture (layer)){
        
    }
}

function isTxt( layer ){
    if(layer.name.indexOf(layer.name)>=0){
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


/////////////////////////////////////////////////////////

function isItemComponent( layername ){
    if(layername.indexOf("item")){
        return true;
    }
    return false;
}


function isListComponent( layername ){
    if(layername.indexOf("list")){
        return true;
    }
    return false;
}

function isExportLayer( layername ){
    if(layername.indexOf("_")>=0){
        return true;
    }
    var arr = layername.split("_");
    var len = arr.length;
    for(var i=0; i<len; i++){
        if(!!commonComponentMap[arr[i]]){
            return true
        }
    }
    
    return false;
}







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