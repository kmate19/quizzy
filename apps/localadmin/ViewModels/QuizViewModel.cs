using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using localadmin.Models;
using localadmin.Services;
using static localadmin.Models.Quiz;

namespace localadmin.ViewModels
{
    public class QuizViewModel
    {
        private readonly NavigationService NavigationService;
        private readonly SharedStateService SharedState;

        private Dictionary<Quiz.EQuizStatus, int> QuizOrder = new Dictionary<EQuizStatus, int>
        {
            {EQuizStatus.RequiresReview, 1 },
            {EQuizStatus.Published, 2 },
            {EQuizStatus.Draft, 3 },
            {EQuizStatus.Private, 4 }
        };

        public ObservableCollection<Quiz> Quizzes { get; set; }
        public ObservableCollection<Quiz> FiltredQuizzes { get; set; }


        public QuizViewModel(NavigationService Navigation, SharedStateService State)
        {
            NavigationService=Navigation;
            SharedState = State;

            //kurva ocsmany szar de megteszi <3
            Quizzes = new ObservableCollection<Quiz>
            {
                new Quiz(NavigationService, SharedState)
                {
                    UUID = "a3c92ff2-6587-4c34-bd7b-7f6d8642f21a",
                    UserID = "f5e6a25f-8b92-441d-b58d-c3d5dbde2c0e",
                    Title = "Basic C# Quiz",
                    Description = "A beginner's quiz about C# fundamentals.",
                    Status = EQuizStatus.Published,
                    Rating = 4,
                    Plays = 350,
                    CreatedAt = DateTime.UtcNow.AddMonths(-2),
                    UpdatedAt = DateTime.UtcNow,
                    QuizCards=new List<QuizCard>
                    {
                        new QuizCard
                        {
                            Type = QuizCard.EQuitType.normal,
                            ID = 1, QuizID = 1,
                            Question = "What is the size of an int in C#?",
                            Answers = new List<string> { "4 bytes", "2 bytes", "8 bytes", "Depends on the platform" },
                            CorrectAnswerIndex = 0
                        },
                        new QuizCard
                        {
                            Type = QuizCard.EQuitType.twochoise,
                            ID = 2, QuizID = 1,
                            Question = "Which keyword is used to define a class?",
                            Answers = new List<string> { "class", "struct" },
                            CorrectAnswerIndex = 0
                        },
                        new QuizCard
                        {
                            Type = QuizCard.EQuitType.normal,
                            ID = 3, QuizID = 1,
                            Question = "What does 'static' mean in C#?",
                            Answers = new List<string> { "It belongs to the class rather than an instance", "It can be instantiated multiple times", "It is a dynamically allocated variable", "None of the above" },
                            CorrectAnswerIndex = 0
                            },
                    }

                },
                new Quiz(NavigationService, SharedState)
                {
                    UUID = "d7e4b1d5-d0c2-4c69-9a2d-fab07344b364",
                    UserID = "d3d77b3a-d671-45b0-88c7-b9a6d7b98c68",
                    Title = "Advanced JavaScript Quiz",
                    Description = "Test your advanced JavaScript knowledge!",
                    Status = EQuizStatus.Published,
                    Rating = 4,
                    Plays = 500,
                    CreatedAt = DateTime.UtcNow.AddMonths(-1),
                    UpdatedAt = DateTime.UtcNow,
                    QuizCards=new List<QuizCard>{
                        new QuizCard
                        {
                            ID = 4, QuizID = 2,
                            Question = "What does 'use strict' do in JavaScript?",
                            Answers = new List<string> { "Enforces stricter parsing and error handling", "Prevents execution", "Makes code run faster", "Has no effect" },
                            CorrectAnswerIndex = 0
                        },
                        new QuizCard
                        {
                            ID = 5, QuizID = 2,
                            Question = "What is the output of `typeof null`?",
                            Answers = new List<string> { "object", "null", "undefined", "string" },
                            CorrectAnswerIndex = 0
                        },
                        new QuizCard
                        {
                            ID = 6, QuizID = 2,
                            Question = "How do you create an arrow function?",
                            Answers = new List<string> { "() => {}", "function() {}", "new Function()", "=> function() {}" },
                            CorrectAnswerIndex = 0
                        }
                    },
                },
                new Quiz(NavigationService, SharedState)
                {
                    UUID = "f0bf33c7-3d28-426d-b7b0-cb57f75ef0f5",
                    UserID = "ccf473a2-92ba-42b7-9444-98013b495ef4",
                    Title = "HTML and CSS Quiz",
                    Description = "How well do you know web design?",
                    Status = EQuizStatus.RequiresReview,
                    Rating = 3,
                    Plays = 220,
                    CreatedAt = DateTime.UtcNow.AddMonths(-3),
                    UpdatedAt = DateTime.UtcNow,
                    QuizCards = new List<QuizCard>
                    {
                        new QuizCard
                        {
                            ID = 7, QuizID = 3,
                            Question = "What does CSS stand for?",
                            Answers = new List<string> { "Cascading Style Sheets", "Computer Style System", "Creative Styling Syntax", "Coded Style Structure" },
                            CorrectAnswerIndex = 0
                        },
                        new QuizCard
                        {
                            ID = 8, QuizID = 3,
                            Question = "Which HTML tag is used for a hyperlink?",
                            Answers = new List<string> { "<a>", "<link>", "<href>", "<h>" },
                            CorrectAnswerIndex = 0
                        },
                        new QuizCard
                        {
                            ID = 9, QuizID = 3,
                            Question = "What is the default display property of a `<div>`?",
                            Answers = new List<string> { "block", "inline", "flex", "grid" },
                            CorrectAnswerIndex = 0
                        }
                    }
                }
            };

            FiltredQuizzes = new ObservableCollection<Quiz>(
                Quizzes.OrderBy(x => QuizOrder[x.Status])
            );

            for (int i = 0; i<FiltredQuizzes.Count; i++)
            {
                Debug.WriteLine(FiltredQuizzes[i].Status);
            }
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
