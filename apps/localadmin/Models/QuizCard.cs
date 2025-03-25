using System.Text.Json.Serialization;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.IO;

namespace localadmin.Models
{
    public class QuizCard
    {
        /// <summary>
        /// Maga az osztály a kédéseket és a válaszokat tárolja minden quizhez.
        /// A wrapper osztályok a JSON fájlban szereplő adatokat tárolják. 
        /// Ezek az osztályok segítenek az adatok könnyebb kinyerésében és feldolgozásában.
        /// </summary>

        public class PictureWrapper
        {
            [JsonPropertyName("data")]
            public List<byte> ?Data { get; set; }

            public byte[]? GetByteArray()
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

        public int ID { get; set; } = 0;
        [JsonPropertyName("quiz_id")]
        public string QuizID { get; set; } = string.Empty;
        [JsonPropertyName("type")]
        public EQuizType Type { get; set; }
        public string Question { get; set; } = string.Empty;
        public List<string> Answers { get; set; } = new List<string>();
        [JsonPropertyName("correct_answer_index")]
        public int CorrectAnswerIndex { get; set; }

        public ProfilePictureWrapper Picture { get; set; } = new ProfilePictureWrapper();
        public byte[]? ProfilePictureArray => Picture?.GetByteArray();
        public ImageSource? BannerImage => ByteArrayToImage(ProfilePictureArray);
        public QuizCard() { }

        public static ImageSource? ByteArrayToImage(byte[]? imageData)
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
