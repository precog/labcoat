package precog.api;

import precog.api.PrecogHttp;

extern class Precog 
{
	public function new(?options : PrecogConfig) : Void;

	public function serviceUrl(serviceName : String, serviceVersion : String, path : String) : String;
	public function accountsUrl(path : String) : String;
	public function securityUrl(path : String) : String;
	public function dataUrl(path : String) : String;
	public function analysisUrl(path : String) : String;
	public function metadataUrl(path : String) : String;
	public function requireConfig(name : String) : Void;


    // ****************
    // *** ACCOUNTS ***
    // ****************

	public function createAccount(account : PrecogAccount, ?success : AccountIdProcedure, ?failure : PrecogFailure) : Future<AccountIdProcedure, PrecogFailure>;
	public function requestPasswordReset(email : String, ?success : StringProcedure, ?failure : PrecogFailure) : Future<StringProcedure, PrecogFailure>;
	public function lookupAccountId(email : String, ?success : AccountIdProcedure, ?failure : PrecogFailure) : Future<AccountIdProcedure, PrecogFailure>;
	public function describeAccount(account : PrecogAccount, ?success : PrecogSuccessDescribeAccount, ?failure : PrecogFailure) : Future<PrecogSuccessDescribeAccount, PrecogFailure>;
	// TODO needs typing
	public function addGrantToAccount(info : PrecogGrantInfo, ?success : PrecogSuccess, ?failure : PrecogFailure) : Future<PrecogSuccess, PrecogFailure>;
	public function currentPlan(account : PrecogAccount, ?success : StringProcedure, ?failure : PrecogFailure) : Future<StringProcedure, PrecogFailure>;
	public function changePlan(account : PrecogAccountPlan, ?success : VoidProcedure, ?failure : PrecogFailure) : Future<VoidProcedure, PrecogFailure>;
	public function deletePlan(account : PrecogAccount, ?success : PrecogPlanProcedure, ?failure : PrecogFailure) : Future<PrecogPlanProcedure, PrecogFailure>;

    // ****************
    // *** SECURITY ***
    // ****************

    public function listApiKeys(?success : PrecogListApiKeyProcedure, ?failure : PrecogFailure) : Future<PrecogListApiKeyProcedure, PrecogFailure>;
    // TODO define grants type
    public function createApiKey(grants : Dynamic, ?success : PrecogCreatedApiKeyProcedure, ?failure : PrecogFailure) : Future<PrecogCreatedApiKeyProcedure, PrecogFailure>;
    public function describeApiKey(apiKey : String, ?success : PrecogDescribeApiKeyProcedure, ?failure : PrecogFailure) : Future<PrecogDescribeApiKeyProcedure, PrecogFailure>;
    public function deleteApiKey(apiKey : String, ?success : VoidProcedure, ?failure : PrecogFailure) : Future<VoidProcedure, PrecogFailure>;
    public function retrieveApiKeyGrants(apiKey : String, ?success : PrecogListDescribeApiKeyProcedure, ?failure : PrecogFailure) : Future<PrecogListDescribeApiKeyProcedure, PrecogFailure>;
	// TODO needs typing
    public function addGrantToApiKey(info : PrecogAddGrantToApiKey, ?success : PrecogSuccess, ?failure : PrecogFailure) : Future<PrecogSuccess, PrecogFailure>;
	// TODO needs typing
    public function removeGrantFromApiKey(info : PrecogRemoveGrantFromApiKey, ?success : PrecogSuccess, ?failure : PrecogFailure) : Future<PrecogSuccess, PrecogFailure>;
	// TODO needs typing
    public function createGrant(grant : PrecogCreateGrant, ?success : PrecogSuccess, ?failure : PrecogFailure) : Future<PrecogSuccess, PrecogFailure>;
	// TODO needs typing
    public function describeGrant(grantId : String, ?success : PrecogSuccess, ?failure : PrecogFailure) : Future<PrecogSuccess, PrecogFailure>;
	// TODO needs typing
    public function deleteGrant(grantId : String, ?success : PrecogSuccess, ?failure : PrecogFailure) : Future<PrecogSuccess, PrecogFailure>;
	// TODO needs typing
    public function listGrantChildren(grantId : String, ?success : PrecogSuccess, ?failure : PrecogFailure) : Future<PrecogSuccess, PrecogFailure>;
	// TODO needs typing
    public function createGrantChild(info : PrecogCreateGrantChild, ?success : PrecogSuccess, ?failure : PrecogFailure) : Future<PrecogSuccess, PrecogFailure>;

	// ****************
	// *** METADATA ***
	// ****************

	// TODO needs typing
    public function retrieveMetadata(path : String, ?success : PrecogSuccess, ?failure : PrecogFailure) : Future<PrecogSuccess, PrecogFailure>;
    public function listChildren(path0 : String, ?success : ArrayProcedure<String>, ?failure : PrecogFailure) : Future<ArrayProcedure<String>, PrecogFailure>;
    public function listDescendants(path0 : String, ?success : ArrayProcedure<String>, ?failure : PrecogFailure) : Future<ArrayProcedure<String>, PrecogFailure>;
	// TODO needs typing
    public function existsFile(path : String, ?success : PrecogSuccess, ?failure : PrecogFailure) : Future<PrecogSuccess, PrecogFailure>;

	// ************
	// *** DATA ***
	// ************

    public function uploadFile(info : PrecogUploadFile, ?success : PrecogUploadReportProcedure, ?failure : PrecogFailure) : Future<PrecogUploadReportProcedure, PrecogFailure>;
    public function createFile(info : PrecogUploadFile, ?success : PrecogUploadReportProcedure, ?failure : PrecogFailure) : Future<PrecogUploadReportProcedure, PrecogFailure>;
	// TODO needs typing
    public function retrieveFile(path0 : String, ?success : PrecogSuccess, ?failure : PrecogFailure) : Future<PrecogSuccess, PrecogFailure>;
    public function append(info : PrecogAppend, ?success : PrecogUploadReportProcedure, ?failure : PrecogFailure) : Future<PrecogUploadReportProcedure, PrecogFailure>;
    public function appendAll(info : PrecogAppendAll, ?success : PrecogUploadReportProcedure, ?failure : PrecogFailure) : Future<PrecogUploadReportProcedure, PrecogFailure>;
	// TODO needs typing
    public function delete0(path0 : String, ?success : PrecogSuccess, ?failure : PrecogFailure) : Future<PrecogSuccess, PrecogFailure>;
	// TODO needs typing
    public function deleteAll(path : String, ?success : PrecogSuccess, ?failure : PrecogFailure) : Future<PrecogSuccess, PrecogFailure>;

	// ****************
	// *** ANALYSIS ***
	// ****************

    public function executeFile(info : PrecogExecuteFile, ?success : PrecogQueryResultProcedure, ?failure : PrecogFailure) : Future<PrecogQueryResultProcedure, PrecogFailure>;
    public function execute(info : PrecogQuery, ?success : PrecogQueryResultProcedure, ?failure : PrecogFailure) : Future<PrecogQueryResultProcedure, PrecogFailure>;
    public function asyncQuery(info : PrecogQuery, ?success : PrecogAsyncQueryProcedure, ?failure : PrecogFailure) : Future<PrecogAsyncQueryProcedure, PrecogFailure>;
    public function asyncQueryResults(jobId : String, ?success : PrecogQueryResultDetailedProcedure, ?failure : PrecogFailure) : Future<PrecogQueryResultDetailedProcedure, PrecogFailure>;

	static function __init__() : Void
	{
		var api = untyped __js__('(precog || (precog = {})) && (precog.api || (precog.api = {}))');
		if(untyped window)
			api.Precog = untyped window.Precog.api;
		else
			api.Precog = untyped require("Precog").api;
	}

	inline public static function Api() : Dynamic
		return untyped __js__('(precog || (precog = {})) && (precog.api || (precog.api = {}))');
}

