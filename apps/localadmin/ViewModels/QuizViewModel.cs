using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using localadmin.Models;
using localadmin.Services;
using static localadmin.Models.Quiz;

namespace localadmin.ViewModels
{
    public class QuizViewModel : INotifyPropertyChanged
    {
        private readonly NavigationService NavigationService;
        private readonly SharedStateService SharedState;
        private int _currentPage = 1;

        private Dictionary<Quiz.EQuizStatus, int> QuizOrder = new Dictionary<EQuizStatus, int>
        {
            {EQuizStatus.RequiresReview, 1 },
            {EQuizStatus.Published, 2 },
            {EQuizStatus.Draft, 3 },
            {EQuizStatus.Private, 4 }
        };

        public int CurrentPage
        {
            get => _currentPage;
            set { 
                _currentPage = value; 
                OnPropertyChanged();
            }
        }


        public ICommand PreviousPageCommand { get; }
        public ICommand NextPageCommand { get; }

        public bool CanGoPrevious => CurrentPage > 1;
        public bool CanGoNext => CurrentPage < 50;

        public ObservableCollection<Quiz> Quizzes { get; set; } = new();
        public ObservableCollection<Quiz> FiltredQuizzes { get; set; } = new();


        public QuizViewModel(NavigationService Navigation, SharedStateService State)
        {
            NavigationService=Navigation;
            SharedState = State;
            PreviousPageCommand = new RelayCommand(PreviousPage);
            NextPageCommand = new RelayCommand(NextPage);

            _ = InitializeAsync();

        }
        public async Task InitializeAsync()
        {
            await GetQuizes(CurrentPage);
        }

        public async Task GetQuizes(int page)
        {
            var fetchedQuizes = await ApiQuizzesService.GetQuizzesAsync(CurrentPage);
            Quizzes.Clear();
            FiltredQuizzes.Clear();

            foreach (var quiz in fetchedQuizes)
            {
                Quizzes.Add(quiz);
                FiltredQuizzes.Add(quiz);
                quiz.Initialize(NavigationService, SharedState);
                quiz.QuizCards = await LoadQuizCards(quiz.UUID);
            }

            FiltredQuizzes.OrderBy(q => QuizOrder.ContainsKey(q.Status) ? QuizOrder[q.Status] : int.MaxValue);

            OnPropertyChanged(nameof(Quizzes));
            OnPropertyChanged(nameof(FiltredQuizzes));
        }

        private async Task<List<QuizCard>> LoadQuizCards(string quizId)
        {
            var quizCards = await ApiQuizzesService.GetQuizCardsByIdAsync(quizId, Quizzes);

            if (!quizCards.Any())
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

        private async void PreviousPage(object parameter)
        {
            if (CanGoPrevious)
            {
                CurrentPage--;
                OnPropertyChanged(nameof(CurrentPage));
                OnPropertyChanged(nameof(CanGoNext));
                await GetQuizes(CurrentPage);
            }
        }

        private async void NextPage(object parameter)
        {
            if (CanGoNext)
            {
                CurrentPage++;
                OnPropertyChanged(nameof(CurrentPage));
                OnPropertyChanged(nameof(CanGoPrevious));
                await GetQuizes(CurrentPage);
            }
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

    }
}
