using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Windows;
using System.Windows.Input;
using localadmin.Models;
using localadmin.Services;

namespace localadmin.ViewModels
{
    public class QuizViewModel
    {
        private readonly NavigationService _navigationService;
        public ObservableCollection<Quiz> Quizzes { get; set; }
        public ObservableCollection<Quiz> FiltredQuizzes { get; set; }
        public ICommand ViewUserCommand { get; }

        public QuizViewModel(NavigationService navigationService)
        {
            _navigationService = navigationService;

            ViewUserCommand = new RelayCommand(ViewUser);

            Quizzes = new ObservableCollection<Quiz> {
                new Quiz { MadeBy = "Goku", Description = "bbbbbbb" },
                new Quiz { MadeBy = "Vegeta", Description = "bbbbbbb" },
                new Quiz { MadeBy = "Piccolo", Description = "bbbbbbb" },
                new Quiz { MadeBy = "Jiren", Description = "bbbbbbb" },
                new Quiz { MadeBy = "Bulma", Description = "bbbbbbb" }
            };

            FiltredQuizzes = new ObservableCollection<Quiz>(Quizzes);

        }
        public void SearchQuizes(string query)
        {
            var results = SearchService.FuzzySearch(Quizzes, query, quiz => [quiz.MadeBy]);
            FiltredQuizzes.Clear();
            foreach (var quiz in results)
            {
                FiltredQuizzes.Add(quiz);
            }
        }

        private void ViewUser(object parameter)
        {
            Debug.WriteLine("viewuser called");
            _navigationService.NavigateTo(new UserViewModel(_navigationService));
            Debug.WriteLine("paramter: "+parameter);
            if (parameter is Quiz quiz)
            {
                Debug.WriteLine("username: "+quiz.MadeBy);
                MessageBox.Show("Viewing user: " + quiz.MadeBy);
            }
        }
    }
}
