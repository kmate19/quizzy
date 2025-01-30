using localadmin.Services;
using localadmin.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Windows.Input;

namespace localadmin.Models
{
    public class User
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }

        private readonly NavigationService navigationService;

        private readonly SharedStateService sharedState;
        public ICommand ViewQuizCommand { get; }

        public User(NavigationService navigationService, SharedStateService sharedState)
        {
            this.navigationService = navigationService;
            this.sharedState = sharedState;
            ViewQuizCommand=new RelayCommand(ViewQuiz);
        }

        public User()
        {

        }

        private void ViewQuiz(object parameter)
        {
            QuizViewModel quizViewModel = new QuizViewModel(navigationService);
            sharedState.SearchText = Username;
            navigationService.NavigateTo(quizViewModel);
            quizViewModel.SearchQuizes(Username);
        }
    }
}
