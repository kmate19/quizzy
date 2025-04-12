using System.ComponentModel;
using System.Diagnostics;
using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using localadmin.Models;
using localadmin.Views;
using localadmin.ViewModels;
using localadmin.Services;
using System.Net.Http.Json;

namespace localadmin
{
    /// <summary>
    /// Ez az ablak a quiz részletes nézetét jeleníti meg.
    /// </summary>
    public partial class QuizDetailedView : Window, INotifyPropertyChanged
    {
        private Quiz _quiz;
        private int _cardIndex;
        private QuizCard _currentQuizCard;
        private string _stars;
        private string _status;
        private int _DisplayIndex;
        private NavigationService NavigationService;
        private SharedStateService SharedState;
        private int NumberOfCards => Quiz.QuizCards.Count;
        public int CardIndex
        {
            get => _cardIndex;
            set
            {
                _cardIndex = value;
                OnPropertyChanged(nameof(CardIndex));
                UpdateCurrentCard();
            }
        }

        public int DisplayIndex
        {
            get => _DisplayIndex;
            set
            {
                _DisplayIndex = value;
                OnPropertyChanged(nameof(DisplayIndex));
            }
        }

        public Quiz Quiz
        {
            get => _quiz;
            set
            {
                _quiz = value;
                OnPropertyChanged(nameof(Quiz));
            }
        }

        public QuizCard CurrentQuizCard
        {
            get => _currentQuizCard;
            set
            {
                _currentQuizCard = value;
                OnPropertyChanged(nameof(CurrentQuizCard));
            }
        }

        public string Stars
        {
            get => _stars;
            set
            {
                _stars = value;
                OnPropertyChanged(nameof(Stars));
            }
        }

        public string Status
        {
            get => _status;
            set
            {
                _status = value;
                OnPropertyChanged(nameof(Status));
            }
        }

        public QuizDetailedView(Quiz quiz, NavigationService navigation, SharedStateService stateService)
        {
            InitializeComponent();

            Quiz = quiz;
            NavigationService = navigation;
            SharedState = stateService;
            CardIndex = 0;
            _stars = string.Empty;
            _status = string.Empty;
            _currentQuizCard = new QuizCard();
            UpdateCurrentCard();
            DataContext = this;
        }

        /// <summary>
        /// A bal és jobb nyíl billentyűkkel lehet lapozni a quiz kártyák között.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void Window_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Left)
                Previous_Card(null, null);
            else if (e.Key == Key.Right)
                Next_Card(null, null);
        }

        private void Previous_Card(object sender, RoutedEventArgs e)
        {
            if (CardIndex == 0)
                CardIndex = NumberOfCards - 1;
            else
                CardIndex--;

            UpdateCurrentCard();
        }
        private void Next_Card(object sender, RoutedEventArgs e)
        {
            if (CardIndex == NumberOfCards - 1)
                CardIndex = 0;
            else
                CardIndex++;

            UpdateCurrentCard();
        }

        /// <summary>
        /// Frissíti a jelenlegi kártyát.
        /// </summary>
        private void UpdateCurrentCard()
        {
            DisplayIndex = CardIndex + 1;
            CurrentQuizCard = Quiz.QuizCards[CardIndex];

            Answer1.Background = Brushes.White;
            Answer2.Background = Brushes.White;
            Answer3.Background = Brushes.White;
            Answer4.Background = Brushes.White;
            Stars = new string('★', Quiz.Rating) + new string('☆', 5 - Quiz.Rating);


            if (CurrentQuizCard.Type == QuizCard.EQuizType.twochoice)
            {
                Answer3.Visibility = Visibility.Collapsed;
                Answer4.Visibility = Visibility.Collapsed;
            }
            else
            {
                Answer3.Visibility = Visibility.Visible;
                Answer4.Visibility = Visibility.Visible;
            }

            switch (CurrentQuizCard.CorrectAnswerIndex)
            {
                case 0:
                    Answer1.Background = Brushes.Green;
                    break;
                case 1:
                    Answer2.Background = Brushes.Green;
                    break;
                case 2:
                    Answer3.Background = Brushes.Green;
                    break;
                case 3:
                    Answer4.Background = Brushes.Green;
                    break;
            }

            switch (Quiz.Status)
            {
                case Quiz.EQuizStatus.published:
                    Status = "Közzétéve";
                    QuizStatus.Foreground = Brushes.Green;
                    break;
                case Quiz.EQuizStatus.requires_review:
                    Status = "Felülvizsgálatra vár";
                    QuizStatus.Foreground = Brushes.Orange;
                    break;
                case Quiz.EQuizStatus.draft:
                    Status = "Vázlat";
                    QuizStatus.Foreground = Brushes.Gray;
                    break;
                case Quiz.EQuizStatus.rejected:
                    Status = "Elutasítva";
                    QuizStatus.Foreground = Brushes.Red;
                    break;
                case Quiz.EQuizStatus.@private:
                    Status = "Privát";
                    QuizStatus.Foreground = Brushes.Red;
                    break;
            }
        }

        public async Task HandleQuizAction(string message, Quiz.EQuizStatus newStatus)
        {
            PopUpModal dialog = new PopUpModal(message);
            bool? result = dialog.ShowDialog();

            if (result == true)
            {
                bool success = await ApiQuizzesService.UpdateQuizStatus(Quiz.UUID, newStatus);

                if (success)
                {
                    MessageBox.Show(newStatus == Quiz.EQuizStatus.published ? "Quiz elfogadva" : "Quiz elutasítva");
                    Quiz.OnQuizUpdated();
                    Hide();
                }
                else
                {
                    MessageBox.Show("Hiba történt a státusz frissítése során.");
                }
            }
        }

        /// <summary>
        /// Ez a függvény kezeli a quiz elfogadását. Amelyik gombra nyom, azt a státuszt fogja tovább küldeni és azt fogja beállítani.
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        /// <returns></returns>
        public async void AcceptQuiz(object sender, RoutedEventArgs e)
        {
            if(Quiz.Status != Quiz.EQuizStatus.requires_review)
            {
                MessageBox.Show("Ez a quiz nem fogadható el.");
                return;
            }

            await HandleQuizAction("Biztosan el szeretnéd fogadni ezt a quizt?", Quiz.EQuizStatus.published);
        }
        public async void DenyQuiz(object sender, RoutedEventArgs e)
        {
            if (Quiz.Status != Quiz.EQuizStatus.requires_review)
            {
                MessageBox.Show("Ez a quiz nem utasítható el.");
                return;
            }

            await HandleQuizAction("Biztosan el szeretnéd utasítani ezt a quizt?", Quiz.EQuizStatus.rejected);
        }

        public async void ViewUser(object sender, RoutedEventArgs e)
        {
            if (Quiz.User == null)
                return;

            UserViewModel userView = new UserViewModel(NavigationService);
            SharedState.SearchText = Quiz.User.Username;
            NavigationService.NavigateTo(userView);
            await userView.InitializeAsync();
            userView.SearchUsers(SharedState.SearchText);
            Hide();
        }

        public event PropertyChangedEventHandler? PropertyChanged;
        private void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}