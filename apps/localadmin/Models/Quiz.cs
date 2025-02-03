using localadmin.ViewModels;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Windows;
using System.Windows.Input;
using localadmin.Services;
using System.Windows.Forms;
using System.Runtime;
using System.Security.Cryptography.X509Certificates;

namespace localadmin.Models
{
    public class Quiz
    {
        public enum EQuizStatus{
            Draft,
            Published,
            RequiresReview,
            Private
        }
        private readonly NavigationService NavigationService;

        private readonly SharedStateService SharedState;
        public ICommand ViewUserCommand { get; }
        public ICommand ViewReviewCommand { get; }
        public string UUID { get; set; }
        public string UserID { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public EQuizStatus Status { get; set; }
        public int Rating { get; set; }
        public int Plays { get; set; }
        public byte[] Banner { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public string MadeBy
        {
            get
            {
                UserViewModel userView = new UserViewModel(NavigationService, SharedState);
                return userView.Users.Where(x => x.UUID == UserID).First().Username;
            }
        }


        public Quiz(NavigationService navigation, SharedStateService sharedState)
        {
            NavigationService= navigation;
            SharedState = sharedState;
            ViewUserCommand = new RelayCommand(ViewUser);
            ViewReviewCommand = new RelayCommand(ViewReview);
        }
        
        private void ViewUser(object parameter)
        {
            Debug.WriteLine("emebr: " + MadeBy);
            UserViewModel userView= new UserViewModel(NavigationService, SharedState);
            SharedState.SearchText = MadeBy;
            NavigationService?.NavigateTo(userView);
            userView.SearchUsers(SharedState.SearchText);
        }

        private void ViewReview(object parameter)
        {
            ReviewViewModel reviewView=new ReviewViewModel(NavigationService, SharedState);
            SharedState.SearchText = MadeBy;
            NavigationService?.NavigateTo(reviewView);
            reviewView.SearchReviews(SharedState.SearchText);
        }
    }
}