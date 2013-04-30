package precog.app.module.view;

import precog.communicator.*;
import js.Browser;
import jQuery.JQuery;
using precog.html.Bootstrap;
using thx.react.IObservable;
using thx.react.Promise;

class LoginModule extends Module
{
	override public function connect(comm : Communicator)
	{
		// TODO
		// load credentials from sessionStorage
		// on success propagate and return
		// on fail propose the form
			// store email in localStorage
			// repurpose email if present in localStorage
			// auto select login if email is present in localStorage
		// email validation
		// password length validation
		// name length validation
		// password confirm validation
		// company length validation
		// title length validation

//		displayForm();
	}

	function displayForm() {
		new JQuery(function() {
			var dialog = new JQuery(MODAL_TEMPLATE).modal(),
				el = dialog.el(),
				actionsCreate = el.find(".actions-create"),
				actionsLogin  = el.find(".actions-login"),
				fieldsCreate  = el.find(".create");

			function updateForm() {
				var mode = el.find("input.choose-ui:checked").val();
				actionsCreate.add(actionsLogin).add(fieldsCreate).hide();
				switch(mode) {
					case "create":
						actionsCreate.add(fieldsCreate).show();
					case "login":
						actionsLogin.show();
				}
			}

			el.find("input.choose-ui").change(updateForm);

			// replace with dynamic behavior
			el.find("input.choose-ui").first().attr("checked", true);

			updateForm();
		});
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
	                    powered by <a href="http://www.precog.com/" target="_blank"><img src="images/logo-dark-precog.png" alt="precog"></a>
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
	                        <div class="control"><input class="username" type="text" name="email" id="email" tabindex="3"></div>
	                        <div class="alert alert-error username"></div>
	                    </div>
	                    <div class="field right">
	                        <label for="password">Password</label>
	                        <div class="control"><input class="password" type="password" name="password" id="password" tabindex="4"></div>
	                        <div class="alert alert-error password"></div>
	                    </div>
	                </div>
	                <div id="form-error">
	                    <div class="form-row alert alert-error">

	                    </div>
	                </div>
	                <div class="create">
	                    <div class="form-row">
	                        <div class="field left">
	                            <label for="account-name">Name</label>
	                            <div class="control"><input type="text" name="account-name" id="account-name" tabindex="6"></div>
	                            <div class="alert alert-error account-name"></div>
	                        </div>
	                        <div class="field right">
	                            <label for="account-confirm-password">Confirm Password</label>
	                            <div class="control"><input type="password" name="account-confirm-password" id="account-confirm-password" tabindex="5"></div>
	                            <div class="alert alert-error account-confirm-password"></div>
	                        </div>
	                    </div>
	                    <div class="form-row">
	                        <div class="field left">
	                            <label for="account-company">Company</label>
	                            <div class="control"><input type="text" name="account-company" id="account-company" tabindex="7"></div>
	                            <div class="alert alert-error account-company"></div>
	                        </div>
	                        <div class="field right">
	                            <label for="account-title">Title</label>
	                            <div class="control"><input type="text" name="account-title" id="account-title" tabindex="8"></div>
	                            <div class="alert alert-error account-title"></div>
	                        </div>
	                    </div>
	                </div>
	            </div>
            </div>
            <div class="modal-footer">
            	<div class="actions-create">
            		<label class="left-note"><input type="checkbox" name="account-accept" id="account-accept" tabindex="9"><small> I accept the <a href="http://www.precog.com/terms-and-service/" target="_blank">terms of service agreement</a></small></label>
            		<button id="account-create" class="btn btn-primary" disabled>Create Account</button>
            		<div class="alert alert-error account-accept"></div>
            	</div>
            	<div class="actions-login">
            		<small class="left-note"><a href="#" class="reset" id="reset-password">Forgot your password? Click to reset</a></small>
              		<button id="account-login" class="btn btn-primary" disabled>Login</button>
              	</div>
            </div>
          </div>';

          // tabindex="10"
}