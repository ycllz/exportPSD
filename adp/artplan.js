




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
   "ShopBtnSkin", "GuildADialogSkin", "GuildLabelSkin",
   "tab", "tabbar", "bar",
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
   "Button", "GuildADialog", "GuildLabel",
   "TabBar", "TabBar", "TabBar"
];

var skinMap2Class = {};

var defTypeMap = {}
defTypeMap["Component"] = "e";
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

var exmlDir = "art/ui/exml/"

//定义一个变量[doc]，表示当前文档。
var doc = app.activeDocument;
var dupDoc


initData();


function incc(params) {
    
}

function name(params) {

}