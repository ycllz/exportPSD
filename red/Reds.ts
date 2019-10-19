

class Reds extends BaseClass{
	
	static ins():Reds{
		return super.ins();
	}

	public constructor() {
		super();
	}

	private _mapMsg2DisplayObj:{ [key:string]: egret.DisplayObject }//key:msg , value:egret.DisplayObject
	private _mapDisplayObj2RedVO:{ [key:number]: RedVO }//key:egret.DisplayObject.hashCode , value:redvo

	/** 
	 * classa funca funcb			btn1				功能a funca 或者funcb满足 则btn1有红点
	 * classb funcc funcd funce		btn2 btn3			功能b funcc funcd funce 其中一个满足 则 btn2有红点
	 * classc funcf					btn4 btn5 btn6		btn4 btn5 btn6 三个按钮的红点都是 funcf 计算得出
	 *  
	 * 
	 */
	/**
	 * 要做的是更新某个显示对象的红点状态
	 * 某个显示对象的红点计算
	 * classA funcA funcB	功能a funca 或者funcb满足 则btn1有红点
	 * classC funcF			功能c funcf 满足则红点
	 * 
	 * 所以 接口设计可以这样
	 * 
	 * addEvent(classA，[funcA, funcB], ["msgA", "msgB"], roleBtn)
	 * addEvent(classB，[funcA, funcF], ["msgA", "msgF"], actBtn)  一个msgA 可能会更新多个按钮
	 * 
	 * addEvent(classA, [funcA, funcB], ["msgA", "msgB"], roleBtn)
	 * addEvent(classB, [funcF ], ["msgF" ], roleBtn)
	 * 
	 * 
	 * 数据结构设计
	 * 
	 * roleBtn的红点
	 * vo1
	 * key：roleBtn ，msgA 通过msgA 找到该消息用于更新哪个显示对象
	 * value：vo2
	 * 
	 * key：roleBtn ，msgB 通过msgB 找到该消息用于更新哪个显示对象
	 * value：vo2
	 * 
	 * key：roleBtn ，msgF 通过msgF 找到该消息用于更新哪个显示对象
	 * value：vo2
	 * 
	 * 第一步：通过 消息msgA 找到那些按钮需要更新
	 
	 * map0:_mapMsg2DisplayObj
	 *
	 *  map0[msgA ] = [roleBtn, actBtn]
	 * 
	 * 
	 * 第二步：通过找到的 按钮 来找到那些功能对这个按钮有红点设置
	 * 
	 * map1:_mapDisplayObj2RedVO
	 * 
	 *  map1[roleBtn ] = vo2 //msgA插入到map2
	 * 
	 * 	map1[roleBtn ] = vo2	第二个功能对roleBtn进行红点设置 插入 msgB 到 map2
	 * 	map1[roleBtn ] = vo2	第三个功能对roleBtn设置红点  插入 msgF 到map2
	 * 
	 * 
	 * 第三步：通过 消息msgA 确定哪个功能派来消息的，然后通过这个功能的红点接口计算红点
	 * 
	 * vo2:RedVO
	 * 
	 *  vo2{
	 * 		dis = roleBtn
	 * 		map2[msgA ] = valueA:{{key:classA, [funcA, funcB] }
	 * 		map2[msgB ] = valueB:{{key:classA, [funcA, funcB] }
	 * 
	 * 		map2[msgF ] = valueF:{{key:classF, [funcF ] }
	 * }
	 * 
	 * 
	 * 
	 */
	/**
	 * 
	 * @param contextObj 
	 * @param contextRedFuncs 排在前面的func 会先调用
	 * @param msgs 				一个msg可能绑定多个display object，不同的msg计算的是同一个context的那几个func
	 * @param displayObj 
	 */
	public addEvent(contextObj:any, contextRedFuncs:Function[], msgs:string[], displayObjOrFuncId:egret.DisplayObject|number){
		let displayObj:egret.DisplayObject
		let funcId:number
		if(displayObjOrFuncId instanceof egret.DisplayObject){
			displayObj = displayObjOrFuncId
		}else{
			//如果是id 的话，获取display object 对象赋值
			//displayObj = getDisplayObj()
		}
		
		for (let msg of msgs) {
			__ON__(msg, this.onCalculate, this);

			this._mapMsg2DisplayObj[msg] = displayObj;
			let redvo = this._mapDisplayObj2RedVO[displayObj.hashCode];

			if(!redvo){
				redvo = new RedVO();
				//一个显示对象，有n个模块各自计算红点，对应一个 redvo，一个redvo保存所有的msg 与 redfunc
				//多个msg 对应一个context 所以多个对应一个 redfuncvo，每次一个msg过来时候，找到对应的redfuncvo 来执行 redfunc
				this._mapDisplayObj2RedVO[displayObj.hashCode] = redvo;
				redvo.dis = displayObj;
			}

			// let funcvo = redvo.mapMsg2FuncModule[msg];//通过redvo 的获取 funcvo 的方法获得，因为多个 msg 对应一个 funcvo
			// if(!funcvo){
			// 	funcvo = new RedFuncVO();
			// 	funcvo.contextObj = contextObj;
			// 	funcvo.redFuncs = contextRedFuncs
			// 	funcvo.redState = []
			// }

			redvo.setRedFuncVO(msg, contextObj, contextRedFuncs, msgs, displayObjOrFuncId)//通过redvo 的setRedFuncVO 设置 funcvo 的方法获得，因为多个 msg 对应一个 funcvo

		}

	}
	
