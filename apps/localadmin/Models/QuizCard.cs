using System.IO;
using System.Text.Json.Serialization;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace localadmin.Models
{
    public class QuizCard
    {
        public class PictureWrapper
        {
            [JsonPropertyName("data")]
            public List<byte> ?Data { get; set; }

            public byte[] GetByteArray()
            {
                if (Data == null || Data.Count == 0)
                {
                    return null;
                }
                return Data.ToArray();
            }
        }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public enum EQuizType
        {
            normal,
            twochoice
        }
        
        public int ID { get; set; }
        [JsonPropertyName("quiz_id")]
        public string QuizID { get; set; }
        [JsonPropertyName("type")]
        public EQuizType Type { get; set; }
        public string Question { get; set; }
        public List<string> Answers { get; set; }
        [JsonPropertyName("correct_answer_index")]
        public int CorrectAnswerIndex { get; set; }

        public ProfilePictureWrapper Picture { get; set; }
        public byte[]? ProfilePictureArray => Picture?.GetByteArray();
        public ImageSource BannerImage => ByteArrayToImage(ProfilePictureArray);
        public QuizCard() { }

        public static ImageSource ByteArrayToImage(byte[] imageData)
        {
            if (imageData == null || imageData.Length == 0)
                return null;

            BitmapImage image = new BitmapImage();
            using (var ms = new MemoryStream(imageData))
            {
                image.BeginInit();
                image.CacheOption = BitmapCacheOption.OnLoad;
                image.StreamSource = ms;
                image.EndInit();
            }
            return image;
        }
    }
}
