﻿using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Diagnostics;
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
        internal const string JukeboxTrackTableName = "jukeboxtrack";
        private readonly ITableStorage _storage;
        private readonly IPlaylistsApi _api;

        internal ImportSpotifyPlaylistService(ITableStorage tableStorage, IPlaylistsApi playlistsApi)
        {
            _storage = tableStorage;
            _api = playlistsApi;

            _storage.CreateTables(new[] { JukeboxTrackTableName }).Wait();
        }

        public async Task Import(string message)
        {
            // dequeue
            dynamic importMessage = JsonConvert.DeserializeObject(message);
            await Import(importMessage);
        }

        public async Task Import(dynamic importMessage)
        {
            var messageQueueTime = DateTime.UtcNow.Subtract((DateTime) importMessage.whenCreated);
            Trace.TraceInformation("Message was queued for " + messageQueueTime);

            var entities = new List<TableEntity>();

            //  get tracks for playlist
            var response = await _api.GetTracks((string)importMessage.username, (string)importMessage.playlistId);
            var tracks = new List<dynamic>(response.items);

            foreach (dynamic item in tracks)
            {
                //TODO: Add duration & JSON
                entities.Add(new JukeboxTrackEntity((string)importMessage.jukeboxId, (string)item.track.name,
                    (string)item.track.artists[0].name, (string)item.track.album.name, (int)item.track.duration_ms, 
                    (string)item.track.preview_url,
                    (string)item.track.album.images[1].url, (string)item.track.external_urls.spotify));
            }

            //  add to tracks table
            await _storage.Insert(JukeboxTrackTableName, entities.ToArray());
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

    public class ImportSpotifyPlaylistServiceInvoker
    {
        public async Task<object> Invoke(dynamic input)
        {
            try
            {
                // appSettings are passed in from Node's process env vars
                var appSettings = new NameValueCollection();
                foreach (var setting in input.settings)
                {
                    appSettings.Add(setting.Key, setting.Value);
                }

                var restHttpClient = new RestHttpClient(new HttpClient());

                var service = new ImportSpotifyPlaylistService(AzureTableStorage.GetTableStorage(appSettings),
                    new PlaylistsApi(restHttpClient,
                        new ClientCredentialsAuthorizationApi(restHttpClient, appSettings,
                            new RuntimeMemoryCache(MemoryCache.Default))));

                await service.Import(input.message);
                return null;

            }
            catch(Exception exception)
            {
                Trace.TraceError(exception.Message);
                return exception.Message;
            }
        }
    }
}
