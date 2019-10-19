package game.component
{
	/**
	 * @author Kramer(QQ:21524742)
	 */	
	import flash.display.DisplayObject;
	import flash.events.Event;
	import flash.events.MouseEvent;

	[Event(name="change", type="flash.events.Event")]
	public class RadioButtonGroup extends Container
	{
		private var _btnList:Vector.<RadioButton>;
		private var _selectedBtn:RadioButton;
		private var _selectedIndex:int;
		
		public function RadioButtonGroup()
		{
			initialize();
		}
		
		private function initialize():void
		{
			_btnList = new Vector.<RadioButton>();
		}
		
		protected override function configChildren():void
		{
			this.selection = findFirstBtn();
		}
		
		private function findFirstBtn():RadioButton
		{
			var i:int = 0;
			var result:RadioButton;
			while(i < this.numChildren)
			{
				result = getChildAt(i) as RadioButton;
				if(result != null)
				{
					return result;
				}
				i++;
			}
			return result;
		}
		
		public override function addChild(child:DisplayObject):DisplayObject
		{
			var tempChild:DisplayObject = super.addChild(child); 
			var btn:RadioButton = tempChild as RadioButton;
			if(btn != null)
			{
				addBtnEventListener(btn);
				addToBtnList(btn);
			}
			return tempChild;
		}
		
		public override function addChildAt(child:DisplayObject, index:int):DisplayObject
		{
			var tempChild:DisplayObject = super.addChildAt(child, index); 
			var btn:RadioButton = tempChild as RadioButton;
			if(btn != null)
			{
				addBtnEventListener(btn);
				addToBtnList(btn);
			}
			return tempChild;
		}
		
		public override function removeChild(child:DisplayObject):DisplayObject
		{
			var tempChild:DisplayObject = super.removeChild(child);
			var btn:RadioButton = tempChild as RadioButton;
			if(btn != null)
			{
				removeBtnEventListener(btn);
				removeFromBtnList(btn);
			}
			return tempChild;
		}
		
		public override function removeChildAt(index:int):DisplayObject
		{
			var tempChild:DisplayObject = super.removeChildAt(index);
			var btn:RadioButton = tempChild as RadioButton;
			if(btn != null)
			{
				removeBtnEventListener(btn);
				removeFromBtnList(btn);
			}
			return tempChild;
		}
		
		private function addToBtnList(btn:RadioButton):void
		{
			_btnList.push(btn);
		}
		
		private function removeFromBtnList(btn:RadioButton):void
		{
			var index:int = _btnList.indexOf(btn);
			if(index > -1)
			{
				_btnList.splice(index, 1);
			}
		}
		
		private function addBtnEventListener(btn:RadioButton):void
		{
			btn.addEventListener(MouseEvent.CLICK, onBtnClick);
		}
		
		private function removeBtnEventListener(btn:RadioButton):void
		{
			btn.removeEventListener(MouseEvent.CLICK, onBtnClick);
		}
		
		private function onBtnClick(evt:MouseEvent):void
		{
			var btn:RadioButton = evt.target as RadioButton;
			if(this.selection != btn)
			{
				this.selection = btn;
				rearrangeBtnListDepth();
				dispatchEvent(Component.EVENT_CHANGE);
			}
		}
		
		private function rearrangeBtnListDepth():void
		{
			var minDepth:int = int.MAX_VALUE;
			for each(var btn:RadioButton in _btnList)
			{
				var btnIndex:int = getChildIndex(btn);
				if(btnIndex < minDepth)
				{
					minDepth = btnIndex;
				}
			}
			var len:int = _btnList.length;
			for(var i:int = 0; i < len; i++)
			{
				setChildIndex(_btnList[i], minDepth + i);
			}
			setChildIndex(_selectedBtn, minDepth + len - 1);
		}
		
		public function set selection(value:RadioButton):void
		{
			if(_selectedBtn != null)
			{
				_selectedBtn.selected = false;
			}
			_selectedBtn = value;
			_selectedBtn.selected = true;
		}
		
		public function get selection():RadioButton
		{
			return _selectedBtn;
		}
		
		public function set selectIndex(value:int):void
		{
			if(value < 0 || value > _btnList.length - 1)
			{
				throw new ArgumentError("按钮索引值越界！");
			}
			var btn:RadioButton = _btnList[value];
			if(this.selection != btn)
			{
				this.selection = btn;
			}
		}
		
		public function get selectIndex():int
		{
			return _btnList.indexOf(this.selection);
		}
		
		public override function set enabled(value:Boolean):void
		{
			super.enabled = value;
			for each(var btn:RadioButton in _btnList)
			{
				btn.enabled = value;
			}
		}
	}
}