using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.Text.RegularExpressions;
using System.Windows;
using System.Windows.Input;
using localadmin.Models;
using localadmin.Services;
using static localadmin.Models.Quiz;

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
                new Quiz(NavigationService, SharedState)
                {
                    UUID = "a3c92ff2-6587-4c34-bd7b-7f6d8642f21a",
                    UserID = "f5e6a25f-8b92-441d-b58d-c3d5dbde2c0e",  // linked to john_doe
                    Title = "Basic C# Quiz",
                    Description = "A beginner's quiz about C# fundamentals.",
                    Status = EQuizStatus.Published,
                    Rating = 4,
                    Plays = 350,
                    CreatedAt = DateTime.UtcNow.AddMonths(-2),
                    UpdatedAt = DateTime.UtcNow
                },
                new Quiz(NavigationService, SharedState)
                {
                    UUID = "d7e4b1d5-d0c2-4c69-9a2d-fab07344b364",
                    UserID = "d3d77b3a-d671-45b0-88c7-b9a6d7b98c68",  // linked to jane_smith
                    Title = "Advanced JavaScript Quiz",
                    Description = "Test your advanced JavaScript knowledge!",
                    Status = EQuizStatus.Published,
                    Rating = 4,
                    Plays = 500,
                    CreatedAt = DateTime.UtcNow.AddMonths(-1),
                    UpdatedAt = DateTime.UtcNow
                },
                new Quiz(NavigationService, SharedState)
                {
                    UUID = "f0bf33c7-3d28-426d-b7b0-cb57f75ef0f5",
                    UserID = "ccf473a2-92ba-42b7-9444-98013b495ef4",  // linked to mike_jones
                    Title = "HTML and CSS Quiz",
                    Description = "How well do you know web design?",
                    Status = EQuizStatus.RequiresReview,
                    Rating = 3,
                    Plays = 220,
                    CreatedAt = DateTime.UtcNow.AddMonths(-3),
                    UpdatedAt = DateTime.UtcNow
                }
            };

            FiltredQuizzes = new ObservableCollection<Quiz>(Quizzes);
        }

        public void SearchQuizes(string query)
        {
            var results = SearchService.FuzzySearch(Quizzes, query, quiz => [quiz.MadeBy, quiz.Title]);
            FiltredQuizzes.Clear();
            foreach (var quiz in results)
            {
                FiltredQuizzes.Add(quiz);
            }
        }
    }
}
