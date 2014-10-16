using System;
using System.Diagnostics;
using System.Net.Http;
using System.Threading.Tasks;
using Jukebox.Services;
using Microsoft.Azure.WebJobs;

namespace Jukebox.WebJobs
{
    public class Program
    {
        public static void Main()
        {
            var config =
                new JobHostConfiguration(
                    System.Configuration.ConfigurationManager.AppSettings["AZURE_STORAGE_CONNECTION_STRING"]);

            // set max poll setting if configured. Default is 10 mins
            // http://azure.microsoft.com/blog/2014/08/21/announcing-the-0-4-0-beta-preview-of-microsoft-azure-webjobs-sdk/
            var maxPollSetting = System.Configuration.ConfigurationManager.AppSettings["JobHostConfiguration.Queues.MaxPollingInterval"];

            if (!string.IsNullOrEmpty(maxPollSetting))
            {
                int result;
                if (int.TryParse(maxPollSetting, out result)) 
                {
                    config.Queues.MaxPollingInterval = TimeSpan.FromMinutes(result);     
                }
            }

            var host = new JobHost(config);
            host.RunAndBlock();
        }

        public static async Task ImportPlaylist([QueueTrigger("import-playlist")] string message)
        {
            Trace.TraceInformation("Import Playlist " + message);
            try
            {
                var service = ImportSpotifyPlaylistService.GetService(new HttpClient());
                await service.Import(message);
            }
            catch (Exception exception)
            {
                Trace.TraceError("{0}\r\n\t{1}", exception.Message, exception.StackTrace);
                throw;
            }
        }
    }
}
