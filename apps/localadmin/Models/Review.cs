using localadmin.Services;
using localadmin.ViewModels;
using Microsoft.VisualBasic.ApplicationServices;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Input;

namespace localadmin.Models
{
    public class Review
    {
        private readonly NavigationService NavigationService;

        private readonly SharedStateService SharedState;

        public ICommand ViewUserCommand { get;}

        public string UUID { get; set; }
        public string UserUUID { get; set; }
        public string QuizUUID { get; set; }
        public double Rating { get; set; }
        public int Likes { get; set; }
        public int Dislikes { get; set; }
        public string Comment { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public string Stars => new string('★', (int)Rating) + new string('☆', 5 - (int)Rating);
        /*
        public string Stars
        {
            get
            {
                int fullStars = (int)Math.Floor(Rating);

                bool hasHalfStar = (Rating - fullStars) >= 0.5;

                int emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

                return new string('★', fullStars)
                     + (hasHalfStar ? "⯨" : "")
                     + new string('☆', emptyStars);
            }
        }
        */

        public string MadeBy
        {
            get
            {
                UserViewModel userView = new UserViewModel(NavigationService, SharedState);
                return userView.Users.Where(x => x.UUID == UserUUID).First().Username;
            }
        }

        public Review(NavigationService navigation, SharedStateService sharedState)
        {
            NavigationService = navigation;
            SharedState = sharedState;
            ViewUserCommand = new RelayCommand(ViewUser);
        }

        private void ViewUser(object parameter)
        {
            Debug.WriteLine("viewing user profile: " + MadeBy);
            UserViewModel userView = new UserViewModel(NavigationService, SharedState);
            SharedState.SearchText = MadeBy;
            NavigationService?.NavigateTo(userView);
            userView.SearchUsers(SharedState.SearchText);
        }
    }
}
