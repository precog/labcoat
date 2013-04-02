import utest.Runner;
import utest.ui.Report;

class TestAll
{
	public static function addTests(runner : Runner)
	{
		runner.addCase(new precog.communicator.TestCommunicator());
		runner.addCase(new precog.communicator.TestModuleManager());
		
		runner.addCase(new precog.geom.TestPoint());
		runner.addCase(new precog.geom.TestRectangle());

		runner.addCase(new precog.util.fs.TestFileSystem());

		runner.addCase(new precog.layout.TestLayout());
		runner.addCase(new precog.layout.TestCanvasLayout());
		runner.addCase(new precog.layout.TestDockLayout());
		runner.addCase(new precog.layout.TestStackLayout());
		runner.addCase(new precog.layout.TestWrapLayout());

		runner.addCase(new precog.editor.markdown.TestRenderer());
	}

	public static function main()
	{
		var runner = new Runner();
		addTests(runner);
		Report.create(runner);
		runner.run();
	}
}