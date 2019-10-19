﻿/**
 * ...
 * @author KramerZhang(QQ:21524742)
 * 重要概念：
 * GroupLayer:文件夹图层
 * ImageLayer:图像图层
 * TextLayer: 文本图层
 * Layer专指图层文件夹
 * fw.launchApp("file:///C|/Program Files (x86)/Adobe/Flash Professional CS5.5/Adobe Flash CS5.5/Flash.exe", ["file:///D|/Temp/Panel/EquipExchange.fla"]); fw中调用Flash的方法
 */
var doc = fw.getDocumentDOM();
var psdName = "";
var psdPath = "";
var psdFolder = "";
var parseResult = null;
//公共图片资源，从PSD文件所在目录下的shared.xml中读取,shared.xml记录了模块间公共资源信息
var sharedAssetMap = null;
var assetMap = {};
//生成Skin文件路径
var skinFilePath = "";
//图片资源链接名拼接字符串
var resource = "";

var typeList =		["Image", "ScaleImage", "Label", "Button", "ComboBox", "Container", "DragBar", "List", "RadioButton", "RadioButtonGroup", "ScrollBar", "Slider", "Stepper", "LabelButton"];
var parserList =	[parseImage, parseScaleImage, parseLabel, parseContainer, parseContainer, parseContainer, parseDragBar, parseList, parseContainer, parseContainer, parseContainer, parseContainer, parseContainer, parseContainer];
var generatorList =	[generateImageSkin, generateScaleImageSkin, generateLabelSkin, generateContainerSkin, generateContainerSkin, generateContainerSkin, generateDragBarSkin, generateListSkin, generateContainerSkin, generateContainerSkin, generateContainerSkin, generateContainerSkin, generateContainerSkin, generateContainerSkin];
var validatorList =	[validateImage, validateScaleImage, validateLabel, validateContainer, validateContainer, validateContainer, validateContainer, validateList, validateContainer, validateContainer, validateContainer, validateContainer, validateContainer, validateContainer];
var regExpList =	[null, null, null, buttonRegExp, comboBoxRegExp, null, null, null, radioButtonRegExp, radioButtonGroupRegExp, scrollBarRegExp, sliderRegExp, stepperRegExp, labelButtonExp];

//使用正则表达式对组件名称进行验证，$表示名称结尾
var buttonRegExp =				{required: ["(Image|ScaleImage)_.*"]};
var comboBoxRegExp =			{required: ["Label_label$", "List_list$", "Button_btn$"], optional: ["ScrollBar_scrollBar$"]};
var radioButtonRegExp =			{required: ["(Image|ScaleImage)_.*"]};
var radioButtonGroupRegExp =	{required: ["RadioButton_.*"]};
var scrollBarRegExp =			{required: ["Button_arrowDown$", "Button_arrowUp$", "Button_thumb$", ".*_track$", "viewport$"], optional: ["Image_thumbIcon$"]};
var sliderRegExp =				{required: ["Button_btn$", ".*_track$"]};
var stepperRegExp =				{required: ["Label_txt$", "Button_nextBtn$", "Button_prevBtn$"], optional: ["Button_lastBtn$", "Button_firstBtn$"]};
var labelButtonExp = 			{required: ["Label_.*", "(Image|ScaleImage)_.*"]}

