
#!/usr/bin/python3

# 根据美术提交的exml 把图片转换成组件
import os
import re
import codecs  # 或者io，使用哪种包无所谓
import math
import json
import xml.sax
from xml.dom.minidom import parse
import xml.dom.minidom
import re

class ConverComponent():

    reParse = True#重新解析，等通用组件稳定后设置为false 就不用每次都重新解析

    allSubDirs = []
    pathPrefix = ""
    allFileDef = ""
    defFolder = ""
    defModel = ""
    componentDir = ""
    confFile = ""  # 配置文件
    # key: image name , value: component name 映射图片名称到组件名称,组件名称对应多个图片名称的映射
    componentJson = {}
    commonWinFrameJson = {}
    imageHead = "<e:Image"
    imageSource = "source"

    txtIndex = 1

    nameArr = ['a', 'a', 'a']
    nameIndex = 1

    componentList = ["BG","Component", "list", "btn", "Button", "tab", "progressbar", "progress", "bar", "check", "checkbox", "Image"]
    componentListName = ["Component", "Component", "list", "Button", "Button", "TabBar", "ProgressBar", "ProgressBar", "ProgressBar", "CheckBox", "CheckBox", "Image"]
    xmlTypeMap = {}
    xmlType_custom_component = "ns1"
    xmlType_egret_component = "e"

    comMap = {}

    #包含这些单词的都是panel类型 映射panel用的
    panelTypes = ["win", "window", "panel", "dialog"]
    componentPanelJson = {}
    panelFile = ""

    #保存一个值 key：文件名，value：true/false true是说这个文件已经解析过了，不用再解析
    dataJson = {}
    dataFile = ""

    modelName = ""
    msgDef = ""

    workDir = ""
    wordSubDirs = []

    def initData(self):
        self.xmlTypeMap["item"] = "ns1"

    def mapComponentName(self):
        for i in range(0, len(self.componentList)):
            key = self.componentList[i]
            val = self.componentListName[i]
            self.comMap[key] = val

    def parseComponentFile(self):

        self.mapComponentName()

        curPath = os.getcwd()  # 返回当前工作目录
        self.confFile = curPath + "\\conf.json"  # 映射图片名称到组件名称,组件名称对应多个图片名称的映射
        self.componentJson = self.loadJsonFile(self.confFile)

        # 保存哪些文件已经处理过的，以后不再解析
        self.dataFile = curPath + "\\data.json"
        self.dataJson = self.loadJsonFile(self.dataFile)

        self.panelFile = curPath + "\\panel.json"
        self.componentPanelJson = self.loadJsonFile(self.panelFile)

        wdParentDir = os.path.join(os.getcwd(), "../../")
        wdParentDir = os.path.abspath(wdParentDir)
        self.componentDir = wdParentDir + "\\project\\resource\\skins\\common\\"

        self.pathPrefix = self.componentDir
        self.allSubDirs.append(self.componentDir)
        while(len(self.allSubDirs) > 0):
            arrlen = str(len(self.allSubDirs))
            print("处理一个目录,目前长度：" + arrlen)
            path = self.allSubDirs.pop()
            if(os.path.isdir(path)):
                self.parseOneComponentDir(path)

        self.saveJsonFile(self.confFile, self.componentJson)
        self.saveJsonFile(self.dataFile, self.dataJson)
        self.saveJsonFile(self.panelFile, self.componentJson)

    def parseOneComponentDir(self, onePath):
        fileNames = os.listdir(onePath)
        for fileName in fileNames:
            if os.path.isdir(fileName):
                subpath = onePath + fileName
                self.allSubDirs.append(subpath)
                #print("目录：" + fileName)
                continue
            if(fileName.find(".") < 0):
                subpath = onePath + fileName
                self.allSubDirs.append(subpath)
                #print("目录：" + fileName)
                continue
            isEXML = fileName.find(".exml")
            if(isEXML < 0):
                continue
            fullName = onePath + "\\" + fileName

            namearr = fileName.split(".")
            onlyName = namearr[0]
            # if onlyName in self.dataJson:
            #     curOver = self.dataJson[onlyName]
            # else:
            #     curOver = False
            if onlyName in self.dataJson:
                curOver = True
            else:
                curOver = False
            
            if not curOver:
                self.doParseComponentFile(fullName, fileName)
                self.dataJson[onlyName] = True
            elif self.reParse:
                self.doParseComponentFile(fullName, fileName)
                self.dataJson[onlyName] = True

    def doParseComponentFile(self, file, fileName):
        try:
            DOMTree = xml.dom.minidom.parse(file)
            collection = DOMTree.documentElement  # dom element
            isPanel = False
            componentClass = collection.getAttribute("class")

            lowerCaseName = (componentClass + "").lower()

            for typename in self.panelTypes:
                if lowerCaseName.find(typename)>=0:
                    isPanel = True
                    break
            if isPanel:
                self.confParsePanel(collection, componentClass)
            else:
                self.confParseComponent(collection, componentClass)
            #test
            # if fileName=="BG5":
            #     print(fileName)

        finally:
            print("over ")


    def confParsePanel(self, collection, className):
        componentClass = className
        for child in collection.childNodes:
            if child.attributes == None:
                continue

            component2ImgMap = {}
            # self.componentPanelJson[componentClass] = component2ImgMap

            imgSrc = child.getAttribute("source")
            if imgSrc and imgSrc != "ui_cm_hd_png":
                self.componentPanelJson[imgSrc] = componentClass
                component2ImgMap[imgSrc] = imgSrc
                self.componentJson[imgSrc] = componentClass

            imgSrcUp = child.getAttribute("source.up")
            if imgSrcUp and imgSrcUp != "ui_cm_hd_png":
                self.componentPanelJson[imgSrcUp] = componentClass
                self.componentJson[imgSrcUp] = componentClass

            imgSrcDown = child.getAttribute("source.down")
            if imgSrcDown and imgSrcDown != "ui_cm_hd_png":
                self.componentPanelJson[imgSrcDown] = componentClass
                self.componentJson[imgSrcDown] = componentClass

            imgSrcDisabled = child.getAttribute("source.disabled")
            if imgSrcDisabled and imgSrcDisabled != "ui_cm_hd_png":
                self.componentPanelJson[imgSrcDisabled] = componentClass
                self.componentJson[imgSrcDisabled] = componentClass
            
            iconSrc = child.getAttribute("icon")
            if iconSrc and iconSrc != "ui_cm_hd_png":
                self.componentPanelJson[iconSrc] = componentClass
                component2ImgMap[iconSrc] = iconSrc
                self.componentJson[iconSrc] = componentClass


    def confParseComponent(self, collection, className):
        componentClass = className
        for child in collection.childNodes:
            if child.attributes == None:
                continue

            component2ImgMap = {}
            # self.componentJson[componentClass] = component2ImgMap

            imgSrc = child.getAttribute("source")
            if imgSrc and imgSrc != "ui_cm_hd_png":
                self.componentJson[imgSrc] = componentClass
                component2ImgMap[imgSrc] = imgSrc

            imgSrcUp = child.getAttribute("source.up")
            if imgSrcUp and imgSrcUp != "ui_cm_hd_png":
                self.componentJson[imgSrcUp] = componentClass

            imgSrcDown = child.getAttribute("source.down")
            if imgSrcDown and imgSrcDown != "ui_cm_hd_png":
                self.componentJson[imgSrcDown] = componentClass

            imgSrcDisabled = child.getAttribute("source.disabled")
            if imgSrcDisabled and imgSrcDisabled != "ui_cm_hd_png":
                self.componentJson[imgSrcDisabled] = componentClass
            
            iconSrc = child.getAttribute("icon")
            if iconSrc and iconSrc != "ui_cm_hd_png":
                self.componentJson[iconSrc] = componentClass
                component2ImgMap[iconSrc] = iconSrc

    def loadJsonFile(self, file):
        with open(file, 'r') as f:
            data = json.load(f)
        return data

    # file ：文件路径
    def saveJsonFile(self, file, data):
        with open(file, 'w') as f:
            json.dump(data, f)


