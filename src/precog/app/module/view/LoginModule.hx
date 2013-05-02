package precog.app.module.view;

import precog.app.message.*;
import precog.communicator.*;
import precog.api.Precog;
import precog.html.LabcoatAccountWindow;

class LoginModule extends Module
{
	static var SERVICES = ['https://nebula.precog.com','https://beta.precog.com'];
	static var DEFAULT_SERVICE = 'https://beta.precog.com';
	var communicator : Communicator;

	override public function connect(communicator : Communicator)
	{
		// reset password
			// replace link with loader
				// display ok message
				// display error message

		// keyboard input (enter button)
		// tab index
		// use localStorage to preserve email
			// use on reload
		// focus problems (starting input, precog image)

		this.communicator = communicator;
		communicator.demand(RequestPrecogCredentials).then(function(_ : RequestPrecogCredentials) {
			displayForm();
		});
	}

	function findServiceAndAccount(email : String, handler : Null<{ analyticsService : String, accountId : String }> -> Void)
	{
		var services = SERVICES.copy();
		function tryService() {
			if(services.length == 0)
			{
				handler(null);
				return;
			}
			var service = services.shift();
			var api = new Precog({ analyticsService : service });
			api.lookupAccountId(email)
				.then(
					function(result : precog.api.ResAccountId) {
						handler({ analyticsService : service, accountId : result.accountId });
					},
					function(e : Dynamic) {
						tryService();
					});
		}

		tryService();
	}

	function login(service : String, email : String, password : String, callback : Validation -> Void)
	{
		var api = new Precog({ analyticsService : service });
		api.describeAccount({ email : email, password : password })
			.then(
				function(result : ResDescribeAccount) {
					callback(Ok);
					var config = new PrecogConfig(service, result.apiKey, result.accountId);
					communicator.queue(new PrecogNamedConfig("default", config));
				},
				function (error){
					callback(Error("login error: " + Std.string(error)));
				} 
			);
	}

	function processCreate(data : { email : String, password : String, profile : { name : String, company : String, title : String }}, handler : Validation -> Void)
	{
		findServiceAndAccount(data.email, function(info) {
			if(null == info) {
				var api = new Precog({ analyticsService : DEFAULT_SERVICE });
				api.createAccount(data)
					.then(
						function(result : precog.api.ResAccountId) {
							login(DEFAULT_SERVICE, data.email, data.password, handler);
						},
						function(e : Dynamic) {
							handler(Error('an error occurred creating the account: ' + Std.string(e)));
						}
					);
			} else {
				handler(Error('an account for this email already exists on ${info.analyticsService}'));
			}
		});
	}

	function processLogin(data : { email : String, password : String }, handler : Validation -> Void)
	{
		findServiceAndAccount(data.email, function(info) {
			if(null != info) {
				login(info.analyticsService, data.email, data.password, handler);
			} else {
				handler(Error("this email doesn't seem to have an associated account"));
			}
		});
	}

	function displayForm() {
		new jQuery.JQuery(function() {
			var dialog = new LabcoatAccountWindow();
			dialog.processCreate = processCreate;
			dialog.processLogin = processLogin;
			dialog.show();
		});
	}
}