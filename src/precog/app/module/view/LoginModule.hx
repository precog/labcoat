package precog.app.module.view;

import precog.app.message.*;
import precog.communicator.*;
import js.Browser;
import jQuery.JQuery;
using precog.html.Bootstrap;
using thx.react.IObservable;
using thx.react.Promise;
import precog.api.Precog;

class LoginModule extends Module
{
	static var SERVICES = ['https://nebula.precog.com','https://beta.precog.com'];
	static var DEFAULT_SERVICE = 'https://beta.precog.com';
	var communicator : Communicator;

	override public function connect(communicator : Communicator)
	{
		// servers list
		// login
			// find server
				// login
				// report error
		// create account
			// find server
				// report error
				// create account
					// login
					// error
		// reset password
			// replace link with loader
				// display ok message
				// display error message

		// keyboard input (enter button)
		// tab index
		// use localStorage to preserve email
			// set on reload
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
		new JQuery(function() {
			var dialog = new AccountWindow();
			dialog.processCreate = processCreate;
			dialog.processLogin = processLogin;
			dialog.show();
		});
	}
}


class AccountWindow
{
	var dialog : Modal;
	var el : JQuery;
	var actionsCreate	: JQuery;
	var actionsLogin	: JQuery;
	var fieldsCreate	: JQuery;
	var formError       : JQuery;

	var createModel     : ObjectModel;
	var loginModel      : ObjectModel;
	var currentModel    : Model<Dynamic>;

	public var processCreate : { email : String, password : String, profile : {name : String, company : String, title : String } } -> (Validation -> Void) -> Void;
	public var processLogin : { email : String, password : String } -> (Validation -> Void) -> Void;

	public function new() 
	{
		dialog = new JQuery(MODAL_TEMPLATE).modal({
				show : false
			});
		el = dialog.el();
		actionsCreate = el.find(".actions-create");
		actionsLogin  = el.find(".actions-login");
		fieldsCreate  = el.find(".create");
		formError     = el.find("#form-error");

		function confirmPasswordValidator(v : String) {
			return 
				if(v == el.find("#password").val())
					Ok;
				else
					Error("passwords do not match");			
		}

		var email    = new TextInputModel(el.find('#email'), el.find('.email.alert-error'), Validators.emailValidator()),
			password = new TextInputModel(el.find('#password'),  el.find('.password.alert-error'), Validators.lengthValidator(6));

		createModel = new ObjectModel()
				.addField("email", email)
				.addField("password", password)
				.addField("confirmPassword", new TextInputModel(el.find('#confirm-password'), el.find('.confirm-password.alert-error'), confirmPasswordValidator))
				.addField("name", new TextInputModel(el.find('#name'), el.find('.name.alert-error'), Validators.lengthValidator(3)))
				.addField("company", new TextInputModel(el.find('#company'), el.find('.company.alert-error'), Validators.lengthValidator(2)))
				.addField("title", new TextInputModel(el.find('#title'), el.find('.title.alert-error'), Validators.lengthValidator(2)))
				.addField("accept", new BoolInputModel(el.find('#account-accept'), el.find('.account-accept.alert-error'), Validators.mustBeTrue("you must accept the terms")))
				;

		loginModel = new ObjectModel()
				.addField("email", email)
				.addField("password", password);

		el.find("#account-create").on("click", function() {
			if(!createModel.isValid())
				return;
			formError.hide();
			el.find("#account-create").attr("disabled", true);
			processCreate({
					email : email.get(),
					password : password.get(),
					profile : {
						name : createModel.model("name").get(),
						company : createModel.model("company").get(),
						title : createModel.model("title").get()
					}
				}, function(result) {
				el.find("#account-create").attr("disabled", false);
				switch (result) {
					case Ok:
						dialog.hide();
						el.remove();
					case Error(msg):
						formError.show().html(msg);
				}
			});
		});

		el.find("#account-login").on("click", function() {
			if(!loginModel.isValid())
				return;
			formError.hide();
			el.find("#account-login").attr("disabled", true);
			processLogin({
					email : email.get(),
					password : password.get()
				}, function(result) {
				el.find("#account-login").attr("disabled", false);
				switch (result) {
					case Ok:
						dialog.hide();
						el.remove();
					case Error(msg):
						formError.show().html(msg);
				}
			});
		});

		el.find("input.choose-ui").change(updateForm);

		// replace with dynamic behavior
		el.find("input.choose-ui").first().attr("checked", true);

		updateForm();
	}

