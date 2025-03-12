using localadmin.ViewModels;
using System.Diagnostics;
using System.Windows.Input;
using localadmin.Services;
using System.Windows;
using System.Text.Json.Serialization;
using System.Windows.Media;
using System.IO;
using System.Windows.Media.Imaging;

namespace localadmin.Models
{
    public class Quiz
    {
        public enum EQuizStatus{
            Draft,
            Published,
            RequiresReview,
            Private
        }
        public class UserWrapper
        {
            public string Username { get; set; }
        }

        public class PictureWrapper
        {
            [JsonPropertyName("data")]
            public List<byte> Data { get; set; }

            public byte[] GetByteArray()
            {
                if (Data == null || Data.Count == 0)
                {
                    return null;
                }
                return Data.ToArray();
            }
        }
        public class TagWrapper
        {
            public Tag Tag { get; set; }
        }

        public class Tag
        {
            public string Name { get; set; }
        }

        private NavigationService NavigationService;

        private SharedStateService SharedState;
        public ICommand ViewUserCommand { get; }
        public ICommand ViewReviewCommand { get; }
        public ICommand ViewQuizCommand { get; }
        [JsonPropertyName("id")]
        public string UUID { get; set; }
        public string UserID { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public EQuizStatus Status { get; set; }
        public int Rating { get; set; }
        public int Plays { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }
        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }
        public List<QuizCard> QuizCards { get; set; }
        public UserWrapper User { get; set; }

        public ProfilePictureWrapper Banner { get; set; }
        public byte[]? ProfilePictureArray => Banner?.GetByteArray();
        public ImageSource BannerImage => ByteArrayToImage(ProfilePictureArray);

        public List<TagWrapper> Tags { get; set; } = new List<TagWrapper>();

        public Quiz()
        {
            ViewUserCommand = new RelayCommand(ViewUser);
            ViewReviewCommand = new RelayCommand(ViewReview);
            ViewQuizCommand = new RelayCommand(ViewQuiz);
        }

        public void Initialize(NavigationService navigation, SharedStateService sharedState)
        {
            NavigationService = navigation;
            SharedState = sharedState;
        }

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

        private void ViewUser(object parameter)
        {
            UserViewModel userView = new UserViewModel(NavigationService, SharedState);
            SharedState.SearchText = User.Username;
            NavigationService?.NavigateTo(userView);
            userView.SearchUsers(SharedState.SearchText);
        }

        private void ViewReview(object parameter)
        {
            ReviewViewModel reviewView = new ReviewViewModel(NavigationService, SharedState);
            SharedState.SearchText = User.Username;
            NavigationService?.NavigateTo(reviewView);
            reviewView.SearchReviews(SharedState.SearchText);
        }
        private void ViewQuiz(object paramter)
        {
            Window window = new QuizDetailedView(this);
            window.Show();
        }
    }
}