using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
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
                new Review{MadeBy= "Goku", ReviewText="Excellent service! Will definitely come back again.", Rating=3},
                new Review{MadeBy= "Vegeta", ReviewText="The food was fantastic, and the staff were very attentive. However, the wait time was longer than expected, which took away from the overall experience. Still, I’d recommend it for a casual outing.", Rating=1},
                new Review{MadeBy= "Gohan", ReviewText="I visited this place based on a recommendation from a friend, and I had high expectations. While the ambiance was cozy and welcoming, the quality of the food left much to be desired. My pasta was overcooked, and the sauce tasted bland. On the other hand, my friend enjoyed their steak, so I guess it depends on what you order. The staff seemed overwhelmed, which resulted in slower service. It has potential, but there’s definitely room for improvement before I’d consider coming back.", Rating=5},
                new Review{MadeBy= "Black", ReviewText="Excellent service! Will definitely come back again.", Rating=3},
                new Review{MadeBy= "Picowo", ReviewText="The food was fantastic, and the staff were very attentive. However, the wait time was longer than expected, which took away from the overall experience. Still, I’d recommend it for a casual outing.", Rating=1},
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
