using localadmin.Models;
using localadmin.Services;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Windows;
using System.Windows.Input;
using static localadmin.Models.Quiz;

namespace localadmin.ViewModels
{
    public class QuizViewModel : INotifyPropertyChanged
    {
        private readonly NavigationService NavigationService;
        private readonly SharedStateService SharedState;
        private int _currentPage = 1;
        private int _PageSize = 10;
        public ObservableCollection<int> PageSizeOptions { get; }

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

        public int PageSize
        {
            get => _PageSize;
            set
            {
                if (_PageSize != value)
                {
                    _PageSize = value;
                    Debug.WriteLine($"IsLoading changed to: {value}");
                    OnPropertyChanged(nameof(PageSize));

                    _ = PageSizeChanged();
                }
            }
        }

        private bool _isLoading;
        public bool IsLoading
        {
            get => _isLoading;
            set
            {
                _isLoading = value;
                OnPropertyChanged();
            }
        }

        public ICommand PreviousPageCommand { get; }
        public ICommand NextPageCommand { get; }

        public bool CanGoPrevious => CurrentPage > 1;
        public bool CanGoNext => maxPage > CurrentPage;

        public int maxPage;

        public ObservableCollection<Quiz> Quizzes { get; set; } = new();
        public ObservableCollection<Quiz> FiltredQuizzes { get; set; } = new();


        public QuizViewModel(NavigationService Navigation, SharedStateService State)
        {
            NavigationService=Navigation;
            SharedState = State;
            PreviousPageCommand = new RelayCommand(PreviousPage);
            NextPageCommand = new RelayCommand(NextPage);

            PageSizeOptions = new ObservableCollection<int> { 10, 20, 30, 40, 50 };
            PageSize = PageSizeOptions[0];
        }
        private async Task PageSizeChanged()
        {
            await GetQuizes();
        }

        public async Task InitializeAsync()
        {
            await GetQuizes();
        }

        public async Task GetQuizes()
        {
            IsLoading = true;
            var fetchedQuizes = await ApiQuizzesService.GetQuizzesAsync(CurrentPage, PageSize);

            var quizzesList = new List<Quiz>();
            var filteredList = new List<Quiz>();

            foreach (var quiz in fetchedQuizes.Quizzes)
            {
                quiz.Initialize(NavigationService, SharedState);
                quiz.QuizCards = await LoadQuizCards(quiz.UUID);

                quizzesList.Add(quiz);
                filteredList.Add(quiz);
            }

            await Application.Current.Dispatcher.InvokeAsync(() =>
            {
                Quizzes.Clear();
                foreach (var quiz in quizzesList)
                {
                    Quizzes.Add(quiz);
                }

                var orderedFilteredList = filteredList
                    .OrderBy(q => QuizOrder.ContainsKey(q.Status) ? QuizOrder[q.Status] : int.MaxValue)
                    .ToList();

                FiltredQuizzes.Clear();
                foreach (var quiz in orderedFilteredList)
                {
                    FiltredQuizzes.Add(quiz);
                }
            });

            maxPage = (int)Math.Ceiling((double)fetchedQuizes.TotalCount / PageSize);

            IsLoading = false;
        }


        private async Task<List<QuizCard>> LoadQuizCards(string quizId)
        {
            var quizCards = await ApiQuizzesService.GetQuizCardsByIdAsync(quizId, Quizzes);

            if (!quizCards.Any())
            {
                Debug.WriteLine("No quiz cards found.");
                return new();
            }

            return quizCards;
        }


        public  void SearchQuizes(string query)
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
                await GetQuizes();
            }
        }

        private async void NextPage(object parameter)
        {
            if (CanGoNext)
            {
                CurrentPage++;
                OnPropertyChanged(nameof(CurrentPage));
                OnPropertyChanged(nameof(CanGoPrevious));
                await GetQuizes();
            }
            else
                MessageBox.Show("Nincs további oldal.");
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected virtual void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}