using localadmin.Services;
using localadmin.ViewModels;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Windows.Input;

namespace localadmin.Models
{
    public class User
    {
        private readonly NavigationService navigationService;

        private readonly SharedStateService sharedState;
        public ICommand ViewQuizCommand { get; }

        public string Username { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }


        public User(NavigationService navigationService, SharedStateService sharedState)
        {
            this.navigationService = navigationService;
            this.sharedState = sharedState;
            ViewQuizCommand=new RelayCommand(ViewQuiz);
        }

        
        private void ViewQuiz(object parameter)
        {
            Debug.WriteLine("viewing quizes from: " + Username);
            QuizViewModel quizView = new QuizViewModel(navigationService, sharedState);
            sharedState.SearchText = Username;
            navigationService.NavigateTo(quizView);
            quizView.SearchQuizes(Username);
        }
    }
}