	public onCalculate(param:any, msg:string){
		let displayObj = this._mapMsg2DisplayObj[msg];
		if(!displayObj){
			return
		}
		let originRedState = false
		if(displayObj["redPoint"]){
			originRedState = displayObj["redPoint"].visible;
		}else{
			Log.trace(`组件 ${displayObj["id"]} 没有redPoint属性`);
			return
		}
		let redvo = this._mapDisplayObj2RedVO[displayObj.hashCode];
		if(redvo){
			let redFuncVO = redvo.mapMsg2FuncModule[msg];
			if(redFuncVO){
				if(redFuncVO.contextObj){
					let hasRed = false;
					let len = redFuncVO.redFuncs ? redFuncVO.redFuncs.length : 0
					for(let i=0; i<len; i++ ){
						let func = redFuncVO.redFuncs[i]
						if(func){
							if(((i+1)<redFuncVO.redState.length) || (redFuncVO.redState[i] == undefined)){

							}
							let isred = func.call(redFuncVO.contextObj)
							redFuncVO.redState[i] = isred;
							if(!originRedState && isred){//从没有红点变成有红点
								//如果是没有红点的，有一个值是有红点的就可以不用计算了，redFuncVO.redState后面的值默认false即可，因为如果计算func的值如果一路false的话会把全部func都计算
								displayObj["redPoint"].visible = true
								hasRed = true;
								break;
							}//else if(originRedState ){
								//如果有红点的，可能是这个功能有红点，也可能是其他功能有红点，如果这个功能没有红点了，也要判断其他功能是否有红点
								//从有红点状态转变为没有红点状态需要计算全部
							//}
						}
					}

					if(!hasRed){//如果这个功能对这个组件是没有红点的，要看看其他功能有没红点

					}


				}
			}
		}

	}

	/**
	 * removeEvent
	 */
	/**
	 * 
	 * @param contextObj 
	 * @param contextRedFuncs 
	 * @param msgs 					一个msg可能绑定多个display object
	 * @param displayObjOrFuncId 
	 */
	public removeEvent(contextObj:any, contextRedFuncs:Function[], msgs:string[], displayObjOrFuncId:egret.DisplayObject|number) {
		
	}


}

class RedVO{
	dis:egret.DisplayObject
	/** key:msg , value:redfuncvo */
	mapMsg2FuncModule:{[key:string]: RedFuncVO}

	/**很多个msg 对应一个 redFuncVO */
	
	public setRedFuncVO(msg:string, contextObj:any, contextRedFuncs:Function[], msgs:string[], displayObjOrFuncId:egret.DisplayObject|number) : RedFuncVO {

		let funcvo = this.mapMsg2FuncModule[msg];//通过redvo 的获取 funcvo 的方法获得，因为多个 msg 对应一个 funcvo
		if(!funcvo){
			let len = msgs
		}
		if(!funcvo){
			funcvo = new RedFuncVO();
			funcvo.contextObj = contextObj;
			funcvo.redFuncs = contextRedFuncs
			funcvo.redState = []
		}

		return funcvo
	}
	

}

class RedFuncVO{
	contextObj:any;
	redFuncs:Function[];
	/**记录每个redFunc的状态，免去重复计算 */
	redState:boolean[];
}

class mapObj{
	/**红点计算方法 */
	func:Function;
	/**红点计算方法所在的对象 */
	contextObj:any;
	/**消息事件 */
	msg:string;
	/**带红点的显示对象 */
	displayObj:egret.DisplayObject;
}