// ****************
// *** HANDLERS ***
// ****************
typedef PrecogSuccess = Dynamic -> Void;
typedef StringProcedure = String -> Void;
typedef ArrayProcedure<T> = T -> Void;
typedef VoidProcedure = Void -> Void;
typedef AccountIdProcedure = {
				accountId : String
			} -> Void;
typedef PrecogPlan = {
				type : String
			};
typedef PrecogPlanProcedure = PrecogPlan -> Void;
typedef PrecogSuccessDescribeAccount = {
				accountCreationDate : String,
				accountId : String,
				apiKey : String,
				email : String,
				lastPasswordChangeTime : String,
				rootPath : String,
				plan : PrecogPlan
			} -> Void;
typedef PrecogFailure = Dynamic -> Void;
typedef PrecogPermission = {
				accessType : String,
				path : String,
				schemaVersion : String,
				ownerAccountIds : Array<String>
			};
typedef PrecogGrant = {
				createdAt : String,
				description : String,
				grantId : String,
				name : String,
				permissions : Array<PrecogPermission>
			};
typedef PrecogCreatedApiKey = {
				apiKey : String,
				grants : Array<PrecogGrant>,
				issuerChain : Array<Dynamic> // TODO type me
			};
typedef PrecogCreatedApiKeyProcedure = PrecogCreatedApiKey -> Void;
typedef PrecogListApiKeyProcedure = Array<PrecogCreatedApiKey> -> Void;
typedef PrecogDescribeApiKey = {
				>PrecogCreatedApiKey,
				description : String,
				name : String
			};
