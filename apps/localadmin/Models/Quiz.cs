using localadmin.ViewModels;
using System.Windows.Input;
using localadmin.Services;
using System.Windows;
using System.Text.Json.Serialization;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.IO;
using static localadmin.Models.User;

namespace localadmin.Models
{
    public class Quiz
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
        /// Ez az ostály reprezentál 1 quizt az alkalmazásban, de nem minden adatát hiszen azok a QuizCardokban vannak.
        /// </summary>

        public enum EQuizStatus
        {
            draft,
            published,
            requires_review,
            @private,
            rejected
        }

        private static readonly Dictionary<EQuizStatus, string> StatusTranslations = new Dictionary<EQuizStatus, string>
        {
            { EQuizStatus.draft, "Vázlat" },
            { EQuizStatus.published, "Közzétéve" },
            { EQuizStatus.requires_review, "Felülvizsgálatra vár" },
            { EQuizStatus.@private, "Privát" },
            { EQuizStatus.rejected, "Elutasítva" }
        };

        public string TranslatedActivityStatus => StatusTranslations.TryGetValue(Status, out var translation) ? translation : Status.ToString();

        public class UserWrapper
        {
            public string? Username { get; set; }
        }

        public class PictureWrapper
        {
            [JsonPropertyName("data")]
            public List<byte>? Data { get; set; }

            public byte[]? GetByteArray()
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
            public Tag? Tag { get; set; }
        }

        public class Tag
        {
            public string? Name { get; set; }
        }

        public class LanguageWrapper
        {
            public Language? Language { get; set; }
        }

        public class Language
        {
            public string? Name { get; set; }
        }

        private NavigationService? NavigationService;

        private SharedStateService? SharedState;
        public ICommand ViewUserCommand { get; }
        public ICommand ViewReviewCommand { get; }
        public ICommand ViewQuizCommand { get; }

        public event Action QuizUpdated = delegate { };

        [JsonPropertyName("id")]
        public string UUID { get; set; } = string.Empty;
        public string UserID { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        [JsonPropertyName("status")]
        public EQuizStatus Status { get; set; }
        public int Rating { get; set; }
        public int Plays { get; set; }

        [JsonPropertyName("created_at")]
        public DateTime CreatedAt { get; set; }
        [JsonPropertyName("updated_at")]
        public DateTime UpdatedAt { get; set; }
        public List<QuizCard> QuizCards { get; set; } = new List<QuizCard>();
        public UserWrapper User { get; set; } = new UserWrapper();

        public ProfilePictureWrapper? Banner { get; set; }
        public byte[]? ProfilePictureArray => Banner?.GetByteArray();
        public ImageSource? BannerImage => ByteArrayToImage(ProfilePictureArray);
        public List<TagWrapper> Tags { get; set; } = new List<TagWrapper>();
        public List<LanguageWrapper> Languages { get; set; } = new List<LanguageWrapper>();

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

        /// <summary>
        /// Ezek a függvények a gombokhoz tartozó parancsokat hajtják végre.
        /// </summary>
        /// <param name="parameter"></param>
        public async void ViewUser(object? parameter)
        {
            if (NavigationService == null || SharedState == null || User.Username == null)
                return;

            UserViewModel userView = new UserViewModel(NavigationService, SharedState);
            SharedState.SearchText = User.Username;
            NavigationService.NavigateTo(userView);
            await userView.InitializeAsync();
            userView.SearchUsers(SharedState.SearchText);
        }

        public void ViewReview(object? parameter)
        {
            if (NavigationService == null || SharedState == null || User.Username == null)
                return;

            ReviewViewModel reviewView = new ReviewViewModel(NavigationService, SharedState);
            SharedState.SearchText = User.Username;
            NavigationService.NavigateTo(reviewView);
            reviewView.SearchReviews(SharedState.SearchText);
        }

        /// <summary>
        /// Ez megnyit egy új ablakot a quiz részletes nézetével.
        /// </summary>
        /// <param name="parameter"></param>
        public void ViewQuiz(object? parameter)
        {
            Window window = new QuizDetailedView(this, NavigationService, SharedState);
            window.Show();
        }

        public void OnQuizUpdated()
        {
            QuizUpdated?.Invoke();
        }
    }
}