package precog.app.module.api;

import precog.communicator.*;

class JavaScriptAPIModule extends Module 
{
	public static inline var API_FIELD_NAME = "labcoat2";
	override public function connect(comm : Communicator)
	{
		var api = Reflect.field(js.Browser.window, API_FIELD_NAME);
		if(null == api)
			Reflect.setField(js.Browser.window, API_FIELD_NAME, api = {});
		comm.provide(new precog.app.message.JavaScriptAPIMessage(api));
	}
}