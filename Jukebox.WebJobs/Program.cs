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
