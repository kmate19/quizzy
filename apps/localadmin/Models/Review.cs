using localadmin.Services;
using localadmin.ViewModels;
using System.Windows.Input;

namespace localadmin.Models
{
    public class Review
    {
        private readonly NavigationService NavigationService;

        private readonly SharedStateService SharedState;

        public ICommand ViewUserCommand { get;}
        public ICommand ViewQuizCommand { get;}

        public string UUID { get; set; }
        public string UserUUID { get; set; }
        public string QuizUUID { get; set; }
        public double Rating { get; set; }
        public int Likes { get; set; }
        public int Dislikes { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public string Stars => new string('★', (int)Rating) + new string('☆', 5 - (int)Rating);

        public string MadeBy
        {
            get
            {
                UserViewModel userView = new UserViewModel(NavigationService, SharedState);
                User user = userView.Users.FirstOrDefault(x => x.UUID == UserUUID);
                if (user == null)
                {
                    return "Unknown";
                }
                else
                    return user.Username;
            }
        }

        public string MadeOn
        {
            get
            {
                QuizViewModel quizView = new QuizViewModel(NavigationService, SharedState);
                return quizView.Quizzes.Where(x => x.UUID == QuizUUID).First().Title;
            }
        }

        public Review(NavigationService navigation, SharedStateService sharedState)
        {
            NavigationService = navigation;
            SharedState = sharedState;
            ViewUserCommand = new RelayCommand(ViewUser);
            ViewQuizCommand = new RelayCommand(ViewQuiz);
        }

        private void ViewUser(object parameter)
        {
            UserViewModel userView = new UserViewModel(NavigationService, SharedState);
            SharedState.SearchText = MadeBy;
            NavigationService?.NavigateTo(userView);
            userView.SearchUsers(SharedState.SearchText);
        }

        private void ViewQuiz(object parameter) 
        { 
            QuizViewModel quizView=new QuizViewModel(NavigationService, SharedState);
            SharedState.SearchText = MadeBy;
            NavigationService?.NavigateTo(quizView);
            quizView.SearchQuizes(SharedState.SearchText);
        }
    }
}
