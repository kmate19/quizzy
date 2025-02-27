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
        private NavigationService NavigationService;

        private SharedStateService SharedState;
        public ICommand ViewUserCommand { get; }
        public ICommand ViewReviewCommand { get; }
        public ICommand ViewQuizCommand { get; }
        public string UUID { get; set; }
        public string UserID { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public EQuizStatus Status { get; set; }
        public int Rating { get; set; }
        public int Plays { get; set; }
        public byte[] Banner { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<QuizCard> QuizCards { get; set; }

        public string MadeBy
        {
            get
            {
                UserViewModel userView = new UserViewModel(NavigationService, SharedState);
                User user = userView.Users.FirstOrDefault(x => x.UUID == UserID);
                if (user == null)
                {
                    return "Unknown"; // Or any default value
                }

                else
                    return user.Username;
            }
            set { }
        }

        public Quiz(NavigationService navigation, SharedStateService sharedState)
        {
            NavigationService= navigation;
            SharedState = sharedState;

            ViewUserCommand = new RelayCommand(ViewUser);
            ViewReviewCommand = new RelayCommand(ViewReview);
            ViewQuizCommand = new RelayCommand(ViewQuiz);
        }

        private void ViewUser(object parameter)
        {
            UserViewModel userView = new UserViewModel(NavigationService, SharedState);
            SharedState.SearchText = MadeBy;
            NavigationService?.NavigateTo(userView);
            userView.SearchUsers(SharedState.SearchText);
        }

        private void ViewReview(object parameter)
        {
            ReviewViewModel reviewView = new ReviewViewModel(NavigationService, SharedState);
            SharedState.SearchText = MadeBy;
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