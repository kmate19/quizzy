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

        private readonly SharedStateService _sharedState;

        private readonly NavigationService _navigationService;
        public ICommand ViewUserCommand { get; }

        public Quiz(NavigationService navigationService)
        {
            _navigationService = navigationService;
            ViewUserCommand = new RelayCommand(ViewUser);
        }
        
        private void ViewUser(object parameter)
        {
            Debug.WriteLine($"Viewing user: {MadeBy}");
            MessageBox.Show($"Viewing user: {MadeBy}");
            _navigationService?.NavigateTo(new UserViewModel(_navigationService));
            _sharedState.SearchText = MadeBy;
        }
    }
}