

class RedMod extends BaseClass{

    static ins():RedMod{
        return super.ins();
    }

    constructor() {
        super()
    }

	/**
	 ** 如果只是传入 displayObject，则是删除这个 displayObject 的红点计算，所有都删，
	 ** 比如 主界面 角色 按钮，那按钮里面所有功能的红点计算都不再计算
	 ** #
	 ** 后面的参数要同时都传入，或者都不传入
	 *	
	 ** 参数不空的时候，删的是 对应msg 对应的 DisplayObject 的函数
	 * 
	 */
	removeEvent(displayObject:egret.DisplayObject, msgs?:string[], thisObjRedFuncs?:Function[], thisObj?:any ){
		if(!displayObject){
			Log.trace(`不存在的显示对象--》 ${displayObject["id"]}`);
			return
		}
		if(!msgs){//不传参数就整个删掉
			let funcvo = this.displayObject2Context[displayObject.hashCode];
			if(funcvo){
				if(funcvo.deleteContext(msgs, thisObjRedFuncs, thisObj)){
					//如果整个 显示对象 删除
					this.displayObject2Context[displayObject.hashCode] = undefined;
					delete this.displayObject2Context[displayObject.hashCode];
				}
				// __OFF__(msg, this.onCalculate, this);
			}
		}
		else{
			for (let msg of msgs) {
				let vo = this.msg2DisplayObjects[msg];//一个msg 对应一个vo，vo保存 msg 与 DisplayObject ，一个 vo 保存多个 DisplayObject
				if(vo){
					if( vo.deleteDisplayObject(displayObject) ){
						MessageCenter.ins().removeListener(msg, this.onCalculate, this)
					}
				}
			}
		}
	}
	/**
	 ** 使用Msg2ObjsVO 的push 方法 把 这个 msg 对应的 DisplayObject 都放到同一个key下管理，完成一对多管理
	 ** 就可以在收到一条 msg 的时候更新该 msg 下的所有 DisplayObject 的红点状态
	 **
	 * key:msg , value: Msg2ObjsVO : msg:string; map:{ [key:number]: egret.DisplayObject } 
	 ** 											    {key:egret.DisplayObject.hashCode; value:msg} 
	 */
	msg2DisplayObjects:{ [key:string]: Msg2ObjsVO } = {}

	/**
	 * * 牺牲一点性能，简化下，
	 * 直接 一个egret.DisplayObject 对应多个 context ，
	 * 然后那个context 计算这个egret.DisplayObject的func 都绑定到这个context，
	 * 不同的egret.DisplayObject对应同一个context的相同func与不同func问题 这个问题忽略不计
	 * so 数据结构
	 * { [egret.DisplayObject.hashCode] : { {[context:funcs[]]} } }
	 */
	displayObject2Context:{ [key:number] : FuncVO } = {}

	addOne(displayObject:egret.DisplayObject, msgs:string, thisObjRedFuncs:Function, thisObj:any){
		this.addEvent(displayObject, [msgs], [thisObjRedFuncs], thisObj)
	}
    /**
	 * 1
     * 我们的目的是：收到一个 msg 更新对应的 n 个显示对象的红点状态，而不用每个显示对象都去算一遍那个红点状态值
	 * 2
	 * 消息 与 显示对象 是多对多的关系
	 * 拆分为 消息-->显示对象为一对多的关系，一条消息更新n个显示对象 msg2DisplayObjects
	 * so 数据结构
	 * { [msg] : { msg; { [egret.DisplayObject.hashCode]: egret.DisplayObject }} } 遍历value 获得显示对象egret.DisplayObject
	 * 
	 * 
	 * 3
	 * 每个显示对象可能有 多个context 的多个func 计算得到，如果前面的已经计算出来有红点，那么后面就不需要计算了；
	 * 其中一个context有多个func，这样的话存储每个context跟对应的func，还有个问题 不同的egret.DisplayObject对应同一个context的相同func与不同func问题
	 * 
	 * 牺牲一点性能，简化下，直接 一个egret.DisplayObject 对应多个 context ，
	 * 然后那个context 计算这个egret.DisplayObject的func 都绑定到这个context，
	 * 不同的egret.DisplayObject对应同一个context的相同func与不同func问题 这个问题忽略不计
	 * so 数据结构
	 * { [egret.DisplayObject.hashCode] : { {[context:funcs[]]} } }
	 * 
	 * 
	 * 
	 * 再在每次计算的时候加个时间戳判断，这样的话，计算过的func 在为另一个显示对象计算的时候，如果计算的时间戳是当前的时间戳，那就不需要计算了，拿上次的值，又可以避免重复计算
	 * 
	 * 
	 * 
     */
    public addEvent(displayObject:egret.DisplayObject, msgs:string[], thisObjRedFuncs:Function[], thisObj:any ){

        let displayObj:egret.DisplayObject
		let funcId:number
		if(displayObject instanceof egret.DisplayObject){
			displayObj = displayObject
		}else{
			//如果是id 的话，获取display object 对象赋值
			//displayObj = getDisplayObj()
        }

        for (let msg of msgs) {
			__ON__(msg, this.onCalculate, this);

			let vo = this.msg2DisplayObjects[msg];//一个msg 对应一个vo，vo保存 msg 与 DisplayObject
			if(!vo){
				vo = new Msg2ObjsVO();//如果这个msg下已经有 vo ，则不创建vo，直接push DisplayObject到这个vo保存起来
				// vo.msg = msg;
				this.msg2DisplayObjects[msg] = vo;
			}
			vo.pushDisplayObject(msg, displayObj)//直接push DisplayObject到这个vo保存起来，这样在收到 这个msg 的时候可以把这个msg的全部DisplayObject找到
		}

		//一个display object 对应多个 context ，比如主界面的 角色按钮，里面很多功能都会影响这里的红点
		let funcvo = this.displayObject2Context[displayObj.hashCode];
		if(!funcvo){
			funcvo = new FuncVO();
			// funcvo.displayObj = displayObj;
			this.displayObject2Context[displayObj.hashCode] = funcvo
		}
		funcvo.setFuncVO(thisObj, thisObjRedFuncs, msgs, displayObject)

    }