//资源名称命名验证正则表达式，1.不允许数字和特殊符号作为命名开始，2.图像图层命名中不能包含中文字符
var firstTokenRegExp = /^([0-9]|\~|\!|\@|\#|\^|\*)/;
var chineseCharRegExp = /[\u4e00-\u9fa5]/;
//消除图层命名中的无意义字符
var dummyTokenList = [/ /g, /副本\d*/g, /copy\d*/g];

//检测按钮组件四态名称易写错的形式
var stateNameList		= ["normal", "over", "down", "disable"];
var stateNameRegExpList	= ["((\\w+?){1}normal)|(normal(\\w+){1})|nromal|norma\\b", "((\\w+?){1}over)|(over(\\w+){1})|ovre", "((\\w+?){1}down)|(down(\\w+){1})|donw", "((\\w+?){1}disable)|(disable(\\w+){1})|disble|disabled/disbled"];

var oldTypeList = ["Bitmap", "ScaleBitmap", "Scroll_", "GroupRadioButton_"];
var newTypeList = ["Image", "ScaleImage", "ScrollBar_", "RadioButtonGroup_"];

//默认Skin模板,模板可根据项目需要调整,可以在PSD2SWF.ini中覆盖定义
var skinCodeTemplate = "package game.skin\n{\n${assetImport}\n\t/*组件结构大纲\n${hint}\n\t*/\n\tpublic class ${className}\n\t{\n\t\tpublic static var skin:Object=\n${placeholder};\n\t\tpublic static var resource:Array=${resource};\n\t}\n}";
//Skin文件默认保存目录为Psd文件目录下的0_code文件夹
var skinCodeFolderPath = "0_code";
var SETTING_FILE_NAME = "PSD2SWF.ini";
var SETTING_SKIN_CODE_FOLDER_TOKEN = "SKIN_CODE_FOLDER=";
var SETTING_SKIN_TEMPLATE_TOKEN = "SKIN_TEMPLATE=";
var SHARED = "shared";
var DEFAULT_IMAGE_QUALITY = 80;
//---------------------------------

main();

function main()
{
	try
	{
		extractFileInfo();
		loadSetting();
		loadSharedXml();
		resizeDocumentCanvas();
		correctDocumentStructure();
		parseDocument();
		validateParseResult();
		writeSkinFile();
		writeAssetXMLFile();
		exportAllLayerToPNG();
	}
	catch (e)
	{
		return "Error: " + psdName + ".psd(" + e.message + ")";
	}
	return "Success$" + parseResult.width + "$" + parseResult.height + "$" + skinFilePath;
}

function resizeDocumentCanvas()
{
	doc.setDocumentCanvasSizeToDocumentExtents(true);
}

function extractFileInfo()
{
	psdPath = doc.filePathForRevert;
	psdFolder = Files.getDirectory(psdPath);
	psdName = Files.getFilename(psdPath).replace(/\.(psd|PSD|png|PNG)/, "");
	skinCodeFolderPath = psdFolder + "/" + skinCodeFolderPath;
}

function loadSharedXml()
{
	var sharedXmlPath = psdFolder + "/shared.xml";
	sharedAssetMap = {};
	if (Files.exists(sharedXmlPath) == true)
	{
		var file = Files.open(sharedXmlPath, "unicode", false);
		var line = "";
		do {
			var pngIndex = line.indexOf(".png");
			if (pngIndex != -1)
			{
				var slashIndex = line.lastIndexOf("\\", pngIndex);
				var sharedResourceKey = line.substring(slashIndex + 1, pngIndex);
				sharedAssetMap[sharedResourceKey] = 1;
			}
			line = file.readlineUTF8();
		} while (line != null);
		file.close();
	}
}

function loadSetting()
{
	var settingFilePath = psdFolder + "/" + SETTING_FILE_NAME;
	if(Files.exists(settingFilePath) == false)
	{
		logError("在PSD文件所在目录下未找到配置文件" + SETTING_FILE_NAME);
		return;
	}
	var file = Files.open(settingFilePath, "unicode", false);
	var line = "";
	do {
		if(line.match(/^\w.+?$/igm) != null)
		{
			readSkinTemplateSetting(line);
			readSkinCodeFolderSetting(line);
		}
		line = file.readlineUTF8();
	} while (line != null);
	file.close();
}

function readSkinTemplateSetting(line)
{
	var index = line.indexOf(SETTING_SKIN_TEMPLATE_TOKEN);
	if(index != -1)
	{
		skinCodeTemplate = line.substring(SETTING_SKIN_TEMPLATE_TOKEN.length);
	}
}

function readSkinCodeFolderSetting(line)
{
	var index = line.indexOf(SETTING_SKIN_CODE_FOLDER_TOKEN);
	if(index != -1)
	{
		skinCodeFolderPath = line.substring(SETTING_SKIN_CODE_FOLDER_TOKEN.length);
		skinCodeFolderPath = convertPathToUrl(skinCodeFolderPath);
	}
}

function writeSkinFile()
{
	var content = generateContainerSkin(parseResult, "\t\t\t");
	var hint = generateHint(parseResult, "\t")
	var assetImport = generateImport(parseResult);
	var skinClassName = psdName + "Skin";
	createInexistentFolder(skinCodeFolderPath);
	skinCodeFolderPath = skinCodeFolderPath + "/game";
	createInexistentFolder(skinCodeFolderPath);
	skinCodeFolderPath = skinCodeFolderPath + "/skin";
	createInexistentFolder(skinCodeFolderPath);
	skinFilePath = skinCodeFolderPath + "/" + skinClassName + ".as";
	Files.deleteFileIfExisting(skinFilePath);
	var file = Files.open(skinFilePath, true, "unicode");
	var str = skinCodeTemplate.replace("${assetImport}", assetImport);
	str = str.replace("${hint}", hint);
	str = str.replace("${className}", skinClassName);
	str = str.replace("${placeholder}", content);
	str = str.replace("${resource}", "[" + resource.substring(0, resource.length - 2) + "]");
	str = str.replace(/\\n/g, "\n");
	str = str.replace(/\\t/g, "\t");
	file.writeUTF8(str);
	file.close();
}

function generateHint(obj, indent)
{
	result = indent + obj.name + ":" + obj.type;
	if(obj.type != "Container")
	{
		return result;
	}
	var len = obj.children != null ? obj.children.length : 0;
	for (var i = 0; i < len; i++)
	{
		var child = obj.children[i];
		result += "\n" + generateHint(child, indent + "\t")
	}
	return result;
}

function generateImport()
{
	var result = "";
	for(var name in assetMap)
	{
		if(sharedAssetMap[name] != null)
		{
			result += "\timport " + SHARED + "." + name + ";" + name + ";\n";
		}
		else
		{
			result += "\timport " + psdName + "." + name + ";" + name + ";\n";
		}
	}
	return result;
}

function writeAssetXMLFile()
{
	var assetXML = "<data name=\"" + psdName + "\">\n";
	for(var name in assetMap)
	{
		var assetPath = psdFolder + "/" + psdName + "/" + name + ".png";
		if(sharedAssetMap[name] != null)
		{
			assetPath = psdFolder + "/" + SHARED + "/" + name + ".png";
		}
		assetXML += "\t<node quality='" + assetMap[name] + "'>" + convertFileName(assetPath) + "</node>\n";
	}
	assetXML += "</data>";
	var xmlPath = psdPath.replace(/\.(psd|PSD|png)/g, ".xml");
	Files.deleteFileIfExisting(xmlPath);
	var file = Files.open(xmlPath, true, "unicode");
	file.writeUTF8(assetXML);
	file.close();
}

function correctDocumentStructure()
{	
	if(verifyDocumentStructure() == false)
	{
		createTopNormalLayer();
		reorderDocumentStructure();
	}
}

function verifyDocumentStructure()
{
	var layerList = doc.topLayers;
	var len = layerList.length;
	for(var i = 0; i < len; i++)
	{
		var layer = layerList[i];
		if(layer.name == "层" || layer.name == "layer")
		{
			return true;
		}
	}
	return false;
}

function createTopNormalLayer()
{
	doc.addNewLayer("层", false);
}

function reorderDocumentStructure()
{
	var sublayerNameList = getSublayerNameList();
	var len = sublayerNameList.length;
	var index = 0;
	for(var i = len - 1; i >= 0; i--)
	{
		var sublayerName = sublayerNameList[i];
		doc.reorderLayer(getLayerIndex(sublayerName), getLayerIndex("层"), false, index++, 2);
	}
}

function getSublayerNameList()
{
	var result = new Array();
	var layerList = doc.topLayers;
	var len = layerList.length;
	for(var i = 0; i < len; i++)
	{
		var layer = layerList[i];
		if(layer.layerType != "normal" || layer.name == "层" || layer.name == "layer")
		{
			continue;
		}
		result.push(layer.name);
	}
	return result;
}

function getLayerIndex(layerName)
{
	var len = doc.layers.length;
	for(var i = len - 1; i >= 0; i--)
	{
		if(doc.layers[i].name == layerName)
		{
			return i;
		}
	}
	return -1;
}

function parseDocument()
{
	var layerList = doc.topLayers;
	var len = layerList.length;
	for (var i = 0; i < len; i++)
	{
		var layer = layerList[i];
		if (layer.layerType == "normal")
		{
			parseResult = parseTopContainer(layer);
		}
	}
}

function parseTopContainer(layer)
{
	var result = new Object();
	result.name = psdName;
	result.type = "Container";
	result.x = 0;
	result.y = 0;
	result.width = doc.width;
	result.height = doc.height;
	result.children = parseLayerList(layer.elems);
	result.bound = calculateContainerBound(result.children);
	return result;
}

function parseContainer(layer)
{
	var result = new Object();
	var obj = parseGroupLayerIdentifier(layer);
	result.name = obj.name;
	result.type = obj.type;
	var children = parseLayerList(layer.elems);
	result.bound = calculateContainerBound(children);
	adjustContainerBound(result);
	adjustChildBound(children, result.bound);
	result.children = children;
	return result;
}

function parseLayerList(layerList)
{
	var result = new Array();
	var len = layerList.length;
	for (var i = len - 1; i >= 0; i--)
	{
		var obj;
		var layer = layerList[i];
		if(layer.visible == false || (layer.frames && layer.frames[0].visible == false))
		{
			return null;
		}
		if (layer.isLayer == true)
		{
			obj = parseGroupLayer(layer);
		}
		else if(layer instanceof Text)
		{
			obj = parseTextLayer(layer);
		}
		else
		{
			obj = parseImageLayer(layer);
		}
		if (obj != null)
		{
			result.push(obj);
		}
	}
	return result;
}

function parseGroupLayer(layer)
{
	var parser = getGroupLayerParser(layer);
	if (parser == null)
	{
		logError(layer.name + "【" +  parseGroupLayerIdentifier(layer).type + "】" + "未找到对应解析函数");
	}
	return parser(layer);
}

function parseList(layer)
{
	var result = parseContainer(layer);
	var children = result.children;
	var len = children.length;
	var itemIndex = -1;
	for (var i = 0; i < len; i++)
	{
		var child = children[i];
		if (child.name == "Item")
		{
			result.item = child;
			itemIndex = i;
			break;
		}
	}
	children.splice(itemIndex, 1);
	return result;
}

//兼容使用透明图片决定可拖拽范围的做法，并且以使用透明图片方式优先级最高
function parseDragBar(layer)
{
	var result = new Object();
	var obj = parseGroupLayerIdentifier(layer);
	result.name = obj.name;
	result.type = obj.type;
	if (result.name != undefined)
	{
		var paramArr = result.name.split("x");
		if (paramArr != null)
		{
			result.x = 0;
			result.y = 0;
			result.width = paramArr[0];
			result.height = paramArr[1];
			result.bound = {x: result.x, y: result.y, width: result.width, height: result.height};
		}
	}
	if (layer.elems.length > 0)
	{
		var firstChild = parseLayerList(layer.elems)[0];
		result.x = firstChild.x;
		result.y = firstChild.y;
		result.width = firstChild.width;
		result.height = firstChild.height;
		result.bound = {x: result.x, y: result.y, width: result.width, height: result.height};
	}
	result.name = "dragBar";
	return result;
}

function parseLabel(layer)
{
	var result = new Object();
	var obj = parseGroupLayerIdentifier(layer);
	result.name = obj.name;
	result.type = obj.type;
	return parseStateGroupLayer(layer, result, "Label", atomParseTextLayer);
}

function parseImage(layer)
{
	var result = new Object();
	var obj = parseGroupLayerIdentifier(layer);
	result.name = obj.name;
	result.type = obj.type;
	return parseStateGroupLayer(layer, result, "Image", atomParseImageLayer);
}

function parseScaleImage(layer)
{
	var result = new Object();
	var obj = parseGroupLayerIdentifier(layer);
	result.name = obj.name;
	result.type = obj.type;
	var paramArr = obj.param.split(",");
	result.top = paramArr[0];
	result.right = paramArr[1];
	result.bottom = paramArr[2];
	result.left = paramArr[3];
	return parseStateGroupLayer(layer, result, "ScaleImage", atomParseImageLayer);
}

//StateGroupLayer:Label, Image, ScaleImage
function parseStateGroupLayer(layer, preprocessResult, typeName, atomParser)
{
	var result = preprocessResult;
	var layerList = layer.elems;
	var len = layerList.length;
	if (len == 0)
	{
		logError(typeName + "【" + result.name + "】格式错误！文件夹内容为空。");
		return result;
	}
	var children = new Array();
	for (var i = 0; i < len; i++)
	{
		var subLayer = layerList[i];
		subLayerName = eliminateDummyTokenOfLayerName(subLayer);
		verifyStateName(layer.name, subLayerName);
		if (subLayer.isLayer == false)
		{
			logError(typeName + "【" + result.name + "】格式错误！文件夹内容包含非状态文件夹内容！");
			return result;
		}
		if (subLayer.isLayer == true && subLayer.elems.length == 0)
		{
			logError(typeName + "【" + result.name + "】格式错误！状态文件夹内容为空！");
			return result;
		}
		result[subLayerName] = atomParser(subLayer.elems[0]);
		children.push(result[subLayerName]);
	}
	result.bound = calculateContainerBound(children);
	adjustContainerBound(result);
	adjustChildBound(children, result.bound);
	return result;
}

function verifyStateName(layerName, stateName)
{
	var len = stateNameList.length;
	for(var i = 0; i < len; i++)
	{
		if(stateName.match(stateNameRegExpList[i]) != null)
		{
			logError(layerName + " 状态名错误:‘" + stateName + "’应为‘" + stateNameList[i] + "'");
		}
	}
}

function parseImageLayer(layer)
{
	var result = new Object();
	var obj = parseImageLayerName(layer);
	result.name = obj.name;
	result.type = "Image";
	result.normal = atomParseImageLayer(layer);
	result.bound = unionRectangle([result.normal]);
	adjustContainerBound(result);
	result.normal.x = result.normal.x - result.bound.x;
	result.normal.y = result.normal.y - result.bound.y;
	return result;
}

function parseTextLayer(layer)
{
	var result = new Object();
	result.name = eliminateDummyTokenOfLayerName(layer);
	result.type = "Label";
	result.normal = atomParseTextLayer(layer)
	result.bound = unionRectangle([result.normal]);
	adjustContainerBound(result);
	result.normal.x = result.normal.x - result.bound.x;
	result.normal.y = result.normal.y - result.bound.y;
	return result;
}

//---------------------------------------------------------------------------------
//Validate document parse result
//---------------------------------------------------------------------------------
function validateParseResult()
{
	var validator = getComponentValidator(parseResult.type);
	if(validator != null)
	{
		validator(parseResult);
	}
}

function validateContainer(obj)
{
	validateComponentNameFirstToken(obj);
	validateChildrenName(obj);
	var len = obj.children != null ? obj.children.length : 0;
	var childNameMap = {};
	for (var i = 0; i < len; i++)
	{
		var child = obj.children[i];
		if(childNameMap[child.name] != null)
		{
			logError("容器【" + obj.name + "】中存在重名的子元素 " + child.name);
		}
		childNameMap[child.name] = true;
		var validator = getComponentValidator(child.type);
		if(validator != null)
		{
			validator(child);
		}
	}
}

function validateList(obj)
{
	validateComponentNameFirstToken(obj);
	if(obj.item == null)
	{
		logError(obj.type + "【" + obj.name + "】格式错误！未包含名为Item的子文件夹");
		return;
	}
	validateContainer(obj.item);
}

function validateImage(obj)
{
	validateComponentNameFirstToken(obj);
	for(var state in obj)
	{
		if(obj[state] instanceof Object)
		{
			if(obj[state].link != null)
			{
				var link = obj[state].link;
				var imageName = link.substring(link.indexOf(".") + 1);
				validateComponentNameFirstToken({type:obj.type, name:imageName});
				if (imageName.match(chineseCharRegExp) != null)
				{
					logError("图像图层【" + imageName + "】命名格式错误！名字中含有中文字符！");
				}
			}
		}
	}
}

function validateScaleImage(obj)
{
	validateImage(obj);
	if((parseInt(obj.top) + parseInt(obj.bottom)) >= obj.hegith)
	{
		logError("九宫图像图层【" + obj.name +  "】九宫图片top和bottom设定值之和不能大于图片height（高度）值！");
	}
	if((parseInt(obj.right) + parseInt(obj.left)) >= obj.width)
	{
		logError("九宫图像图层【" + obj.name +  "】九宫图片right和left设定值之和不能大于图片width（宽度）值！");
	}
}

function validateLabel(obj)
{
	validateComponentNameFirstToken(obj);
}

function validateChildrenName(obj)
{
	var regExp = getComponentRegExp(obj.type);
	if (regExp == null)
	{
		return;
	}
	requiredTotalNum = regExp.required.length;
	var children = obj.children;
	var len = children.length;
	outer:
	for(var i = 0; i < requiredTotalNum; i++)
	{
		var required = regExp.required[i];
		for(var j = 0; j < len; j++)
		{
			var child = children[j];
			var candidate = child.type + "_" + child.name;
			if(candidate.match(required) != null)
			{
				continue outer;
			}
		}
		var content = obj.type + " 组件【" + obj.name + "】格式错误！";
		content += "子元素 " + required.replace("$", "") + " 未找到 ";
		logError(content);
	}
}

function validateComponentNameFirstToken(obj)
{
	if (obj.name.match(firstTokenRegExp) != null)
	{
		logError(obj.type + " 组件【" + obj.name + "】命名格式错误！命名以数字或特殊符号开始！");
	}
}

function getComponentRegExp(type)
{
	return regExpList[findLayerTypeIndex(type)];
}

function getComponentValidator(type)
{
	return validatorList[findLayerTypeIndex(type)];
}

//--------------------------------------------------------------------------
//generate skin output string
//--------------------------------------------------------------------------
function getLayerTypeGenerator(type)
{
	return generatorList[findLayerTypeIndex(type)];
}

function generateChildrenSkin(children, indent)
{
	var result = indent + "[" + "\n";
	children.reverse();
	var len = children.length;
	for (var i = 0; i < len; i++)
	{
		var obj = children[i];
		var generator = getLayerTypeGenerator(obj.type);
		result += generator(obj, indent + "\t");
		if (i < (len - 1))
		{
			result += ",\n";
		}
	}
	result += "\n" + indent + "]\n"
	return result;
}

function generateContainerSkin(obj, indent)
{
	var result = indent + "{";
	result += atomGeneratePropertyListStr(obj, ["name", "type", "x", "y", "width", "height"], [1, 1, 0, 0, 0, 0]) + ",";
	result += "\n";
	result += indent + "\t" + "children:\n";
	result += generateChildrenSkin(obj.children, indent + "\t");
	result += indent + "}";
	return result;
}

function generateListSkin(obj, indent)
{
	var result = indent + "{";
	result += atomGeneratePropertyListStr(obj, ["name", "type", "x", "y", "width", "height"], [1, 1, 0, 0, 0, 0]) + ",";
	result += "\n";
	result += indent + "\t" + "item:\n";
	var generator = getLayerTypeGenerator(obj.item.type);
	result += "\t" + generator(obj.item, indent + "\t") + ",";
	result += "\n";
	result += indent + "\t" + "children:\n";
	result += generateChildrenSkin(obj.children, indent + "\t");
	result += indent + "}";
	return result;
}

function generateDragBarSkin(obj, indent)
{
	var result = indent + "{";
	result += atomGeneratePropertyListStr(obj, ["name", "type", "x", "y", "width", "height"], [1, 1, 0, 0, 0, 0]);
	result += "}";
	return result;
}

function generateImageSkin(obj, indent)
{
	var result = indent + "{";
	result += atomGeneratePropertyListStr(obj, ["name", "type", "x", "y", "width", "height"], [1, 1, 0, 0, 0, 0]) + ",";
	for(var state in obj)
	{
		if(obj[state] instanceof Object)
		{
			if(obj[state].link != undefined)
			{
				result += "\n" + indent + "\t" + state + ":" + atomGenerateImageObjStr(obj[state]) + ",";
				resource += "{type:\"Image\", link:" + "\"" + obj[state].link + "\"}, ";
			}
		}
	}
	result = result.substring(0, result.length - 1);
	result += "\n" + indent + "}"
	return result;
}

function generateScaleImageSkin(obj, indent)
{
	var result = indent + "{";
	result += atomGeneratePropertyListStr(obj, ["name", "type", "x", "y", "width", "height", "top", "right", "bottom", "left"], [1, 1, 0, 0, 0, 0, 0, 0, 0, 0]) + ",";
	for(var state in obj)
	{
		if(obj[state] instanceof Object)
		{
			if(obj[state].link != undefined)
			{
				result += "\n" + indent + "\t" + state + ":" + atomGenerateImageObjStr(obj[state]) + ",";
				resource += "{type:\"ScaleImage\", link:" + "\"" + obj[state].link + "\", width:" + obj.width + ", height:" + obj.height + ", top:" + obj.top + ", right:" + obj.right + ", bottom:" + obj.bottom + ", left:" + obj.left + "}, ";
			}
		}
	}
	result = result.substring(0, result.length - 1);
	result += "\n" + indent + "}"
	return result;
}

function generateLabelSkin(obj, indent)
{
	var result = indent + "{";
	result += atomGeneratePropertyListStr(obj, ["name", "type", "x", "y", "width", "height"], [1, 1, 0, 0, 0, 0]) + ",";
	for(var state in obj)
	{
		if(obj[state] instanceof Object)
		{
			if(obj[state].format != undefined)
			{
				result += "\n" + indent + "\t" + state + ":" + atomGenerateTextObjStr(obj[state]) + ",";
			}
		}
	}
	result = result.substring(0, result.length - 1);
	result += "\n" + indent + "}";
	return result;
}

//---------------------------------------------------------------------------------
//atom operation
//---------------------------------------------------------------------------------
function atomParseTextLayer(layer)
{
	if((layer instanceof Text) == false)
	{
		logError("【" + layer.name + "】为图像图层，在Label组件中应为文本图层！");
		return;
	}
	var result = new Object();
	result.name = eliminateDummyTokenOfLayerName(layer);
	result.x = layer.left;
	result.y = layer.top + 1;
	result.width = layer.width;
	result.height = layer.height;
	result.content = "";
	result.rawContent = "";
	var textRunsArr = layer.textRuns.textRuns;
	result.format = parseTextDefaultTextFormat(layer.textRuns.initialAttrs);
	var len = textRunsArr.length;
	for (var i = 0; i < len; i++)
	{
		var content = textRunsArr[i].characters;
		if (typeof (content) == "string")
		{
			content = content.replace(/\r/g, "\\r");
		}
		result.rawContent += content;
		var obj = textRunsArr[i].changedAttrs;
		if (obj.underline == true)
		{
			content = "<u>" + content + "</u>";
		}
		else
		{
			result.format.underline = false;
		}
		if (obj.bold == true)
		{
			content = "<b>" + content + "</b>";
		}
		else
		{
			result.format.bold = false;
		}
		content = "<font color='" + obj.fillColor + "'>" + content + "</font>";
		result.content += content;
	}
	result.width = refineTextLayerWidth(result, layer.textRuns.initialAttrs);
	result.bound = {x: layer.left, y: layer.top + 1, width: layer.width, height: layer.height + 1};
	return result;
}

function refineTextLayerWidth(textObj, textAttrs)
{
	var result = textObj.width;
	var rawContent = textObj.rawContent;
	var kerning = textAttrs.rangeKerning;
	var refinedKerning = Math.round(kerning);
	var lineList = rawContent.split("\\r");
	var len = lineList != null ? lineList.length : 0;
	var maxCharNum = 0;
	for(var i = 0; i < len; i++)
	{
		var line = lineList[i];
		if(line.length > maxCharNum)
		{
			maxCharNum = line.length;
		}
	}
	result += (refinedKerning - kerning) * maxCharNum;
	result = Math.ceil(result);
	return result;
}

function parseTextDefaultTextFormat(textAttrs)
{
	var result = new Object();
	result.align = textAttrs.alignment;
	result.bold = textAttrs.bold;
	result.color = textAttrs.fillColor.replace("#", "0x");
	result.font = textAttrs.face;
	result.italic = textAttrs.italic;
	result.size = parseFontSize(textAttrs.size);
	result.letterSpacing = textAttrs.rangeKerning;
	var leading = 0;
	if(textAttrs.leadingMode == "percentage")
	{
		leading = result.size * (textAttrs.leading - 1) ;
	}
	else
	{
		leading = textAttrs.leading - result.size;
	}
	leading = leading > 0 ? leading : 0;
	result.leading = Math.round(leading * 100) * 0.01;
	result.underline = textAttrs.underline;
	return result;
}

function parseFontSize(sizeStr)
{
	var result = sizeStr.replace("pt", "");
	return Math.round(parseFloat(result));
}

function atomParseImageLayer(layer)
{	
	if((layer instanceof Text) == true)
	{
		logError("【" + layer.name + "】为文本图层，在Image组件中应为图像图层！");
		return;
	}
	var result = new Object();
	var obj = parseImageLayerName(layer);
	if(assetMap[obj.name] == undefined || obj.quality > parseInt(assetMap[obj.name]))
	{
		assetMap[obj.name] = obj.quality;
	}
	var prefix = psdName;
	if (sharedAssetMap[obj.name] != null)
	{
		prefix = SHARED;
	}
	result.link = prefix + "." + obj.name;
	var rect = layer.pixelRect;
	result.x = rect.left;
	result.y = rect.top;
	result.width = rect.right - rect.left;
	result.height = rect.bottom - rect.top;
	result.bound = {x: layer.left, y: layer.top, width: layer.width, height: layer.height};
	return result;
}

function atomGenerateTextObjStr(obj)
{
	var result = "{";
	result += atomGeneratePropertyListStr(obj, ["x", "y", "width", "height", "content"], [0, 0, 0, 0, 1]) + ",";
	result += "format:{";
	result += atomGeneratePropertyListStr(obj.format, ["align", "bold", "color", "font", "italic", "leading", "letterSpacing", "size", "underline"], [1, 0, 0, 1, 0, 0, 0, 0, 0]);
	result += "}}";
	return result;
}

function atomGenerateImageObjStr(obj)
{
	return "{" + atomGeneratePropertyListStr(obj, ["link", "x", "y", "width", "height"], [1, 0, 0, 0, 0]) + "}";
}

//0为数字，1为字符串
function atomGeneratePropertyListStr(obj, propertyList, typeList)
{
	if (propertyList.length != typeList.length)
	{
		logError("属性长度和属性类型长度不符");
		return "";
	}
	var result = "";
	var len = propertyList.length;
	for (var i = 0; i < len; i++)
	{
		result += atomGenerateObjPropertyStr(obj, propertyList[i], typeList[i]);
		if (i < (len - 1))
		{
			result += ",";
		}
	}
	return result;
}

function atomGenerateObjPropertyStr(obj, property, type)
{
	var result = "";
	if (type == 0)
	{
		result += property + ":" + obj[property];
	}
	else
	{
		result += property + ":" + "\"" + obj[property] + "\"";
	}
	return result;
}

//----------------------------------------------------------------
//Tools
//----------------------------------------------------------------
function parseImageLayerName(layer)
{
	var str = eliminateDummyTokenOfLayerName(layer);
	var obj = new Object();
	var paramList = str.split("_");
	obj.name = paramList[0];
	obj.quality = paramList[1] == undefined ? DEFAULT_IMAGE_QUALITY : paramList[1];
	if(isNaN(Number(obj.quality)) == true)
	{
		logError("组件【 " + str + " 】的图片质量不是数字！下划线后面必须是数字!");
	}
	return obj;
}

function parseGroupLayerIdentifier(layer)
{
	var str = eliminateDummyTokenOfLayerName(layer);
	var obj = new Object();
	var paramList = str.split("_");
	obj.name = extractLayerName(paramList);
	obj.type = extractLayerType(paramList);
	obj.param = extractLayerParam(paramList);
	return obj;
}

function getGroupLayerParser(layer)
{
	var obj = parseGroupLayerIdentifier(layer);
	var type = obj.type;
	var index = findLayerTypeIndex(type);
	if (index > -1)
	{
		return parserList[index];
	}
	return null;
}

function extractLayerType(paramList)
{
	var type = paramList[0];
	var index = findLayerTypeIndex(type);
	if (index > -1)
	{
		return type;
	}
	return "Container";
}

function findLayerTypeIndex(type)
{
	var len = typeList.length;
	for (var i = 0; i < len; i++)
	{
		if (typeList[i] == type)
		{
			return i;
		}
	}
	return -1;
}

function extractLayerName(paramList)
{
	if (paramList[1] == undefined)
	{
		return paramList[0];
	}
	return paramList[1];
}

function extractLayerParam(paramList)
{
	if (paramList[2] == undefined)
	{
		return "4,4,4,4"; //default value
	}
	return paramList[2];
}

function eliminateDummyTokenOfLayerName(layer)
{
	var name = layer.name;
	var len = dummyTokenList.length;
	for (var i = 0; i < len; i++)
	{
		name = name.replace(dummyTokenList[i], "");
	}
	 //replace legacy type
    var typeLen = oldTypeList.length;
    for (var j = 0; j < typeLen; j++)
    {
            name = name.replace(oldTypeList[j], newTypeList[j]);
    }
	return name;
}

function unionRectangle(rectList)
{
	if(rectList.length == 0)
	{
		return {x:0, y:0, width:0, height:0};
	}
	var result = new Object();
	var left = 1048576;
	var top = 1048576;
	var right = -1048576;
	var bottom = -1048576;
	var len = rectList.length;
	for (var i = 0; i < len; i++)
	{
		var rect = rectList[i];
		if (left > rect.x)
		{
			left = rect.x;
		}
		if (top > rect.y)
		{
			top = rect.y;
		}
		if (right < (rect.width + rect.x))
		{
			right = rect.width + rect.x;
		}
		if (bottom < (rect.height + rect.y))
		{
			bottom = rect.height + rect.y;
		}
	}
	result.x = left;
	result.y = top;
	result.width = right - left;
	result.height = bottom - top;
	return result;
}

function calculateContainerBound(children)
{
	var rectList = new Array();
	var len = children.length;
	for (var i = 0; i < len; i++)
	{
		rectList.push(children[i].bound);
	}
	return unionRectangle(rectList);
}

function adjustContainerBound(obj)
{
	var bound = obj.bound;
	obj.x = bound.x;
	obj.y = bound.y;
	obj.width = bound.width;
	obj.height = bound.height;
}

function adjustChildBound(children, parentBound)
{
	var len = children.length;
	for (var j = 0; j < len; j++)
	{
		var childObj = children[j];
		childObj.x = childObj.bound.x - parentBound.x;
		childObj.y = childObj.bound.y - parentBound.y;
	}
}

function dumpSimpleObj(obj)
{
	var result = "";
	for (var str in obj)
	{
		if (obj[str] instanceof Object)
		{
			result += "\t" + str + " :" + dumpSimpleObj(obj[str]);
		}
		else
		{
			result += str + " :" + obj[str] + "\n";
		}
	}
	return result;
}

//----------------------
//http://www.xlobby.com/forum/viewtopic.php?f=7&t=5606
//----------------------
function exportAllLayerToPNG()
{
	var dom = fw.getDocumentDOM();
	var elems = new Array().concat(fw.selection);
	dom.selectNone();

	dom.setDocumentCanvasColor("#ffffff00");
	var sXO = dom.exportOptions;
	var oldcrop = sXO.crop;
	sXO.crop = true;
	sXO.ditherMode = "none";
	sXO.ditherPercent = 100;
	sXO.exportFormat = "PNG";
	sXO.colorMode = "32 bit";
	sXO.optimized = true;
	sXO.paletteTransparencyType = "rgba";

	var f = dom.currentFrameNum;
	var n = dom.layers.length;
	var i, j, m, elem;
	var visArr = new Array();
	for (i = 0; i < n; i++)
	{
		var layer = dom.layers[i];
		if (layer.layerType == "web") continue;
		if(layer.frames[f].visible == false)
		{
			dom.setLayerVisible(-1, -1, true, true);
		}
		m = layer.frames[f].elements.length;
		for (j = 0; j < m; j++)
		{
			elem = layer.frames[f].elements[j];
			elem.visible = false;
			visArr.push(elem);
		}
	}

	var rect, name, filename;
	for (i = 0; i < n; i++)
	{
		var layer = dom.layers[i];
		if (layer.layerType == "web") continue;
		m = layer.frames[f].elements.length;
		for (j = 0; j < m; j++)
		{
			elem = layer.frames[f].elements[j];
			if (elem instanceof Text) continue; //ignore text elements
			rect = elem.pixelRect;
			elem.visible = true;
			name = parseImageLayerName(elem).name;
			var folderPath = psdFolder + "/" + psdName;
			createInexistentFolder(folderPath);
			filename = folderPath + "/" + name + ".png";
			sXO.cropLeft = rect.left;
			sXO.cropRight = rect.right;
			sXO.cropTop = rect.top;
			sXO.cropBottom = rect.bottom;
			fw.exportDocumentAs(dom, filename, sXO);
			elem.visible = false;
		}
	}
	i = visArr.length;
	while (i--) visArr[i].visible = true;
	sXO.crop = oldcrop;
	dom.lastExportDirectory = psdFolder;
	fw.selection = elems;
}

function convertFileName(fileName)
{
	fileName = fileName.replace("file:///", "");
	fileName = fileName.replace("|", ":");
	fileName = fileName.replace(/\//g, "\\");
	return fileName;
}

function logError(msg)
{
	throw new Error(msg);
}

function createInexistentFolder(path)
{
	if (Files.exists(path) == false)
	{
		if(Files.createDirectory(path) == false)
		{
			logError("创建路径 " + path + " 失败! 请检查路径是否存在。");
		}
	}
}

function convertPathToUrl(path)
{
	var result = path.replace(/\\/g, "/");
	result = result.replace(/([cdefg])\:/ig, "file:///$1|"); 
	return result;
}