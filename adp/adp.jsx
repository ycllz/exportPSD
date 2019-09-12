


var componentSkinList = [
 "BG1", "BG2", "BG3", "BG4", "BG5", "BG6", "BG7", "BG8", "BG9", "BG10",
 "BG11", "BG12", "BG13", "BG14", "BG15", "BG16", "BG17", "BG18", "BG19",
 "CommonBtn1_1Skin", "CommonBtn1_2Skin", "CommonBtn1_3Skin", "CommonBtn1_4Skin",
 "CommonBtn2_1Skin", "CommonBtn2_2Skin", "CommonBtn2_3Skin", "CommonBtn2_4Skin",
 "bar1Skin", "bar1Skin_1", "bar21Skin", "bar20Skin", "bar19Skin", "bar18Skin", "bar17Skin", "bar16Skin", "bar15Skin",
 "CheckBox0", "CheckBox2", "CheckBox3", "CheckBox4",
 "ItemBaseSkin", "ItemIconSkin", "PriceIconSkin", "PriceIconSkin2", "PowerLabelSkin",
 "ShopBtnSkin", "GuildADialogSkin", "GuildADialogSkin", "GuildLabelSkin"
];

 var componentListClass = [
    "Component", "Component", "Component", "Component", "Component", "Component", "Component", "Component", "Component", "Component",
    "Component", "Component", "Component", "Component", "Component", "Component", "Component", "Component", "Component", 
 "Button", "Button", "Button", "Button",
 "Button", "Button", "Button", "Button",
 "ProgressBar", "ProgressBar", "ProgressBar", "ProgressBar", "ProgressBar", "ProgressBar", "ProgressBar", "ProgressBar", "ProgressBar",
 "CheckBox", "CheckBox", "CheckBox", "CheckBox",
 "ItemBase", "ItemIcon", "PriceIcon", "PriceIcon", "PowerLabel",
 "Button", "GuildADialog", "GuildLabel"
]

var defTypeMap = {}
defTypeMap["Button"] = "e";
defTypeMap["ProgressBar"] = "e";
defTypeMap["CheckBox"] = "e";
defTypeMap["Label"] = "e";
defTypeMap["list"] = "e";
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
var tabsDeep = ["","\t", "\t\t", "\t\t\t", "\t\t\t\t", "\t\t\t\t\t", "\t\t\t\t\t\t", "\t\t\t\t\t\t\t", "\t\t\t\t\t\t\t\t"]
var deepIndex = 1;

var exmlContents = "";
var psdFileName = ""

//定义一个变量[doc]，表示当前文档。
var doc = app.activeDocument;
var dupDoc