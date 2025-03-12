using localadmin.Services;
using localadmin.ViewModels;
using localadmin.Views;
using System.Data;
using System.Diagnostics;
using System.IO;
using System.Text.Json.Serialization;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace localadmin.Models
{
    public class RoleWrapper
    {
        public Roles Role { get; set; }
    }
    public class ProfilePictureWrapper
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

        private NavigationService navigationService = new NavigationService();
        private SharedStateService sharedState = new SharedStateService();
        public ICommand ViewQuizCommand { get; }
        public ICommand ViewReviewCommand { get; }
        public ICommand EditUserCommand { get; }

        [JsonPropertyName("id")]
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
        public byte[]? ProfilePictureArray => ProfilePicture?.GetByteArray();
        public ImageSource ProfileImage => ByteArrayToImage(ProfilePictureArray);

        public List<RoleWrapper> Roles { get; set; } = new List<RoleWrapper>();

        public User()
        {
            ViewQuizCommand = new RelayCommand(ViewQuiz);
            ViewReviewCommand = new RelayCommand(ViewReview);
            EditUserCommand = new RelayCommand(EditUser);
        }

        public void Initialize(NavigationService navigationService, SharedStateService sharedState)
        {
            this.navigationService = navigationService;
            this.sharedState = sharedState;
        }

        public static ImageSource ByteArrayToImage(byte[] imageData)
        {
            if (imageData == null)
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
        private void EditUser(object parameter)
        {
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
