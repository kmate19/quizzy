using localadmin.Services;
using localadmin.ViewModels;
using localadmin.Views;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Text.Json.Serialization;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using static System.Windows.Forms.VisualStyles.VisualStyleElement;

namespace localadmin.Models
{
    public class RoleWrapper
    {
        public Roles Role { get; set; }
    }
    public class ProfilePictureWrapper
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

    public class User
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public enum EActivityStatus
        {
            Active,
            Inactive,
            Away
        }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public enum EAuthStatus
        {
            pending,
            active,
            blocked
        }

        private static readonly Dictionary<EActivityStatus, string> ActivityStatusTranslations = new Dictionary<EActivityStatus, string>
        {
            { EActivityStatus.Active, "Aktív" },
            { EActivityStatus.Inactive, "Inaktív" },
            { EActivityStatus.Away, "Távol" }
        };

        private static readonly Dictionary<EAuthStatus, string> AuthStatusTranslations = new Dictionary<EAuthStatus, string>
        {
            { EAuthStatus.pending, "Folyamatban" },
            { EAuthStatus.active, "Aktív" },
            { EAuthStatus.blocked, "Blokkolva" }
        };

        public string TranslatedActivityStatus => ActivityStatusTranslations.TryGetValue(ActivityStatus, out var translation) ? translation : ActivityStatus.ToString();
        public string TranslatedAuthStatus => AuthStatusTranslations.TryGetValue(AuthStatus, out var translation) ? translation : AuthStatus.ToString();
        public string UserRoles => Roles != null
            ? string.Join(", ", Roles.Select(r => r.Role?.Name ?? "Unknown"))
            : "No Roles";

        private readonly NavigationService navigationService;
        private readonly SharedStateService sharedState;
        public ICommand ViewQuizCommand { get; }
        public ICommand ViewReviewCommand { get; }
        public ICommand EditUserCommand { get; }
        public string UUID { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        [JsonPropertyName("activity_status")]
        public EActivityStatus ActivityStatus { get; set; }
        [JsonPropertyName("auth_status")]
        public EAuthStatus AuthStatus { get; set; }
        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }
        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [JsonPropertyName("profile_picture")]
        public ProfilePictureWrapper ProfilePicture { get; set; }
        public byte[] ProfilePictureArray => ProfilePicture?.GetByteArray();
        public ImageSource ProfileImage => ByteArrayToImage(ProfilePictureArray);

        public List<RoleWrapper> Roles { get; set; } = new List<RoleWrapper>();


        public User(NavigationService navigationService, SharedStateService sharedState)
        {
            this.navigationService = navigationService;
            this.sharedState = sharedState;

            ViewQuizCommand =new RelayCommand(ViewQuiz);
            ViewReviewCommand = new RelayCommand(ViewReview);
            EditUserCommand = new RelayCommand(EditUser);
        }

        public User() { }

        public static ImageSource ByteArrayToImage(byte[] imageData)
        {
            if (imageData == null || imageData.Length == 0)
                return GetDefaultProfileImage();

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

        public static ImageSource GetDefaultProfileImage()
        {
            try
            {
                BitmapImage defaultImage = new BitmapImage();
                defaultImage.BeginInit();
                defaultImage.UriSource = new Uri("../icon.ico");
                defaultImage.CacheOption = BitmapCacheOption.OnLoad;
                defaultImage.EndInit();
                return defaultImage;
            }
            catch
            {
                return null;
            }
        }

        private void EditUser(object parameter)
        {
            Debug.WriteLine("edit user clicked");
            EditUserWindow editUserWindow = new(this);
            editUserWindow.Show();
        }

        private void ViewQuiz(object parameter)
        {
            QuizViewModel quizView = new(navigationService, sharedState);
            sharedState.SearchText = Username;
            navigationService.NavigateTo(quizView);
            quizView.SearchQuizes(Username);
        }

        private void ViewReview(object parameter)
        {
            ReviewViewModel reviewView = new(navigationService, sharedState);
            sharedState.SearchText = Username;
            navigationService.NavigateTo(reviewView);
            reviewView.SearchReviews(Username);
        }
    }
}
