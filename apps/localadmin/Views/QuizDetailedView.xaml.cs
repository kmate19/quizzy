using System.ComponentModel;
using System.Windows;
using System.Windows.Media;
using localadmin.Models;
using localadmin.Views;

namespace localadmin
{
    /// <summary>
    /// Interaction logic for QuizDetailedView.xaml
    /// </summary>
    public partial class QuizDetailedView : Window, INotifyPropertyChanged
    {
        private Quiz _quiz;
        private int _cardIndex;
        private QuizCard _currentQuizCard;
        private string _stars;
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


        public QuizDetailedView(Quiz quiz)
        {
            InitializeComponent();

            Quiz = quiz;
            CardIndex = 0;
            UpdateCurrentCard();
            DataContext = this;
        }

        private void Previous_Card(object sender, RoutedEventArgs e)
        {
            if (CardIndex == 0)
                CardIndex = NumberOfCards-1;
            else
                CardIndex--;

            UpdateCurrentCard();
        }
        private void Next_Card(object sender, RoutedEventArgs e)
        {
            if(CardIndex == NumberOfCards - 1)
                CardIndex = 0;
            else
                CardIndex++;

            UpdateCurrentCard();
        }

        private void UpdateCurrentCard()
        {
            CurrentQuizCard = Quiz.QuizCards[CardIndex];
            Stars = new string('★', Quiz.Rating) + new string('☆', 5 - Quiz.Rating);

            switch (CurrentQuizCard.CorrectAnswerIndex) {
                case 0:
                    Answer1.Background=Brushes.Green;
                    break;
                case 1:
                    Answer2.Background=Brushes.Green;
                    break;
                case 2:
                    Answer3.Background=Brushes.Green;
                    break;
                case 3:
                    Answer4.Background=Brushes.Green;
                    break;
            }
        }

        public void AcceptQuiz(object sender, RoutedEventArgs e)
        {
            PopUpModal dialog = new PopUpModal("Biztosan el szeretnéd fogadni ezt a quizt?");
            if (dialog.ShowDialog()==true)
                MessageBox.Show("Quiz elfogadva");
        }
        public void DenyQuiz(object sender, RoutedEventArgs e)
        {
            PopUpModal dialog = new PopUpModal("Biztosan el szeretnéd utasítani ezt a quizt?");
            if (dialog.ShowDialog() == true)
                MessageBox.Show("Quiz elutasítva");
        }
        public void DeleteQuiz(object sender, RoutedEventArgs e)
        {
            PopUpModal dialog = new PopUpModal("Biztosan ki szeretnéd törölni ezt a quizt?");
            if (dialog.ShowDialog() == true)
                MessageBox.Show("Quiz törölve");
        }

        public event PropertyChangedEventHandler PropertyChanged;
        private void OnPropertyChanged(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
}
