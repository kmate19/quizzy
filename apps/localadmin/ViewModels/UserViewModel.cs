using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using localadmin.Models;
using localadmin.Services;

namespace localadmin.ViewModels
{
    public class UserViewModel
    {
        public NavigationService _navigationService { get; set; }
        public ObservableCollection<User> Users { get; set; } = new ObservableCollection<User>();
        public ObservableCollection<User> FilteredUsers { get; private set; }

        public UserViewModel(NavigationService navigationService)
        {
            _navigationService = navigationService;

            Users = new ObservableCollection<User>
            {
                new User()
                {
                    Username = "Goku",
                    Email = "alice@example.com",
                    Role = "Administrator"
                },
                new User()
                {
                    Username = "Vegeta",
                    Email = "bob@example.com",
                    Role = "Editor"
                },
                new User()
                {
                    Username = "Piccowo",
                    Email = "charlie@example.com",
                    Role = "Viewer"
                },
                new User()
                {
                    Username = "Gohan",
                    Email = "diana@example.com",
                    Role = "Editor"
                },
                new User()
                {
                    Username = "Edward Elric",
                    Email = "edward@example.com",
                    Role = "Viewer"
                }
            };

            FilteredUsers = new ObservableCollection<User>(Users);
        }
        public void SearchUsers(string query)
        {
            var results = SearchService.FuzzySearch(Users, query, user => [user.Username, user.Email]);
            FilteredUsers.Clear();
            foreach (var user in results)
            {
                FilteredUsers.Add(user);
            }
        }

        private void OnNavigatedTo(object viewModel, object parameter)
        {
            if (viewModel == this && parameter is string username)
            {
                SearchUsers(username);
            }
        }
    }
}
