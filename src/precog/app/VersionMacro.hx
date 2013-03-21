package precog.app;

import haxe.macro.Context;

using StringTools;

class VersionMacro {
    // Must be executed from a cloned Labcoat repository.
    public static macro function gitVersion() {
        var gitProcess = new sys.io.Process('git', ['describe', '--always', '--dirty', '--long', '--tags']);
        var gitDescription = gitProcess.stdout.readAll().toString().trim();
        return macro $v{gitDescription};
    }
}