	/**
	 * 收到一条消息的时候
	 * 从 msg2DisplayObjects 取出该消息对应的 显示对象列表
	 * 
	 * 遍历显示对象，每个显示对象根据绑定的红点计算函数计算红点状态 ，从 displayObject2Context 这里获取显示对象绑定的函数
	 * 
	 */
    public onCalculate(param:any, msg:string){
		let curTime = GameServer.serverTime;//本次计算时间戳
		
		let disvo = this.msg2DisplayObjects[msg];
		if(disvo && disvo.displayObjectMap){//可能这条消息下的所有 显示对象 都删掉了
			let displayObj:egret.DisplayObject;
			let funcvo:FuncVO;
			let originRedState = false
			let redState = false;
			for(let key in disvo.displayObjectMap){//收到一个 msg ，计算map中的 n 个显示对象的红点
				displayObj = disvo.displayObjectMap[key];//取得 displayobject
				
				if(displayObj){//可能这条消息下的所有 显示对象 都删掉了，所有需要判断空
					if(displayObj["redPoint"] ){
						originRedState = displayObj["redPoint"].visible;//这个显示现在的红点状态
					}else{
						Log.trace(`组件 ${displayObj["id"]} 没有redPoint属性`);//没有 redPoint 属性，不计算了
						continue;
					}
					/** funcvo 保存了很多个影响这个红点的功能 */
					funcvo = this.displayObject2Context[key];//通过这个 DisplayObject 的 hashcode 获取 所有计算这个 DisplayObject 红点的功能

					if(funcvo && funcvo.thisObjList && funcvo.thisObjList.length>0){
						redState = this.doCalcuRed(originRedState, funcvo, curTime);//计算这个 DisplayObject 的红点
						if(displayObj["redPoint"] ){
							displayObj["redPoint"].visible = redState;//设置红点状态
						}
					}
				}
			}
		}


    }

	private doCalcuRed(originRedState:boolean, funcvo:FuncVO, curTime:number):boolean {
		
		let redState = false;
		let thisObjLen = funcvo.thisObjList.length;
		let contextvo:ContextVO;
		let oneRedState = false;
		/**遍历所有功能 */
		for(let i=0; i<thisObjLen; i++){
			contextvo = funcvo.thisObjList[i];
			if(contextvo && contextvo.thisObj){

				oneRedState = contextvo.calcuRedFunc(originRedState, curTime)//计算一个context的红点

				if(oneRedState){
					redState = oneRedState;//这个context有红点，可以提前退出计算
					break;
				}
			}
		}
		return redState;
	}


}

/**
 * 一条消息对应多个 egret.DisplayObject
 */
class Msg2ObjsVO {
	/**一条消息对应多个 egret.DisplayObject */
	// msg:string
	/**key:egret.DisplayObject.hashCode; value:egret.DisplayObject */
	displayObjectMap:{ [key:number]: egret.DisplayObject } = {}
	mapLen:number = 0;

