package precog.module.config;

import precog.communicator.Communicator;
import precog.communicator.Module;
import precog.log.ILogger;
import precog.log.TraceLogger;
import labcoat.message.Log;

class LogModule extends Module
{
    override public function connect(communicator: Communicator)
    {
        var logger : ILogger = new TraceLogger();
        communicator.provide(logger);
        communicator.on(function(log : Log) {
            logger.log(log.message, log.pos);
        });
    }
}