using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.Security.Cryptography.Pkcs;
using localadmin.Models;
using localadmin.Services;

namespace localadmin.ViewModels
{
    public class ReviewViewModel
    {
        private readonly NavigationService NavigationService;
        private readonly SharedStateService SharedState;
        public ObservableCollection<Review> Reviews {  get; set; }
        public ObservableCollection<Review> FilteredReviews { get; private set; }

        public ReviewViewModel(NavigationService Navigation, SharedStateService State)
        {
            NavigationService = Navigation;
            SharedState = State;

            Reviews = new ObservableCollection<Review>
            {
                new Review(NavigationService, SharedState)
                {
                    UUID = "f01d4a90-b96b-4a3a-a689-8c42c5086e43",
                    UserUUID = "f5e6a25f-8b92-441d-b58d-c3d5dbde2c0e",  // linked to john_doe
                    QuizUUID = "a3c92ff2-6587-4c34-bd7b-7f6d8642f21a",  // linked to Basic C# Quiz
                    Rating = 5,
                    Likes = 45,
                    Dislikes = 2,
                    Comment = "Great quiz for beginners. Highly recommend!",
                    CreatedAt = DateTime.UtcNow.AddDays(-15),
                    UpdatedAt = DateTime.UtcNow.AddDays(-10)
                },
                new Review(NavigationService, SharedState)
                {
                    UUID = "bc42f2b5-02f4-497b-8a9f-e34cf679d622",
                    UserUUID = "d3d77b3a-d671-45b0-88c7-b9a6d7b98c68",  // linked to jane_smith
                    QuizUUID = "d7e4b1d5-d0c2-4c69-9a2d-fab07344b364",  // linked to Advanced JavaScript Quiz
                    Rating = 4,
                    Likes = 30,
                    Dislikes = 1,
                    Comment = "Challenging but fun quiz for advanced learners.",
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    UpdatedAt = DateTime.UtcNow.AddDays(-5)
                },
                new Review(NavigationService, SharedState)
                {
                    UUID = "cb3a14f8-5a5d-453d-bd1c-d3d62cfeccf2",
                    UserUUID = "ccf473a2-92ba-42b7-9444-98013b495ef4",  // linked to mike_jones
                    QuizUUID = "f0bf33c7-3d28-426d-b7b0-cb57f75ef0f5",  // linked to HTML and CSS Quiz
                    Rating = 3,
                    Likes = 12,
                    Dislikes = 4,
                    Comment = "The quiz was okay but could use more questions.The quiz was okay but could use more questions.The quiz was okay but could use more questions.The quiz was okay but could use more questions.",
                    CreatedAt = DateTime.UtcNow.AddDays(-20),
                    UpdatedAt = DateTime.UtcNow.AddDays(-18)
                }
            };

            FilteredReviews=new ObservableCollection<Review>(Reviews);
        }

        public void SearchReviews(string query)
        {
            var results = SearchService.FuzzySearch(Reviews, query, review => [review.MadeBy]);
            FilteredReviews.Clear();
            foreach (var review in results)
            {
                FilteredReviews.Add(review);
            }
        }
    }
}
