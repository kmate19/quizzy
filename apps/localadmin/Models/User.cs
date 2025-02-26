using localadmin.Services;
using localadmin.ViewModels;
using localadmin.Views;
using System.Data;
using System.Diagnostics;
using System.Text.Json.Serialization;
using System.Windows;
using System.Windows.Input;
using static System.Windows.Forms.VisualStyles.VisualStyleElement;

namespace localadmin.Models
{
    public class RoleWrapper
    {
        public Roles Role { get; set; }
    }

    public class User
    {
        public enum EActivityStatus
        {
            Active,
            Inactive,
            Away
        }
        public enum EAuthStatus
        {
            Pending,
            Active,
            Blocked
        }

        private static readonly Dictionary<EActivityStatus, string> ActivityStatusTranslations = new Dictionary<EActivityStatus, string>
        {
            { EActivityStatus.Active, "Aktív" },
            { EActivityStatus.Inactive, "Inaktív" },
            { EActivityStatus.Away, "Távol" }
        };

        private static readonly Dictionary<EAuthStatus, string> AuthStatusTranslations = new Dictionary<EAuthStatus, string>
        {
            { EAuthStatus.Pending, "Folyamatban" },
            { EAuthStatus.Active, "Aktív" },
            { EAuthStatus.Blocked, "Blokkolva" }
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
        public ICommand DeleteUserCommand { get; }
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
        //pfp
        public List<RoleWrapper> Roles { get; set; } = new List<RoleWrapper>();


        public User(NavigationService navigationService, SharedStateService sharedState)
        {
            this.navigationService = navigationService;
            this.sharedState = sharedState;
            ViewQuizCommand=new RelayCommand(ViewQuiz);
            ViewReviewCommand = new RelayCommand(ViewReview);
            DeleteUserCommand = new RelayCommand(DeleteUser);
            EditUserCommand = new RelayCommand(EditUser);
        }

        public User() { }

        private void EditUser(object parameter)
        {
            Debug.WriteLine("edit user clicked");
            EditUserWindow editUserWindow = new(this);
            editUserWindow.Show();
        }

        private void ViewQuiz(object parameter)
        {
            QuizViewModel quizView = new (navigationService, sharedState);
            sharedState.SearchText = Username;
            navigationService.NavigateTo(quizView);
            quizView.SearchQuizes(Username);
        }

        private void ViewReview(object parameter)
        {
            ReviewViewModel reviewView=new (navigationService, sharedState);
            sharedState.SearchText = Username;
            navigationService.NavigateTo(reviewView);
            reviewView.SearchReviews(Username);
        }

        private void DeleteUser(object parameter)
        {
            PopUpModal modal = new ("Biztosan törölni szeretnéd ezt a felhasználót: "+Username);
            bool? result = modal.ShowDialog();

            if (result == true) {
                MessageBox.Show("Felhasznalo sikeresen törölve");
            }
        }
    }
}
