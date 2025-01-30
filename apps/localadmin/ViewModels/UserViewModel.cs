using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using localadmin.Models;
using localadmin.Services;

namespace localadmin.ViewModels
{
    public class UserViewModel
    {
        private readonly NavigationService NavigationService;
        private readonly SharedStateService SharedState;
        public ObservableCollection<User> Users { get; set; } = new ObservableCollection<User>();
        public ObservableCollection<User> FilteredUsers { get; private set; }

        public UserViewModel(NavigationService Navigation, SharedStateService State)
        {
            NavigationService = Navigation;
            SharedState = State;

            Users = new ObservableCollection<User>
            {
                new User(NavigationService, SharedState)
                {
                    Username = "Goku",
                    Email = "alice@example.com",
                    Role = "Administrator"
                },
                new User(NavigationService, SharedState)
                {
                    Username = "Vegeta",
                    Email = "bob@example.com",
                    Role = "Editor"
                },
                new User(NavigationService, SharedState)
                {
                    Username = "Piccowo",
                    Email = "charlie@example.com",
                    Role = "Viewer"
                },
                new User(NavigationService, SharedState)
                {
                    Username = "Gohan",
                    Email = "diana@example.com",
                    Role = "Editor"
                },
                new User(NavigationService, SharedState)
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
    }
}
