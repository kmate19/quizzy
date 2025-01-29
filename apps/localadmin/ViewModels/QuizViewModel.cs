using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.Windows;
using System.Windows.Input;
using localadmin.Models;
using localadmin.Services;

namespace localadmin.ViewModels
{
    public class QuizViewModel : INotifyPropertyChanged
    {
        private readonly NavigationService _navigationService;
        private readonly SharedStateService _sharedState;
        public ObservableCollection<Quiz> Quizzes { get; set; }
        public ObservableCollection<Quiz> FiltredQuizzes { get; set; }

        public QuizViewModel(NavigationService navigationService, SharedStateService sharedState)
        {
            _navigationService = navigationService;
            _sharedState = sharedState;
            _sharedState.PropertyChanged += SharedState_PropertyChanged;

            Quizzes = new ObservableCollection<Quiz>
        {
            new Quiz(_navigationService) { MadeBy = "Goku", Description = "bbbbbbb" },
            new Quiz(_navigationService) { MadeBy = "Vegeta", Description = "bbbbbbb" },
            new Quiz(_navigationService) { MadeBy = "Piccolo", Description = "bbbbbbb" },
            new Quiz(_navigationService) { MadeBy = "Jiren", Description = "bbbbbbb" },
            new Quiz(_navigationService) { MadeBy = "Bulma", Description = "bbbbbbb" }
        };

            FiltredQuizzes = new ObservableCollection<Quiz>(Quizzes);
        }

        private void SharedState_PropertyChanged(object sender, PropertyChangedEventArgs e)
        {
            if (e.PropertyName == nameof(SharedStateService.SearchText))
            {
                SearchQuizes(_sharedState.SearchText);
            }
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
    }
}
