using localadmin.Services;
using localadmin.ViewModels;
using localadmin.Views;
using System.Data;
using System.IO;
using System.Text.Json.Serialization;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;

namespace localadmin.Models
{
    /*
    általános információk

    A JsonPropertyName attribútumok a JSON fájlban szereplő neveket tárolják, mivel néhány adat neve az alkalmazásban eltér az adatbázisban tároltaktól.
    A JsonConverter pedig a Enumok konvertálásához kell.
    A wrapper osztályok a JSON fájlban szereplő adatokat tárolják. 
    Ezek az osztályok segítenek az adatok könnyebb kinyerésében és feldolgozásában.
    Az ICommandok a gombokhoz tartozó parancsokat tárolják, mivel a gombokhoz nem lehet közvetlenül metódust rendelni ezért ezt a konstruktorban
    */


    /// <summary>
    /// Ez az osztály reprezentál 1 felhasználót az alkalmazásban.
    /// </summary>
    public class RoleWrapper
    {
        public Roles ?Role { get; set; }
    }
    public class ProfilePictureWrapper
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

    public class StatWrapper
    {
        public int? Plays { get; set; }
        [JsonPropertyName("first_places")]
        public int? FirstPlaces { get; set; }
    }

    public class User
    {

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public enum EActivityStatus
        {
            active,
            inactive,
            away
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
            { EActivityStatus.active, "Aktív" },
            { EActivityStatus.inactive, "Inaktív" },
            { EActivityStatus.away, "Távol" }
        };

        private static readonly Dictionary<EAuthStatus, string> AuthStatusTranslations = new Dictionary<EAuthStatus, string>
        {
            { EAuthStatus.pending, "Folyamatban" },
            { EAuthStatus.active, "Aktív" },
            { EAuthStatus.blocked, "Blokkolva" }
        };

        //ez az event meghívódik amikor egy felhasználó adatai megváltoznak, és újra tölti az felhasználókat.
        public event Action UserUpdated = delegate { };

        //ezek szimplán vissza adják a felhasználó Aktivitás és Authentikációs státuszát magyarul, így volt a legkönnyebb lefordítani.
        public string TranslatedActivityStatus => ActivityStatusTranslations.TryGetValue(ActivityStatus, out var translation) ? translation : ActivityStatus.ToString();
        public string TranslatedAuthStatus => AuthStatusTranslations.TryGetValue(AuthStatus, out var translation) ? translation : AuthStatus.ToString();
        public string UserRoles => Roles != null
            ? string.Join(", ", Roles.Select(r => r.Role?.Name ?? "Unknown"))
            : "No Roles";

        private NavigationService navigationService = new NavigationService();
        private SharedStateService sharedState = new SharedStateService();

        /// <summary>
        /// Az ICommandok a gombokhoz tartozó parancsokat tárolják, mivel a gombokhoz nem lehet közvetlenül metódust rendelni ezért ezt a konstruktorban
        /// </summary>
        public ICommand ViewQuizCommand { get; }
        public ICommand ViewReviewCommand { get; }
        public ICommand EditUserCommand { get; }

        [JsonPropertyName("id")]
        public string UUID { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        [JsonPropertyName("activity_status")]
        public EActivityStatus ActivityStatus { get; set; }
        [JsonPropertyName("auth_status")]
        public EAuthStatus AuthStatus { get; set; }
        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }
        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }

        [JsonPropertyName("profile_picture")]
        public ProfilePictureWrapper ProfilePicture { get; set; } = new ProfilePictureWrapper();
        public byte[]? ProfilePictureArray => ProfilePicture?.GetByteArray();
        public ImageSource? ProfileImage => ByteArrayToImage(ProfilePictureArray);

        public StatWrapper Stats { get; set; } = new StatWrapper();
        public double Winrate { get; set; }

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

        /// <summary>
        /// Ez a funkció konvertálja a byte tömböt (így van tárolva az adatbázisban) ImageSource-ra, hogy megjeleníthető legyen a WPF-ben.
        /// </summary>
        /// <param name="imageData"></param>
        /// <returns></returns>
        public static ImageSource? ByteArrayToImage(byte[]? imageData)
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


        /// <summary>
        /// Ezek a függvények a gombokhoz tartozó parancsokat hajtják végre.
        /// </summary>
        /// <param name="parameter"></param>
        public void EditUser(object parameter)
        {
            EditUserWindow editUserWindow = new(this);
            editUserWindow.Show();
        }

        public async void ViewQuiz(object parameter)
        {
            QuizViewModel quizView = new(navigationService, sharedState);
            sharedState.SearchText = Username;
            navigationService.NavigateTo(quizView);
            await quizView.InitializeAsync();
            quizView.SearchQuizes(Username);
        }

        public void ViewReview(object parameter)
        {
            ReviewViewModel reviewView = new(navigationService, sharedState);
            sharedState.SearchText = Username;
            navigationService.NavigateTo(reviewView);
            reviewView.SearchReviews(Username);
        }

        public void OnUserUpdated()
        {
            UserUpdated?.Invoke();
        }
    }
}
