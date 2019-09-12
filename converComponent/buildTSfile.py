

import os
import re
import codecs  # 或者io，使用哪种包无所谓
import math
import json
import xml.sax
from xml.dom.minidom import parse
import xml.dom.minidom
import re

class buildTSfile():

    path = "E:\\stoneage\\client\\project\\resource\\skins\\"

    out = "E:\\stoneage\\client\\out\\"

    modelName = input("解析目录 : ")

    path = path + modelName + "\\"

    onePath = path

    allNodeStr = ""

    machprefix = {}
    machprefix["e"] = "e"
    machprefix["ns1"] = "ns1"

    prefixMap = {}
    prefixMap["e"] = "e:"
    prefixMap["ns1"] = "ns1:"

    machstr = ["e:" ,"ns1:"]
    mapmachstr = {}
    mapmachstr[machstr[0]] = "eui."
    mapmachstr[machstr[1]] = ""

    def doBuild(self):
        if not os.path.exists(self.out):
            os.mkdir(self.out)
        print("------------------------ start")
        fileNames = os.listdir(self.onePath)
        for fileName in fileNames:
            isEXML = fileName.find(".exml")
            if(isEXML > 0):
                file = self.onePath + fileName
                self.doParseOneWorkFile(file, self.onePath)
        print("------------------------ end")

    def doParseOneWorkFile(self, file, onePath):
        DOMTree = xml.dom.minidom.parse(file)
        collection = DOMTree.documentElement  # dom element

        componentClass = collection.getAttribute("class")

        exmlClassName = componentClass
        tsClassName = self.getClassName(exmlClassName)
        
        self.allNodeStr = ""
        
        self.parseNodes(collection)
        tsfile = self.out + tsClassName + ".ts"

        ext = ""
        constructstr =""
        if tsClassName.find("item")>=0 or tsClassName.find('Item')>=0:
            ext = " extends eui.ItemRenderer"
            constructstr = "\n\tpublic constructor() {\n" + "\t\tsuper();\n" + '\t}'
        else:
            ext = " extends EBaseView"
            constructstr = "\n\tpublic constructor() {\n" + "\t\tsuper();\n" + '\t\tthis.skinName = "'+exmlClassName+'";\n\n\t}'
		
        funcstr = "\n\tprotected childrenCreated() {\n" + "\t\tsuper.childrenCreated();\n" + "\t}\n"
		

        filestr = "\n\nclass " + tsClassName + ext + "{\n\n" + self.allNodeStr + "\n" + constructstr + funcstr + "}"

        self.saveTsfile(tsfile, filestr)
        

    def parseNodes(self, nodes):
        for child in nodes.childNodes:
            if child.attributes == None or ( (child.attributes == None) and ((not child.childNodes) or (child.childNodes.length==0))):
                continue
            self.parseNode(child)


    def parseNode(self, node):
        # nodestr = ""
        if ((not node.attributes) and (not node.childNodes)) or ((not node.childNodes) and node.attributes and (node.attributes==None or node.attributes.length==0)) :
            return self.getAttributeStr(node)
        self.allNodeStr = self.allNodeStr + self.getAttributeStr(node)
        # print(self.allNodeStr)
        if (not not node.childNodes) and (node.childNodes.length>0):
            self.parseNodes(node)

    def getAttributeStr(self, node):
        str = ""
        if not node.getAttribute("id"):
            str = ""
        elif node.attributes:
            if node.prefix in self.machprefix:
                prefixstr = self.machprefix[node.prefix]
                tagnamestr = self.prefixMap[prefixstr]
                typename = self.mapmachstr[tagnamestr] + node.localName
                str = str + "\tpublic " + node.getAttribute("id") + ":" + typename + ";\n"
        return str


    def getClassName(self, fullname):
        arr = str(fullname).split(".")
        cname = arr[0].replace("Skin", "")
        return cname

    def saveTsfile(self, file, fileStr):
        with codecs.open(file, 'w', 'utf-8') as f:
            f.seek(0, 0)
            f.write(fileStr)
            f.flush()
            f.close()

tsbuild = buildTSfile()
tsbuild.doBuild()