	pushDisplayObject(msg, dis:egret.DisplayObject){
		if(dis && !this.displayObjectMap[dis.hashCode]){
			this.displayObjectMap[dis.hashCode] = dis;
			this.mapLen = this.mapLen + 1;
		}
	}
	/**
	 * return true 这个 msg 下已经没有显示对象需要计算红点了，都被删除了，这个消息也可以删除了
	 */
	deleteDisplayObject(dis:egret.DisplayObject){
		if(dis){
			this.displayObjectMap[dis.hashCode] = undefined;
			delete this.displayObjectMap[dis.hashCode];
			this.mapLen = this.mapLen - 1;
		}
		if(this.mapLen == 0){
			return true;//这个 msg 下已经没有显示对象需要计算红点了，都被删除了，这个消息也可以删除了
		}
		return false;
	}
}

/** 一个显示对象的红点所对应的所有功能 */
class FuncVO{
	/**带红点的显示对象 */
	// displayObj:egret.DisplayObject;

	public thisObjList:ContextVO[] = []
	
	public setFuncVO(thisObj:any, thisObjRedFuncs:Function[], msgs:string[], displayObjOrFuncId:egret.DisplayObject|number) {
		let contextvo:ContextVO
		let isContextInContextList = false
		let len = this.thisObjList ? this.thisObjList.length : 0;
		for(let i=0; i<len; i++){
			contextvo = this.thisObjList[i]
			if(contextvo && contextvo.thisObj==thisObj){
				isContextInContextList = true;
				break;
			}
		}
		//红点计算方法
		if(isContextInContextList){
			let curLen = contextvo.redFuncs ? contextvo.redFuncs.length : 0
			let inserLen = thisObjRedFuncs ? thisObjRedFuncs.length : 0
			let beInser = false;
			for(let j=0; j<inserLen; j++){
				beInser = false;
				let inserFunc = thisObjRedFuncs[j];
				for(let i=0; i<curLen; i++){
					let func = contextvo.redFuncs[i];
					if(inserFunc == func){
						beInser = true;
						break
					}
				}
				if(!beInser){
					contextvo.redFuncs.push(inserFunc)
				}
			}
		}
		else{
			contextvo = new ContextVO()
			contextvo.thisObj = thisObj;
			contextvo.redFuncs = thisObjRedFuncs;
		}
	}
	/**不传参数就整个删掉 */
	deleteContext(msgs?:string[], thisObjRedFuncs?:Function[], thisObj?:any){
		let contextvo:ContextVO
		let len = this.thisObjList ? this.thisObjList.length : 0;
		if(!thisObj){
			//这种情况一般是面板中的按钮
			// for(let i=0; i<len; i++){
			while(this.thisObjList && this.thisObjList.length>0){
				contextvo = this.thisObjList.pop();
				if(contextvo){
					contextvo.dispose();
				}
			}
			return true;

		}else{
			//这个一般是主界面按钮
			for(let i=0; i<len; i++){
				contextvo = this.thisObjList[i]
				if(contextvo && contextvo.thisObj==thisObj){
					contextvo.dispose();
					this.thisObjList.splice(i, 1);//////////////////////////删掉某个功能的红点计算
					break;
				}
			}
		}
		return false;
	}

	
}

class ContextVO{
	thisObj:any;
	/**计算红点的方法 */
	redFuncs:Function[] = []
	/**每个计算红点的方法，计算的时候的时间戳 ，与本次计算时间戳不同则更新，并且重新计算红点方法*/
	calcuTimeStamp:number[] = []
	/**记录每个redFunc的状态，免去重复计算 */
	redState:boolean[] = []

	calcuRedFunc(originRedState:boolean, curTime:number){
		let redState = false;
		if(originRedState){//现在的状态是有红点，可能是这个功能有红点，也可能是其他功能有红点，如果这个功能没有红点了，也要判断其他功能是否有红点
			
		}
		let oneFuncState = false;
		let funLen:number = this.redFuncs ? this.redFuncs.length : 0;
		for(let i=0; i<funLen; i++){
			let func = this.redFuncs[i];
			if(this.thisObj && func){
				if(this.calcuTimeStamp[i] == curTime){
					oneFuncState = this.redState[i]
				}else{
					oneFuncState = func.apply(this.thisObj);
					if(oneFuncState){//计算到了红点了，这个显示对象就有红点了，其他不用计算了，退出计算
						redState = oneFuncState;
						this.redState[i] = oneFuncState;
						this.calcuTimeStamp[i] = curTime;
						break;
					}
					// else{
						// 如果这个功能没有红点了，也要判断其他功能是否有红点
					// }
				}
			}
		}

		return redState;
	}

	dispose(){
		this.thisObj = undefined;
		this.redFuncs && (this.redFuncs.length=0, this.redFuncs=undefined)
		this.calcuTimeStamp && (this.calcuTimeStamp.length=0, this.calcuTimeStamp=undefined)
		this.redState && (this.redState.length=0, this.redState=undefined)
	}
}

