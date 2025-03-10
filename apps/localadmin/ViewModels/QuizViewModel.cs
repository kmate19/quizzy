using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Windows.Documents;
using localadmin.Models;
using localadmin.Services;
using static localadmin.Models.Quiz;

namespace localadmin.ViewModels
{
    public class QuizViewModel : INotifyPropertyChanged
    {
        private readonly NavigationService NavigationService;
        private readonly SharedStateService SharedState;

        private Dictionary<Quiz.EQuizStatus, int> QuizOrder = new Dictionary<EQuizStatus, int>
        {
            {EQuizStatus.RequiresReview, 1 },
            {EQuizStatus.Published, 2 },
            {EQuizStatus.Draft, 3 },
            {EQuizStatus.Private, 4 }
        };

        public ObservableCollection<Quiz> Quizzes { get; set; } = new();
        public ObservableCollection<Quiz> FiltredQuizzes { get; set; } = new();


        public QuizViewModel(NavigationService Navigation, SharedStateService State)
        {
            NavigationService=Navigation;
            SharedState = State;

            _= InitializeAsync();

        }
        public async Task InitializeAsync()
        {
            await GetQuizes();
        }

        public async Task GetQuizes()
        {
            var fetchedQuizes = await ApiQuizzesService.GetQuizzesAsync();
            Quizzes.Clear();
            FiltredQuizzes.Clear();

            foreach (var quiz in fetchedQuizes)
            {
                Quizzes.Add(quiz);
                FiltredQuizzes.Add(quiz);
                quiz.Initialize(NavigationService, SharedState);
                quiz.QuizCards = await LoadQuizCards(quiz.UUID);
            }

            OnPropertyChanged(nameof(Quizzes));
            OnPropertyChanged(nameof(FiltredQuizzes));
            Debug.WriteLine($"Fetched {Quizzes.Count} quizes.");
        }

        private async Task<List<QuizCard>> LoadQuizCards(string quizId)
        {
            var quizCards = await ApiQuizzesService.GetQuizCardsByIdAsync(quizId, Quizzes);

            if (quizCards.Any())
                Debug.WriteLine($"Loaded {quizCards.Count} Quiz Cards");
            else
                Debug.WriteLine("No quiz cards found.");

            return quizCards;
        }


        public void SearchQuizes(string query)
        {   
            var results = SearchService.FuzzySearch(Quizzes, query, quiz => [quiz.User.Username, quiz.Title]);
            FiltredQuizzes.Clear();
            foreach (var quiz in results)
            {
                FiltredQuizzes.Add(quiz);
            } 
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

    }
}
