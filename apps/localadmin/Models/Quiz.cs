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

namespace localadmin.Models
{
    public class Quiz
    {
        public string MadeBy { get; set; }
        public string Description { get; set; }

        private readonly NavigationService NavigationService;

        private readonly SharedStateService SharedState;
        public ICommand ViewUserCommand { get; }

        public Quiz(NavigationService navigation, SharedStateService sharedState)
        {
            NavigationService= navigation;
            SharedState = sharedState;
            ViewUserCommand = new RelayCommand(ViewUser);
        }
        
        private void ViewUser(object parameter)
        {
            Debug.WriteLine("viewing user profile: " + MadeBy);
            UserViewModel userView= new UserViewModel(NavigationService, SharedState);
            SharedState.SearchText = MadeBy;
            NavigationService?.NavigateTo(userView);
            userView.SearchUsers(SharedState.SearchText);
        }
    }
}