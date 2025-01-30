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
        private readonly NavigationService NavigationService;
        private readonly SharedStateService SharedState;

        public ObservableCollection<Quiz> Quizzes { get; set; }
        public ObservableCollection<Quiz> FiltredQuizzes { get; set; }


        public QuizViewModel(NavigationService Navigation, SharedStateService State)
        {
            NavigationService=Navigation;
            SharedState = State;


            Quizzes = new ObservableCollection<Quiz>
        {
            new Quiz(NavigationService, SharedState) { MadeBy = "Goku", Description = "bbbbbbb" },
            new Quiz(NavigationService, SharedState) { MadeBy = "Vegeta", Description = "bbbbbbb" },
            new Quiz(NavigationService, SharedState) { MadeBy = "Piccolo", Description = "bbbbbbb" },
            new Quiz(NavigationService, SharedState) { MadeBy = "Jiren", Description = "bbbbbbb" },
            new Quiz(NavigationService, SharedState) { MadeBy = "Bulma", Description = "bbbbbbb" }
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
