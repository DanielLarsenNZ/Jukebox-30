using System;
using Microsoft.WindowsAzure.Storage.Table;

namespace Jukebox.Entities
{
    public class JukeboxTrackEntity : TableEntity
    {
        public JukeboxTrackEntity()
        {
        }

        public JukeboxTrackEntity(string jukeboxId, string name, string artist, string album, int duration, string previewUrl, string imageUrl, 
            string webUrl)
        {
            Id = Guid.NewGuid();
            JukeboxId = jukeboxId;
            Name = name;
            Artist = artist;
            Album = album;
            Duration = duration;
            PreviewUrl = previewUrl;
            ImageUrl = imageUrl;
            WebUrl = webUrl;

            RowKey = Id.ToString("N");
            PartitionKey = jukeboxId;
        }

        public Guid Id { get; set; }
        
        public string JukeboxId { get; set; }
        
        public string Name { get; set; }
        
        public string Artist { get; set; }
        
        public string Album { get; set; }

        /// <summary>
        /// Duration in milliseconds
        /// </summary>
        public int Duration { get; set; }
        
        public string PreviewUrl { get; set; }
        
        public string ImageUrl { get; set; }
        
        public string WebUrl { get; set; }
    }
}
