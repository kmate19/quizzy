using localadmin.Services;
using localadmin.ViewModels;
using localadmin.Views;
using System.Diagnostics;
using System.Windows;
using System.Windows.Input;

namespace localadmin.Models
{
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
        private readonly NavigationService navigationService;
        private readonly SharedStateService sharedState;
        public ICommand ViewQuizCommand { get; }
        public ICommand ViewReviewCommand { get; }
        public ICommand DeleteUserCommand { get; }

        public string UUID { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public EActivityStatus ActivityStatus { get; set; }
        public EAuthStatus AuthStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string Roles { get; set; }


        public User(NavigationService navigationService, SharedStateService sharedState)
        {
            this.navigationService = navigationService;
            this.sharedState = sharedState;
            ViewQuizCommand=new RelayCommand(ViewQuiz);
            ViewReviewCommand = new RelayCommand(ViewReview);
            DeleteUserCommand = new RelayCommand(DeleteUser);
        }

        
        private void ViewQuiz(object parameter)
        {
            QuizViewModel quizView = new QuizViewModel(navigationService, sharedState);
            sharedState.SearchText = Username;
            navigationService.NavigateTo(quizView);
            quizView.SearchQuizes(Username);
        }

        private void ViewReview(object parameter)
        {
            ReviewViewModel reviewView=new ReviewViewModel(navigationService, sharedState);
            sharedState.SearchText = Username;
            navigationService.NavigateTo(reviewView);
            reviewView.SearchReviews(Username);
        }

        private void DeleteUser(object parameter)
        {
            PopUpModal modal = new PopUpModal("Biztosan törölni szeretnéd ezt a felhasználót?");
            bool? result = modal.ShowDialog();

            if (result == true) {
                MessageBox.Show("Felhasznalo sikeresen törölve");
            }
        }
    }
}
