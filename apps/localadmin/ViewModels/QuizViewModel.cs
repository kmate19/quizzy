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
    public class QuizViewModel
    {
        public ObservableCollection<Quiz> Quizzes { get; set; }
        public ObservableCollection<Quiz> FiltredQuizzes { get; set; }

        private readonly NavigationService navigationService;

        public QuizViewModel(NavigationService navigation)
        {
            this.navigationService=navigation;

            Quizzes = new ObservableCollection<Quiz>
        {
            new Quiz(navigationService) { MadeBy = "Goku", Description = "bbbbbbb" },
            new Quiz(navigationService) { MadeBy = "Vegeta", Description = "bbbbbbb" },
            new Quiz(navigationService) { MadeBy = "Piccolo", Description = "bbbbbbb" },
            new Quiz(navigationService) { MadeBy = "Jiren", Description = "bbbbbbb" },
            new Quiz(navigationService) { MadeBy = "Bulma", Description = "bbbbbbb" }
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
    }
}