	function updateForm() {
		var mode = el.find("input.choose-ui:checked").val();
		actionsCreate.add(actionsLogin).add(fieldsCreate).hide();
		switch(mode) {
			case "create":
				actionsCreate.add(fieldsCreate).show();
				currentModel = createModel;
			case "login":
				actionsLogin.show();
				currentModel = loginModel;
		}
	}

	public function show()
	{
		dialog.show();
	}

	static var MODAL_TEMPLATE = '<div class="modal hide fade in labcoat-dialog-account" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="false" style="display: block;">
            <div class="modal-header">
              Login to Labcoat
            </div>
            <div class="modal-body">
	            <div>
	                <div class="form-row banner">
	                </div>
	                <div class="form-row poweredby">
	                    powered by <a href="http://www.precog.com" target="_blank"><img src="images/logo-dark-precog.png" alt="precog"></a>
	                </div>
	                <div class="form-row header">
	                    <div class="field left">
	                        <p>
	                            <label>
	                                <input type="radio" class="choose-ui" name="choose-ui" value="login" tabindex="0">
	                                I have an existing account
	                            </label>
	                        </p>
	                        <p>
	                            <label>
	                                <input type="radio" class="choose-ui" name="choose-ui" value="create" tabindex="1">
	                                I need to create a new account
	                            </label>
	                        </p>
	                    </div>
	                </div>
	            </div>
	            <div class="form">
	                <div class="form-row">
	                    <div class="field left">
	                        <label for="email">Email</label>
	                        <div class="control"><input class="email" type="text" name="email" id="email" tabindex="3"></div>
	                        <div class="alert alert-error email"></div>
	                    </div>
	                    <div class="field right">
	                        <label for="password">Password</label>
	                        <div class="control"><input class="password" type="password" name="password" id="password" tabindex="4"></div>
	                        <div class="alert alert-error password"></div>
	                    </div>
	                </div>
	                <div class="create">
	                    <div class="form-row">
	                        <div class="field left">
	                            <label for="name">Name</label>
	                            <div class="control"><input type="text" name="name" id="name" tabindex="6"></div>
	                            <div class="alert alert-error name"></div>
	                        </div>
	                        <div class="field right">
	                            <label for="confirm-password">Confirm Password</label>
	                            <div class="control"><input type="password" name="confirm-password" id="confirm-password" tabindex="5"></div>
	                            <div class="alert alert-error confirm-password"></div>
	                        </div>
	                    </div>
	                    <div class="form-row">
	                        <div class="field left">
	                            <label for="company">Company</label>
	                            <div class="control"><input type="text" name="company" id="company" tabindex="7"></div>
	                            <div class="alert alert-error company"></div>
	                        </div>
	                        <div class="field right">
	                            <label for="title">Title</label>
	                            <div class="control"><input type="text" name="title" id="title" tabindex="8"></div>
	                            <div class="alert alert-error title"></div>
	                        </div>
	                    </div>
	                </div>
                    <div id="form-error" class="form-row alert alert-error">

                    </div>
	            </div>
            </div>
            <div class="modal-footer">
            	<div class="actions-create">
            		<label class="left-note"><input type="checkbox" name="account-accept" id="account-accept" tabindex="9"><small> I accept the <a href="http://www.precog.comterms-and-service/" target="_blank">terms of service agreement</a></small></label>
            		<button id="account-create" class="btn btn-primary">Create Account</button>
            		<div class="alert alert-error account-accept"></div>
            	</div>
            	<div class="actions-login">
            		<small class="left-note"><a href="#" class="reset" id="reset-password">Forgot your password? Click to reset</a></small>
              		<button id="account-login" class="btn btn-primary">Login</button>
              	</div>
            </div>
          </div>';

          // tabindex="10"
}

enum Validation
{
	Ok;
	Error(msg : String);
}

interface Model<T>
{
	public function get() : T;
	public function getString() : String;
	public function set(v : T, ?useValidation : Bool) : Bool;
	public function setString(v : String, ?useValidation : Bool) : Bool;
	public function validate() : Validation;
	public function isValid() : Bool;
	public function reset() : Void;
}

