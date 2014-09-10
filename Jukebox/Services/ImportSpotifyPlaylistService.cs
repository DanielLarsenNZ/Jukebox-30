using System.Collections.Generic;
using System.Collections.Specialized;
using System.Net.Http;
using System.Runtime.Caching;
using System.Threading.Tasks;
using Jukebox.Entities;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using Radiostr.SpotifyWebApi;
using Radiostr.SpotifyWebApi.Cache;
using Radiostr.SpotifyWebApi.Http;
using Scale.Storage.Table;

namespace Jukebox.Services
{
    public class ImportSpotifyPlaylistService
    {
        private readonly ITableStorage _storage;
        private readonly IPlaylistsApi _api;

        internal ImportSpotifyPlaylistService(ITableStorage tableStorage, IPlaylistsApi playlistsApi)
        {
            _storage = tableStorage;
            _api = playlistsApi;
        }

        public async Task Import(string message)
        {
            // dequeue
            dynamic importMessage = JsonConvert.DeserializeObject(message);

            var entities = new List<TableEntity>();

            //  get tracks for playlist
            var response = await _api.GetTracks((string)importMessage.username, (string)importMessage.playlistId);
            var tracks = new List<dynamic>(response.items);

            foreach (dynamic track in tracks)
            {
                entities.Add(new JukeboxTrackEntity(importMessage.jukeboxId, track.name, track.artists[0].name, 
                    track.album.name, track.preview_url, track.album.images[0].url));
            }

            //  add to tracks table
            await _storage.Insert("jukebox-track", entities.ToArray());
        }

        public static ImportSpotifyPlaylistService GetService(HttpClient httpClient)
        {
            var appSettings = new NameValueCollection(System.Configuration.ConfigurationManager.AppSettings);

            var restHttpClient = new RestHttpClient(httpClient);
            return new ImportSpotifyPlaylistService(AzureTableStorage.GetTableStorage(appSettings),
                new PlaylistsApi(restHttpClient,
                    new ClientCredentialsAuthorizationApi(restHttpClient, appSettings,
                        new RuntimeMemoryCache(MemoryCache.Default))));
        }
    }
}
