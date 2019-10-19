#根据协议文件生成typescript消息代码
import os
import re
import codecs #或者io，使用哪种包无所谓
import math

class ToolsAddDeclare():

    allSubDirs = []
    pathPrefix = ""
    allFileDef = ""
    strHeadCS = "cs_"
    strHeadSC = "sc_"
    defFolder = ""
    defModel = ""

    modelName = ""
    msgDef = ""

    CSStart = False
    CSParamStart = False
    CSParamEnd = False

    CSDefWord = ""
    CSStr = ""
    CSParamStr = ""
    CSParamDefStr = ""

    def parseFile(self):
        self.modelName = self.modelName.capitalize()
        curPath = os.getcwd()
        self.pathPrefix = curPath
        self.allSubDirs.append(curPath)
        while(len(self.allSubDirs)>0):
            arrlen = str(len(self.allSubDirs))
            #print("处理一个目录,目前长度：" + arrlen)
            path = self.allSubDirs.pop()
            if(os.path.isdir(path)):
                self.parseOneDir(path)

        # print("处理完毕-------------<\n")
        # print("定义开始写入定义文件--------------->")
        # self.allFileDef
        # defFileName = curPath + "\\" + "ExportFile.ts"
        # with codecs.open(defFileName, 'w+', 'utf-8') as f:
        #     f.seek(0, 0)
        #     f.write(self.allFileDef)
        #     f.flush()
        #     f.close()
        print("定义导出完毕-----------------------<")

    def parseOneDir(self, onePath):
        #print("当前处理目录:" + onePath)
        fileNames = os.listdir(onePath)
        for fileName in fileNames:
            if os.path.isdir(fileName):
                subpath = onePath + "\\" + fileName
                # self.allSubDirs.append(subpath)
                #print("目录：" + fileName)
                continue
            if(fileName.find(".")<0):
                subpath = onePath + "\\" + fileName
                # self.allSubDirs.append(subpath)
                #print("目录：" + fileName)
                continue
            isTS = fileName.find(".sproto")
            if(isTS < 0):
                continue
            fullName = onePath + "\\" + fileName
            defpath = onePath + "\\protots\\"
            if(not os.path.exists(defpath) ):
                os.mkdir(defpath)
            c2s2c = -1
            biaozhi = "c2s"
            c2s2c = fileName.find("c2s")
            if c2s2c < 0:
                c2s2c = fileName.find("s2c")
                biaozhi = "s2c"
            foldnamearr = str(fileName).split(biaozhi)
            folderpath = onePath + "\\" + foldnamearr[0] + "\\"
            modelpath = onePath + "\\" + foldnamearr[0] + "\\"
            if(not os.path.exists(folderpath) ):
                os.mkdir(folderpath)
            if(not os.path.exists(modelpath) ):
                os.mkdir(modelpath)
            
            self.defFolder = folderpath + fileName + ".ts"
            self.defModel = modelpath + fileName + "model.ts"
            self.doParseFile(fullName)

    """插入定义"""
    def doParseFile(self, fullName):
        try:
            allDef = ""
            allLines = []
            regStr = ""
            with codecs.open(fullName, 'r', 'utf-8') as fo:
                fo.seek(0)
                allLines = fo.readlines()
                curLine = 0
                csZuokuohaoStart = False
                csParamZuokuohaoStart = False
                csParamRequest = False
                hasWordOfRequest = False
                iscs = False
                for oneLine in allLines:
                    isdef = oneLine.find(self.strHeadCS)
                    if isdef>=0:
                        iscs = True
                    else:
                        iscs = False
                    if(isdef<0):
                        isdef = oneLine.find(self.strHeadSC)
                    if(isdef>=0):
                        self.CSParamStr = ""
                        self.commentStr= ""
                        self.CSDefWord = ""
                        self.CSStr = ""
                        self.CSParamStr = ""
                        self.CSParamDefStr = ""
                        csZuokuohaoStart = False
                        csParamZuokuohaoStart = False
                        csParamRequest = False
                        hasWordOfRequest = False
                        str1, str2, protoNum = self.decodeDef(oneLine)
                        
                        if(protoNum>0):#把协议号拼到上一行
                            allDef = allDef + " //" + str(protoNum) + "\n"
                        else:
                            if(allDef.find("\n", len(allDef)-3)<0):#没有换行符，添加换行符
                                allDef = allDef + "\n"
                        
                        if(iscs):#发送协议
                            self.CSDefWord = str1
                            if(oneLine.find("{")>=0 and oneLine.find("}")>=0):#协议名称与大括号在同一行，且没有参数
                                allDef = allDef + self.getSendStr(str1)
                                self.CSStart = False
                                csZuokuohaoStart = False
                            elif(oneLine.find("{")>=0 and oneLine.find("}")<0):#协议名称与左边大括号在同一行
                                csZuokuohaoStart = True
                        else:
                            allDef = allDef + str1#接收协议

                        regStr = regStr + str2

                    if(oneLine.find("##")==0 or (oneLine.find("#")==0)):
                        nextLineStr = allLines[curLine+1]
                        if(nextLineStr and (nextLineStr.find(".")==0) ):
                            commentStr = ""
                        else:
                            commentStr = oneLine
                            commentStr = str(commentStr).replace("\r\n", "")
                            commentStr = commentStr.replace("\n", "")
                            commentStr = commentStr.replace("\r", "")
                            allDef = allDef + "\t//"+commentStr
                    
                    if(self.CSStart==True):#解析发送的参数
                        # if(csZuokuohaoStart==True and oneLine.find("}")<0):
                        
                        

                        if(csZuokuohaoStart==True and csParamRequest==False and oneLine.find("request")>=0):#参数开始了
                            csParamRequest = True
                            hasWordOfRequest = True
                        if(csZuokuohaoStart==True and csParamRequest==True and oneLine.find("{")>=0):#参数左括号跟request连在一行
                            csParamZuokuohaoStart=True
                        if(csZuokuohaoStart==True and csParamRequest==True and csParamZuokuohaoStart==True):
                            #左括号 参数 右括号在同一行
                            #左括号
                            #当前行有冒号的是参数
                            #self.parseCSParam(oneLine)
                            if( oneLine.count("}")==2 ):#两个右括号在同一行
                                self.CSStart = False
                                csZuokuohaoStart = False
                                csParamRequest = False
                                csParamZuokuohaoStart = False
                                allDef = allDef + self.getParamSendStr()

                            elif(oneLine.find("}")>=0):#参数的右括号
                                #参数结束判断
                                csParamRequest = False
                                csParamZuokuohaoStart = False
                            
                            else:
                                self.parseCSParam(oneLine)
                        
                        #有参数的时候第二个右括号（协议的右括号）
                        if(csZuokuohaoStart==True and hasWordOfRequest==True and csParamRequest==False and oneLine.find("}")>=0):
                            #这条协议结束
                            self.CSStart = False
                            csZuokuohaoStart = False
                            csParamRequest = False
                            allDef = allDef + self.getParamSendStr()

                        if(csZuokuohaoStart==True and hasWordOfRequest==False and oneLine.find("}")>=0):
                            #这条协议结束,没有request 这个关键字，但是出现了右括号，则这条协议结束，大括号换行的情况 右括号在下一行
                            self.CSStart = False
                            allDef = allDef + self.getSendStr(str1)
                            csZuokuohaoStart = False
                            allDef = allDef + self.getParamSendStr()

                        if(csZuokuohaoStart==False):#左括号与协议名称不在同一行
                            if(oneLine.find("{")>=0 and oneLine.find("}")>=0):
                                #没有参数，但是大括号在下一行
                                allDef = allDef + self.getSendStr(str1)
                                self.CSStart = False
                                csZuokuohaoStart = False
                            elif(oneLine.find("{")>=0 and oneLine.find("}")<0):#大括号换行的情况 还不知道有没有参数
                                csZuokuohaoStart = True
                    curLine = curLine + 1
                    

            with codecs.open(self.defFolder, 'w', 'utf-8') as f:
                f.seek(0, 0)
                f.write(allDef)
                f.flush()
                f.close()
            with codecs.open(self.defModel, 'w', 'utf-8') as f:
                modelStr = regStr + "\n\n" + self.msgDef
                f.seek(0, 0)
                f.write(modelStr)
                f.flush()
                f.close()
            
        finally:
            fo.close()
            
    # this.regNetMsg(S2cProtocol.sc_get_friend_list, this.onFriendList);
    # send -----------------
    # public send_cs_get_friend_list(){
	# 	this.Rpc(C2sProtocol.cs_get_friend_list);
	# }

    # receive --------------
    # private onFriendList(msg:Sproto.sc_get_friend_list_request) {	
	# 	this.postFriendList();
	# }
	# public postFriendList(){}

    # //##请求守卫装备升级
	# public sendEquipUpgrade(id:number, index:number, iscost:boolean){
	# 	let req = new Sproto.cs_guard_equip_upgrade_request()
	# 	req.id = id
	# 	req.index = index
	# 	req.iscost = iscost
	# 	this.Rpc(C2sProtocol.cs_guard_equip_upgrade, req)
	# }

    def getParamSendStr(self):
        words = self.CSDefWord.split(".")
        word = words[0]
        word1 = words[1]
        word2 = words[2]
        defstr = ""
        #id:number, index:number, iscost:boolean
        #self.CSParamStr
        #req.index = index
        #self.CSParamDefStr

        defstr = defstr + "\tpublic req" + word1 + word2 + "( " + self.CSParamStr + " ){\n"
        defstr = defstr + "\t\tlet req = new Sproto." + word + "_request()\n"
        defstr = defstr + self.CSParamDefStr + "\n"
        defstr = defstr + "\t\tthis.Rpc(C2sProtocol." + word + ", req);\n"
        defstr = defstr + "\t}\n"
        self.CSParamDefStr = ""
        self.CSParamStr = ""
        return defstr

    def getSendStr(self, wordStr:str):
        words = wordStr.split(".")
        word = words[0]
        word1 = words[1]
        word2 = words[2]
        defstr = ""
        defstr = defstr + "\tpublic req" + word1 + word2 + "(){\n"
        defstr = defstr + "\t\tthis.Rpc(C2sProtocol." + word + ");\n"
        defstr = defstr + "\t}\n"
        return defstr

    def parseCSParam(self, oneLine:str):
        if(oneLine.find(":")>0):
            arr = oneLine.split(":")
            paramStrs = ((arr[0].lstrip()).rstrip()).split(" ")
            typeStrs = ((arr[1].lstrip()).rstrip()).split(" ")
            paramName = ""
            typeName = ""
            commentStr = ""
            for oneWord in paramStrs:
                if(oneWord.isspace()==False):
                    paramName = oneWord
                    ttindex = paramName.find("\t")
                    if(ttindex < 0):
                        ttindex = paramName.find(" ")
                    if(ttindex >= 0):
                        subparam = paramName[0:ttindex]
                        paramName = subparam
                    break
            for typeWord in typeStrs:
                if( typeName=="" and (typeWord.isspace()==False) ):
                    typeName = typeWord
                if( commentStr=="" and typeWord.find("#")>=0):
                    commentStr = typeWord
            if(typeName=="boolean"):
                typeName = "boolean"
            elif(typeName=="integer"):
                typeName = "number"
            elif(typeName=="string"):
                typeName = "string"
            elif(typeName.find("*")>=0):
                typeName = typeName.replace("*", "")
                if(typeName=="boolean"):
                    typeName = "boolean[]"
                elif(typeName=="integer"):
                    typeName = "number[]"
                elif(typeName=="string"):
                    typeName = "string[]"
                else:
                    typeName = "Sproto." + typeName + "[]"
            
            #id:number, index:number, iscost:boolean
            if(self.CSParamStr==""):
                self.CSParamStr = paramName + ":" + typeName
            else:
                self.CSParamStr = self.CSParamStr + ", " + paramName + ":" + typeName
            
            #req.index = index
            if(self.CSParamDefStr==""):
                self.CSParamDefStr = "\t\treq." + paramName + " = " + paramName
            else:
                self.CSParamDefStr = self.CSParamDefStr + "\n" + "\t\treq." + paramName + " = " + paramName
            return 

    def decodeDef(self, oneLine:str):
        strs = oneLine.split(" ")
        defstr = ""
        regStr = ""
        protoNum = 0
        word1 = ""
        word2 = ""
        for word in strs:
            word = word.lstrip().rstrip()
            protoWords = word.split("_")
            protoWordsLen = len(protoWords)
            if(protoWordsLen > 2):
                word1 = protoWords[protoWordsLen-2].capitalize()
                word2 = protoWords[protoWordsLen-1].capitalize()
            else:
                word1 = protoWords[protoWordsLen-2]
                word2 = protoWords[protoWordsLen-1].capitalize()

            if(word.find(self.strHeadCS)>=0):
                defstr = defstr + "\tpublic req"+word1 + word2+"(){\n"
                defstr = defstr + "\t\tthis.Rpc(C2sProtocol."+word+");\n"
                defstr = defstr + "\t}\n"
                defstr = word + "." + word1 + "." + word2
                self.CSStart = True
                self.CSParamEnd = False
            if(word.find(self.strHeadSC)>=0):
                regStr = regStr + "\t\tthis.regNetMsg(S2cProtocol."+word+", this.on"+word1 + word2+");\n"
                defstr = defstr + "\tprivate on"+word1 + word2+"(msg:Sproto."+word+"_request){\n"
                # defstr = defstr + "\tthis.post"+word+"();\n"
                curMsgDef = ""
                if(self.modelName == word1):
                    curMsgDef =  self.modelName.upper() + "_" + word2.upper()
                else:
                    curMsgDef = self.modelName.upper()+ "_" + word1.upper() +"_" + word2.upper()
                self.msgDef = self.msgDef + "\n" + "\tpublic static " + curMsgDef + " = " + '"' + curMsgDef + '"'

                defstr = defstr + "\t\t__EMIT__(" + "MessageDef." + curMsgDef +")\n"
                defstr = defstr + "\t}\n"
                # defstr = defstr + "public post"+word+"(){"+"}\n"
            if(str(word).isdigit()):
                protoNum = int(word)
                            
        return defstr, regStr, protoNum

    def isBlankLine(self, lineStr):
        if(lineStr=="" or lineStr=="\n" or lineStr=="\r\n" or lineStr=="\r"):
            return 1
        return 0

    def isdefToWindow(self, lineStr, classNames):
        for eachname in classNames:
            if(lineStr.find(eachname)>=0 and lineStr.find("window")>=0):
                return 1
        return 0
    """
        判断输入的字符串中是否有关键字（做全字匹配，例如关键字为scanf则不匹配sscanf）
            如果匹配到了，返回1，没有返回0 ,如果是注释返回 -1，
    """
    def isIncludeKeyWord(self, detailinfo, tmp_keyword):
        # 正则表达查询性能较差，先用find函数过滤，因为大部分字符串都不需要走正则查询
        if(-1 != detailinfo.find(tmp_keyword)):
            keywordIndex = detailinfo.find(tmp_keyword)
            commentIndex = detailinfo.find("//")
            if(commentIndex>=0 and commentIndex<keywordIndex):
                return -1
            if(detailinfo.find("=")>=0):
                return -1#这是一个表达式，不是定义
            # 匹配^tmp_keyword$或^tmp_keyword(非字母数字下划线)(任意字符)
            # 或(任意字符)(非字母数字下划线)tmp_keyword$或(任意字符)(非字母数字下划线)tmp_keyword(非字母数字下划线)(任意字符)
            pattern_str = '(^' + tmp_keyword + '$)|(^' + tmp_keyword + '(\W+).*)|(.*(\W+)' + tmp_keyword + '$)|(.*(\W+)' + tmp_keyword + '(\W+).*)'
            m = re.match(r'' + pattern_str + '', detailinfo)
            if m:
                return 1
        return 0

ft = ToolsAddDeclare()
ft.modelName = input("消息字符串前缀-> 如__EMIT__(MessageDef.FS_UPDATE) 中的 FS 前缀 : ")
ft.parseFile()
#input("press <enter>")
