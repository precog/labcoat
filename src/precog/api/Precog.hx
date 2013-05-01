package precog.api;

import precog.api.PrecogHttp;

extern class Precog 
{
	public function new(?options : Config) : Void;

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

	public function createAccount(account : OptAccount, ?success : ProcAccountId, ?failure : ProcFailure) : Future<ProcAccountId, ProcFailure>;
	public function requestPasswordReset(email : String, ?success : ProcT<String>, ?failure : ProcFailure) : Future<ProcT<String>, ProcFailure>;
	public function lookupAccountId(email : String, ?success : ProcAccountId, ?failure : ProcFailure) : Future<ProcAccountId, ProcFailure>;
	public function describeAccount(account : OptAccount, ?success : ProcDescribeAccount, ?failure : ProcFailure) : Future<ProcDescribeAccount, ProcFailure>;
	public function addGrantToAccount(info : OptGrantInfo, ?success : ProcVoid, ?failure : ProcFailure) : Future<ProcVoid, ProcFailure>;
	public function currentPlan(account : OptAccount, ?success : ProcT<String>, ?failure : ProcFailure) : Future<ProcT<String>, ProcFailure>;
	public function changePlan(account : OptAccountPlan, ?success : ProcVoid, ?failure : ProcFailure) : Future<ProcVoid, ProcFailure>;
	public function deletePlan(account : OptAccount, ?success : ProcPlan, ?failure : ProcFailure) : Future<ProcPlan, ProcFailure>;

    // ****************
    // *** SECURITY ***
    // ****************

    public function listApiKeys(?success : ProcListApiKey, ?failure : ProcFailure) : Future<ProcListApiKey, ProcFailure>;
    // TODO define grants type
    public function createApiKey(grants : Array<Dynamic>, ?success : ProcResCreatedApiKey, ?failure : ProcFailure) : Future<ProcResCreatedApiKey, ProcFailure>;
    public function describeApiKey(apiKey : String, ?success : ProcDescribeApiKey, ?failure : ProcFailure) : Future<ProcDescribeApiKey, ProcFailure>;
    public function deleteApiKey(apiKey : String, ?success : ProcVoid, ?failure : ProcFailure) : Future<ProcVoid, ProcFailure>;
    public function retrieveApiKeyGrants(apiKey : String, ?success : ProcListDescribeApiKey, ?failure : ProcFailure) : Future<ProcListDescribeApiKey, ProcFailure>;
    public function addGrantToApiKey(info : OptAddGrantToApiKey, ?success : ProcVoid, ?failure : ProcFailure) : Future<ProcVoid, ProcFailure>;
    public function removeGrantFromApiKey(info : OptRemoveGrantFromApiKey, ?success : ProcVoid, ?failure : ProcFailure) : Future<ProcVoid, ProcFailure>;
    public function createGrant(grant : OptCreateGrant, ?success : ProcVoid, ?failure : ProcFailure) : Future<ProcVoid, ProcFailure>;
    public function describeGrant(grantId : String, ?success : ProcResGrant, ?failure : ProcFailure) : Future<ProcResGrant, ProcFailure>;
    public function deleteGrant(grantId : String, ?success : ProcVoid, ?failure : ProcFailure) : Future<ProcVoid, ProcFailure>;
    public function createGrantChild(info : OptCreateGrantChild, ?success : ProcCreateGrant, ?failure : ProcFailure) : Future<ProcCreateGrant, ProcFailure>;

	// ****************
	// *** METADATA ***
	// ****************

    public function getMetadata(path : String, ?success : ProcMetadata, ?failure : ProcFailure) : Future<ProcMetadata, ProcFailure>;
    public function _retrieveMetadata(path : String, ?success : ProcMetadata, ?failure : ProcFailure) : Future<ProcMetadata, ProcFailure>;
    public function listChildren(path0 : String, ?success : ProcListFileDescription, ?failure : ProcFailure) : Future<ProcListFileDescription, ProcFailure>;
    public function listDescendants(path0 : String, ?success : ProcArrayT<String>, ?failure : ProcFailure) : Future<ProcArrayT<String>, ProcFailure>;
    public function existsFile(path : String, ?success : ProcT<Bool>, ?failure : ProcFailure) : Future<ProcT<Bool>, ProcFailure>;

	// ************
	// *** DATA ***
	// ************
	public function getFile(path : String, ?success : ProcFile, ?failure : ProcFailure) : Future<ProcFile, ProcFailure>;
    public function uploadFile(info : OptUploadFile, ?success : ProcUploadReport, ?failure : ProcFailure) : Future<ProcUploadReport, ProcFailure>;
    public function createFile(info : OptUploadFile, ?success : ProcUploadReport, ?failure : ProcFailure) : Future<ProcUploadReport, ProcFailure>;
    public function retrieveFile(path0 : String, ?success : ProcFile, ?failure : ProcFailure) : Future<ProcFile, ProcFailure>;
    public function append(info : OptAppend, ?success : ProcUploadReport, ?failure : ProcFailure) : Future<ProcUploadReport, ProcFailure>;
    public function appendAll(info : OptAppendAll, ?success : ProcUploadReport, ?failure : ProcFailure) : Future<ProcUploadReport, ProcFailure>;
	// TODO needs typing
    public function delete0(path0 : String, ?success : ProcT<Dynamic>, ?failure : ProcFailure) : Future<ProcT<Dynamic>, ProcFailure>;
	// TODO needs typing
    public function deleteAll(path : String, ?success : ProcT<Dynamic>, ?failure : ProcFailure) : Future<ProcT<Dynamic>, ProcFailure>;
    public function moveDirectory(info : OptMove, ?success : ProcVoid, ?failure : ProcFailure) : Future<ProcVoid, ProcFailure>;
    public function moveFile(info : OptMove, ?success : ProcVoid, ?failure : ProcFailure) : Future<ProcVoid, ProcFailure>;

	// ****************
	// *** ANALYSIS ***
	// ****************

    public function executeFile(info : OptExecuteFile, ?success : ProcQuery, ?failure : ProcFailure) : Future<ProcQuery, ProcFailure>;
    public function execute(info : ResQuery, ?success : ProcQuery, ?failure : ProcFailure) : Future<ProcQuery, ProcFailure>;
    public function _asyncQuery(info : ResQuery, ?success : ProcAsyncQuery, ?failure : ProcFailure) : Future<ProcAsyncQuery, ProcFailure>;
    public function _asyncQueryResults(jobId : String, ?success : ProcQueryDetailed, ?failure : ProcFailure) : Future<ProcQueryDetailed, ProcFailure>;

	static function __init__() : Void
	{
		haxe.macro.Compiler.includeFile("precog/api/precog.js");
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
typedef ProcVoid = Void -> Void;
typedef ProcT<T> = T -> Void;
typedef ProcArrayT<T> = ProcT<Array<T>>;
typedef ResAccountId = {
				accountId : String
			}
typedef ProcAccountId = ProcT<ResAccountId>;
typedef ResPlan = {
				type : String
			};
typedef ProcPlan = ProcT<ResPlan>;
typedef ResDescribeAccount = {
				accountCreationDate : String,
				accountId : String,
				apiKey : String,
				email : String,
				lastPasswordChangeTime : String,
				rootPath : String,
				plan : ResPlan
			}
typedef ProcDescribeAccount = ProcT<ResDescribeAccount>;
typedef ProcFailure = ProcT<Dynamic>;
typedef ResPermission = {
				accessType : String,
				path : String,
				schemaVersion : String,
				ownerAccountIds : Array<String>
			};
typedef ResCreateGrant = {
				createdAt : String,
				grantId : String,
				permissions : Array<ResPermission>
			};
typedef ProcCreateGrant = ProcT<ResCreateGrant>;
typedef ProcListGrant = ProcArrayT<ResCreateGrant>;
typedef ResGrant = {
				>ResCreateGrant,
				description : String,
				name : String
			};
typedef ProcResGrant = ResGrant -> Void;
typedef ResCreatedApiKey = {
				apiKey : String,
				grants : Array<ResGrant>,
				issuerChain : Array<Dynamic> // TODO type me
			};
typedef ProcResCreatedApiKey = ProcT<ResCreatedApiKey>;
typedef ProcListApiKey = ProcArrayT<ResCreatedApiKey>;
typedef ResDescribeApiKey = {
				>ResCreatedApiKey,
				description : String,
				name : String
			};
typedef ProcDescribeApiKey = ProcT<ResDescribeApiKey>;
typedef ProcListDescribeApiKey = ProcArrayT<ResDescribeApiKey>;

typedef ResUploadError = {
				// TODO type me
			}
typedef ResUploadReport = {
				errors : Array<ResUploadError>,
				failed : Int,
				ingestId : String,
				ingested : Int,
				skipped : Int,
				total : Int
			}
typedef ProcUploadReport = ProcT<ResUploadReport>;
typedef ResMetadata = {
				size : Int,
				children : Array<String>,
				structure : Dynamic // TODO type me
			}
typedef ProcMetadata = ProcT<ResMetadata>;
typedef ResAsyncQuery = {
				jobId : String
			}
typedef ProcAsyncQuery = ProcT<ResAsyncQuery>;
typedef ResQuery = {data: Array<Dynamic>};
typedef ProcQuery = ProcT<ResQuery>;
typedef ResQueryDetailed = {
				errors : Array<Dynamic>, // TODO type me
				warnings : Array<Dynamic>, // TODO type me
				data : ResQuery
			}
typedef ProcQueryDetailed = ProcT<ResQueryDetailed>;
typedef ResFile = {
				contents : String,
				type : String
			}
typedef ProcFile = ProcT<ResFile>;
typedef ResFileDescription = {
				name : String,
				type : String
			}
typedef ProcFileDescription = ProcT<ResFileDescription>;
typedef ProcListFileDescription = ProcArrayT<ResFileDescription>;

// ****************
// *** CONFIG ***
// ****************

typedef Config = {
	analyticsService : String,
	?apiKey : String
}

// ****************
// *** ARGUMENTS ***
// ****************
typedef OptAccount = {
	email		: String,
	password	: String
}

typedef OptAccountPlan = {
	> OptAccount,
	plan : String
}

typedef OptGrantInfo = {
	accountId	: String,
	grantId		: String
}

typedef OptAddGrantToApiKey = {
	grant	: Dynamic, // TODO type this
	apiKey	: String
}

typedef OptRemoveGrantFromApiKey = {
	grantId	: String,
	apiKey	: String
}

typedef OptCreateGrant = {
	name			: String,
	description		: String,
	?parentIds		: String,
	?expirationDate	: String,
	permissions		: Array<{
	  accessType		: String,
	  path				: String,
	  ownerAccountIds	: Array<String>
	}>
}

typedef OptCreateGrantChild = {
	parentGrantId	: String,
	childGrant		: Dynamic // TODO type this
}

typedef OptUploadFile = {
	path		: String,
	type		: String, // TODO Type this
	contents	: String
}

typedef OptAppend = {
	path	: String,
	value	: Dynamic
}

typedef OptAppendAll = {
	path	: String,
	values	: Array<Dynamic>
}

typedef OptExecuteFile = {
	path	: String,
	?maxAge : Float,
	?maxStale : Float
}

typedef OptMove = {
	source : String,
	dest : String
}