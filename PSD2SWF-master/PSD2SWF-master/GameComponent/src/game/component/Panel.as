package game.component
{
	import flash.events.Event;
	import flash.utils.getTimer;

	/**
	 * @author Kramer(QQ:21524742)
	 */	
	
	public class Panel extends Container
	{
		private static const STEP_LENGTH:int = 10;
		
		private var _resourceList:Array;
		private var _resourceIndex:int;
		
		private var _skin:Object;
		
		public function Panel(resourceList:Array, skin:Object)
		{
			super();
			_resourceList = resourceList;
			_skin = skin;
			prepareResource();
		}
		
		private function prepareResource():void
		{
			if(_resourceList != null && _resourceList.length > 0)
			{
				addEventListener(Event.ENTER_FRAME, onEnterFrame);
			}
			else
			{
				this.skin = _skin;
			}
		}
		
		private function onEnterFrame(evt:Event):void
		{
			var i:int = 0;
			while(i < STEP_LENGTH && _resourceIndex < _resourceList.length)
			{
				var obj:Object = _resourceList[_resourceIndex];
				var type:String = obj.type;
				switch(type)
				{
					case Image.CLASS_NAME:
						BitmapDataCache.getBitmapData(obj.link);
						break;
					case ScaleImage.CLASS_NAME:
						BitmapDataCache.getScaleBitmapData(obj.link, obj.width, obj.height, obj.top, obj.right, obj.bottom, obj.left);
						break;
				}
				i++;
				_resourceIndex++;
			}
			if(_resourceIndex >= _resourceList.length)
			{
				removeEventListener(Event.ENTER_FRAME, onEnterFrame);
				this.skin = _skin;
			}
		}
		
		public override function set name(value:String):void
		{
			
		}
		
		public override function get name():String
		{
			if(this.skin != null)
			{
				return this.skin.name;
			}
			return "Panel";
		}
	}
}