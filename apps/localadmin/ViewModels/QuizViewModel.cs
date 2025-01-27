using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using localadmin.Models;
using localadmin.Services;

namespace localadmin.ViewModels
{
    public class QuizViewModel
    {
        public ObservableCollection<Quiz> Quizzes { get; set; }
        public ObservableCollection<Quiz> FiltredQuizzes { get; set; }

        public QuizViewModel()
        {

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
        public void viewUser()
        {
            NavigationService.
        }
    }
}
