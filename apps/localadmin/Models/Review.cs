using localadmin.Services;
using localadmin.ViewModels;
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

        public string MadeBy { get; set; }
        public string ReviewText { get; set; }
        public int Rating { get; set; }

        public string Stars => new string('★', Rating) + new string('☆', 5 - Rating);

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