typedef PrecogDescribeApiKeyProcedure = PrecogDescribeApiKey -> Void;
typedef PrecogListDescribeApiKeyProcedure = Array<PrecogDescribeApiKey> -> Void;

typedef PrecogUploadError = {
				// TODO type me
			}
typedef PrecogUploadReport = {
				errors : Array<PrecogUploadError>,
				failed : Int,
				ingestId : String,
				ingested : Int,
				skipped : Int,
				total : Int
			}
typedef PrecogUploadReportProcedure = PrecogUploadReport -> Void;
typedef PrecogMetadata = {
				size : Float,
				children : Dynamic, // TODO type me
				structure : Dynamic // TODO type me
			}
typedef PrecogMetadataProcedure = PrecogMetadata -> Void;
typedef PrecogAsyncQuery = {
				jobId : String
			}
typedef PrecogAsyncQueryProcedure = PrecogAsyncQuery -> Void;
typedef PrecogQueryResult = Array<Dynamic>;
typedef PrecogQueryResultProcedure = PrecogQueryResult -> Void;
typedef PrecogQueryResultDetailed = {
				errors : Array<Dynamic>, // TODO type me
				warnings : Array<Dynamic>, // TODO type me
				data : PrecogQueryResult
			}
typedef PrecogQueryResultDetailedProcedure = PrecogQueryResultDetailed -> Void;

// ****************
// *** CONFIG ***
// ****************

typedef PrecogConfig = {
	analyticsService : String,
	?apiKey : String
}

// ****************
// *** ARGUMENTS ***
// ****************
typedef PrecogAccount = {
	email		: String,
	password	: String
}

typedef PrecogAccountPlan = {
	> PrecogAccount,
	plan : String
}

typedef PrecogGrantInfo = {
	accountId	: String,
	grantId		: String
}

typedef PrecogAddGrantToApiKey = {
	grant	: Dynamic, // TODO type this
	apiKey	: String
}

typedef PrecogRemoveGrantFromApiKey = {
	grantId	: String,
	apiKey	: String
}

typedef PrecogCreateGrant = {
	name			: String,
	description		: String,
	parentIds		: String,
	expirationDate	: String,
	permissions		: Array<{
	  accessType		: String,
	  path				: String,
	  ownerAccountIds	: String
	}>
}

typedef PrecogCreateGrantChild = {
	parentGrantId	: String,
	childGrant		: Dynamic // TODO type this
}

typedef PrecogUploadFile = {
	path		: String,
	type		: String, // TODO Type this
	contents	: String
}

typedef PrecogAppend = {
	path	: String,
	value	: Dynamic
}

typedef PrecogAppendAll = {
	path	: String,
	values	: Array<Dynamic>
}

typedef PrecogExecuteFile = {
	path	: String
}