# ***********************************把美术的exml 转成程序组件的exml*******************************************


    def parseExmlFile(self):
        wdParentDir = os.path.join(os.getcwd(), "../../../")
        wdParentDir = os.path.abspath(wdParentDir)
        self.workDir = wdParentDir + "\\art\\ui\\psdExport\\"
        if self.modelName=='':
            subDir = self.workDir
        else:
            subDir = self.workDir + '\\' + self.modelName + '\\'
        self.wordSubDirs.append(subDir)
        while(len(self.wordSubDirs) > 0):
            arrlen = str(len(self.wordSubDirs))
            print("处理一个目录,目前长度：" + arrlen)
            path = self.wordSubDirs.pop()
            if(os.path.isdir(path)):
                endStr1 = path[len(path)-1]
                if endStr1=='\\':
                    path
                else:
                    path = path + '\\'
                self.parseOneWorkDir(path)

    def parseOneWorkDir(self, onePath):
        fileNames = os.listdir(onePath)
        for fileName in fileNames:
            if fileName=='export':
                continue
            if os.path.isdir(fileName):
                subpath = onePath + fileName + '\\'
                self.wordSubDirs.append(subpath)
                #print("目录：" + fileName)
                continue
            if(fileName.find(".") < 0):
                subpath = onePath + fileName + '\\'
                self.wordSubDirs.append(subpath)
                #print("目录：" + fileName)
                continue
            isEXML = fileName.find(".exml")
            if(isEXML < 0):
                continue
            fullName = onePath + fileName
            self.doParseOneWorkFile(fullName, fileName, onePath)

    def getClassName(self, classString):
        machObj = re.match("([\u4e00-\u9fa5])", classString)
        if machObj:
            print(classString)
        yushu = self.nameIndex % 26
        shang = math.floor(self.nameIndex / 26)+1
        chName = ""
        namelen = len(self.nameArr)
        for i in range(0, shang):
            if i<namelen:
                cn = ord(self.nameArr[i]) + yushu
                chName = chName + chr(cn)
        
        classString = re.sub(u"([\u4e00-\u9fa5\s])", chName, classString)
        # machObj = re.match("([\u4e00-\u9fa5])", classString)
        # if machObj:
        #     chName = ""
        #     for cc in classString:
        #         cn = ord(cc)
        #         if(cn >= 19968):
        #             chName = chName + chr(cn - 19903)
        #         else:
        #             chName = chName + cc
        # else:
        #     chName = classString

        self.nameIndex = self.nameIndex + 1
        return chName

    def doParseOneWorkFile(self, file, fileName, onePath):  # 解析一个exml文件
        try:
            DOMTree = xml.dom.minidom.parse(file)
            collection = DOMTree.documentElement  # dom element

            componentClass = collection.getAttribute("class")

            exmlClassName = componentClass
            exmlClassName = self.getClassName(exmlClassName)
            # exmlClassName = re.sub(u"([\u4e00-\u9fa5\s])", "", exmlClassName)

            fileStr = '<?xml version="1.0" encoding="utf-8"?>'
            fileStr = fileStr + '\n' + '<e:Skin class="' + exmlClassName + 'Skin" width="720" height="1280" xmlns:e="http://ns.egret.com/eui" xmlns:w="http://ns.egret.com/wing">' + '\n'
            comStr = ""
            lastComponent = ""#上一个图片对应的组件
            lastCoord = {}
            lastCoord["x"] = 0
            lastCoord["y"] = 0
            curCoord = {}
            curCoord["x"] = 0
            curCoord["y"] = 0

            labelContentStr = ""
            
            for child in collection.childNodes:
                if child.attributes == None:
                    continue

                imgSrc = child.getAttribute("source")
                if imgSrc in self.componentJson:
                    img2ComClassName = self.componentJson.get(imgSrc)  # 图片对应的组件
                else:
                   img2ComClassName = None
                   
                if img2ComClassName==None:#此图片没有相应的组件，是独立的图片
                    if child.tagName=='e:Label':
                        labelContentStr = labelContentStr + self.getNodeStr(child)
                    else:
                        comStr = comStr + self.getNodeStr(child)
                    continue
                elif imgSrc and imgSrc != "ui_cm_hd_png":
                    img2ComClassName = self.componentJson.get(imgSrc)  # 图片对应的组件

                    # 多张图片对应一个组件的时候就把多个组件都创建出来算了，自己再删
                    if img2ComClassName == lastComponent:#这张图片跟上一张是同一个组件，就要判断坐标，判断是否要创建
                        imgWidth = int(child.getAttribute("width"))
                        imgHeight = int(child.getAttribute("height"))
                        if not imgWidth:
                            imgWidth = 5
                        if not imgHeight:
                            imgHeight = 5
                        if child.getAttribute("x"):
                            curCoord["x"] = int(child.getAttribute("x"))
                        if child.getAttribute("y"):
                            curCoord["y"] = int(child.getAttribute("y"))
                        if abs(curCoord["x"] - lastCoord["x"])>imgWidth and abs(curCoord["y"] - lastCoord["y"])>imgHeight:
                            comStr = comStr + self.getComponentStr(child, img2ComClassName)
                        else:
                            print("图片的"+imgSrc+"组件：" + lastComponent)#已经加了组件了
                    else:
                        comStr = comStr + self.getComponentStr(child, img2ComClassName)
                    
                    # comStr = comStr + self.getComponentStr(child, img2ComClassName)

                    lastComponent = img2ComClassName
                    if child.getAttribute("x"):
                        lastCoord["x"] = int(child.getAttribute("x"))
                    if child.getAttribute("y"):
                        lastCoord["y"] = int(child.getAttribute("y"))
            
            comStr = comStr + labelContentStr
            fileStr = fileStr + comStr + '\n' + '</e:Skin>'
            exmlFilePath = onePath + '\\export\\'
            #exmlFilePath = self.workDir + 'exmlExportFile\\'
            if(not os.path.exists(exmlFilePath) ):
                os.mkdir(exmlFilePath)
            exmlFileName = componentClass
            
            exmlFile = exmlFilePath + exmlFileName + 'Skin.exml'
            self.saveExmlFile(exmlFile, fileStr)

        finally:
            print("over... ")

    def getComponentStr(self, childNode, skinName):
        nodex = childNode.getAttribute("x")
        nodey = (childNode.getAttribute("y"))
        nodew = childNode.getAttribute("width")
        nodeh = childNode.getAttribute("height")
        ycoord = int(nodey)
        if(ycoord > 1157):
            return ''
        if skinName == "BG1":
            nodex = "0"
            nodey = "0"
        typeName = "Component"
        tmp = (skinName+"").lower()
        xmlTypeStr = self.xmlType_egret_component
        for i in range(0, len(self.componentList)):
            key = self.componentList[i]
            key2 = str(key).lower()
            strIndex = tmp.find(key2)
            if(strIndex >= 0):
                typeName = self.comMap[key]
                xmlTypeStr = self.xmlType_egret_component
                break
            else:
                xmlTypeStr = self.xmlType_custom_component
        if typeName == "Component":
            xmlTypeStr = "e"
        if skinName=="BG7":
            return '\t<'+xmlTypeStr+':'+typeName+' skinName="'+skinName+'" />' + '\n'
        
        return '\t<'+xmlTypeStr+':'+typeName+' skinName="'+skinName+'" x="'+nodex+'" y="'+nodey+'" width="'+nodew+'" height="'+nodeh+'" />' + '\n'

    def getNodeStr(self, childNode):
        if childNode.tagName=='e:Image' and childNode.getAttribute("source")=='':
            return ''
        nodey = (childNode.getAttribute("y"))
        if nodey=='':
            nodey = 0
        ycoord = int(nodey)
        if(ycoord>1139 or ycoord<70):#顶底
            return ''
        nodestr = '\t<' + childNode.tagName + ' '
        labelTagName = 'e:Label'
        imageTagName = 'e:Image'
        endIdx = -1
        percentStr = ""
        scaleStr = ""
        ppp = 1
        isPercentImage = False
        if childNode.getAttribute("source").find('%')>=0:
            isPercentImage = True
        for attr in childNode.attributes._attrs:
            ppp = 1
            val = childNode.getAttribute(attr)
            if childNode.tagName=='e:Label' and attr=="id":
                val = val + str(self.txtIndex)
                self.txtIndex = self.txtIndex + 1
                val = re.sub(u"([\u4e00-\u9fa5\s])", "", val)
                continue
            if childNode.tagName==labelTagName and attr=='width':
                continue
            if childNode.tagName==labelTagName and attr=='height':
                continue
            # if childNode.tagName==imageTagName and attr=='width':
            #     continue
            # if childNode.tagName==imageTagName and attr=='height':
            #     continue
            if childNode.tagName=='e:Image' and attr=='source':
                endIdx = val.find("%")
                if endIdx>=0:
                    startIdx = 0
                    for i in range(endIdx, 0, -1):
                        if val[i]=="_":
                            startIdx = i
                            break
                    percentStr = val[startIdx:endIdx+1]
                    val = val.replace(percentStr, "")
                    # tmpp = percentStr[1:len(percentStr)-1]
                    # if tmpp.isdigit():
                    #     ppp = int(tmpp)/100
                    #     scaleStr = ' scaleX="'+str(ppp)+'" scaleY="'+str(ppp)+'" '
                        
            # if attr=="width":
            #     tmpval = math.floor(float(val))
            #     val = str( math.floor(int(tmpval)/ppp) )
            # if attr=="height":
            #     tmpval = math.floor(float(val))
            #     val = str( math.floor(int(tmpval)/ppp) )
            if attr=="x" and int(val) > 720:
                val = 200
            if attr=='y' and int(val) > 1280:
                val = 200
            nodestr = nodestr + attr +'="' + val + '" '
        if endIdx>=0:
            nodestr = nodestr + scaleStr + '/>' + '<!--' + percentStr + '-->\n'
        else:
            nodestr = nodestr + '/>\n'
        return nodestr

    def saveExmlFile(self, file, fileStr):
        with codecs.open(file, 'w', 'utf-8') as f:
            f.seek(0, 0)
            f.write(fileStr)
            f.flush()
            f.close()

cc = ConverComponent()
cc.modelName = input("解析目录 : ")
cc.parseComponentFile()
cc.parseExmlFile()