class ObjectModel implements Model<{}>
{
	var fields : Map<String, Model<Dynamic>>;
	public function new()
	{
		fields = new Map();
	}

	public function addField<T>(name : String, model : Model<T>)
	{
		fields.set(name, model);
			return this;
	}

	public function model(name : String)
	{
		return fields.get(name);
	}

	public function get()
	{
		var ob : {} = {};
		for(field in fields.keys()) {
			Reflect.setField(ob, field, fields.get(field).get());
		}
		return ob;
	}
	public function getString() : String
	{
		return haxe.Json.stringify(get());
	}
	public function set(v : {}, ?useValidation = true) : Bool
	{
		var ok = true;
		Reflect.fields(v).map(function(field) {
				if(!fields.exists(field))
					return;
				var value = Reflect.field(v, field);
				if(!fields.get(field).set(value))
					ok = false;
			});
		return false;
	}
	public function setString(v : String, ?useValidation = true) : Bool
	{
		try {
			return set(haxe.Json.parse(v));
		} catch(_ : Dynamic) {
			return false;
		}
	}
	public function validate() : Validation
	{
		var errors = [];
		for(field in fields.keys()) {
			var model = fields.get(field);
			switch (model.validate()) {
				case Error(msg):
					errors.push('$field: $msg');
				case _:
			}
		}
		if(errors.length == 0)
			return Ok;
		return Error(errors.join("\n"));
	}

	public function reset()
	{
		for(model in fields) {
			model.reset();
		}
	}

	public function isValid()
		return switch(validate()) { case Ok: true; case _: false; };
}

class TextInputModel extends BaseInputModel<String>
{
	override function valueFromString(v : String) : String
	{
		return v;
	}
}

class BoolInputModel extends BaseInputModel<Bool>
{
	override public function get() : Bool
	{
		return inputElement.is(":checked");
	}

	override public function set(v : Bool, ?useValidation = true) : Bool
	{
		inputElement.toggle(v);
		if(useValidation)
			return isValid();
		return true;
	}

	override public function getString() : String
	{
		return "" + get();
	}

	override public function setString(v : String, ?useValidation = true)
	{
		return set(v == "true", useValidation);
	}
}

class BaseInputModel<T> implements Model<T>
{
	var inputElement : JQuery;
	var errorElement : JQuery;
	var validator : T -> Validation;
	public function new(inputElement : JQuery, errorElement : JQuery, ?validator : T -> Validation)
	{
		this.inputElement = inputElement;
		this.errorElement = errorElement;
		this.validator = null != validator ? validator : function(_) return Ok;
		this.inputElement.on("change", validate);
	}

	function valueToString(v : T) : String
	{
		return "" + v;
	}

	function valueFromString(v : String) : T
	{
		return throw "abstract method";
	}

	public function get() : T
	{
		return valueFromString(getString());
	}

	public function set(v : T, ?useValidation = true) : Bool
	{
		var s = valueToString(v);
		return setString(s, useValidation);
	}

	public function getString() : String
	{
		return "" + inputElement.val();
	}

	public function setString(v : String, ?useValidation = true)
	{
		inputElement.val(v);
		if(useValidation)
			return isValid();
		return true;
	}

	public function validate()
	{
		var r = validator(get());
		switch (r) {
			case Ok:
				errorElement.hide();
			case Error(msg):
				errorElement.show();
				errorElement.html(msg);
		}
		return r;
	}

	public function reset()
	{
		errorElement.hide();
	}

	public function isValid()
		return switch(validate()) { case Ok: true; case _: false; };
}

class Validators
{
	public static function mustBeTrue(msg : String)
		return function(value : Bool) {
			if(!value)
				return Error(msg);
			else
				return Ok;
		}

	public static function lengthValidator(minlength : Int)
	{
		return function(value : String) {
			if(value.length < minlength)
				return Error('requires at least $minlength chars');
			else
				return Ok;
		}
	}

	public static function emailValidator()
	{
		var pattern = ~/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@\\"]+)*)|(\\".+\\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return function(value : String) {
			if(value.length == 0 || !pattern.match(value))
				return Error('invalid email address');
			else
				return Ok;
		}
	}
}