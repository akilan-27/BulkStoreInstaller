using BulkStoreInstaller.Companion.Services;

namespace BulkStoreInstaller.Companion.Tests
{
    public class WingetOutputParserTests
    {
        [Fact]
        public void ParseLine_ShouldExtractProgress()
        {
            var line = "Downloading 50%";
            var result = WingetOutputParser.ParseLine(line, "downloading", null);
            
            Assert.Equal("downloading", result.Stage);
            Assert.Equal(50, result.Progress);
        }

        [Fact]
        public void ParseLine_ShouldNotDecreaseProgress()
        {
            var line = "Downloading 40%";
            var result = WingetOutputParser.ParseLine(line, "downloading", 50);
            
            Assert.Equal("downloading", result.Stage);
            Assert.Equal(50, result.Progress);
        }

        [Fact]
        public void ParseLine_ExtractsStagesCorrectly()
        {
            Assert.Equal("preparing", WingetOutputParser.ParseLine("Found package", "", null).Stage);
            Assert.Equal("downloading", WingetOutputParser.ParseLine("Downloading something", "", null).Stage);
            Assert.Equal("installing", WingetOutputParser.ParseLine("Extracting archive", "", null).Stage);
            Assert.Equal("verifying", WingetOutputParser.ParseLine("Successfully installed", "", null).Stage);
        }
    }
}
